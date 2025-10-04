// OpenStates API Configuration

export const OPENSTATES_CONFIG = {
  BASE_URL: 'https://v3.openstates.org',
  API_KEY: 'ce658c08-5cb0-4848-b50c-7ae88cf2b7a3',
  DEFAULT_PER_PAGE: 10,
  MAX_PER_PAGE: 50,
} as const;

export const OPENSTATES_ENDPOINTS = {
  BILLS: '/bills',
  BILL_BY_ID: '/bills/ocd-bill',
  BILL_DETAIL: '/bills',
  JURISDICTIONS: '/jurisdictions',
  PEOPLE: '/people',
  COMMITTEES: '/committees',
  EVENTS: '/events',
} as const;
