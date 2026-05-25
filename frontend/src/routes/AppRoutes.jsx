import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/auth/ProtectedRoute';

// Auth / Public pages
import Landing from '../pages/auth/Landing';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';

// Applicant pages
import ApplicantDashboard from '../pages/applicant/ApplicantDashboard';
import MyProposals from '../pages/applicant/MyProposals';
import SubmitProposal from '../pages/applicant/SubmitProposal';
import ProposalDetails from '../pages/applicant/ProposalDetails';
import UploadDocuments from '../pages/applicant/UploadDocuments';
import ProjectTeamMembers from '../pages/applicant/ProjectTeamMembers';
import Notifications from '../pages/applicant/Notifications';

// Admin pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import Users from '../pages/admin/Users';
import Reviewers from '../pages/admin/Reviewers';
import GrantCalls from '../pages/admin/GrantCalls';
import SubmittedProposals from '../pages/admin/proposals/SubmittedProposals';
import ScheduledProposals from '../pages/admin/proposals/ScheduledProposals';
import ReviewedProposals from '../pages/admin/proposals/ReviewedProposals';
import ApprovedProposals from '../pages/admin/proposals/ApprovedProposals';
import RejectedProposals from '../pages/admin/proposals/RejectedProposals';
import AwardedProposals from '../pages/admin/proposals/AwardedProposals';
import AdminProposalDetail from '../pages/admin/proposals/AdminProposalDetail';

import ReviewerDashboard from '../pages/reviewer/ReviewerDashboard';
import AssignedProposals from '../pages/reviewer/AssignedProposals';
import ReviewProposalDetail from '../pages/reviewer/ReviewProposalDetail';
import SubmittedReviews from '../pages/reviewer/SubmittedReviews';
import ReviewerNotifications from '../pages/reviewer/ReviewerNotifications';
import ChangePassword from '../pages/auth/ChangePassword';

export default function AppRoutes() {
  const { isAuthenticated, user, redirectPathForRole } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Landing />} />
      <Route
        path="/login"
        element={
          isAuthenticated
            ? <Navigate to={redirectPathForRole(user.role)} replace />
            : <Login />
        }
      />
      <Route
        path="/register"
        element={
          isAuthenticated
            ? <Navigate to={redirectPathForRole(user.role)} replace />
            : <Register />
        }
      />
      <Route
        path="/forgot-password"
        element={
          isAuthenticated
            ? <Navigate to={redirectPathForRole(user.role)} replace />
            : <ForgotPassword />
        }
      />
      <Route
        path="/reset-password"
        element={
          isAuthenticated
            ? <Navigate to={redirectPathForRole(user.role)} replace />
            : <ResetPassword />
        }
      />

            {/* Change Password */}
      <Route path="/change-password" element={
        <ProtectedRoute allowedRoles={['reviewer', 'staff', 'admin']}>
          <ChangePassword />
        </ProtectedRoute>
      } />

      {/* Applicant Routes */}
      <Route path="/applicant/dashboard" element={
        <ProtectedRoute allowedRoles={['staff']}><ApplicantDashboard /></ProtectedRoute>
      } />
      <Route path="/applicant/proposals" element={
        <ProtectedRoute allowedRoles={['staff']}><MyProposals /></ProtectedRoute>
      } />
      <Route path="/applicant/proposals/new" element={
        <ProtectedRoute allowedRoles={['staff']}><SubmitProposal /></ProtectedRoute>
      } />
      <Route path="/applicant/proposals/:id" element={
        <ProtectedRoute allowedRoles={['staff']}><ProposalDetails /></ProtectedRoute>
      } />
      <Route path="/applicant/proposals/:id/documents" element={
        <ProtectedRoute allowedRoles={['staff']}><UploadDocuments /></ProtectedRoute>
      } />
      <Route path="/applicant/proposals/:id/team-members" element={
        <ProtectedRoute allowedRoles={['staff']}><ProjectTeamMembers /></ProtectedRoute>
      } />
      <Route path="/applicant/notifications" element={
        <ProtectedRoute allowedRoles={['staff']}><Notifications /></ProtectedRoute>
      } />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>
      } />
      <Route path="/admin/users" element={
        <ProtectedRoute allowedRoles={['admin']}><Users /></ProtectedRoute>
      } />
      <Route path="/admin/reviewers" element={
        <ProtectedRoute allowedRoles={['admin']}><Reviewers /></ProtectedRoute>
      } />
      <Route path="/admin/grant-calls" element={
        <ProtectedRoute allowedRoles={['admin']}><GrantCalls /></ProtectedRoute>
      } />
      <Route path="/admin/proposals/submitted" element={
        <ProtectedRoute allowedRoles={['admin']}><SubmittedProposals /></ProtectedRoute>
      } />
      <Route path="/admin/proposals/scheduled" element={
        <ProtectedRoute allowedRoles={['admin']}><ScheduledProposals /></ProtectedRoute>
      } />
      <Route path="/admin/proposals/reviewed" element={
        <ProtectedRoute allowedRoles={['admin']}><ReviewedProposals /></ProtectedRoute>
      } />
      <Route path="/admin/proposals/approved" element={
        <ProtectedRoute allowedRoles={['admin']}><ApprovedProposals /></ProtectedRoute>
      } />
      <Route path="/admin/proposals/rejected" element={
        <ProtectedRoute allowedRoles={['admin']}><RejectedProposals /></ProtectedRoute>
      } />
      <Route path="/admin/proposals/awarded" element={
        <ProtectedRoute allowedRoles={['admin']}><AwardedProposals /></ProtectedRoute>
      } />
      <Route path="/admin/proposals/:id" element={
        <ProtectedRoute allowedRoles={['admin']}><AdminProposalDetail /></ProtectedRoute>
      } />

            {/* Reviewer Routes */}
      <Route path="/reviewer/dashboard" element={
        <ProtectedRoute allowedRoles={['reviewer']}><ReviewerDashboard /></ProtectedRoute>
      } />
      <Route path="/reviewer/proposals" element={
        <ProtectedRoute allowedRoles={['reviewer']}><AssignedProposals /></ProtectedRoute>
      } />
      <Route path="/reviewer/proposals/:id" element={
        <ProtectedRoute allowedRoles={['reviewer']}><ReviewProposalDetail /></ProtectedRoute>
      } />
      <Route path="/reviewer/reviews" element={
        <ProtectedRoute allowedRoles={['reviewer']}><SubmittedReviews /></ProtectedRoute>
      } />
      <Route path="/reviewer/notifications" element={
        <ProtectedRoute allowedRoles={['reviewer']}><ReviewerNotifications /></ProtectedRoute>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}