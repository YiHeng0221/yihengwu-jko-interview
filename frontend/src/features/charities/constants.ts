export const CHARITY_TABS = ['ORG', 'CAMPAIGN', 'MERCHANDISE'] as const
export type CharityTab = (typeof CHARITY_TABS)[number]
export const DEFAULT_TAB: CharityTab = 'ORG'
