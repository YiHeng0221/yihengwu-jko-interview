import type { Charity } from '@prisma/client'
import type { CharityWire } from './schemas.js'

// CharityRow: Prisma 自動推導的 Charity model 型別。Schema 異動（新增 required
// 欄位 / 重命名）會直接讓 TS 偵測到對齊問題，比手寫 type 更嚴密。
export type CharityRow = Charity

// CharityTab 也直接從 Prisma 拿（schema.prisma 的 enum CharityTab）。
export type { CharityTab } from '@prisma/client'

// CharityWire 從 schemas.ts 的 Zod schema 推導（ADR-0004: single source of truth），
// re-export 方便既有 consumer 從同個 module 拿。
export type { CharityWire }

export function charityToWire(row: CharityRow): CharityWire {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    tab: row.tab,
    category_code: row.categoryCode,
    logo_url: row.logoUrl,
    amount_raised: row.amountRaised,
    amount_goal: row.amountGoal,
    created_at: row.createdAt.toISOString(),
  }
}
