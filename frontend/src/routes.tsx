import { BrowserRouter, Route, Routes } from 'react-router'
import { OfflineBanner } from './components/OfflineBanner'

/**
 * Placeholder route element — 待 FE-10 (#56) 補上真的 CharityListPage 後替換。
 * 結構先 wired，避免 FE-10 PR 還要動 main entrypoint。
 */
function CharityListPagePlaceholder() {
  return (
    <main className="mx-auto max-w-md p-4 text-text-secondary">
      CharityListPage 待 FE-10 (#56) 實作
    </main>
  )
}

export function AppRoutes() {
  return (
    <BrowserRouter>
      <OfflineBanner />
      <Routes>
        <Route path="/" element={<CharityListPagePlaceholder />} />
        <Route path="*" element={<CharityListPagePlaceholder />} />
      </Routes>
    </BrowserRouter>
  )
}
