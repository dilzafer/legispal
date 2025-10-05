/**
 * Senate Lobbying Disclosure Act (LDA) API Integration
 * Official API for lobbying disclosure filings
 * Documentation: https://lda.senate.gov/api/redoc/v1/
 */

// ==================== TypeScript Interfaces ====================

export interface LDAFiling {
  filing_uuid: string
  filing_type: string
  filing_year: number
  filing_period: string
  dt_posted: string
  income: string | null
  expenses: string | null
  registrant: {
    id: number
    name: string
    description: string | null
  }
  client: {
    id: number
    name: string
    general_description: string | null
    state: string | null
    country: string
  }
  lobbying_activities?: LobbyingActivity[]
}

export interface LobbyingActivity {
  general_issue_code: string
  general_issue_code_display: string
  description: string
  foreign_entity_issues: string
  lobbyists: Array<{
    lobbyist: {
      id: number
      prefix: string | null
      first_name: string
      middle_name: string | null
      last_name: string
      suffix: string | null
    }
    covered_position: string | null
    new: boolean
  }>
  government_entities: Array<{
    id: number
    name: string
  }>
}

export interface Lobbyist {
  lobbyist: {
    id: number
    prefix: string | null
    first_name: string
    middle_name: string | null
    last_name: string
    suffix: string | null
  }
  covered_position: string | null
  new: boolean
}

export interface GovernmentEntity {
  id: number
  name: string
}

export interface LDARegistrant {
  registrant_id: number
  registrant_name: string
  address: string
  description: string
  country: string
  ppb_country: string
}

export interface LDAClient {
  client_id: number
  client_name: string
  description: string
  state: string
  country: string
  ppb_country: string
  status: string
}

export interface LDAContribution {
  contribution_uuid: string
  contribution_type: string
  contribution_date: string
  amount: number
  payee_name: string
  recipient_name: string
  lobbyist: Lobbyist
}

export interface LDAConstant {
  code: string
  display: string
}

export interface LDAResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

// ==================== API Configuration ====================

const LDA_API_BASE = 'https://lda.senate.gov/api/v1'

function getLDAApiKey(): string {
  return process.env.NEXT_PUBLIC_LDA_API_KEY || ''
}

// ==================== Core API Functions ====================

/**
 * Fetch lobbying filings with optional filters
 */
export async function fetchLDAFilings(params: {
  filing_year?: number
  filing_period?: string
  filing_type?: string
  registrant_name?: string
  client_name?: string
  page?: number
  page_size?: number
}): Promise<LDAResponse<LDAFiling>> {
  try {
    const apiKey = getLDAApiKey()

    // Build query parameters
    const queryParams = new URLSearchParams()
    if (apiKey) queryParams.append('api_key', apiKey)
    if (params.filing_year) queryParams.append('filing_year', params.filing_year.toString())
    if (params.filing_period) queryParams.append('filing_period', params.filing_period)
    if (params.filing_type) queryParams.append('filing_type', params.filing_type)
    if (params.registrant_name) queryParams.append('registrant_name', params.registrant_name)
    if (params.client_name) queryParams.append('client_name', params.client_name)
    if (params.page) queryParams.append('page', params.page.toString())
    if (params.page_size) queryParams.append('page_size', params.page_size.toString())

    const url = `${LDA_API_BASE}/filings/?${queryParams.toString()}`

    console.log('📡 Fetching LDA filings:', url.substring(0, 100) + '...')

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      },
      next: { revalidate: 3600 } // Cache for 1 hour
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ LDA API error:', response.status, response.statusText, errorText)
      return { count: 0, next: null, previous: null, results: [] }
    }

    const data = await response.json()
    console.log(`✅ Fetched ${data.results?.length || 0} filings (total: ${data.count || 0})`)

    return data
  } catch (error) {
    console.error('❌ Error fetching LDA filings:', error)
    return { count: 0, next: null, previous: null, results: [] }
  }
}

/**
 * Fetch registrant information
 */
export async function fetchRegistrants(params: {
  registrant_name?: string
  page?: number
}): Promise<LDAResponse<LDARegistrant>> {
  try {
    const apiKey = getLDAApiKey()

    const queryParams = new URLSearchParams()
    if (apiKey) queryParams.append('api_key', apiKey)
    if (params.registrant_name) queryParams.append('registrant_name', params.registrant_name)
    if (params.page) queryParams.append('page', params.page.toString())

    const url = `${LDA_API_BASE}/registrants/?${queryParams.toString()}`

    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 3600 }
    })

    if (!response.ok) {
      return { count: 0, next: null, previous: null, results: [] }
    }

    return await response.json()
  } catch (error) {
    console.error('❌ Error fetching registrants:', error)
    return { count: 0, next: null, previous: null, results: [] }
  }
}

/**
 * Fetch client information
 */
export async function fetchClients(params: {
  client_name?: string
  page?: number
}): Promise<LDAResponse<LDAClient>> {
  try {
    const apiKey = getLDAApiKey()

    const queryParams = new URLSearchParams()
    if (apiKey) queryParams.append('api_key', apiKey)
    if (params.client_name) queryParams.append('client_name', params.client_name)
    if (params.page) queryParams.append('page', params.page.toString())

    const url = `${LDA_API_BASE}/clients/?${queryParams.toString()}`

    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 3600 }
    })

    if (!response.ok) {
      return { count: 0, next: null, previous: null, results: [] }
    }

    return await response.json()
  } catch (error) {
    console.error('❌ Error fetching clients:', error)
    return { count: 0, next: null, previous: null, results: [] }
  }
}

/**
 * Fetch contributions/LD-203 reports
 */
export async function fetchContributions(params: {
  filing_year?: number
  page?: number
}): Promise<LDAResponse<LDAContribution>> {
  try {
    const apiKey = getLDAApiKey()

    const queryParams = new URLSearchParams()
    if (apiKey) queryParams.append('api_key', apiKey)
    if (params.filing_year) queryParams.append('filing_year', params.filing_year.toString())
    if (params.page) queryParams.append('page', params.page.toString())

    const url = `${LDA_API_BASE}/contributions/?${queryParams.toString()}`

    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 3600 }
    })

    if (!response.ok) {
      return { count: 0, next: null, previous: null, results: [] }
    }

    return await response.json()
  } catch (error) {
    console.error('❌ Error fetching contributions:', error)
    return { count: 0, next: null, previous: null, results: [] }
  }
}

/**
 * Fetch lobbying activity issue codes
 */
export async function fetchIssuesCodes(): Promise<LDAConstant[]> {
  try {
    const apiKey = getLDAApiKey()
    const queryParams = new URLSearchParams()
    if (apiKey) queryParams.append('api_key', apiKey)

    const url = `${LDA_API_BASE}/constants/filing/lobbyingactivityissues/?${queryParams.toString()}`

    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 86400 } // Cache for 24 hours
    })

    if (!response.ok) {
      return []
    }

    const data = await response.json()
    return data.results || []
  } catch (error) {
    console.error('❌ Error fetching issue codes:', error)
    return []
  }
}

/**
 * Fetch government entities (House, Senate, agencies, etc.)
 */
export async function fetchGovernmentEntities(): Promise<LDAConstant[]> {
  try {
    const apiKey = getLDAApiKey()
    const queryParams = new URLSearchParams()
    if (apiKey) queryParams.append('api_key', apiKey)

    const url = `${LDA_API_BASE}/constants/filing/governmententities/?${queryParams.toString()}`

    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 86400 }
    })

    if (!response.ok) {
      return []
    }

    const data = await response.json()
    return data.results || []
  } catch (error) {
    console.error('❌ Error fetching government entities:', error)
    return []
  }
}

/**
 * Fetch filing types
 */
export async function fetchFilingTypes(): Promise<LDAConstant[]> {
  try {
    const apiKey = getLDAApiKey()
    const queryParams = new URLSearchParams()
    if (apiKey) queryParams.append('api_key', apiKey)

    const url = `${LDA_API_BASE}/constants/filing/filingtypes/?${queryParams.toString()}`

    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 86400 }
    })

    if (!response.ok) {
      return []
    }

    const data = await response.json()
    return data.results || []
  } catch (error) {
    console.error('❌ Error fetching filing types:', error)
    return []
  }
}

/**
 * Calculate aggregated statistics from filings
 */
export async function calculateLobbyingStats(filings: LDAFiling[]): Promise<{
  totalSpending: number
  activeLobbying: number
  uniqueClients: number
  uniqueRegistrants: number
  averagePerFiling: number
}> {
  const totalSpending = filings.reduce((sum, filing) => {
    return sum + (filing.income || filing.expenses || 0)
  }, 0)

  const uniqueClients = new Set(filings.map(f => f.client.client_id)).size
  const uniqueRegistrants = new Set(filings.map(f => f.registrant.registrant_id)).size

  return {
    totalSpending,
    activeLobbying: filings.length,
    uniqueClients,
    uniqueRegistrants,
    averagePerFiling: filings.length > 0 ? totalSpending / filings.length : 0
  }
}

/**
 * Extract bill references from lobbying activity descriptions
 */
export function extractBillReferences(description: string): string[] {
  // Match patterns like H.R. 1234, S. 567, H.R.1234, S.567, HR 1234, etc.
  const billPattern = /\b(H\.?R\.?|S\.?|H\.?J\.?RES\.?|S\.?J\.?RES\.?)\s*(\d+)/gi
  const matches = description.matchAll(billPattern)

  const bills: string[] = []
  for (const match of matches) {
    let billType = match[1].replace(/\./g, '').toUpperCase()
    const billNumber = match[2]

    // Normalize bill type
    if (billType === 'HR') billType = 'HR'
    else if (billType === 'S') billType = 'S'
    else if (billType === 'HJRES') billType = 'HJRES'
    else if (billType === 'SJRES') billType = 'SJRES'

    bills.push(`${billType}-${billNumber}`)
  }

  return [...new Set(bills)] // Return unique bills
}
