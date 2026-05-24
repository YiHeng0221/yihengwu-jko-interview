import { z } from 'zod'

const envSchema = z.object({
  VITE_API_BASE_URL: z
    .string()
    .min(1)
    .transform((val) => {
      if (/^https?:\/\//.test(val)) return val
      return `https://${val}`
    }),
})

const parsed = envSchema.safeParse(import.meta.env)

if (!parsed.success) {
  throw new Error(`Invalid env: ${parsed.error.message}`)
}

export const env = parsed.data
