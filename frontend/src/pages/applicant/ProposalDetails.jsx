import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Alert from '../../components/common/Alert';
import Loader from '../../components/common/Loader';
import { getProposalDetails } from '../../api/applicantApi';

export default function ProposalDetails() {
  const { id: proposalId } = useParams();
  const navigate = useNavigate();
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProposal = async () => {
      try {
        setLoading(true);
        const data = await getProposalDetails(proposalId);
        setProposal(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProposal();
  }, [proposalId]);

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

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) return <Loader />;
  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!proposal) return <Alert variant="info">Proposal not found</Alert>;

  const displayTitle = proposal.title || proposal.projectTitle || proposal.proposal_title || 'Untitled Proposal';

  return (
    <DashboardLayout role="applicant">
      <PageHeader
        title={displayTitle}
        subtitle={`Protocol: ${proposal.protocolNo}`}
      />

      <div className="space-y-6">
        {/* Summary Card */}
        <Card title="Proposal Summary">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm font-medium text-muted mb-1">Status</p>
              <Badge variant={getStatusBadge(proposal.status)}>
                {getStatusLabel(proposal.status)}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted mb-1">Type</p>
              {proposal.proposal_type && (
                <Badge variant={getProposalTypeBadge(proposal.proposal_type)}>
                  {getProposalTypeLabel(proposal.proposal_type)}
                </Badge>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted">Principal Investigator</p>
              <p className="text-textMain">
                {proposal.piFirstName} {proposal.piLastName}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted">Email</p>
              <p className="text-textMain">{proposal.piEmail}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted">Faculty / Department</p>
              <p className="text-textMain">
                {proposal.faculty} / {proposal.department}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted">Telephone</p>
              <p className="text-textMain">{proposal.piPhone}</p>
            </div>
          </div>
        </Card>

        {/* Project Summary */}
        <Card title="Project Summary">
          <p className="text-textMain whitespace-pre-wrap">{proposal.summary}</p>
        </Card>

        {/* Team Members */}
        {proposal.teamMembers && proposal.teamMembers.length > 0 && (
          <Card title="Project Team Members" subtitle={`${proposal.teamMembers.length} members`}>
            <div className="w-full overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-4 font-semibold text-textMain">Name</th>
                    <th className="text-left py-2 px-4 font-semibold text-textMain">Designation</th>
                    <th className="text-left py-2 px-4 font-semibold text-textMain">Department</th>
                    <th className="text-left py-2 px-4 font-semibold text-textMain">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {proposal.teamMembers.map((member) => (
                    <tr key={member.id} className="border-b border-border hover:bg-background">
                      <td className="py-2 px-4 text-textMain">
                        {member.firstName} {member.lastName}
                      </td>
                      <td className="py-2 px-4 text-textMain">{member.designation}</td>
                      <td className="py-2 px-4 text-textMain">{member.department}</td>
                      <td className="py-2 px-4 text-textMain">{member.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Attachments */}
        {proposal.attachments && proposal.attachments.length > 0 && (
          <Card title="Uploaded Attachments">
            <div className="w-full overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-4 font-semibold text-textMain">Document</th>
                    <th className="text-left py-2 px-4 font-semibold text-textMain">Status</th>
                    <th className="text-left py-2 px-4 font-semibold text-textMain">File Name</th>
                    <th className="text-left py-2 px-4 font-semibold text-textMain">Uploaded</th>
                  </tr>
                </thead>
                <tbody>
                  {proposal.attachments.map((attachment) => (
                    <tr key={attachment.id} className="border-b border-border hover:bg-background">
                      <td className="py-2 px-4 text-textMain">{attachment.name}</td>
                      <td className="py-2 px-4">
                        <Badge
                          variant={
                            attachment.status === 'uploaded' ? 'success' : 'warning'
                          }
                        >
                          {attachment.status === 'uploaded' ? 'Uploaded' : 'Pending'}
                        </Badge>
                      </td>
                      <td className="py-2 px-4 text-textMain">{attachment.fileName || '-'}</td>
                      <td className="py-2 px-4 text-muted">
                        {formatDate(attachment.uploadedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Review Report */}
        {proposal.reviewReport && (
          <Card title="Review Report">
            {proposal.reviewReport.status === 'pending' ? (
              <p className="text-muted">Waiting for review assignment...</p>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted">Reviewer</p>
                  <p className="text-textMain">{proposal.reviewReport.reviewer || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted">Feedback</p>
                  <p className="text-textMain whitespace-pre-wrap">
                    {proposal.reviewReport.feedback || '-'}
                  </p>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Timeline */}
        {proposal.timeline && (
          <Card title="Submission Timeline">
            <div className="space-y-3">
              <div className="flex gap-4">
                <div className="w-40 font-medium text-sm text-muted">Draft Created</div>
                <div className="text-textMain">{formatDate(proposal.timeline.draftCreated)}</div>
              </div>
              <div className="flex gap-4">
                <div className="w-40 font-medium text-sm text-muted">Attachments Uploaded</div>
                <div className="text-textMain">
                  {proposal.timeline.attachmentsUploaded
                    ? formatDate(proposal.timeline.attachmentsUploaded)
                    : '-'}
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-40 font-medium text-sm text-muted">Submitted</div>
                <div className="text-textMain">
                  {proposal.timeline.submitted ? formatDate(proposal.timeline.submitted) : '-'}
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-40 font-medium text-sm text-muted">Scheduled for Review</div>
                <div className="text-textMain">
                  {proposal.timeline.scheduledReview
                    ? formatDate(proposal.timeline.scheduledReview)
                    : '-'}
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-40 font-medium text-sm text-muted">Reviewed</div>
                <div className="text-textMain">
                  {proposal.timeline.reviewed ? formatDate(proposal.timeline.reviewed) : '-'}
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-40 font-medium text-sm text-muted">Decision</div>
                <div className="text-textMain">
                  {proposal.timeline.decision ? formatDate(proposal.timeline.decision) : '-'}
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
