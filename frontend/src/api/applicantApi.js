import axiosClient from './axiosClient';

// ─── Dashboard ────────────────────────────────────────────────────────────────

/**
 * Get applicant dashboard statistics (not in official API - custom endpoint for UI).
 * GET /api/v1/proposals/my (alternatively get stats from list)
 * Returns proposal summary for logged-in user
 */
export const getApplicantDashboard = async () => {
  try {
    // Get user's proposals to calculate stats
    const proposals = await getMyProposals();
    const stats = {
      totalProposals: proposals.length,
      draft: proposals.filter((p) => p.status === 'Draft').length,
      submitted: proposals.filter((p) => p.status === 'Submitted').length,
      underReview: proposals.filter((p) => p.status === 'Scheduled for Review' || p.status === 'Reviewed').length,
      approved: proposals.filter((p) => p.status === 'Approved').length,
      rejected: proposals.filter((p) => p.status === 'Rejected').length,
      awarded: proposals.filter((p) => p.status === 'Awarded').length,
    };
    return {
      proposals: proposals.slice(0, 5),
      stats,
    };
  } catch (error) {
    console.error('Failed to fetch applicant dashboard:', error);
    throw error;
  }
};

// ─── My Proposals ─────────────────────────────────────────────────────────────

/**
 * Get all proposals created by logged-in staff member.
 * GET /api/v1/proposals/my
 * Returns array of proposal summary objects
 */
export const getMyProposals = async () => {
  const response = await axiosClient.get('/proposals/my');
  return response.data;
};

/**
 * Get full details of a single proposal (only own proposals for staff).
 * GET /api/v1/proposals/{proposal_id}
 * Returns full proposal object with all fields
 */
export const getProposalDetails = async (proposalId) => {
  const response = await axiosClient.get(`/proposals/${proposalId}`);
  return response.data;
};

// ─── Create & Update Proposals ────────────────────────────────────────────────

/**
 * Create a new proposal (draft).
 * POST /api/v1/proposals
 * Body: Full proposal object (see schema)
 * Returns created proposal with id, protocol_no, status=Draft
 */
export const createProposalDraft = async (payload) => {
  const response = await axiosClient.post('/proposals', {
    grant_type: payload.grant_type,
    pi_first_name: payload.pi_first_name,
    pi_last_name: payload.pi_last_name,
    pi_qualification: payload.pi_qualification,
    pi_gender: payload.pi_gender,
    pi_designation: payload.pi_designation,
    pi_faculty_id: payload.pi_faculty_id,
    pi_department: payload.pi_department,
    pi_research_specialization: payload.pi_research_specialization,
    pi_email: payload.pi_email,
    pi_phone: payload.pi_phone,
    research_type: payload.research_type,
    title: payload.title,
    project_summary: payload.project_summary,
    problem_statement: payload.problem_statement,
    proposed_solution: payload.proposed_solution,
    relevance: payload.relevance,
    innovativeness: payload.innovativeness,
    main_objective: payload.main_objective,
    specific_objectives: payload.specific_objectives,
    methods_description: payload.methods_description,
    outcomes: payload.outcomes,
    dissemination_plan: payload.dissemination_plan,
    policy_impact: payload.policy_impact,
    scalability: payload.scalability,
    sustainability: payload.sustainability,
    gender_considerations: payload.gender_considerations,
    ethical_impact: payload.ethical_impact,
    capacity_building: payload.capacity_building,
    conflict_of_interest: payload.conflict_of_interest,
    references: payload.references,
    total_budget: payload.total_budget ? Number(payload.total_budget) : 0,
  });
  return response.data;
};

/**
 * Update a draft proposal.
 * PATCH /api/v1/proposals/{proposal_id}
 * Body: Proposal fields to update (partial update)
 * Returns updated proposal object
 */
export const updateProposal = async (proposalId, payload) => {
  const updateData = {};
  
  // Include all fields that are in the payload
  const allowedFields = [
    'pi_first_name', 'pi_last_name', 'pi_qualification', 'pi_gender',
    'pi_designation', 'pi_faculty_id', 'pi_department', 'pi_research_specialization',
    'pi_email', 'pi_phone', 'research_type', 'title', 'project_summary',
    'problem_statement', 'proposed_solution', 'relevance', 'innovativeness',
    'main_objective', 'specific_objectives', 'methods_description', 'outcomes',
    'dissemination_plan', 'policy_impact', 'scalability', 'sustainability',
    'gender_considerations', 'ethical_impact', 'capacity_building',
    'conflict_of_interest', 'references', 'total_budget',
  ];

  allowedFields.forEach((field) => {
    if (field in payload) {
      updateData[field] = field === 'total_budget' && payload[field] 
        ? Number(payload[field]) 
        : payload[field];
    }
  });

  const response = await axiosClient.patch(`/proposals/${proposalId}`, updateData);
  return response.data;
};

/**
 * @deprecated Use updateProposal instead
 */
export const updateProposalDraft = updateProposal;

/**
 * Delete a draft proposal.
 * DELETE /api/v1/proposals/{proposal_id}
 * Only draft proposals can be deleted
 * Returns: { message }
 */
export const deleteDraft = async (proposalId) => {
  const response = await axiosClient.delete(`/proposals/${proposalId}`);
  return response.data;
};

// ─── Attachments ──────────────────────────────────────────────────────────────

/**
 * Get all attachments for a proposal.
 * GET /api/v1/proposals/{proposal_id}
 * Attachments array included in main proposal response
 */
export const getProposalAttachments = async (proposalId) => {
  const proposal = await getProposalDetails(proposalId);
  return proposal.attachments || [];
};

/**
 * Upload a supporting document for a proposal.
 * POST /api/v1/proposals/{proposal_id}/attachments
 * Body (multipart/form-data): { attachment_type, file }
 * attachment_type: "Gantt Chart"|"Budget"|"National ID"|"Confirmation Letter"|"CVs"|
 *                  "Consent Forms"|"Research Instruments"|"Faculty Support Evidence"|"Full Proposal Document"
 * Returns: { id, attachment_type, file_name, cloudinary_url, uploaded_at }
 */
export const uploadProposalAttachment = async (proposalId, attachmentType, file) => {
  const formData = new FormData();
  formData.append('attachment_type', attachmentType);
  formData.append('file', file);

  const response = await axiosClient.post(
    `/proposals/${proposalId}/attachments`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return response.data;
};

/**
 * Delete an attachment.
 * DELETE /api/v1/proposals/{proposal_id}/attachments/{attachment_id}
 * Returns: { message }
 */
export const deleteProposalAttachment = async (proposalId, attachmentId) => {
  // Note: API endpoint not explicitly in spec, but standard REST pattern
  const response = await axiosClient.delete(`/proposals/${proposalId}/attachments/${attachmentId}`);
  return response.data;
};

// ─── Team Members ─────────────────────────────────────────────────────────────

/**
 * Get all team members for a proposal.
 * GET /api/v1/proposals/{proposal_id}
 * Team members array included in main proposal response
 */
export const getProjectTeamMembers = async (proposalId) => {
  const proposal = await getProposalDetails(proposalId);
  return proposal.team_members || [];
};

/**
 * Add a project team member to a proposal.
 * POST /api/v1/proposals/{proposal_id}/team-members
 * Body: { first_name, last_name, qualification, gender, designation, faculty_id,
 *         department, specialization, email, phone }
 * Returns: { id, first_name, last_name, qualification, gender, designation,
 *            email, phone, created_at }
 */
export const addProjectTeamMember = async (proposalId, payload) => {
  const response = await axiosClient.post(`/proposals/${proposalId}/team-members`, {
    first_name: payload.first_name,
    last_name: payload.last_name,
    qualification: payload.qualification,
    gender: payload.gender,
    designation: payload.designation,
    faculty_id: payload.faculty_id || null,
    department: payload.department,
    specialization: payload.specialization || null,
    email: payload.email,
    phone: payload.phone || null,
  });
  return response.data;
};

/**
 * Remove a team member from a proposal.
 * DELETE /api/v1/proposals/{proposal_id}/team-members/{member_id}
 * Returns: { message }
 */
export const deleteProjectTeamMember = async (proposalId, memberId) => {
  const response = await axiosClient.delete(`/proposals/${proposalId}/team-members/${memberId}`);
  return response.data;
};

// ─── Proposal Submission ──────────────────────────────────────────────────────

/**
 * Submit a draft proposal.
 * Note: Not explicitly in API spec - may need custom endpoint
 * or use a status change endpoint
 */
export const submitProposal = async (proposalId) => {
  try {
    // Try PATCH approach (changing status)
    const response = await axiosClient.patch(`/proposals/${proposalId}`, {
      status: 'Submitted',
    });
    return response.data;
  } catch (error) {
    // If PATCH fails, proposal might auto-submit on last attachment
    console.warn('submitProposal: Auto-submission on last attachment or use PATCH');
    throw error;
  }
};

// ─── Notifications ────────────────────────────────────────────────────────────

/**
 * Get notifications for applicant (not in official API - custom endpoint).
 * This is a derived concept - notifications might come from proposal status changes
 */
export const getApplicantNotifications = async () => {
  try {
    const proposals = await getMyProposals();
    // Map proposal status changes to notifications
    return proposals.map((p) => ({
      id: p.id,
      type: 'proposal_status_change',
      title: `Proposal: ${p.title}`,
      message: `Status: ${p.status}`,
      timestamp: p.submitted_at || p.created_at,
    }));
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    return [];
  }
};
