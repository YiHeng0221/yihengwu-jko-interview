import { z } from 'zod'

export const CATEGORIES = [
  { code: 'ALL', label: '全部' },
  { code: 'CHILD_CARE', label: '兒少照護' },
  { code: 'ANIMAL_PROTECTION', label: '動物保護' },
  { code: 'SPECIAL_MEDICAL', label: '特殊醫病' },
  { code: 'ELDER_CARE', label: '老人照護' },
  { code: 'DISABILITY_SERVICE', label: '身心障礙服務' },
  { code: 'WOMEN_CARE', label: '婦女關懷' },
  { code: 'SPORTS_DEV', label: '運動發展' },
  { code: 'EDUCATION_ADVOCACY', label: '教育議題提倡' },
  { code: 'ENV_PROTECTION', label: '環境保護' },
  { code: 'MULTI_ETHNIC', label: '多元族群' },
  { code: 'MEDIA', label: '媒體傳播' },
  { code: 'PUBLIC_ISSUE', label: '公共議題' },
  { code: 'CULTURE_ARTS', label: '文教藝術' },
  { code: 'COMMUNITY_DEV', label: '社區發展' },
  { code: 'POVERTY_RELIEF', label: '弱勢扶貧' },
  { code: 'INTL_RESCUE', label: '國際救援' },
] as const

export type CategoryCode = (typeof CATEGORIES)[number]['code']

const CATEGORY_CODES = CATEGORIES.map((c) => c.code) as [
  CategoryCode,
  ...CategoryCode[],
]

export const CategoryCodeSchema = z.enum(CATEGORY_CODES)

export function isCategoryCode(value: unknown): value is CategoryCode {
  return typeof value === 'string' && CATEGORY_CODES.includes(value as CategoryCode)
}
