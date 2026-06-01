import axiosClient from './axiosClient';

// ─── Faculties ────────────────────────────────────────────────────────────────

/**
 * Get all active faculties.
 * GET /api/v1/general/faculties
 * Returns array of: { id, name }
 * Used for: Registration form dropdown
 */
export async function getFaculties() {
  const response = await axiosClient.get('/general/faculties');
  return response.data.map((f) => ({
    id: f.id,
    label: f.name,
    value: f.id,
  }));
}

// ─── Departments ──────────────────────────────────────────────────────────────

/**
 * Get departments, optionally filtered by faculty.
 * GET /api/v1/general/departments?faculty_id={id}
 * Returns array of: { id, name, faculty_id }
 * Used for: Registration/Proposal forms - dynamically load by faculty
 */
export async function getDepartments(facultyId) {
  const response = await axiosClient.get('/general/departments', {
    params: facultyId ? { faculty_id: facultyId } : {},
  });
  return response.data.map((d) => ({
    id: d.id,
    label: d.name,
    value: d.id,
    faculty_id: d.faculty_id,
  }));
}

// ─── System Settings ──────────────────────────────────────────────────────────

/**
 * Get current system settings.
 * GET /api/v1/general/settings
 * Returns: { id, system_name, system_motto, address, email, phone,
 *            active_academic_year, submission_deadline, is_accepting_applications }
 * Used for: Display settings, check if applications are open
 */
export async function getSystemSettings() {
  const response = await axiosClient.get('/general/settings');
  return response.data;
}

// ─── DEPRECATED/LOCAL-ONLY FUNCTIONS ──────────────────────────────────────────

/**
 * @deprecated Research disciplines not exposed by API
 * These should be configured server-side during reviewer creation
 */
export async function getResearchDisciplines() {
  console.warn('getResearchDisciplines: API endpoint not available');
  return [];
}

/**
 * @deprecated Innovation specializations not exposed by API
 * Should be implemented as backend reference data if needed
 */
export async function getInnovationSpecializations() {
  console.warn('getInnovationSpecializations: API endpoint not available');
  return [];
}

/**
 * @deprecated Use adminApi.getGrantCalls() instead
 */
export async function getGrantCalls() {
  console.warn('getGrantCalls: Use adminApi.getGrantCalls() instead');
  return [];
}
