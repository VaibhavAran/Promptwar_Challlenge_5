import { EventFormData, FormErrors } from '../types/event';

export function validateEventForm(data: EventFormData): FormErrors {
  const errors: FormErrors = {};

  if (!data.eventName || data.eventName.trim().length < 3) {
    errors.eventName = 'Event name is required (minimum 3 characters)';
  } else if (data.eventName.length > 80) {
    errors.eventName = 'Event name cannot exceed 80 characters';
  }

  if (!data.eventType) {
    errors.eventType = 'Please select an event type';
  }

  if (!data.date) {
    errors.date = 'Event date is required';
  } else {
    const selectedDate = new Date(data.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (isNaN(selectedDate.getTime())) {
      errors.date = 'Please enter a valid date';
    } else if (selectedDate < today) {
      errors.date = 'Event date cannot be in the past';
    }
  }

  if (!data.city || data.city.trim().length < 2) {
    errors.city = 'City or location is required';
  }

  if (data.guestCount === '' || data.guestCount === undefined || data.guestCount === null) {
    errors.guestCount = 'Guest count is required';
  } else if (Number(data.guestCount) <= 0) {
    errors.guestCount = 'Guest count must be at least 1';
  } else if (!Number.isInteger(Number(data.guestCount))) {
    errors.guestCount = 'Guest count must be a whole number';
  } else if (Number(data.guestCount) > 100000) {
    errors.guestCount = 'Guest count must be 100,000 or fewer';
  }

  if (data.budget === '' || data.budget === undefined || data.budget === null) {
    errors.budget = 'Estimated budget is required';
  } else if (Number(data.budget) <= 0) {
    errors.budget = 'Budget must be greater than 0';
  }

  if (data.specialRequirements && data.specialRequirements.length > 1000) {
    errors.specialRequirements = 'Special requirements must be under 1,000 characters';
  }

  return errors;
}

export function isFormValid(errors: FormErrors): boolean {
  return Object.keys(errors).length === 0;
}
