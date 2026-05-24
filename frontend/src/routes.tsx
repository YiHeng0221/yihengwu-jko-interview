import { BrowserRouter, Route, Routes } from 'react-router'
import { CharityListPage } from './features/charities/CharityListPage'

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CharityListPage />} />
        <Route path="*" element={<CharityListPage />} />
      </Routes>
    </BrowserRouter>
  )
}
