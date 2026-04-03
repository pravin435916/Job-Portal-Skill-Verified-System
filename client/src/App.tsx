import { BrowserRouter, Routes, Route } from 'react-router-dom'
const Home = () => <div>Home Page</div>
const About = () => <div>About Page</div>
const Contact = () => <div>Contact Page</div>

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App