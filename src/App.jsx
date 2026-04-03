import { HashRouter, Routes, Route } from 'react-router-dom'
import TryOnPage from './pages/TryOnPage'
import PortalPage from './pages/PortalPage'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<TryOnPage />} />
        <Route path="/portal" element={<PortalPage />} />
      </Routes>
    </HashRouter>
  )
}
