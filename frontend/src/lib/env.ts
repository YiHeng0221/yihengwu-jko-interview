import { z } from 'zod'

// 預設指向 Railway 上的 production BE URL。Railway FE service 沒設
// VITE_API_BASE_URL build-arg 時，build 出來的 bundle 至少能跑（連到 prod BE），
// 不會 runtime 直接 throw。本機 dev 透過 frontend/.env 或 vite CLI --env 覆寫成
// http://localhost:3001（見 frontend/.env.example）。
const DEFAULT_API_BASE_URL = 'https://yihengwu-jko-interview-backend.up.railway.app'

const envSchema = z.object({
  VITE_API_BASE_URL: z
    .string()
    .default(DEFAULT_API_BASE_URL)
    .transform((val) => {
      if (/^https?:\/\//.test(val)) return val
      return `https://${val}`
    }),
})

const parsed = envSchema.safeParse(import.meta.env)

if (!parsed.success) {
  throw new Error(
    `Invalid env:\n${JSON.stringify(parsed.error.flatten().fieldErrors, null, 2)}`,
  )
}

export const env = parsed.data
