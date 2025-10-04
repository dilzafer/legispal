// Congress.gov API Configuration

export const CONGRESS_CONFIG = {
  BASE_URL: 'https://api.congress.gov/v3',
  API_KEY: '1iI2RUAZIN3WUCf0K4r1Vz6LzorEp41XmyaLIZFi',
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 250,
  CURRENT_CONGRESS: 118,
} as const;

export const CONGRESS_ENDPOINTS = {
  BILLS: '/bill',
  BILL_DETAIL: '/bill',
  AMENDMENTS: '/amendment',
  AMENDMENT_DETAIL: '/amendment',
} as const;

export const BILL_TYPES = {
  HR: 'hr',        // House Bill
  S: 's',          // Senate Bill
  HRES: 'hres',    // House Resolution
  SRES: 'sres',    // Senate Resolution
  HJRES: 'hjres',  // House Joint Resolution
  SJRES: 'sjres',  // Senate Joint Resolution
  HCONRES: 'hconres', // House Concurrent Resolution
  SCONRES: 'sconres', // Senate Concurrent Resolution
} as const;
