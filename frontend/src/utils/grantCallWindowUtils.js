/** Grant call application window helpers (opening_date / closing_date). */

export function isGrantCallWithinWindow(call, today = new Date()) {
  if (!call) return false;
  const now = new Date(today);
  now.setHours(0, 0, 0, 0);

  if (call.status && call.status !== 'Open') return false;

  if (call.opening_date) {
    const opens = new Date(call.opening_date);
    opens.setHours(0, 0, 0, 0);
    if (now < opens) return false;
  }

  if (call.closing_date) {
    const closes = new Date(call.closing_date);
    closes.setHours(23, 59, 59, 999);
    if (now > closes) return false;
  }

  return true;
}

export function getGrantCallWindowStatus(call, today = new Date()) {
  if (!call) return { state: 'closed', label: 'Closed', canApply: false };

  if (call.status === 'Closed' || call.status === 'Draft') {
    return { state: 'closed', label: call.status === 'Draft' ? 'Coming Soon' : 'Closed', canApply: false };
  }

  const now = new Date(today);
  now.setHours(0, 0, 0, 0);

  if (call.opening_date) {
    const opens = new Date(call.opening_date);
    opens.setHours(0, 0, 0, 0);
    if (now < opens) {
      return { state: 'upcoming', label: 'Opens Soon', canApply: false };
    }
  }

  if (call.closing_date) {
    const closes = new Date(call.closing_date);
    closes.setHours(0, 0, 0, 0);
    if (now > closes) {
      return { state: 'closed', label: 'Closed', canApply: false };
    }
  }

  return { state: 'open', label: 'Open for Applications', canApply: true };
}

export function daysUntilClosing(dateStr) {
  if (!dateStr) return null;
  const diff = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
  if (diff <= 0) return 'Deadline passed';
  return `${diff} days left`;
}

export function filterActiveGrantCalls(calls) {
  return (calls || []).filter((call) => isGrantCallWithinWindow(call));
}
