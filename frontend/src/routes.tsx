import { BrowserRouter, Route, Routes } from 'react-router'
import { OfflineBanner } from './components/OfflineBanner'
import { CharityListPage } from './features/charities/CharityListPage'

export function AppRoutes() {
  return (
    <BrowserRouter>
      <OfflineBanner />
      <Routes>
        <Route path="/" element={<CharityListPage />} />
        <Route path="*" element={<CharityListPage />} />
      </Routes>
    </BrowserRouter>
  )
}
