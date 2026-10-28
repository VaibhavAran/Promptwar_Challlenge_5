export function formatCurrency(amount: number | '', currency = 'USD'): string {
  if (amount === '' || isNaN(Number(amount))) return '—';
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    }).format(Number(amount));
  } catch {
    return `${currency} ${amount}`;
  }
}

export function formatDate(dateString: string): string {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatEventType(type: string): string {
  const map: Record<string, string> = {
    birthday: 'Birthday Celebration',
    wedding: 'Wedding & Reception',
    anniversary: 'Anniversary Milestone',
    community: 'Community Gathering',
    dinner_party: 'Intimate Dinner Party',
    corporate: 'Corporate & Networking',
  };
  return map[type] || type || 'Celebration';
}
