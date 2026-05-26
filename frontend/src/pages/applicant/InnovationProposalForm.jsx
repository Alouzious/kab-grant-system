import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Alert from '../../components/common/Alert';
import Loader from '../../components/common/Loader';
import { createProposalDraft, submitProposal } from '../../api/applicantApi';
import { getFaculties, getDepartments, getInnovationSpecializations, getGrantCalls } from '../../api/referenceApi';
import { sexOptions, qualificationOptions, designationOptions, typeOfInnovationOptions } from '../../utils/formOptions';
import {
  validateRequired,
  validateEmail,
  validateKABEmail,
  validatePhone,
  validateBudget,
  validateWordCount,
  validateCompliance,
  validateOtherSpecification,
  countWords,
  isOtherOption,
  getSpecificationFieldName,
} from '../../utils/validations';

// Word count limits for innovation fields
const WORD_LIMITS = {
  innovationSummary: 200,
  problemStatement: 200,
  proposedSolution: 200,
  uniqueness: 200,
  targetUsers: 250,
  prototypeDescription: 300,
  implementationPlan: 500,
  marketPotential: 250,
  scalability: 200,
  sustainability: 150,
  expectedOutputs: 250,
  ethicalConsiderations: 200,
  capacityBuilding: 250,
  conflictOfInterest: 150,
  references: 250,
};

export default function InnovationProposalForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});

  // Dropdown loading states
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [grantCalls, setGrantCalls] = useState([]);

  const [formData, setFormData] = useState({
    proposal_type: 'innovation',
    // Basic Project Information
    projectTitle: '',
    piFirstName: '',
    piLastName: '',
    piQualifications: '',
    piQualificationsOther: '',
    piSex: '',
    piDesignation: '',
    piDesignationOther: '',
    faculty: '',
    department: '',
    innovationSpecialization: '',
    piEmail: '',
    piPhone: '',
    typeOfInnovation: '',
    typeOfInnovationOther: '',
    grantCall: '',

    // Innovation Description
    innovationSummary: '',
    problemStatement: '',
    proposedSolution: '',
    uniqueness: '',
    targetUsers: '',
    prototypeDescription: '',
    implementationPlan: '',
    marketPotential: '',
    scalability: '',
    sustainability: '',
    expectedOutputs: '',
    ethicalConsiderations: '',
    capacityBuilding: '',
    conflictOfInterest: '',
    references: '',
    totalBudget: '',

    // Compliance
    compliance: false,
  });

  // Load reference data on mount
  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        setLoadingDropdowns(true);
        const [facultiesData, specializationsData, grantCallsData] = await Promise.all([
          getFaculties(),
          getInnovationSpecializations(),
          getGrantCalls(),
        ]);
        setFaculties(facultiesData);
        setSpecializations(specializationsData);
        setGrantCalls(grantCallsData);
      } catch (err) {
        console.error('Error loading dropdown data:', err);
      } finally {
        setLoadingDropdowns(false);
      }
    };

    loadDropdownData();
  }, []);

  // Load departments when faculty changes
  useEffect(() => {
    if (formData.faculty) {
      const loadDepts = async () => {
        try {
          const depts = await getDepartments(formData.faculty);
          setDepartments(depts);
        } catch (err) {
          console.error('Error loading departments:', err);
        }
      };
      loadDepts();
    } else {
      setDepartments([]);
    }
  }, [formData.faculty]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = (isSubmitting = false) => {
    const newErrors = {};

    // Required fields
    if (!formData.projectTitle) newErrors.projectTitle = 'Project title is required';
    if (!formData.piFirstName) newErrors.piFirstName = 'PI first name is required';
    if (!formData.piLastName) newErrors.piLastName = 'PI last name is required';
    if (!formData.piQualifications) newErrors.piQualifications = 'Highest qualifications are required';
    if (isOtherOption(formData.piQualifications) && !formData.piQualificationsOther) {
      newErrors.piQualificationsOther = 'Please specify your qualifications';
    }
    if (!formData.piSex) newErrors.piSex = 'Sex is required';
    if (!formData.piDesignation) newErrors.piDesignation = 'Designation is required';
    if (isOtherOption(formData.piDesignation) && !formData.piDesignationOther) {
      newErrors.piDesignationOther = 'Please specify your designation';
    }
    if (!formData.faculty) newErrors.faculty = 'Faculty is required';
    if (!formData.department) newErrors.department = 'Department is required';
    if (!formData.innovationSpecialization) newErrors.innovationSpecialization = 'Innovation specialization is required';
    if (!formData.piEmail) newErrors.piEmail = 'Email is required';
    const emailError = validateKABEmail(formData.piEmail);
    if (formData.piEmail && emailError) {
      newErrors.piEmail = emailError;
    }
    if (!formData.piPhone) newErrors.piPhone = 'Phone number is required';
    const phoneError = validatePhone(formData.piPhone);
    if (formData.piPhone && phoneError) {
      newErrors.piPhone = phoneError;
    }
    if (!formData.typeOfInnovation) newErrors.typeOfInnovation = 'Type of innovation is required';
    if (isOtherOption(formData.typeOfInnovation) && !formData.typeOfInnovationOther) {
      newErrors.typeOfInnovationOther = 'Please specify the innovation type';
    }
    if (!formData.grantCall) newErrors.grantCall = 'Grant call is required';

    // Innovation Description - all required
    if (!formData.innovationSummary) newErrors.innovationSummary = 'Innovation summary is required';
    if (formData.innovationSummary && validateWordCount(formData.innovationSummary, WORD_LIMITS.innovationSummary, 'Innovation Summary')) {
      newErrors.innovationSummary = validateWordCount(formData.innovationSummary, WORD_LIMITS.innovationSummary, 'Innovation Summary');
    }

    if (!formData.problemStatement) newErrors.problemStatement = 'Problem statement is required';
    if (formData.problemStatement && validateWordCount(formData.problemStatement, WORD_LIMITS.problemStatement, 'Problem Statement')) {
      newErrors.problemStatement = validateWordCount(formData.problemStatement, WORD_LIMITS.problemStatement, 'Problem Statement');
    }

    if (!formData.proposedSolution) newErrors.proposedSolution = 'Proposed solution is required';
    if (formData.proposedSolution && validateWordCount(formData.proposedSolution, WORD_LIMITS.proposedSolution, 'Proposed Solution')) {
      newErrors.proposedSolution = validateWordCount(formData.proposedSolution, WORD_LIMITS.proposedSolution, 'Proposed Solution');
    }

    if (!formData.uniqueness) newErrors.uniqueness = 'Uniqueness/Innovativeness is required';
    if (formData.uniqueness && validateWordCount(formData.uniqueness, WORD_LIMITS.uniqueness, 'Uniqueness')) {
      newErrors.uniqueness = validateWordCount(formData.uniqueness, WORD_LIMITS.uniqueness, 'Uniqueness');
    }

    if (!formData.targetUsers) newErrors.targetUsers = 'Target users/beneficiaries is required';
    if (formData.targetUsers && validateWordCount(formData.targetUsers, WORD_LIMITS.targetUsers, 'Target Users')) {
      newErrors.targetUsers = validateWordCount(formData.targetUsers, WORD_LIMITS.targetUsers, 'Target Users');
    }

    if (!formData.prototypeDescription) newErrors.prototypeDescription = 'Prototype/product/service description is required';
    if (formData.prototypeDescription && validateWordCount(formData.prototypeDescription, WORD_LIMITS.prototypeDescription, 'Prototype Description')) {
      newErrors.prototypeDescription = validateWordCount(formData.prototypeDescription, WORD_LIMITS.prototypeDescription, 'Prototype Description');
    }

    if (!formData.implementationPlan) newErrors.implementationPlan = 'Implementation plan is required';
    if (formData.implementationPlan && validateWordCount(formData.implementationPlan, WORD_LIMITS.implementationPlan, 'Implementation Plan')) {
      newErrors.implementationPlan = validateWordCount(formData.implementationPlan, WORD_LIMITS.implementationPlan, 'Implementation Plan');
    }

    if (!formData.marketPotential) newErrors.marketPotential = 'Market/adoption potential is required';
    if (formData.marketPotential && validateWordCount(formData.marketPotential, WORD_LIMITS.marketPotential, 'Market Potential')) {
      newErrors.marketPotential = validateWordCount(formData.marketPotential, WORD_LIMITS.marketPotential, 'Market Potential');
    }

    if (!formData.scalability) newErrors.scalability = 'Scalability is required';
    if (formData.scalability && validateWordCount(formData.scalability, WORD_LIMITS.scalability, 'Scalability')) {
      newErrors.scalability = validateWordCount(formData.scalability, WORD_LIMITS.scalability, 'Scalability');
    }

    if (!formData.sustainability) newErrors.sustainability = 'Sustainability is required';
    if (formData.sustainability && validateWordCount(formData.sustainability, WORD_LIMITS.sustainability, 'Sustainability')) {
      newErrors.sustainability = validateWordCount(formData.sustainability, WORD_LIMITS.sustainability, 'Sustainability');
    }

    if (!formData.expectedOutputs) newErrors.expectedOutputs = 'Expected outputs and impact is required';
    if (formData.expectedOutputs && validateWordCount(formData.expectedOutputs, WORD_LIMITS.expectedOutputs, 'Expected Outputs')) {
      newErrors.expectedOutputs = validateWordCount(formData.expectedOutputs, WORD_LIMITS.expectedOutputs, 'Expected Outputs');
    }

    if (!formData.ethicalConsiderations) newErrors.ethicalConsiderations = 'Ethical/environmental considerations are required';
    if (formData.ethicalConsiderations && validateWordCount(formData.ethicalConsiderations, WORD_LIMITS.ethicalConsiderations, 'Ethical Considerations')) {
      newErrors.ethicalConsiderations = validateWordCount(formData.ethicalConsiderations, WORD_LIMITS.ethicalConsiderations, 'Ethical Considerations');
    }

    if (!formData.capacityBuilding) newErrors.capacityBuilding = 'Capacity building is required';
    if (formData.capacityBuilding && validateWordCount(formData.capacityBuilding, WORD_LIMITS.capacityBuilding, 'Capacity Building')) {
      newErrors.capacityBuilding = validateWordCount(formData.capacityBuilding, WORD_LIMITS.capacityBuilding, 'Capacity Building');
    }

    if (!formData.conflictOfInterest) newErrors.conflictOfInterest = 'Conflict of interest statement is required';
    if (formData.conflictOfInterest && validateWordCount(formData.conflictOfInterest, WORD_LIMITS.conflictOfInterest, 'Conflict of Interest')) {
      newErrors.conflictOfInterest = validateWordCount(formData.conflictOfInterest, WORD_LIMITS.conflictOfInterest, 'Conflict of Interest');
    }

    if (!formData.references) newErrors.references = 'References are required';
    if (formData.references && validateWordCount(formData.references, WORD_LIMITS.references, 'References')) {
      newErrors.references = validateWordCount(formData.references, WORD_LIMITS.references, 'References');
    }

    if (!formData.totalBudget) newErrors.totalBudget = 'Total budget is required';
    if (formData.totalBudget && validateBudget(formData.totalBudget)) {
      newErrors.totalBudget = validateBudget(formData.totalBudget);
    }

    // Compliance only for submission
    if (isSubmitting && !formData.compliance) {
      newErrors.compliance = 'You must confirm compliance before continuing';
    }

    return newErrors;
  };

  const handleSaveDraft = async (e) => {
    e.preventDefault();
    
    const newErrors = validateForm(false);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setError('Please fix the errors below before saving');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await createProposalDraft(formData);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        navigate('/applicant/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to save draft');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitProposal = async (e) => {
    e.preventDefault();

    const newErrors = validateForm(true);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setError('Please fix all errors before submitting');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const draft = await createProposalDraft(formData);
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

  const renderTextarea = (fieldName, label, placeholder, wordLimit) => {
    const wordCount = countWords(formData[fieldName]);
    const isExceeded = wordCount > wordLimit;

    return (
      <div key={fieldName}>
        <label className="block text-sm font-medium text-textMain mb-2">
          {label}
        </label>
        <textarea
          name={fieldName}
          value={formData[fieldName]}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={`w-full min-h-[120px] resize-y rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 whitespace-pre-wrap break-words ${
            errors[fieldName]
              ? 'border-danger focus:ring-danger'
              : 'border-border focus:ring-accent focus:border-accent'
          }`}
        />
        <div className="flex justify-between mt-1">
          <span className={`text-xs ${isExceeded ? 'text-danger font-semibold' : 'text-muted'}`}>
            {wordCount} / {wordLimit} words
          </span>
          {errors[fieldName] && <span className="text-xs text-danger">{errors[fieldName]}</span>}
        </div>
      </div>
    );
  };

  const renderSelectWithOther = (fieldName, label, options, otherFieldName) => {
    return (
      <div>
        <label className="block text-sm font-medium text-textMain mb-2">
          {label}
        </label>
        <select
          name={fieldName}
          value={formData[fieldName]}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-md text-textMain bg-white outline-none focus:ring-2 ${
            errors[fieldName]
              ? 'border-danger focus:ring-danger'
              : 'border-border focus:ring-accent focus:border-accent'
          }`}
        >
          <option value="">Select option</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {errors[fieldName] && <span className="text-xs text-danger mt-1 block">{errors[fieldName]}</span>}

        {isOtherOption(formData[fieldName]) && (
          <div className="mt-3">
            <label className="block text-sm font-medium text-textMain mb-2">
              Please specify
            </label>
            <input
              type="text"
              name={otherFieldName}
              value={formData[otherFieldName]}
              onChange={handleInputChange}
              placeholder="Enter details"
              className={`w-full px-3 py-2 border rounded-md text-textMain outline-none focus:ring-2 ${
                errors[otherFieldName]
                  ? 'border-danger focus:ring-danger'
                  : 'border-border focus:ring-accent focus:border-accent'
              }`}
            />
            {errors[otherFieldName] && <span className="text-xs text-danger mt-1 block">{errors[otherFieldName]}</span>}
          </div>
        )}
      </div>
    );
  };

  const renderSelect = (fieldName, label, options) => {
    return (
      <div>
        <label className="block text-sm font-medium text-textMain mb-2">
          {label}
        </label>
        <select
          name={fieldName}
          value={formData[fieldName]}
          onChange={handleInputChange}
          disabled={fieldName === 'department' && !formData.faculty}
          className={`w-full px-3 py-2 border rounded-md text-textMain bg-white outline-none focus:ring-2 ${
            errors[fieldName]
              ? 'border-danger focus:ring-danger'
              : 'border-border focus:ring-accent focus:border-accent'
          } ${fieldName === 'department' && !formData.faculty ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <option value="">Select option</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {errors[fieldName] && <span className="text-xs text-danger mt-1 block">{errors[fieldName]}</span>}
      </div>
    );
  };

  const renderInputField = (fieldName, label, type = 'text') => {
    return (
      <div>
        <label className="block text-sm font-medium text-textMain mb-2">
          {label}
        </label>
        <input
          type={type}
          name={fieldName}
          value={formData[fieldName]}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-md text-textMain outline-none focus:ring-2 ${
            errors[fieldName]
              ? 'border-danger focus:ring-danger'
              : 'border-border focus:ring-accent focus:border-accent'
          }`}
        />
        {errors[fieldName] && <span className="text-xs text-danger mt-1 block">{errors[fieldName]}</span>}
      </div>
    );
  };

  if (loadingDropdowns) return <Loader />;

  return (
    <DashboardLayout role="applicant">
      <PageHeader
        title="Submit Innovation Proposal"
        subtitle="Complete the application form for your innovation project"
      />

      {error && <Alert variant="danger" title="Error">{error}</Alert>}
      {success && (
        <Alert variant="success" title="Success">
          Draft saved successfully. You can now upload attachments and add project team members from the dashboard.
        </Alert>
      )}

      <form onSubmit={handleSaveDraft} className="space-y-6">
        {/* Section A: Basic Project Information */}
        <Card title="A. Basic Project Information">
          <div className="space-y-4">
            {renderInputField('projectTitle', 'Title of Innovation Project')}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderInputField('piFirstName', 'PI First Name')}
              {renderInputField('piLastName', 'PI Last Name')}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderSelectWithOther('piQualifications', 'Highest Qualifications', qualificationOptions, 'piQualificationsOther')}
              {renderSelect('piSex', 'Sex of PI', sexOptions)}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderSelectWithOther('piDesignation', 'Designation of PI', designationOptions, 'piDesignationOther')}
              {renderSelect('faculty', 'Faculty', faculties)}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderSelect('department', 'Department', departments)}
              {renderSelect('innovationSpecialization', 'Innovation Specialization', specializations)}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderInputField('piEmail', 'PI Email / Primary Contact Email', 'email')}
              {renderInputField('piPhone', 'PI Telephone Number', 'tel')}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderSelectWithOther('typeOfInnovation', 'Type of Innovation', typeOfInnovationOptions, 'typeOfInnovationOther')}
              {renderSelect('grantCall', 'Grant Call', grantCalls)}
            </div>
          </div>
        </Card>

        {/* Section B: Innovation Description */}
        <Card title="B. Innovation Description">
          <div className="space-y-4">
            {renderTextarea('innovationSummary', 'Innovation Summary (max 200 words)', 'Brief overview of the innovation', WORD_LIMITS.innovationSummary)}
            {renderTextarea('problemStatement', 'Problem / Stakeholder Need (max 200 words)', 'What problem does this innovation solve?', WORD_LIMITS.problemStatement)}
            {renderTextarea('proposedSolution', 'Proposed Innovation Solution (max 200 words)', 'How does your innovation solve the problem?', WORD_LIMITS.proposedSolution)}
            {renderTextarea('uniqueness', 'Uniqueness / Innovativeness (max 200 words)', 'What makes this innovation unique?', WORD_LIMITS.uniqueness)}
            {renderTextarea('targetUsers', 'Target Users / Beneficiaries (max 250 words)', 'Who will benefit from this innovation?', WORD_LIMITS.targetUsers)}
            {renderTextarea('prototypeDescription', 'Prototype / Product / Service Description (max 300 words)', 'Describe the prototype, product, or service', WORD_LIMITS.prototypeDescription)}
            {renderTextarea('implementationPlan', 'Implementation Plan (max 500 words)', 'Detailed plan for implementing the innovation', WORD_LIMITS.implementationPlan)}
            {renderTextarea('marketPotential', 'Market / Adoption Potential (max 250 words)', 'Market opportunities and adoption strategy', WORD_LIMITS.marketPotential)}
            {renderTextarea('scalability', 'Scalability (max 200 words)', 'How can the innovation be scaled?', WORD_LIMITS.scalability)}
            {renderTextarea('sustainability', 'Sustainability (max 150 words)', 'Long-term sustainability of the innovation', WORD_LIMITS.sustainability)}
            {renderTextarea('expectedOutputs', 'Expected Outputs and Impact (max 250 words)', 'Expected outcomes and impact', WORD_LIMITS.expectedOutputs)}
            {renderTextarea('ethicalConsiderations', 'Ethical / Environmental Considerations (max 200 words)', '', WORD_LIMITS.ethicalConsiderations)}
            {renderTextarea('capacityBuilding', 'Capacity Building (max 250 words)', '', WORD_LIMITS.capacityBuilding)}
            {renderTextarea('conflictOfInterest', 'Conflict of Interest (max 150 words)', '', WORD_LIMITS.conflictOfInterest)}
            {renderTextarea('references', 'References (max 250 words)', '', WORD_LIMITS.references)}
            {renderInputField('totalBudget', 'Total Budget', 'number')}
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
              className={`mt-1 ${errors.compliance ? 'border-danger' : ''}`}
              id="compliance"
            />
            <div className="flex-1">
              <label htmlFor="compliance" className="text-sm text-textMain">
                I confirm that the proposal being submitted complies with the KAB Research standard proposal format.
                Submission of a proposal which does not comply with the said proposal format is an automatic
                disqualification.
              </label>
              {errors.compliance && <span className="text-xs text-danger block mt-1">{errors.compliance}</span>}
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <Card>
          <div className="flex gap-4 justify-end">
            <Button
              type="submit"
              variant="outline"
              disabled={loading}
              onClick={(e) => {
                e.preventDefault();
                handleSaveDraft(e);
              }}
            >
              Save Draft
            </Button>
            <Button type="button" variant="primary" disabled={loading} onClick={handleSubmitProposal}>
              {loading ? 'Processing...' : 'Submit Proposal'}
            </Button>
          </div>
        </Card>
      </form>
    </DashboardLayout>
  );
}
