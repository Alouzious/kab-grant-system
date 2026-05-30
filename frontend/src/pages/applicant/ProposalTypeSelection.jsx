import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

export default function ProposalTypeSelection() {
  const navigate = useNavigate();

  return (
    <DashboardLayout role="applicant">
      <PageHeader
        title="Submit New Proposal"
        subtitle="Choose the type of proposal you want to submit"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Research Proposal Card */}
        <Card>
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-textMain">Research Proposal</h2>
            <p className="text-sm text-muted">
              For academic research projects involving objectives, methodology, data collection, analysis, ethics, references, and scholarly outputs.
            </p>
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-textMain">Key Focus Points:</h3>
              <ul className="text-xs text-muted space-y-1 pl-4">
                <li>• Research objectives and methodology</li>
                <li>• Data collection and analysis</li>
                <li>• Ethical considerations</li>
                <li>• Expected scholarly outputs</li>
                <li>• References and citations</li>
              </ul>
            </div>
            <Button
              variant="primary"
              onClick={() => navigate('/applicant/proposals/new/research')}
              className="w-full"
            >
              Start Research Proposal
            </Button>
          </div>
        </Card>

        {/* Innovation Proposal Card */}
        <Card>
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-textMain">Innovation Proposal</h2>
            <p className="text-sm text-muted">
              For innovation projects involving a new product, service, prototype, process, technology, or solution addressing a stakeholder or community need.
            </p>
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-textMain">Key Focus Points:</h3>
              <ul className="text-xs text-muted space-y-1 pl-4">
                <li>• Product or service innovation</li>
                <li>• Target users and beneficiaries</li>
                <li>• Market and adoption potential</li>
                <li>• Implementation plan</li>
                <li>• Scalability and sustainability</li>
              </ul>
            </div>
            <Button
              variant="accent"
              onClick={() => navigate('/applicant/proposals/new/innovation')}
              className="w-full"
            >
              Start Innovation Proposal
            </Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
