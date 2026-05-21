import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Alert from '../../components/common/Alert';
import { createProposalDraft } from '../../api/applicantApi';

export default function SubmitProposal() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    // Basic Project Information
    projectTitle: '',
    piFirstName: '',
    piLastName: '',
    piQualifications: '',
    piSex: '',
    piDesignation: '',
    faculty: '',
    department: '',
    specialization: '',
    piEmail: '',
    piPhone: '',
    researchType: '',

    // Project Description
    summary: '',
    problemStatement: '',
    proposedSolution: '',
    relevance: '',
    innovativeness: '',
    mainObjective: '',
    specificObjectives: '',
    methods: '',
    outcomes: '',
    dissemination: '',
    policyImpact: '',
    scalability: '',
    sustainability: '',
    genderConsiderations: '',
    ethicalImpact: '',
    capacityBuilding: '',
    conflictOfInterest: '',
    references: '',
    totalBudget: '',

    // Compliance
    compliance: false,
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSaveDraft = async (e) => {
    e.preventDefault();
    if (!formData.projectTitle) {
      setError('Project title is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await createProposalDraft(formData);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        navigate('/applicant/proposals');
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitProposal = async (e) => {
    e.preventDefault();
    if (!formData.compliance) {
      setError('You must confirm compliance before submitting');
      return;
    }
    if (!formData.projectTitle) {
      setError('Project title is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await createProposalDraft({ ...formData, status: 'submitted' });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        navigate('/applicant/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout role="applicant">
      <PageHeader
        title="Submit Research Proposal"
        subtitle="Complete the application form for your research or innovation project"
      />

      {error && <Alert variant="danger" title="Error">{error}</Alert>}
      {success && (
        <Alert variant="success" title="Success">
          Proposal saved successfully. You will be redirected to upload attachments.
        </Alert>
      )}

      <form onSubmit={handleSaveDraft} className="space-y-6">
        {/* Section A: Basic Project Information */}
        <Card title="A. Basic Project Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 space-y-4">
            <div className="md:col-span-2">
              <Input
                label="Title of Research/Innovation Project"
                name="projectTitle"
                value={formData.projectTitle}
                onChange={handleInputChange}
                required
              />
            </div>
            <Input
              label="PI First Name"
              name="piFirstName"
              value={formData.piFirstName}
              onChange={handleInputChange}
            />
            <Input
              label="PI Last Name"
              name="piLastName"
              value={formData.piLastName}
              onChange={handleInputChange}
            />
            <Input
              label="Highest Qualifications"
              name="piQualifications"
              value={formData.piQualifications}
              onChange={handleInputChange}
            />
            <Input
              label="Sex of PI"
              name="piSex"
              value={formData.piSex}
              onChange={handleInputChange}
            />
            <Input
              label="Designation of PI"
              name="piDesignation"
              value={formData.piDesignation}
              onChange={handleInputChange}
            />
            <Input
              label="Faculty"
              name="faculty"
              value={formData.faculty}
              onChange={handleInputChange}
            />
            <Input
              label="Department"
              name="department"
              value={formData.department}
              onChange={handleInputChange}
            />
            <Input
              label="Research Specialization"
              name="specialization"
              value={formData.specialization}
              onChange={handleInputChange}
            />
            <Input
              label="PI Email / Primary Contact Email"
              name="piEmail"
              type="email"
              value={formData.piEmail}
              onChange={handleInputChange}
            />
            <Input
              label="PI Telephone Number"
              name="piPhone"
              value={formData.piPhone}
              onChange={handleInputChange}
            />
            <Input
              label="Type of Research"
              name="researchType"
              value={formData.researchType}
              onChange={handleInputChange}
            />
          </div>
        </Card>

        {/* Section B: Project Description */}
        <Card title="B. Project Description">
          <div className="space-y-4">
            <Input
              label="Project Summary (max 200 words)"
              name="summary"
              value={formData.summary}
              onChange={handleInputChange}
              placeholder="Brief overview of the project"
            />
            <Input
              label="Problem Statement (max 200 words)"
              name="problemStatement"
              value={formData.problemStatement}
              onChange={handleInputChange}
              placeholder="What problem does this research address?"
            />
            <Input
              label="Proposed Solution (max 200 words)"
              name="proposedSolution"
              value={formData.proposedSolution}
              onChange={handleInputChange}
              placeholder="How will you solve the problem?"
            />
            <Input
              label="Relevance to NDP IV / SDGs (max 300 words)"
              name="relevance"
              value={formData.relevance}
              onChange={handleInputChange}
            />
            <Input
              label="Innovativeness (max 200 words)"
              name="innovativeness"
              value={formData.innovativeness}
              onChange={handleInputChange}
            />
            <Input
              label="Main Objective"
              name="mainObjective"
              value={formData.mainObjective}
              onChange={handleInputChange}
            />
            <Input
              label="Specific Objectives"
              name="specificObjectives"
              value={formData.specificObjectives}
              onChange={handleInputChange}
            />
            <Input
              label="Methods Description (max 750 words)"
              name="methods"
              value={formData.methods}
              onChange={handleInputChange}
              placeholder="Describe your research methodology"
            />
            <Input
              label="Outcomes / Impact / Outreach (max 250 words)"
              name="outcomes"
              value={formData.outcomes}
              onChange={handleInputChange}
            />
            <Input
              label="Translation / Dissemination Plan (max 250 words)"
              name="dissemination"
              value={formData.dissemination}
              onChange={handleInputChange}
            />
            <Input
              label="Potential Policy or Program Impact (max 250 words)"
              name="policyImpact"
              value={formData.policyImpact}
              onChange={handleInputChange}
            />
            <Input
              label="Scalability (max 200 words)"
              name="scalability"
              value={formData.scalability}
              onChange={handleInputChange}
            />
            <Input
              label="Sustainability (max 150 words)"
              name="sustainability"
              value={formData.sustainability}
              onChange={handleInputChange}
            />
            <Input
              label="Gender Considerations (max 150 words)"
              name="genderConsiderations"
              value={formData.genderConsiderations}
              onChange={handleInputChange}
            />
            <Input
              label="Ethical / Environmental Impact (max 200 words)"
              name="ethicalImpact"
              value={formData.ethicalImpact}
              onChange={handleInputChange}
            />
            <Input
              label="Capacity Building (max 250 words)"
              name="capacityBuilding"
              value={formData.capacityBuilding}
              onChange={handleInputChange}
            />
            <Input
              label="Conflict of Interest (max 150 words)"
              name="conflictOfInterest"
              value={formData.conflictOfInterest}
              onChange={handleInputChange}
            />
            <Input
              label="References (max 250 words)"
              name="references"
              value={formData.references}
              onChange={handleInputChange}
            />
            <Input
              label="Total Budget"
              name="totalBudget"
              type="number"
              value={formData.totalBudget}
              onChange={handleInputChange}
            />
          </div>
        </Card>

        {/* Section C: Compliance Confirmation */}
        <Card title="C. Compliance Confirmation">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              name="compliance"
              checked={formData.compliance}
              onChange={handleInputChange}
              className="mt-1"
              id="compliance"
            />
            <label htmlFor="compliance" className="text-sm text-textMain">
              I confirm that the proposal being submitted complies with the KAB Research standard proposal
              format. Submission of a proposal which does not comply with the said proposal format is an
              automatic disqualification.
            </label>
          </div>
        </Card>

        {/* Action Buttons */}
        <Card>
          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleSaveDraft}
              disabled={loading}
            >
              Save Draft
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleSubmitProposal}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Submit Proposal'}
            </Button>
          </div>
        </Card>
      </form>
    </DashboardLayout>
  );
}
