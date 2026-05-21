import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import Loader from '../../components/common/Loader';
import { getMyProposals } from '../../api/applicantApi';

export default function MyProposals() {
  const navigate = useNavigate();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) return <Loader />;

  return (
    <DashboardLayout role="applicant">
      <PageHeader
        title="My Proposals"
        subtitle="View and manage all your research proposals"
      />

      {error && <Alert variant="danger">{error}</Alert>}

      <Card>
        {proposals.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted mb-4">No proposals found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-textMain">Protocol No</th>
                  <th className="text-left py-3 px-4 font-semibold text-textMain">Proposal Title</th>
                  <th className="text-left py-3 px-4 font-semibold text-textMain">Uploaded</th>
                  <th className="text-left py-3 px-4 font-semibold text-textMain">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-textMain">Members</th>
                  <th className="text-left py-3 px-4 font-semibold text-textMain">Review</th>
                  <th className="text-left py-3 px-4 font-semibold text-textMain">Actions</th>
                </tr>
              </thead>
              <tbody>
                {proposals.map((proposal) => (
                  <tr key={proposal.id} className="border-b border-border hover:bg-background">
                    <td className="py-3 px-4 text-textMain font-medium">{proposal.protocolNo}</td>
                    <td className="py-3 px-4 text-textMain">{proposal.title}</td>
                    <td className="py-3 px-4 text-sm text-muted">{proposal.attachmentsSummary}</td>
                    <td className="py-3 px-4">
                      <Badge variant={getStatusBadge(proposal.status)}>
                        {getStatusLabel(proposal.status)}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-textMain">{proposal.membersCount}</td>
                    <td className="py-3 px-4 text-muted">-</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2 flex-wrap">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/applicant/proposals/${proposal.id}`)}
                        >
                          Details
                        </Button>
                        {proposal.status === 'draft' && (
                          <>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => navigate(`/applicant/proposals/${proposal.id}`)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="accent"
                              onClick={() => navigate(`/applicant/proposals/${proposal.id}/documents`)}
                            >
                              Upload
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </DashboardLayout>
  );
}
