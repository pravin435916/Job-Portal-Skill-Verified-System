import { BrowserRouter, Routes, Route } from 'react-router-dom'
import JobListing from './pages/recruiters/RecruiterDashboard'
import CandidateJobListing from './pages/candidates/JobListing'
import JobApply from './pages/candidates/JobApply'
import LandingPage from './pages/LandingPage'

const Contact = () => <div>Contact Page</div>

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/recruiter/jobs" element={<JobListing />} />
        <Route path="/candidate/jobs" element={<CandidateJobListing />} />
        <Route path="/candidate/jobs/apply" element={<JobApply />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App