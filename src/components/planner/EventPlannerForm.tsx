import React, { useState } from 'react';
import {
  CalendarHeart,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  LayoutDashboard,
  MapPin,
  Utensils,
  Palette,
  FileEdit,
} from 'lucide-react';
import {
  EventFormData,
  EventType,
  FoodPreference,
  FormErrors,
  EventDraft,
} from '../../types/event';
import { validateEventForm, isFormValid } from '../../utils/validation';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Badge } from '../common/Badge';

interface EventPlannerFormProps {
  initialData?: Partial<EventFormData>;
  onSaveDraft: (draft: EventDraft) => void;
  onNavigateToDashboard: () => void;
}

const DEFAULT_FORM: EventFormData = {
  eventName: '',
  eventType: '',
  date: '',
  city: '',
  guestCount: '',
  budget: '',
  currency: 'USD',
  foodPreferences: [],
  theme: '',
  specialRequirements: '',
};

export const EventPlannerForm: React.FC<EventPlannerFormProps> = ({
  initialData,
  onSaveDraft,
  onNavigateToDashboard,
}) => {
  const [formData, setFormData] = useState<EventFormData>({
    ...DEFAULT_FORM,
    ...initialData,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const eventTypeOptions = [
    { value: 'wedding', label: 'Wedding & Reception' },
    { value: 'birthday', label: 'Milestone Birthday' },
    { value: 'anniversary', label: 'Milestone Anniversary' },
    { value: 'community', label: 'Community Event / Gala' },
    { value: 'dinner_party', label: 'Intimate Dinner Party' },
    { value: 'corporate', label: 'Corporate & Networking' },
  ];

  const currencyOptions = [
    { value: 'USD', label: '$ USD - US Dollar' },
    { value: 'EUR', label: '€ EUR - Euro' },
    { value: 'GBP', label: '£ GBP - British Pound' },
    { value: 'CAD', label: '$ CAD - Canadian Dollar' },
    { value: 'AUD', label: '$ AUD - Australian Dollar' },
    { value: 'INR', label: '₹ INR - Indian Rupee' },
  ];

  const dietaryOptions: { id: FoodPreference; label: string }[] = [
    { id: 'omnivore', label: 'Standard / Omnivore' },
    { id: 'vegetarian', label: 'Vegetarian' },
    { id: 'vegan', label: 'Vegan' },
    { id: 'gluten_free', label: 'Gluten-Free' },
    { id: 'halal', label: 'Halal Certified' },
    { id: 'kosher', label: 'Kosher' },
    { id: 'nut_free', label: 'Nut-Free Strict' },
  ];

  const handleFieldChange = (field: keyof EventFormData, value: unknown) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);

    if (submitAttempted || touched[field]) {
      const validationErrors = validateEventForm(updated);
      setErrors(validationErrors);
    }
  };

  const handleBlur = (field: keyof EventFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const validationErrors = validateEventForm(formData);
    setErrors(validationErrors);
  };

  const toggleDietary = (pref: FoodPreference) => {
    const current = [...formData.foodPreferences];
    const index = current.indexOf(pref);
    if (index >= 0) {
      current.splice(index, 1);
    } else {
      current.push(pref);
    }
    handleFieldChange('foodPreferences', current);
  };

  const handlePreloadSample = () => {
    // Generates a clean realistic test celebration to verify form validation in 1 click
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 2);
    const dateStr = nextMonth.toISOString().split('T')[0];

    const sample: EventFormData = {
      eventName: "Eleanor & Liam's Autumn Vineyard Celebration",
      eventType: 'wedding',
      date: dateStr,
      city: 'Sonoma Valley, CA',
      guestCount: 120,
      budget: 35000,
      currency: 'USD',
      foodPreferences: ['omnivore', 'vegetarian', 'gluten_free'],
      theme: 'Warm Olive, Linen & Candlelit Rustic Elegance',
      specialRequirements: 'Acoustic quartet for ceremony, outdoor heaters on standby, wheelchair accessibility ramp for garden arbor.',
    };

    setFormData(sample);
    setErrors({});
    setSuccessNotice('Loaded sample event details. You can inspect or customize any field.');
    setTimeout(() => setSuccessNotice(null), 4000);
  };

  const handleReset = () => {
    setFormData(DEFAULT_FORM);
    setErrors({});
    setTouched({});
    setSubmitAttempted(false);
    setSuccessNotice('Form reset to blank.');
    setTimeout(() => setSuccessNotice(null), 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);

    const validationErrors = validateEventForm(formData);
    setErrors(validationErrors);

    if (!isFormValid(validationErrors)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const draft: EventDraft = {
      ...formData,
      id: (initialData as EventDraft)?.id || `evt-${Date.now()}`,
      createdAt: (initialData as EventDraft)?.createdAt || new Date().toISOString(),
      status: 'ready_for_ai',
    };

    onSaveDraft(draft);
    setSuccessNotice('Event details validated and saved to workspace!');
  };

  // Calculate today's date formatted as YYYY-MM-DD for min attribute
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      {/* Top Header */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
          <Badge variant="coral">Event Configuration</Badge>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handlePreloadSample}
              leftIcon={<FileEdit className="w-3.5 h-3.5 text-coral-600" />}
            >
              Fill Sample Event
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleReset}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Reset
            </Button>
          </div>
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900 tracking-tight">
          Plan Your Celebration
        </h1>
        <p className="mt-2 text-charcoal-600 text-sm sm:text-base leading-relaxed">
          Provide your celebration logistics below. Your validated details are saved into the workspace and used to generate a tailored Gemini event plan.
        </p>
      </div>

      {/* Success Notification */}
      {successNotice && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successNotice}</span>
          </div>
          <button
            onClick={() => setSuccessNotice(null)}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 ml-4 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Form Error Banner if submit attempted and errors exist */}
      {submitAttempted && !isFormValid(errors) && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Please resolve the highlighted fields before proceeding:</p>
            <ul className="mt-1 list-disc list-inside text-xs space-y-0.5 text-red-700">
              {Object.values(errors).map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Main Form Card */}
      <Card elevated className="p-6 sm:p-8 bg-white border-sand-300">
        <form onSubmit={handleSubmit} noValidate className="space-y-8">
          {/* Section 1: Event Identity */}
          <div>
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-sand-200">
              <CalendarHeart className="w-4 h-4 text-coral-600" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-charcoal-800">
                1. Celebration Identity
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <Input
                  label="Celebration Name"
                  id="eventName"
                  name="eventName"
                  placeholder="e.g., Sarah & David's Autumn Wedding or Marcus's 40th Birthday"
                  value={formData.eventName}
                  onChange={(e) => handleFieldChange('eventName', e.target.value)}
                  onBlur={() => handleBlur('eventName')}
                  error={touched.eventName || submitAttempted ? errors.eventName : undefined}
                  required
                />
              </div>

              <div>
                <Select
                  label="Event Type"
                  id="eventType"
                  name="eventType"
                  options={eventTypeOptions}
                  placeholder="Select event archetype..."
                  value={formData.eventType}
                  onChange={(e) => handleFieldChange('eventType', e.target.value as EventType)}
                  onBlur={() => handleBlur('eventType')}
                  error={touched.eventType || submitAttempted ? errors.eventType : undefined}
                  required
                />
              </div>

              <div>
                <Input
                  label="Event Date"
                  id="date"
                  name="date"
                  type="date"
                  min={todayStr}
                  value={formData.date}
                  onChange={(e) => handleFieldChange('date', e.target.value)}
                  onBlur={() => handleBlur('date')}
                  error={touched.date || submitAttempted ? errors.date : undefined}
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 2: Location & Scale */}
          <div>
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-sand-200">
              <MapPin className="w-4 h-4 text-coral-600" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-charcoal-800">
                2. Scale & Budget
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <Input
                  label="City / Region"
                  id="city"
                  name="city"
                  placeholder="e.g., Seattle, WA or London, UK"
                  value={formData.city}
                  onChange={(e) => handleFieldChange('city', e.target.value)}
                  onBlur={() => handleBlur('city')}
                  error={touched.city || submitAttempted ? errors.city : undefined}
                  required
                />
              </div>

              <div>
                <Input
                  label="Guest Count"
                  id="guestCount"
                  name="guestCount"
                  type="number"
                  min="1"
                  max="100000"
                  placeholder="e.g., 85"
                  value={formData.guestCount}
                  onChange={(e) =>
                    handleFieldChange(
                      'guestCount',
                      e.target.value === '' ? '' : Number(e.target.value)
                    )
                  }
                  onBlur={() => handleBlur('guestCount')}
                  error={touched.guestCount || submitAttempted ? errors.guestCount : undefined}
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <Input
                    label="Estimated Budget"
                    id="budget"
                    name="budget"
                    type="number"
                    min="1"
                    placeholder="e.g., 25000"
                    value={formData.budget}
                    onChange={(e) =>
                      handleFieldChange(
                        'budget',
                        e.target.value === '' ? '' : Number(e.target.value)
                      )
                    }
                    onBlur={() => handleBlur('budget')}
                    error={touched.budget || submitAttempted ? errors.budget : undefined}
                    required
                  />
                </div>
                <div className="col-span-1">
                  <Select
                    label="Currency"
                    id="currency"
                    name="currency"
                    options={currencyOptions}
                    value={formData.currency}
                    onChange={(e) => handleFieldChange('currency', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Dining & Dietary Requirements */}
          <div>
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-sand-200">
              <Utensils className="w-4 h-4 text-coral-600" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-charcoal-800">
                3. Dietary & Catering Preferences
              </h2>
            </div>

            <p className="text-xs text-charcoal-600 mb-3">
              Select all dietary requirements your catering plan should accommodate:
            </p>

            <div className="flex flex-wrap gap-2">
              {dietaryOptions.map((opt) => {
                const isSelected = formData.foodPreferences.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleDietary(opt.id)}
                    className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-coral-500 text-white shadow-subtle'
                        : 'bg-ivory-50 text-charcoal-700 border border-sand-300 hover:border-sand-400'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 4: Aesthetic Theme & Special Requests */}
          <div>
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-sand-200">
              <Palette className="w-4 h-4 text-coral-600" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-charcoal-800">
                4. Theme & Special Requirements
              </h2>
            </div>

            <div className="space-y-4">
              <Input
                label="Aesthetic Theme / Vibe"
                id="theme"
                name="theme"
                placeholder="e.g., Warm Mediterranean Garden, Minimalist Candlelight, or Retro Disco Glam"
                value={formData.theme}
                onChange={(e) => handleFieldChange('theme', e.target.value)}
                helperText="Optional: guides decoration styling and palette"
              />

              <div>
                <label
                  htmlFor="specialRequirements"
                  className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 mb-1.5"
                >
                  Special Requirements & Notes
                </label>
                <textarea
                  id="specialRequirements"
                  name="specialRequirements"
                  rows={3}
                  maxLength={1000}
                  placeholder="e.g., Needs acoustic sound permits until 11 PM, children's activity table, step-free access for elders, separate cocktail lounge..."
                  value={formData.specialRequirements}
                  onChange={(e) => handleFieldChange('specialRequirements', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-ivory-50 text-charcoal-900 border border-sand-300 hover:border-sand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 transition-colors"
                />
                <div className="flex justify-between text-[11px] text-charcoal-400 mt-1">
                  <span>Accessibility, audio restrictions, permits, or guest nuances</span>
                  <span>{formData.specialRequirements.length}/1000 characters</span>
                </div>
              </div>
            </div>
          </div>

          {/* GenAI Engine Architecture Notice */}
          <div className="p-4 rounded-xl bg-sand-100 border border-sand-300 flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-coral-600 mt-0.5 shrink-0" />
            <div className="text-xs text-charcoal-600 leading-relaxed">
              <strong className="text-charcoal-900">Gatherly AI GenAI Engine:</strong> Submitting this form validates your inputs and stores your celebration specifications in your workspace. Our Google Gemini engine will then generate a tailored event concept, reconciled budget allocations, run-of-show schedule, and vendor checklist.
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-sand-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onNavigateToDashboard}
              leftIcon={<LayoutDashboard className="w-4 h-4" />}
            >
              Go to Workspace Dashboard
            </Button>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
                className="w-full sm:w-auto font-semibold"
              >
                Validate & Save to Workspace
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
};
