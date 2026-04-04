import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import JobListing from './pages/recruiters/RecruiterDashboard'
import CandidateJobListing from './pages/candidates/JobListing'
import JobApply from './pages/candidates/JobApply'
import LandingPage from './pages/LandingPage'
import CandidateProfile from './pages/candidates/CandidateProfile'
import RoleNavbar from './components/RoleNavbar'

const Contact = () => <div>Contact Page</div>

const CandidateLayout = () => (
  <>
    <RoleNavbar
      title="Candidate"
      items={[
        { label: 'Profile', to: '/candidate/profile' },
        { label: 'Apply', to: '/candidate/apply' },
        { label: 'Jobs', to: '/candidate/jobs' },
      ]}
    />
    <Outlet />
  </>
)

const RecruiterLayout = () => (
  <>
    <RoleNavbar
      title="Recruiter"
      items={[
        { label: 'Jobs', to: '/recruiter/jobs' },
        { label: 'Dashboard', to: '/recruiter/dashboard' },
      ]}
    />
    <Outlet />
  </>
)

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/candidate" element={<CandidateLayout />}>
          <Route index element={<Navigate to="jobs" replace />} />
          <Route path="jobs" element={<CandidateJobListing />} />
          <Route path="apply" element={<JobApply />} />
          <Route path="profile" element={<CandidateProfile />} />
        </Route>
        <Route path="/recruiter" element={<RecruiterLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="jobs" element={<JobListing />} />
          <Route path="dashboard" element={<JobListing />} />
        </Route>
        <Route path="/candidate/jobs/apply" element={<Navigate to="/candidate/apply" replace />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App