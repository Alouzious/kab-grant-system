import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import Loader from '../../components/common/Loader';
import { createProposalDraft, updateProposalDraft } from '../../api/applicantApi';
import { countWords } from '../../utils/validations';

export default function ProposalReview() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const proposalData = location.state?.proposalData;
  const proposalType = location.state?.proposalType;
  const isEdit = location.state?.isEdit;
  const proposalId = location.state?.proposalId;

  if (!proposalData) {
    return (
      <DashboardLayout role="applicant">
        <Alert variant="danger">No proposal data to review. Please fill the form again.</Alert>
      </DashboardLayout>
    );
  }

  const handleSubmitFinal = async () => {
    try {
      setLoading(true);
      setError(null);

      if (isEdit) {
        await updateProposalDraft(proposalId, proposalData);
      } else {
        await createProposalDraft(proposalData);
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        navigate('/applicant/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to submit proposal');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(-1, { state: { proposalData, proposalType, isEdit, proposalId } });
  };

  const renderField = (label, value) => (
    <div className="mb-4">
      <p className="text-sm font-semibold text-textMain mb-1">{label}</p>
      <p className="text-sm text-textMain bg-background rounded p-3 break-words">{value || '-'}</p>
    </div>
  );

  const renderSection = (title, fields) => (
    <Card title={title} key={title}>
      <div className="space-y-4">
        {fields.map(([label, value]) => (
          <div key={label}>
            {renderField(label, value)}
          </div>
        ))}
      </div>
    </Card>
  );

  return (
    <DashboardLayout role="applicant">
      <PageHeader
        title={isEdit ? 'Review Proposal (Edit)' : 'Review Proposal'}
        subtitle="Please review all details before submitting. You can edit any information if needed."
      />

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">Proposal submitted successfully!</Alert>}

      {/* Principal Investigator Section */}
      {renderSection('Principal Investigator Information', [
        ['First Name', proposalData.piFirstName],
        ['Last Name', proposalData.piLastName],
        ['Gender', proposalData.piSex],
        ['Qualifications', proposalData.piQualifications === 'other' ? proposalData.piQualificationsOther : proposalData.piQualifications],
        ['Designation', proposalData.piDesignation === 'other' ? proposalData.piDesignationOther : proposalData.piDesignation],
        ['Faculty', proposalData.faculty],
        ['Department', proposalData.department],
        ['Specialization', proposalData.specialization],
        ['Email', proposalData.piEmail],
        ['Phone', proposalData.piPhone],
      ])}

      {/* Project Information Section */}
      {renderSection('Project Information', [
        ['Project Title', proposalData.projectTitle],
        ['Grant Call', proposalData.grantCall],
        ['Research Type', proposalData.researchType === 'other' ? proposalData.researchTypeOther : proposalData.researchType],
        ['Total Budget (KES)', proposalData.totalBudget],
      ])}

      {/* Project Description Section */}
      {renderSection('Project Description', [
        ['Summary', proposalData.summary],
        ['Problem Statement', proposalData.problemStatement],
        ['Proposed Solution', proposalData.proposedSolution],
        ['Relevance', proposalData.relevance],
        ['Innovativeness', proposalData.innovativeness],
      ])}

      {/* Research Details Section */}
      {renderSection('Research Details', [
        ['Main Objective', proposalData.mainObjective],
        ['Specific Objectives', proposalData.specificObjectives],
        ['Methodology', proposalData.methods],
        ['Expected Outcomes', proposalData.outcomes],
        ['Dissemination Plan', proposalData.dissemination],
      ])}

      {/* Impact & Sustainability Section */}
      {renderSection('Impact & Sustainability', [
        ['Policy Impact', proposalData.policyImpact],
        ['Scalability', proposalData.scalability],
        ['Sustainability', proposalData.sustainability],
        ['Gender Considerations', proposalData.genderConsiderations],
        ['Ethical Impact', proposalData.ethicalImpact],
        ['Capacity Building', proposalData.capacityBuilding],
      ])}

      {/* Additional Information Section */}
      {renderSection('Additional Information', [
        ['Conflict of Interest', proposalData.conflictOfInterest],
        ['References', proposalData.references],
      ])}

      {/* Action Buttons */}
      <Card>
        <div className="flex gap-4 justify-end">
          <Button
            variant="secondary"
            onClick={handleEdit}
            disabled={loading}
          >
            ← Edit Proposal
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmitFinal}
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Proposal'}
          </Button>
        </div>
      </Card>
    </DashboardLayout>
  );
}
