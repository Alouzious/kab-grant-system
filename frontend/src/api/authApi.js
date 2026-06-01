import axiosClient from './axiosClient';

// ─── Auth ─────────────────────────────────────────────────────────────────────

/**
 * Register a new staff user.
 * POST /api/v1/auth/register
 * Body: { first_name, surname, other_name, gender, phone, email, password, confirm_password, faculty_id, department_id }
 */
export const registerUser = async (payload) => {
  const response = await axiosClient.post('/auth/register', {
    first_name: payload.first_name,
    surname: payload.surname,
    other_name: payload.other_name || '',
    gender: payload.gender,
    phone: payload.phone,
    email: payload.email,
    password: payload.password,
    confirm_password: payload.confirm_password,
    faculty_id: payload.faculty_id ? Number(payload.faculty_id) : null,
    department_id: payload.department_id ? Number(payload.department_id) : null,
  });
  return response.data;
};

/**
 * Login for all user types.
 * POST /api/v1/auth/login
 * Body: { email, password }
 * Returns: { access_token, refresh_token, token_type, user_id, role, must_change_password }
 */
export const loginUser = async (payload) => {
  const response = await axiosClient.post('/auth/login', {
    email: payload.email,
    password: payload.password,
  });
  return response.data;
};

/**
 * Get current authenticated user profile.
 * GET /api/v1/auth/me
 * Returns: { id, first_name, surname, other_name, gender, phone, email, role, faculty_id, department_id, is_active, created_at }
 */
export const getMe = async () => {
  const response = await axiosClient.get('/auth/me');
  return response.data;
};

/**
 * Refresh access token.
 * POST /api/v1/auth/refresh
 * Body: { refresh_token }
 * Returns: { access_token, refresh_token, token_type, user_id, role, must_change_password }
 */
export const refreshToken = async (refreshTokenValue) => {
  const response = await axiosClient.post('/auth/refresh', {
    refresh_token: refreshTokenValue,
  });
  return response.data;
};

/**
 * Change password for logged-in user.
 * POST /api/v1/auth/change-password
 * Body: { current_password, new_password, confirm_password }
 * Returns: { message }
 */
export const changePassword = async (payload) => {
  const response = await axiosClient.post('/auth/change-password', {
    current_password: payload.current_password,
    new_password: payload.new_password,
    confirm_password: payload.confirm_password,
  });
  return response.data;
};

/**
 * Request a password reset OTP.
 * POST /api/v1/auth/forgot-password
 * Body: { email }
 * Returns: { message }
 */
export const forgotPassword = async (payload) => {
  const response = await axiosClient.post('/auth/forgot-password', {
    email: payload.email,
  });
  return response.data;
};

/**
 * Reset password using OTP code.
 * POST /api/v1/auth/reset-password
 * Body: { email, otp_code, new_password, confirm_password }
 * Returns: { message }
 */
export const resetPassword = async (payload) => {
  const response = await axiosClient.post('/auth/reset-password', {
    email: payload.email,
    otp_code: payload.otp_code,
    new_password: payload.new_password,
    confirm_password: payload.confirm_password,
  });
  return response.data;
};

// ─── Grant Calls ──────────────────────────────────────────────────────────────

/**
 * List all grant calls.
 * GET /api/v1/admin/grant-calls
 */
export const getGrantCalls = async () => {
  const response = await axiosClient.get('/admin/grant-calls');
  return response.data;
};

/**
 * Create a new grant call.
 * POST /api/v1/admin/grant-calls
 * Body: { title, description, deadline, academic_year, application_window_open, application_window_close, eligibility_requirements, guidelines_file }
 */
export const createGrantCall = async (payload) => {
  const response = await axiosClient.post('/admin/grant-calls', payload);
  return response.data;
};

/**
 * Update an existing grant call.
 * PUT /api/v1/admin/grant-calls/{call_id}
 */
export const updateGrantCall = async (callId, payload) => {
  const response = await axiosClient.put(`/admin/grant-calls/${callId}`, payload);
  return response.data;
};

/**
 * Delete a grant call.
 * DELETE /api/v1/admin/grant-calls/{call_id}
 */
export const deleteGrantCall = async (callId) => {
  const response = await axiosClient.delete(`/admin/grant-calls/${callId}`);
  return response.data;
};

/**
 * Open the application window for a grant call.
 * POST /api/v1/admin/grant-calls/{call_id}/open-window
 */
export const openApplicationWindow = async (callId) => {
  const response = await axiosClient.post(`/admin/grant-calls/${callId}/open-window`);
  return response.data;
};

/**
 * Close the application window for a grant call.
 * POST /api/v1/admin/grant-calls/{call_id}/close-window
 */
export const closeApplicationWindow = async (callId) => {
  const response = await axiosClient.post(`/admin/grant-calls/${callId}/close-window`);
  return response.data;
};