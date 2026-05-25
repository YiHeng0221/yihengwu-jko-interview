export async function apiFetch(url: string, signal?: AbortSignal): Promise<unknown> {
  const init: RequestInit = signal != null ? { signal } : {}
  const res = await fetch(url, init)
  if (!res.ok) {
    throw new Error(`API ${res.status}`)
  }
  return res.json()
}
