const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://kab-grant-system.onrender.com/api/v1';
const OPEN_CALLS_CACHE_KEY = 'kab_public_open_grant_calls';

export function cacheOpenGrantCallsForLanding(calls) {
  const openCalls = (calls || []).filter((call) => call.status === 'Open');
  try {
    localStorage.setItem(OPEN_CALLS_CACHE_KEY, JSON.stringify(openCalls));
  } catch {
    // ignore quota errors
  }
}

export function readCachedOpenGrantCalls() {
  try {
    const raw = localStorage.getItem(OPEN_CALLS_CACHE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((call) => call.status === 'Open') : [];
  } catch {
    return [];
  }
}

/**
 * Fetch grant calls from /admin/grant-calls.
 * No query params — grant_type filtering is done client-side only.
 */
export async function fetchGrantCalls({ token = null } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const authToken = token || localStorage.getItem('authToken');
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE}/admin/grant-calls`, { headers });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const detail = body.detail || `Failed to load grant calls (${response.status})`;
    throw new Error(typeof detail === 'string' ? detail : JSON.stringify(detail));
  }

  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

/** Open grant calls only, shaped for dropdowns. Requires authenticated staff/applicant. */
export async function getOpenGrantCallsForDropdown(grantType = null) {
  const calls = await fetchGrantCalls();
  return calls
    .filter((call) => call.status === 'Open')
    .filter((call) => !grantType || call.grant_type === grantType)
    .map((call) => ({
      id: call.id,
      value: call.id,
      title: call.title,
      label: `${call.title} (Closes: ${call.closing_date})`,
      grant_type: call.grant_type,
      status: call.status,
      description: call.description,
      opening_date: call.opening_date,
      closing_date: call.closing_date,
      academic_year: call.academic_year,
      max_budget: call.max_budget,
    }));
}

/**
 * Landing page: uses VITE_PUBLIC_GRANT_CALLS_TOKEN when set, else session token, else cache.
 */
export async function getOpenGrantCallsForLanding() {
  const publicToken = import.meta.env.VITE_PUBLIC_GRANT_CALLS_TOKEN;
  const sessionToken = localStorage.getItem('authToken');
  const token = publicToken || sessionToken || null;

  try {
    const calls = await fetchGrantCalls({ token });
    const openCalls = calls.filter((call) => call.status === 'Open');
    cacheOpenGrantCallsForLanding(openCalls);
    return openCalls;
  } catch (error) {
    const cached = readCachedOpenGrantCalls();
    if (cached.length > 0) return cached;
    console.warn('Landing grant calls unavailable:', error.message);
    return [];
  }
}
