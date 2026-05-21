import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, PenTool, Clock, CheckCircle } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import Loader from '../../components/common/Loader';
import { getApplicantDashboard, getMyProposals } from '../../api/applicantApi';

export default function ApplicantDashboard() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const dashboardData = await getApplicantDashboard();
        const proposalsData = await getMyProposals();
        setDashboard(dashboardData);
        setProposals(proposalsData);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
        title={`Welcome back, ${dashboard?.applicantName || 'Researcher'}`}
        subtitle="Manage your research proposals and submissions"
      />

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Statistics */}
      {dashboard && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Proposals" value={dashboard.stats.totalProposals} icon={<FileText className="w-8 h-8" />} />
          <StatCard title="Draft" value={dashboard.stats.draft} icon={<PenTool className="w-8 h-8" />} />
          <StatCard title="Under Review" value={dashboard.stats.underReview} icon={<Clock className="w-8 h-8" />} />
          <StatCard title="Approved" value={dashboard.stats.approved} icon={<CheckCircle className="w-8 h-8" />} />
        </div>
      )}

      {/* My Proposals Section */}
      <Card title="My Proposals" subtitle="Recent proposal submissions and drafts">
        {proposals.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted mb-4">
              No proposals found. Click <strong>Submit New Proposal</strong> from the Side Menu to start a new
              submission.
            </p>
            <Button variant="primary" onClick={() => navigate('/applicant/proposals/new')}>
              Start New Proposal
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-textMain">Protocol No</th>
                  <th className="text-left py-3 px-4 font-semibold text-textMain">Proposal Title</th>
                  <th className="text-left py-3 px-4 font-semibold text-textMain">Attachments</th>
                  <th className="text-left py-3 px-4 font-semibold text-textMain">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-textMain">Members</th>
                  <th className="text-left py-3 px-4 font-semibold text-textMain">Review Report</th>
                  <th className="text-left py-3 px-4 font-semibold text-textMain">Action</th>
                </tr>
              </thead>
              <tbody>
                {proposals.map((proposal) => (
                  <tr key={proposal.id} className="border-b border-border hover:bg-background">
                    <td className="py-3 px-4 text-textMain">{proposal.protocolNo}</td>
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
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/applicant/proposals/${proposal.id}`)}
                      >
                        View
                      </Button>
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
