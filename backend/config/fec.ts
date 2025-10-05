// FEC (Federal Election Commission) API Configuration

export const FEC_CONFIG = {
  BASE_URL: 'https://api.open.fec.gov/v1',
  API_KEY: 'AvYhMl4E60WU02bdMZIHZr9NeGqnxAPWg1gpFhYR',
  DEFAULT_PER_PAGE: 20,
  MAX_PER_PAGE: 100,
} as const;

export const FEC_ENDPOINTS = {
  CANDIDATES: '/candidates',
  CANDIDATE_TOTALS: '/candidate',
  COMMITTEES: '/committees',
  SCHEDULE_A: '/schedules/schedule_a', // Receipts/contributions
  SCHEDULE_B: '/schedules/schedule_b', // Disbursements
  SCHEDULE_E: '/schedules/schedule_e', // Independent expenditures
  FILINGS: '/filings',
  REPORTS: '/reports',
} as const;
