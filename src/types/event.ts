export type EventType =
  | 'birthday'
  | 'wedding'
  | 'anniversary'
  | 'community'
  | 'dinner_party'
  | 'corporate';

export type FoodPreference =
  | 'omnivore'
  | 'vegetarian'
  | 'vegan'
  | 'halal'
  | 'kosher'
  | 'gluten_free'
  | 'nut_free';

export interface EventFormData {
  eventName: string;
  eventType: EventType | '';
  date: string;
  city: string;
  guestCount: number | '';
  budget: number | '';
  currency: string;
  foodPreferences: FoodPreference[];
  theme: string;
  specialRequirements: string;
}

export type FormErrors = Partial<Record<keyof EventFormData, string>>;

export interface EventDraft extends EventFormData {
  id: string;
  createdAt: string;
  status: 'draft' | 'ready_for_ai';
}

export type ActiveView = 'landing' | 'planner' | 'dashboard';
export type DashboardTab = 'overview' | 'plan' | 'budget' | 'timeline' | 'checklist';
