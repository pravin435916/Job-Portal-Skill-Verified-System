import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom'
import JobListing from './pages/recruiters/RecruiterDashboard'

const About = () => <div>About Page</div>
const Contact = () => <div>Contact Page</div>

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/recruiter/jobs" replace />} />
        <Route path="/recruiter/jobs" element={<JobListing />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App