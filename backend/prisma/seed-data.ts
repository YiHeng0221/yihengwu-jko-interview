import { CharityTab } from '@prisma/client'

type CharityInput = {
  id: string
  title: string
  description: string
  tab: CharityTab
  categoryCode: string
  logoUrl: string | null
  amountRaised: number
  amountGoal: number | null
  createdAt: Date
  bannerImageUrl: string | null
  orgName: string | null
  tags: string[]
  productImageUrl: string | null
  priceNtd: number | null
}

function addDays(isoBase: string, days: number): Date {
  const d = new Date(isoBase)
  d.setUTCDate(d.getUTCDate() + days)
  return d
}

// Lorem Picsum：用 ?seed=xxx 保 deterministic、用 path /600/300 控比例
function picsum(seed: string, width: number, height: number): string {
  return `https://picsum.photos/seed/${seed}/${width}/${height}`
}

const CATEGORY_CODES = [
  'CHILD_CARE',
  'ELDER_CARE',
  'ANIMAL_PROTECTION',
  'SPECIAL_MEDICAL',
  'DISABILITY_SERVICE',
  'WOMEN_CARE',
  'SPORTS_DEV',
  'EDUCATION_ADVOCACY',
  'ENV_PROTECTION',
  'MULTI_ETHNIC',
  'MEDIA',
  'PUBLIC_ISSUE',
  'CULTURE_ARTS',
  'COMMUNITY_DEV',
  'POVERTY_RELIEF',
  'INTL_RESCUE',
] as const

const CATEGORY_LABEL: Record<string, string> = {
  CHILD_CARE: '兒少照護',
  ELDER_CARE: '老人照護',
  ANIMAL_PROTECTION: '動物保護',
  SPECIAL_MEDICAL: '特殊醫病',
  DISABILITY_SERVICE: '身心障礙服務',
  WOMEN_CARE: '婦女關懷',
  SPORTS_DEV: '運動發展',
  EDUCATION_ADVOCACY: '教育議題提倡',
  ENV_PROTECTION: '環境保護',
  MULTI_ETHNIC: '多元族群',
  MEDIA: '媒體傳播',
  PUBLIC_ISSUE: '公共議題',
  CULTURE_ARTS: '文教藝術',
  COMMUNITY_DEV: '社區發展',
  POVERTY_RELIEF: '弱勢扶貧',
  INTL_RESCUE: '國際救援',
}

const ORG_NAME_BASE = [
  '台灣愛心協會',
  '中華關懷基金會',
  '希望之芽公益聯盟',
  '陽光社會福利基金會',
  '伊甸社會福利基金會',
  '勵馨基金會',
  '世界展望會',
  '紅十字會台灣分會',
  '兒童福利聯盟',
  '創世社會福利基金會',
]

const ORG_TITLE_TPL = [
  '台灣%s協會',
  '中華%s基金會',
  '財團法人%s聯盟',
  '%s服務協進會',
  '%s公益基金會',
]

const CAMPAIGN_TITLE_TPL = [
  '%s援助計畫',
  '%s重建專案',
  '%s募款行動',
  '%s照護計畫',
  '%s教育推廣專案',
]

const MERCH_TITLE_TPL = [
  '%s義賣禮盒',
  '%s手作小物',
  '%s愛心商品',
  '%s公益馬克杯',
  '%s手工編織組',
]

const DESC_TPL = [
  '讓每一份心意都化為溫暖的力量',
  '陪伴需要的人走過最艱難的時刻',
  '改變從一個小小的行動開始',
  '匯聚善意，創造更多希望',
  '每一筆捐款都將改寫一個故事',
  '讓愛跨越距離，溫暖每個角落',
  '把幸福分享給更需要的人',
  '善的循環從你我開始',
  '微小的善意累積成巨大的能量',
  '相信改變，相信明天會更好',
]

function pick<T>(arr: readonly T[], i: number): T {
  const v = arr[i % arr.length]
  if (v === undefined) throw new Error('pick: array empty')
  return v
}

function formatTitle(tpl: string, label: string): string {
  return tpl.replace('%s', label)
}

function org(seq: number): CharityInput {
  const categoryCode = pick(CATEGORY_CODES, seq - 1)
  const label = CATEGORY_LABEL[categoryCode] ?? '公益'
  const title = formatTitle(pick(ORG_TITLE_TPL, seq - 1), label)
  const description = pick(DESC_TPL, seq - 1)
  return {
    id: `seed-org-${String(seq).padStart(3, '0')}`,
    title,
    description,
    tab: CharityTab.ORG,
    categoryCode,
    logoUrl: picsum(`org-${seq}`, 120, 120),
    amountRaised: 50000 + (seq - 1) * 1500,
    amountGoal: null,
    createdAt: addDays('2026-01-01', seq - 1),
    bannerImageUrl: null,
    orgName: null,
    tags: [],
    productImageUrl: null,
    priceNtd: null,
  }
}

function campaign(seq: number): CharityInput {
  const categoryCode = pick(CATEGORY_CODES, seq - 1)
  const label = CATEGORY_LABEL[categoryCode] ?? '公益'
  const title = formatTitle(pick(CAMPAIGN_TITLE_TPL, seq - 1), label)
  const description = pick(DESC_TPL, seq - 1)
  const orgName = pick(ORG_NAME_BASE, seq - 1)
  // 為 campaign 多帶 1-3 個 tag（rotate categoryCode 鄰居）
  const tagCount = 1 + (seq % 3)
  const tags: string[] = []
  for (let i = 0; i < tagCount; i++) {
    const code = pick(CATEGORY_CODES, seq - 1 + i)
    tags.push(CATEGORY_LABEL[code] ?? code)
  }
  return {
    id: `seed-cam-${String(seq).padStart(3, '0')}`,
    title,
    description,
    tab: CharityTab.CAMPAIGN,
    categoryCode,
    logoUrl: null,
    amountRaised: 10000 + (seq - 1) * 1200,
    amountGoal: 100000 + (seq - 1) * 2000,
    createdAt: addDays('2026-02-01', seq - 1),
    bannerImageUrl: picsum(`cam-${seq}`, 640, 360),
    orgName,
    tags,
    productImageUrl: null,
    priceNtd: null,
  }
}

function merch(seq: number): CharityInput {
  const categoryCode = pick(CATEGORY_CODES, seq - 1)
  const label = CATEGORY_LABEL[categoryCode] ?? '公益'
  const title = formatTitle(pick(MERCH_TITLE_TPL, seq - 1), label)
  const description = pick(DESC_TPL, seq - 1)
  const orgName = pick(ORG_NAME_BASE, seq - 1)
  // Price between $99 - $3,899, deterministic
  const priceNtd = 99 + ((seq * 137) % 39) * 100
  return {
    id: `seed-mer-${String(seq).padStart(3, '0')}`,
    title,
    description,
    tab: CharityTab.MERCHANDISE,
    categoryCode,
    logoUrl: null,
    amountRaised: 2000 + (seq - 1) * 300,
    amountGoal: 20000 + (seq - 1) * 600,
    createdAt: addDays('2026-03-03', seq - 1),
    bannerImageUrl: null,
    orgName,
    tags: [],
    productImageUrl: picsum(`mer-${seq}`, 400, 300),
    priceNtd,
  }
}

const TOTAL_PER_TAB = 90

export const SEED_CHARITIES: CharityInput[] = [
  ...Array.from({ length: TOTAL_PER_TAB }, (_, i) => org(i + 1)),
  ...Array.from({ length: TOTAL_PER_TAB }, (_, i) => campaign(i + 1)),
  ...Array.from({ length: TOTAL_PER_TAB }, (_, i) => merch(i + 1)),
]
