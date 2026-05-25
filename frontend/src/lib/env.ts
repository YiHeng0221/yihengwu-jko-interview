import { z } from 'zod'

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
