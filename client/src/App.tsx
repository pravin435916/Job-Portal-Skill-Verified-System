import { BrowserRouter, Routes, Route } from 'react-router-dom'
import JobListing from './pages/recruiters/RecruiterDashboard'
import LandingPage from './pages/LandingPage'

const Contact = () => <div>Contact Page</div>

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/recruiter/jobs" element={<JobListing />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App