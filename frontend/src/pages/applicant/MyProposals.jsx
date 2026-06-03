import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, FileText, Users, Upload, Edit, Trash2, Send, Eye } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import Loader from '../../components/common/Loader';
import { getMyProposals, deleteDraft, submitProposal } from '../../api/applicantApi';

export default function MyProposals() {
  const navigate = useNavigate();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [expandedAttachments, setExpandedAttachments] = useState({});

  // Required attachments with file format and size info
  const REQUIRED_ATTACHMENTS = [
    { id: 'ganttChart', label: 'a) Gantt Chart', formats: ['.pdf', '.xlsx', '.xls'], maxSize: 5 * 1024 * 1024 },
    { id: 'budget', label: 'b) Budget (using the provided Budget Template)', formats: ['.xlsx', '.xls'], maxSize: 10 * 1024 * 1024 },
    { id: 'nationalId', label: 'c) Copy of Lead Applicant\'s National ID', formats: ['.pdf', '.jpg', '.jpeg', '.png'], maxSize: 5 * 1024 * 1024 },
    { id: 'letterOfConfirmation', label: 'd) Letter of confirmation / contract / latest promotion', formats: ['.pdf'], maxSize: 5 * 1024 * 1024 },
    { id: 'teamCVs', label: 'e) Abridged CVs of key team members', formats: ['.pdf'], maxSize: 10 * 1024 * 1024 },
    { id: 'consentForms', label: 'f) Consent forms for project participants', formats: ['.pdf'], maxSize: 10 * 1024 * 1024 },
    { id: 'researchInstruments', label: 'g) Research instruments / tools', formats: ['.pdf', '.docx', '.doc'], maxSize: 15 * 1024 * 1024 },
  ];

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        setLoading(true);
        const data = await getMyProposals();
        setProposals(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProposals();
  }, []);

  const handleDelete = async (proposalId) => {
    if (!window.confirm('Are you sure you want to delete this draft? This action cannot be undone.')) {
      return;
    }

    try {
      setActionLoading(proposalId);
      await deleteDraft(proposalId);
      setProposals((prev) => prev.filter((p) => p.id !== proposalId));
      setActionSuccess('Draft deleted successfully');
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete draft');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSubmit = async (proposalId) => {
    try {
      setActionLoading(proposalId);
      await submitProposal(proposalId);
      // Refresh the proposals list
      const updatedProposals = await getMyProposals();
      setProposals(updatedProposals);
      setActionSuccess('Proposal submitted successfully');
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to submit proposal');
    } finally {
      setActionLoading(null);
    }
  }

  const getStatusBadge = (status) => {
    const variants = {
      draft: 'default',
      submitted: 'info',
      under_review: 'warning',
      approved: 'success',
      rejected: 'danger',
    };
    return variants[status] || 'default';
  };

  const getStatusLabel = (status) => {
    const labels = {
      draft: 'Draft',
      submitted: 'Submitted',
      under_review: 'Under Review',
      approved: 'Approved',
      rejected: 'Rejected',
    };
    return labels[status] || status;
  };

  const getProposalTypeBadge = (proposalType) => {
    const variants = {
      research: 'info',
      innovation: 'accent',
    };
    return variants[proposalType] || 'default';
  };

  const getProposalTypeLabel = (proposalType) => {
    const labels = {
      research: 'Research',
      innovation: 'Innovation',
    };
    return labels[proposalType] || proposalType;
  };

  const toggleAttachmentsExpand = (proposalId) => {
    setExpandedAttachments((prev) => ({
      ...prev,
      [proposalId]: !prev[proposalId],
    }));
  };

  const getMissingAttachments = (proposal) => {
    if (!proposal.attachments) return REQUIRED_ATTACHMENTS;
    const uploadedIds = proposal.attachments.map(att => att.id || att.type);
    return REQUIRED_ATTACHMENTS.filter(att => !uploadedIds.includes(att.id));
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) return <Loader />;

  return (
    <DashboardLayout role="applicant">
      <PageHeader
        title="My Proposals"
        subtitle="View and manage all your research proposals"
      />

      {error && <Alert variant="danger">{error}</Alert>}
      {actionSuccess && <Alert variant="success">{actionSuccess}</Alert>}

      <Card>
        {proposals.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted mb-4">No proposals found.</p>
          </div>
        ) : (
          <div className="w-full space-y-2">
            {proposals.map((proposal) => {
              const isExpanded = expandedAttachments[proposal.id];
              const missingAttachments = getMissingAttachments(proposal);
              const uploadedAttachments = proposal.attachments || [];
              
              return (
                <div key={proposal.id} className="border border-border rounded-lg overflow-hidden">
                  {/* Main Row */}
                  <div className="hover:bg-background transition">
                    <table className="w-full text-sm">
                      <tbody>
                        <tr className="border-b border-border">
                          <td className="py-4 px-4 font-semibold text-textMain">{proposal.protocolNo}</td>
                          <td className="py-4 px-4 text-textMain">{proposal.title}</td>
                          {/* Upload Attachments Column - Expandable Button */}
                          <td className="py-4 px-4">
                            <button
                              onClick={() => toggleAttachmentsExpand(proposal.id)}
                              className={`px-4 py-2 rounded font-semibold text-white text-sm flex items-center gap-2 transition ${
                                missingAttachments.length > 0
                                  ? 'bg-warning hover:bg-opacity-90'
                                  : 'bg-success hover:bg-opacity-90'
                              }`}
                            >
                              <FileText size={16} />
                              {missingAttachments.length > 0
                                ? `Upload (${missingAttachments.length} missing)`
                                : 'All Uploaded'}
                              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                          </td>
                          <td className="py-4 px-4">
                            <Badge variant={getStatusBadge(proposal.status)}>
                              {getStatusLabel(proposal.status)}
                              {missingAttachments.length > 0 && ` (${missingAttachments.length} files)`}
                            </Badge>
                          </td>
                          <td className="py-4 px-4 text-textMain">
                            <div className="flex items-center gap-2">
                              <Users size={16} className="text-muted" />
                              {proposal.membersCount || 0}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            {proposal.reviewReport ? (
                              <Badge variant="info">Available</Badge>
                            ) : (
                              <span className="text-muted text-xs">-</span>
                            )}
                          </td>
                          {/* Action Column */}
                          <td className="py-4 px-4">
                            <div className="flex gap-2">
                              {proposal.status === 'draft' && (
                                <>
                                  <button
                                    onClick={() => {
                                      const editPath = proposal.proposal_type === 'research'
                                        ? `/applicant/proposals/${proposal.id}/edit/research`
                                        : `/applicant/proposals/${proposal.id}/edit/innovation`;
                                      navigate(editPath);
                                    }}
                                    disabled={actionLoading === proposal.id}
                                    className="p-2 hover:bg-accent hover:text-white rounded transition disabled:opacity-50"
                                    title="Edit Proposal"
                                  >
                                    <Edit size={18} />
                                  </button>
                                  <button
                                    onClick={() => navigate(`/applicant/proposals/${proposal.id}/team-members`)}
                                    disabled={actionLoading === proposal.id}
                                    className="p-2 hover:bg-accent hover:text-white rounded transition disabled:opacity-50"
                                    title="Manage Team Members"
                                  >
                                    <Users size={18} />
                                  </button>
                                  <button
                                    onClick={() => handleSubmit(proposal.id)}
                                    disabled={actionLoading === proposal.id || missingAttachments.length > 0}
                                    className="p-2 hover:bg-success hover:text-white rounded transition disabled:opacity-50"
                                    title={missingAttachments.length > 0 ? 'Complete attachments before submitting' : 'Submit Proposal'}
                                  >
                                    <Send size={18} />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(proposal.id)}
                                    disabled={actionLoading === proposal.id}
                                    className="p-2 hover:bg-danger hover:text-white rounded transition disabled:opacity-50"
                                    title="Delete Draft"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                </>
                              )}
                              {proposal.status !== 'draft' && (
                                <button
                                  onClick={() => navigate(`/applicant/proposals/${proposal.id}`)}
                                  disabled={actionLoading === proposal.id}
                                  className="p-2 hover:bg-accent hover:text-white rounded transition disabled:opacity-50"
                                  title="View Details"
                                >
                                  <Eye size={18} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Expandable Attachments Section */}
                  {isExpanded && (
                    <div className="bg-background border-t border-border p-4">
                      <h4 className="font-semibold text-textMain mb-4">📎 Attachments Required</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-border">
                              <th className="text-left py-2 px-3 font-semibold text-textMain">Item</th>
                              <th className="text-left py-2 px-3 font-semibold text-textMain">Attachment</th>
                            </tr>
                          </thead>
                          <tbody>
                            {REQUIRED_ATTACHMENTS.map((required) => {
                              const uploaded = uploadedAttachments.find(att => (att.id || att.type) === required.id);
                              
                              return (
                                <tr key={required.id} className="border-b border-border hover:bg-gray-50">
                                  <td className="py-3 px-3 text-textMain">{required.label}</td>
                                  <td className="py-3 px-3">
                                    {uploaded ? (
                                      <a
                                        href={uploaded.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-accent hover:underline font-semibold flex items-center gap-1 w-fit"
                                        title={`Download ${uploaded.name}`}
                                      >
                                        <FileText size={14} />
                                        {uploaded.name}
                                      </a>
                                    ) : (
                                      <button
                                        onClick={() => navigate(`/applicant/proposals/${proposal.id}/documents`)}
                                        className="text-accent hover:underline font-semibold flex items-center gap-1"
                                      >
                                        <Upload size={14} />
                                        Upload
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </DashboardLayout>
  );
}
