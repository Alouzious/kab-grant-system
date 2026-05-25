import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import PageHeader from '../../../components/layout/PageHeader';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Badge from '../../../components/common/Badge';
import Alert from '../../../components/common/Alert';
import Loader from '../../../components/common/Loader';
import Table from '../../../components/common/Table';
import { getScheduledProposals, removeReviewerFromProposal } from '../../../api/adminApi';

export default function ScheduledProposals() {
  const navigate = useNavigate();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getScheduledProposals();
        setProposals(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleRemoveReviewer = async (proposalId, reviewerId, reviewerName) => {
    if (!window.confirm(`Remove ${reviewerName} from this proposal?`)) return;
    try {
      setActionLoading(`${proposalId}-${reviewerId}`);
      await removeReviewerFromProposal(proposalId, reviewerId);
      setProposals((prev) =>
        prev.map((p) =>
          p.id === proposalId
            ? { ...p, assigned_reviewers: p.assigned_reviewers.filter((r) => r.id !== reviewerId) }
            : p
        )
      );
      setSuccess('Reviewer removed successfully.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to remove reviewer');
    } finally {
      setActionLoading(null);
    }
  };

  const columns = [
    { key: 'protocol_no', label: 'Protocol No' },
    { key: 'title', label: 'Proposal Title' },
    { key: 'grant_type', label: 'Type', render: (row) => <Badge variant="info">{row.grant_type}</Badge> },
    { key: 'pi', label: 'Principal Investigator', render: (row) => `${row.pi_first_name} ${row.pi_last_name}` },
    {
      key: 'assigned_reviewers',
      label: 'Assigned Reviewers',
      render: (row) => (
        <div className="space-y-1">
          {row.assigned_reviewers && row.assigned_reviewers.length > 0 ? (
            row.assigned_reviewers.map((reviewer) => (
              <div key={reviewer.id} className="flex items-center gap-2">
                <span className="text-xs text-textMain">{reviewer.name}</span>
                <button
                  onClick={() => handleRemoveReviewer(row.id, reviewer.id, reviewer.name)}
                  disabled={actionLoading === `${row.id}-${reviewer.id}`}
                  className="text-xs text-danger hover:underline disabled:opacity-50"
                >
                  {actionLoading === `${row.id}-${reviewer.id}` ? 'Removing...' : 'Remove'}
                </button>
              </div>
            ))
          ) : (
            <span className="text-xs text-muted">None assigned</span>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <Button size="sm" variant="outline" onClick={() => navigate(`/admin/proposals/${row.id}`)}>
          View
        </Button>
      ),
    },
  ];

  if (loading) return <DashboardLayout role="admin"><Loader /></DashboardLayout>;

  return (
    <DashboardLayout role="admin">
      <PageHeader
        title="Scheduled for Review"
        subtitle={`${proposals.length} proposal${proposals.length !== 1 ? 's' : ''} with reviewers assigned`}
      />

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Card>
        <Table
          columns={columns}
          data={proposals}
          emptyMessage="No proposals scheduled for review."
        />
      </Card>
    </DashboardLayout>
  );
}