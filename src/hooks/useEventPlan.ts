/**
 * useEventPlan — React Hook managing GenAI event plan generation state.
 *
 * Responsibilities:
 * - Persists generated plan to localStorage alongside the draft
 * - Synchronizes financial changes when draft budget/guestCount change
 * - Prevents duplicate submissions while generation is in flight
 * - Retains existing valid plan if a generation or regeneration fails
 * - Exposes full generation, section-specific regeneration, and retry functionality
 */

import { useState, useCallback, useEffect } from 'react';
import type { EventDraft } from '../types/event';
import type {
  GeneratedEventPlan,
  GenerationState,
  RegenerableSection,
  GeneratePlanRequest,
} from '../types/generatedPlan';
import { generateEventPlan, regenerateSection } from '../utils/apiClient';
import { adjustBudgetToNewTotal } from '../utils/budgetEngine';

const PLAN_STORAGE_KEY = 'gatherly_generated_plan_v2';

function loadPersistedPlan(expectedDraftId?: string): GeneratedEventPlan | null {
  try {
    const raw = localStorage.getItem(PLAN_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GeneratedEventPlan;
    if (
      parsed?.version &&
      parsed?.concept &&
      parsed?.budget &&
      (!expectedDraftId || parsed.eventDraftId === expectedDraftId)
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

function persistPlan(plan: GeneratedEventPlan | null): void {
  try {
    if (!plan) {
      localStorage.removeItem(PLAN_STORAGE_KEY);
    } else {
      localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(plan));
    }
  } catch {
    /* ignore storage quota limits */
  }
}

export function draftToRequest(draft: EventDraft): GeneratePlanRequest {
  return {
    eventDraftId: draft.id,
    eventName: draft.eventName,
    eventType: draft.eventType as GeneratePlanRequest['eventType'],
    date: draft.date,
    city: draft.city,
    guestCount: Number(draft.guestCount) || 1,
    budget: Number(draft.budget) || 1000,
    currency: (draft.currency as GeneratePlanRequest['currency']) || 'USD',
    foodPreferences: draft.foodPreferences || [],
    theme: draft.theme || '',
    specialRequirements: draft.specialRequirements || '',
  };
}

export function useEventPlan(draft: EventDraft | null) {
  const [state, setState] = useState<GenerationState>(() => ({
    status: 'idle',
    plan: loadPersistedPlan(draft?.id),
    error: null,
    lastAttemptAt: null,
    retryCount: 0,
  }));

  // Keep persisted plans scoped to the active event. Without this guard, a
  // newly created event can temporarily display the previous event's plan.
  useEffect(() => {
    const persistedPlan = loadPersistedPlan(draft?.id);
    setState(() => ({
      status: persistedPlan ? 'success' : 'idle',
      plan: persistedPlan,
      error: null,
      lastAttemptAt: null,
      retryCount: 0,
    }));
    persistPlan(persistedPlan);
  }, [draft?.id]);

  // Dynamically re-adjust budget numbers if the user modified draft budget or guest count
  useEffect(() => {
    if (!draft || !state.plan || state.plan.eventDraftId !== draft.id) return;

    const draftBudget = Number(draft.budget) || 0;
    const draftGuests = Number(draft.guestCount) || 0;

    if (
      draftBudget > 0 &&
      (draftBudget !== state.plan.budget.totalBudget ||
        draft.currency !== state.plan.budget.currency ||
        draftGuests !== Math.round(state.plan.budget.totalBudget / (state.plan.budget.perGuestCost || 1)))
    ) {
      setState((prev) => {
        if (!prev.plan) return prev;
        const updatedBudget = adjustBudgetToNewTotal(
          prev.plan.budget,
          draftBudget,
          draftGuests,
        );
        updatedBudget.currency = draft.currency;
        const updatedPlan: GeneratedEventPlan = {
          ...prev.plan,
          budget: updatedBudget,
        };
        persistPlan(updatedPlan);
        return {
          ...prev,
          plan: updatedPlan,
        };
      });
    }
  }, [draft?.budget, draft?.guestCount, draft?.currency]);

  // Full plan generation
  const generate = useCallback(async () => {
    if (!draft) return;
    if (state.status === 'generating') return; // Prevent duplicate submissions

    const request = draftToRequest(draft);

    setState((prev) => ({
      ...prev,
      status: 'generating',
      error: null,
      lastAttemptAt: new Date().toISOString(),
    }));

    try {
      const newPlan = await generateEventPlan(request);
      persistPlan(newPlan);
      setState((prev) => ({
        ...prev,
        status: 'success',
        plan: newPlan,
        error: null,
        retryCount: 0,
      }));
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred during plan generation.';
      setState((prev) => ({
        ...prev,
        status: 'error',
        // Preserve existing plan on failure — never overwrite with null
        error: msg,
        retryCount: prev.retryCount + 1,
      }));
    }
  }, [draft, state.status]);

  // Individual section regeneration
  const regenerate = useCallback(
    async (section: RegenerableSection) => {
      if (!draft || !state.plan) return;
      if (state.status === 'generating') return;

      const request = draftToRequest(draft);

      setState((prev) => ({
        ...prev,
        status: 'generating',
        error: null,
        lastAttemptAt: new Date().toISOString(),
      }));

      try {
        const updatedPlan = await regenerateSection(section, request, state.plan);
        persistPlan(updatedPlan);
        setState((prev) => ({
          ...prev,
          status: 'success',
          plan: updatedPlan,
          error: null,
          retryCount: 0,
        }));
      } catch (err: unknown) {
        const msg =
          err instanceof Error
            ? err.message
            : `Failed to regenerate ${section}.`;
        setState((prev) => ({
          ...prev,
          status: 'error',
          // Preserve existing plan on section regeneration failure
          error: msg,
          retryCount: prev.retryCount + 1,
        }));
      }
    },
    [draft, state.plan, state.status],
  );

  const clearPlan = useCallback(() => {
    persistPlan(null);
    setState({
      status: 'idle',
      plan: null,
      error: null,
      lastAttemptAt: null,
      retryCount: 0,
    });
  }, []);

  const dismissError = useCallback(() => {
    setState((prev) => ({
      ...prev,
      error: null,
      status: prev.plan ? 'success' : 'idle',
    }));
  }, []);

  return {
    plan: state.plan,
    status: state.status,
    error: state.error,
    retryCount: state.retryCount,
    lastAttemptAt: state.lastAttemptAt,
    generate,
    regenerate,
    clearPlan,
    dismissError,
    isGenerating: state.status === 'generating',
    hasError: state.status === 'error',
    hasPlan: state.plan !== null,
  };
}
