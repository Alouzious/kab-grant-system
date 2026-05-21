import { Routes, Route, Navigate } from 'react-router-dom';
import ApplicantDashboard from '../pages/applicant/ApplicantDashboard';
import MyProposals from '../pages/applicant/MyProposals';
import SubmitProposal from '../pages/applicant/SubmitProposal';
import ProposalDetails from '../pages/applicant/ProposalDetails';
import UploadDocuments from '../pages/applicant/UploadDocuments';
import ProjectTeamMembers from '../pages/applicant/ProjectTeamMembers';
import Notifications from '../pages/applicant/Notifications';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Redirect root to applicant dashboard */}
      <Route path="/" element={<Navigate to="/applicant/dashboard" replace />} />

      {/* Applicant Routes */}
      <Route path="/applicant/dashboard" element={<ApplicantDashboard />} />
      <Route path="/applicant/proposals" element={<MyProposals />} />
      <Route path="/applicant/proposals/new" element={<SubmitProposal />} />
      <Route path="/applicant/proposals/:id" element={<ProposalDetails />} />
      <Route path="/applicant/proposals/:id/documents" element={<UploadDocuments />} />
      <Route path="/applicant/proposals/:id/team-members" element={<ProjectTeamMembers />} />
      <Route path="/applicant/notifications" element={<Notifications />} />

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/applicant/dashboard" replace />} />
    </Routes>
  );
}
