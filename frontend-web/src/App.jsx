import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import SubmitReport from './pages/SubmitReport'
import TrackReport from './pages/TrackReport'
import AuthLogin from './pages/AuthLogin'
import Dashboard from './pages/Dashboard'
import ReportDetail from './pages/ReportDetail'

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/authority/*" element={null} />
        <Route path="*" element={<Navbar />} />
      </Routes>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/submit" element={<SubmitReport />} />
        <Route path="/track" element={<TrackReport />} />
        <Route path="/login" element={<AuthLogin />} />
        <Route path="/authority" element={<Dashboard />} />
        <Route path="/authority/reports/:id" element={<ReportDetail />} />
      </Routes>
    </>
  )
}
