/**
 * OpenStates API v3 Integration
 * State-level legislative data
 * Documentation: https://github.com/openstates/api-v3
 * API Key: Get from https://openstates.org/accounts/profile/
 */

export interface OpenStatesBill {
  id: string
  identifier: string
  title: string
  classification: string[]
  subject: string[]
  state: string
  session: string
  created_at: string
  updated_at: string
  first_action_date: string
  latest_action_date: string
  latest_action_description: string
  sponsorships: Array<{
    name: string
    classification: string
    entity_type: string
    primary: boolean
    person?: {
      id: string
      name: string
      party: string
      current_role?: {
        title: string
        district: string
      }
    }
  }>
  actions: Array<{
    description: string
    date: string
    classification: string[]
    order: number
  }>
  sources: Array<{
    url: string
  }>
  openstates_url: string
}

export interface OpenStatesVote {
  id: string
  identifier: string
  motion_text: string
  start_date: string
  result: string
  organization: {
    name: string
    classification: string
  }
  counts: Array<{
    option: string
    value: number
  }>
  votes: Array<{
    option: string
    voter_name: string
    voter_id: string
  }>
}

const OPENSTATES_API_BASE = 'https://v3.openstates.org'
// Note: OpenStates requires an API key for production use
// Set OPENSTATES_API_KEY in your environment variables

/**
 * Get OpenStates API key from environment
 */
function getApiKey(): string {
  // In production, this should be set in environment variables
  return process.env.NEXT_PUBLIC_OPENSTATES_API_KEY || ''
}

/**
 * Fetch recent state bills
 * @param state State abbreviation (e.g., 'CA', 'NY', 'TX')
 * @param limit Number of bills to fetch
 * @param page Page number for pagination
 */
export async function fetchStateBills(
  state?: string,
  limit: number = 20,
  page: number = 1
): Promise<OpenStatesBill[]> {
  try {
    const apiKey = getApiKey()
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: limit.toString(),
    })

    if (state) {
      params.append('jurisdiction', state)
    }

    const url = `${OPENSTATES_API_BASE}/bills?${params.toString()}`

    const response = await fetch(url, {
      headers: {
        'X-API-KEY': apiKey,
        'Accept': 'application/json'
      },
      next: { revalidate: 3600 } // Cache for 1 hour
    })

    if (!response.ok) {
      console.error('OpenStates API error:', response.status, response.statusText)
      return []
    }

    const data = await response.json()
    return data.results || []
  } catch (error) {
    console.error('Error fetching state bills:', error)
    return []
  }
}

/**
 * Fetch detailed bill information
 * @param billId OpenStates bill ID
 */
export async function fetchStateBillDetails(
  billId: string
): Promise<OpenStatesBill | null> {
  try {
    const apiKey = getApiKey()

    const response = await fetch(`${OPENSTATES_API_BASE}/bills/${billId}`, {
      headers: {
        'X-API-KEY': apiKey,
        'Accept': 'application/json'
      },
      next: { revalidate: 3600 }
    })

    if (!response.ok) {
      console.error('OpenStates bill details error:', response.status)
      return null
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching state bill details:', error)
    return null
  }
}

/**
 * Fetch votes for a specific bill
 * @param billId OpenStates bill ID
 */
export async function fetchStateBillVotes(
  billId: string
): Promise<OpenStatesVote[]> {
  try {
    const apiKey = getApiKey()

    const response = await fetch(
      `${OPENSTATES_API_BASE}/bills/${billId}/votes`,
      {
        headers: {
          'X-API-KEY': apiKey,
          'Accept': 'application/json'
        },
        next: { revalidate: 3600 }
      }
    )

    if (!response.ok) return []

    const data = await response.json()
    return data.results || []
  } catch (error) {
    console.error('Error fetching state bill votes:', error)
    return []
  }
}

/**
 * Search state bills by keyword
 * @param query Search query
 * @param state Optional state filter
 * @param limit Number of results
 */
export async function searchStateBills(
  query: string,
  state?: string,
  limit: number = 20
): Promise<OpenStatesBill[]> {
  try {
    const apiKey = getApiKey()
    const params = new URLSearchParams({
      q: query,
      per_page: limit.toString(),
    })

    if (state) {
      params.append('jurisdiction', state)
    }

    const response = await fetch(
      `${OPENSTATES_API_BASE}/bills?${params.toString()}`,
      {
        headers: {
          'X-API-KEY': apiKey,
          'Accept': 'application/json'
        },
        next: { revalidate: 3600 }
      }
    )

    if (!response.ok) return []

    const data = await response.json()
    return data.results || []
  } catch (error) {
    console.error('Error searching state bills:', error)
    return []
  }
}

/**
 * Get trending state bills (most recently updated)
 */
export async function getTrendingStateBills(
  state?: string,
  limit: number = 10
): Promise<OpenStatesBill[]> {
  const bills = await fetchStateBills(state, limit, 1)

  // Sort by most recent activity
  return bills.sort((a, b) =>
    new Date(b.latest_action_date).getTime() - new Date(a.latest_action_date).getTime()
  )
}

/**
 * Calculate state bill trend score
 */
export function calculateStateTrendScore(bill: OpenStatesBill): number {
  let score = 40 // Base score for state bills

  // Recent activity
  const daysSinceUpdate = Math.floor(
    (Date.now() - new Date(bill.latest_action_date).getTime()) / (1000 * 60 * 60 * 24)
  )
  if (daysSinceUpdate < 7) score += 30
  else if (daysSinceUpdate < 30) score += 15

  // Number of sponsors
  const sponsorCount = bill.sponsorships?.length || 0
  score += Math.min(sponsorCount * 2, 20)

  // Number of actions (activity indicator)
  const actionCount = bill.actions?.length || 0
  score += Math.min(actionCount, 10)

  return Math.min(score, 100)
}
