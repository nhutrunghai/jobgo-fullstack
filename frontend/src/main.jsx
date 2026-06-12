import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import RequireAuth from './components/RequireAuth.jsx'
import RequireEmployerCompany from './components/RequireEmployerCompany.jsx'
import Dashboard from './pages/Dashboard.jsx'
import JobList from './pages/JobList.jsx'
import Contracts from './pages/Contracts.jsx'
import JobDirectory from './pages/JobDirectory.jsx'
import MilestoneManagement from './pages/MilestoneManagement.jsx'
import Notifications from './pages/Notifications.jsx'
import JobProgress from './pages/JobProgress.jsx'
import MessagesCenter from './pages/MessagesCenter.jsx'
import UploadedCvs from './pages/UploadedCvs.jsx'
import AppliedProfileEdit from './pages/AppliedProfileEdit.jsx'
import AuthPortal from './pages/AuthPortal.jsx'
import VerifyEmail from './pages/VerifyEmail.jsx'
import JobDetail from './pages/JobDetail.jsx'
import Discussions from './pages/Discussions.jsx'
import Favorites from './pages/Favorites.jsx'
import SearchJobs from './pages/SearchJobs.jsx'
import AIAgent from './pages/AIAgent.jsx'
import UserProfileEdit from './pages/UserProfileEdit.jsx'
import UserPublicProfile from './pages/UserPublicProfile.jsx'
import UserSettings from './pages/UserSettings.jsx'
import WalletTopUp from './pages/WalletTopUp.jsx'
import EmployerOverviewDashboard from './pages/tuyen-dung/EmployerOverviewDashboard.jsx'
import EmployerCompanyRegistration from './pages/tuyen-dung/EmployerCompanyRegistration.jsx'
import EmployerRecruitmentDashboard from './pages/tuyen-dung/EmployerRecruitmentDashboard.jsx'
import EmployerJobList from './pages/tuyen-dung/EmployerJobList.jsx'
import EmployerInterviewCalendar from './pages/tuyen-dung/EmployerInterviewCalendar.jsx'
import EmployerMilestoneDashboard from './pages/tuyen-dung/EmployerMilestoneDashboard.jsx'
import EmployerReceivedProfiles from './pages/tuyen-dung/EmployerReceivedProfiles.jsx'
import EmployerCandidateDetail from './pages/tuyen-dung/EmployerCandidateDetail.jsx'
import EmployerMessages from './pages/tuyen-dung/EmployerMessages.jsx'
import EmployerNotifications from './pages/tuyen-dung/EmployerNotifications.jsx'
import EmployerJobPromotions from './pages/tuyen-dung/EmployerJobPromotions.jsx'
import EmployerJobPromotionDetail from './pages/tuyen-dung/EmployerJobPromotionDetail.jsx'
import AdminLogin from './pages/admin/AdminLogin.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import AdminUsers from './pages/admin/AdminUsers.jsx'
import AdminCompanies from './pages/admin/AdminCompanies.jsx'
import AdminJobs from './pages/admin/AdminJobs.jsx'
import AdminJobPromotions from './pages/admin/AdminJobPromotions.jsx'
import AdminWalletTransactions from './pages/admin/AdminWalletTransactions.jsx'
import AdminSePayConfig from './pages/admin/AdminSePayConfig.jsx'
import AdminRagChatConfig from './pages/admin/AdminRagChatConfig.jsx'
import AdminAuditLogs from './pages/admin/AdminAuditLogs.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
        <Route path="/employer-dashboard" element={<RequireAuth><EmployerOverviewDashboard /></RequireAuth>} />
        <Route path="/employer/company-registration" element={<RequireAuth><EmployerCompanyRegistration /></RequireAuth>} />
        <Route path="/employer-post-job" element={<RequireAuth><RequireEmployerCompany><EmployerRecruitmentDashboard /></RequireEmployerCompany></RequireAuth>} />
        <Route path="/employer-job-list" element={<RequireAuth><RequireEmployerCompany><EmployerJobList /></RequireEmployerCompany></RequireAuth>} />
        <Route path="/employer-received-cv" element={<RequireAuth><RequireEmployerCompany><EmployerReceivedProfiles /></RequireEmployerCompany></RequireAuth>} />
        <Route path="/employer-received-cv/:applicationId" element={<RequireAuth><RequireEmployerCompany><EmployerCandidateDetail /></RequireEmployerCompany></RequireAuth>} />
        <Route path="/employer-interviews" element={<RequireAuth><RequireEmployerCompany><EmployerInterviewCalendar /></RequireEmployerCompany></RequireAuth>} />
        <Route path="/employer-messages" element={<RequireAuth><RequireEmployerCompany><EmployerMessages /></RequireEmployerCompany></RequireAuth>} />
        <Route path="/employer-notifications" element={<RequireAuth><RequireEmployerCompany><EmployerNotifications /></RequireEmployerCompany></RequireAuth>} />
        <Route path="/employer-milestones" element={<RequireAuth><RequireEmployerCompany><EmployerMilestoneDashboard /></RequireEmployerCompany></RequireAuth>} />
        <Route path="/employer-job-promotions" element={<RequireAuth><RequireEmployerCompany><EmployerJobPromotions /></RequireEmployerCompany></RequireAuth>} />
        <Route path="/employer-job-promotions/:promotionId" element={<RequireAuth><RequireEmployerCompany><EmployerJobPromotionDetail /></RequireEmployerCompany></RequireAuth>} />
        <Route path="/job-list" element={<JobDirectory />} />
        <Route path="/jobs" element={<RequireAuth><JobList /></RequireAuth>} />
        <Route path="/contracts" element={<RequireAuth><Contracts /></RequireAuth>} />
        <Route path="/milestones" element={<RequireAuth><MilestoneManagement /></RequireAuth>} />
        <Route path="/notifications" element={<RequireAuth><Notifications /></RequireAuth>} />
        <Route path="/job-progress" element={<RequireAuth><JobProgress /></RequireAuth>} />
        <Route path="/uploaded-cvs" element={<RequireAuth><UploadedCvs /></RequireAuth>} />
        <Route path="/uploaded-cvs/:cvId/edit" element={<RequireAuth><AppliedProfileEdit /></RequireAuth>} />
        <Route path="/messages" element={<RequireAuth><MessagesCenter /></RequireAuth>} />
        <Route path="/login" element={<AuthPortal mode="login" />} />
        <Route path="/register" element={<AuthPortal mode="register" />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<AuthPortal mode="forgot" />} />
        <Route path="/reset-password" element={<AuthPortal mode="reset" />} />
        <Route path="/job-detail" element={<JobDetail />} />
        <Route path="/job-detail/:id" element={<JobDetail />} />
        <Route path="/discussions" element={<Discussions />} />
        <Route path="/favorites" element={<RequireAuth><Favorites /></RequireAuth>} />
        <Route path="/search-jobs" element={<SearchJobs />} />
        <Route path="/ai-agent" element={<AIAgent />} />
        <Route path="/user/profile" element={<RequireAuth><UserPublicProfile /></RequireAuth>} />
        <Route path="/user/profile/edit" element={<RequireAuth><UserProfileEdit /></RequireAuth>} />
        <Route path="/user/profile/:id" element={<UserPublicProfile />} />
        <Route path="/user/settings" element={<RequireAuth><UserSettings /></RequireAuth>} />
        <Route path="/wallet/top-up" element={<RequireAuth><WalletTopUp /></RequireAuth>} />
        <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/companies" element={<AdminCompanies />} />
        <Route path="/admin/jobs" element={<AdminJobs />} />
        <Route path="/admin/job-promotions" element={<AdminJobPromotions />} />
        <Route path="/admin/wallet-transactions" element={<AdminWalletTransactions />} />
        <Route path="/admin/sepay-config" element={<AdminSePayConfig />} />
        <Route path="/admin/rag-chat-config" element={<AdminRagChatConfig />} />
        <Route path="/admin/audit-logs" element={<AdminAuditLogs />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)






