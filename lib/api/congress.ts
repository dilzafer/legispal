/**
 * Congress.gov API Integration
 * Official API for US federal legislative data
 * Documentation: https://gpo.congress.gov/
 */

export interface CongressBill {
  congress: number
  number: string
  type: string
  title: string
  originChamber: string
  latestAction: {
    actionDate: string
    text: string
  }
  sponsors: Array<{
    bioguideId: string
    fullName: string
    firstName: string
    lastName: string
    party: string
    state: string
  }>
  cosponsors?: Array<{
    bioguideId: string
    fullName: string
    party: string
    state: string
  }>
  subjects?: {
    legislativeSubjects: Array<{
      name: string
    }>
    policyArea?: {
      name: string
    }
  }
  summaries?: Array<{
    actionDate: string
    text: string
    versionCode: string
  }>
  actions?: Array<{
    actionDate: string
    text: string
    type: string
  }>
  committees?: Array<{
    name: string
    chamber: string
  }>
  updateDate: string
  introducedDate: string
}

export interface CongressVote {
  congress: number
  chamber: string
  sessionNumber: number
  rollCallNumber: number
  voteDate: string
  voteQuestion: string
  voteResult: string
  voteTitle: string
  votes: {
    Democratic: {
      Yea: number
      Nay: number
      Present: number
      NotVoting: number
    }
    Republican: {
      Yea: number
      Nay: number
      Present: number
      NotVoting: number
    }
    Independent: {
      Yea: number
      Nay: number
      Present: number
      NotVoting: number
    }
  }
  totals: {
    Yea: number
    Nay: number
    Present: number
    NotVoting: number
  }
}

const CONGRESS_API_BASE = 'https://api.congress.gov/v3'
const CURRENT_CONGRESS = 118 // 118th Congress (2023-2024)

/**
 * Fetch recent bills from Congress.gov API
 * @param limit Number of bills to fetch
 * @param offset Pagination offset
 */
export async function fetchRecentBills(
  limit: number = 20,
  offset: number = 0
): Promise<CongressBill[]> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_CONGRESS_API_KEY

    if (!apiKey) {
      console.warn('⚠️  Congress API key not configured. Set NEXT_PUBLIC_CONGRESS_API_KEY in .env.local')
      return []
    }

    const url = `${CONGRESS_API_BASE}/bill/${CURRENT_CONGRESS}?api_key=${apiKey}&format=json&limit=${limit}&offset=${offset}`

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      },
      next: { revalidate: 3600 } // Cache for 1 hour
    })

    if (!response.ok) {
      console.error('❌ Congress API error:', response.status, response.statusText)
      const errorText = await response.text()
      console.error('Error details:', errorText)
      return []
    }

    const data = await response.json()
    console.log(`✅ Fetched ${data.bills?.length || 0} bills from Congress API`)
    return data.bills || []
  } catch (error) {
    console.error('❌ Error fetching bills from Congress API:', error)
    return []
  }
}

/**
 * Fetch detailed bill information
 * @param billType Type of bill (hr, s, hjres, sjres, etc.)
 * @param billNumber Bill number
 * @param congress Congress number (default: current)
 */
export async function fetchBillDetails(
  billType: string,
  billNumber: string,
  congress: number = CURRENT_CONGRESS
): Promise<CongressBill | null> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_CONGRESS_API_KEY

    if (!apiKey) {
      console.warn('⚠️  Congress API key not configured')
      return null
    }

    const url = `${CONGRESS_API_BASE}/bill/${congress}/${billType}/${billNumber}?api_key=${apiKey}&format=json`

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      },
      next: { revalidate: 3600 }
      }
    )

    if (!response.ok) {
      console.error('Congress API bill details error:', response.status)
      return null
    }

    const data = await response.json()
    return data.bill || null
  } catch (error) {
    console.error('Error fetching bill details:', error)
    return null
  }
}

/**
 * Fetch bill actions/status history
 */
export async function fetchBillActions(
  billType: string,
  billNumber: string,
  congress: number = CURRENT_CONGRESS
): Promise<any[]> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_CONGRESS_API_KEY
    if (!apiKey) return []

    const url = `${CONGRESS_API_BASE}/bill/${congress}/${billType}/${billNumber}/actions?api_key=${apiKey}&format=json`

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      },
      next: { revalidate: 3600 }
    })

    if (!response.ok) return []

    const data = await response.json()
    return data.actions || []
  } catch (error) {
    console.error('Error fetching bill actions:', error)
    return []
  }
}

/**
 * Fetch bill cosponsors
 */
export async function fetchBillCosponsors(
  billType: string,
  billNumber: string,
  congress: number = CURRENT_CONGRESS
): Promise<any[]> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_CONGRESS_API_KEY
    if (!apiKey) return []

    const url = `${CONGRESS_API_BASE}/bill/${congress}/${billType}/${billNumber}/cosponsors?api_key=${apiKey}&format=json`

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      },
      next: { revalidate: 3600 }
    })

    if (!response.ok) return []

    const data = await response.json()
    return data.cosponsors || []
  } catch (error) {
    console.error('Error fetching cosponsors:', error)
    return []
  }
}

/**
 * Fetch voting records for a specific bill
 */
export async function fetchBillVotes(
  billType: string,
  billNumber: string,
  congress: number = CURRENT_CONGRESS
): Promise<CongressVote[]> {
  try {
    // First get the bill's actions to find roll call votes
    const actions = await fetchBillActions(billType, billNumber, congress)

    // Filter actions that have roll call votes
    const voteActions = actions.filter(action =>
      action.recordedVotes && action.recordedVotes.length > 0
    )

    // Fetch detailed vote information for each vote
    const votes: CongressVote[] = []
    for (const action of voteActions) {
      for (const recordedVote of action.recordedVotes) {
        const voteData = await fetchVoteDetails(
          recordedVote.chamber.toLowerCase(),
          recordedVote.rollNumber,
          congress,
          recordedVote.sessionNumber
        )
        if (voteData) votes.push(voteData)
      }
    }

    return votes
  } catch (error) {
    console.error('Error fetching bill votes:', error)
    return []
  }
}

/**
 * Fetch detailed vote information
 */
async function fetchVoteDetails(
  chamber: string,
  rollNumber: number,
  congress: number,
  session: number
): Promise<CongressVote | null> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_CONGRESS_API_KEY
    if (!apiKey) return null

    const url = `${CONGRESS_API_BASE}/vote/${congress}/${chamber}/${rollNumber}?api_key=${apiKey}&format=json`

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      },
      next: { revalidate: 3600 }
    })

    if (!response.ok) return null

    const data = await response.json()
    return data.vote || null
  } catch (error) {
    console.error('Error fetching vote details:', error)
    return null
  }
}

/**
 * Search bills by keyword
 */
export async function searchBills(
  query: string,
  limit: number = 20
): Promise<CongressBill[]> {
  try {
    const response = await fetch(
      `${CONGRESS_API_BASE}/bill/${CURRENT_CONGRESS}?format=json&limit=${limit}`,
      {
        headers: {
          'Accept': 'application/json'
        },
        next: { revalidate: 3600 }
      }
    )

    if (!response.ok) return []

    const data = await response.json()
    const bills = data.bills || []

    // Filter bills by query (simple text matching)
    // In production, use the API's built-in search endpoint
    return bills.filter((bill: CongressBill) =>
      bill.title?.toLowerCase().includes(query.toLowerCase())
    )
  } catch (error) {
    console.error('Error searching bills:', error)
    return []
  }
}

/**
 * Calculate trend score based on bill activity
 */
export function calculateTrendScore(bill: CongressBill): number {
  let score = 50 // Base score

  // Recent activity increases score
  const daysSinceUpdate = Math.floor(
    (Date.now() - new Date(bill.updateDate).getTime()) / (1000 * 60 * 60 * 24)
  )
  if (daysSinceUpdate < 7) score += 30
  else if (daysSinceUpdate < 30) score += 15

  // Number of cosponsors
  const cosponsorCount = bill.cosponsors?.length || 0
  score += Math.min(cosponsorCount, 20) // Max 20 points

  // Cap at 100
  return Math.min(score, 100)
}

/**
 * Determine controversy level based on party split
 */
export function determineControversy(
  democratSupport: number,
  republicanSupport: number
): 'low' | 'medium' | 'high' {
  const diff = Math.abs(democratSupport - republicanSupport)

  if (diff > 60) return 'high'
  if (diff > 30) return 'medium'
  return 'low'
}

/**
 * Estimate partisan support based on bill metadata (when votes unavailable)
 * Uses sponsor party, subject matter, and cosponsor breakdown
 */
export function estimatePolarizationFromMetadata(bill: CongressBill): {
  democratSupport: number
  republicanSupport: number
  confidence: 'low' | 'medium' | 'high'
} {
  const sponsorParty = bill.sponsors?.[0]?.party || 'Unknown'

  // Get cosponsor party breakdown
  const cosponsors = bill.cosponsors || []
  const demCosponsors = cosponsors.filter(c => c.party === 'D' || c.party === 'Democratic').length
  const repCosponsors = cosponsors.filter(c => c.party === 'R' || c.party === 'Republican').length
  const totalCosponsors = demCosponsors + repCosponsors

  // If we have good cosponsor data, use it
  if (totalCosponsors >= 10) {
    return {
      democratSupport: Math.round((demCosponsors / totalCosponsors) * 100),
      republicanSupport: Math.round((repCosponsors / totalCosponsors) * 100),
      confidence: 'high'
    }
  }

  // Check bill subjects for politically polarizing topics
  const subjects = bill.subjects?.legislativeSubjects?.map(s => s.name.toLowerCase()) || []
  const policyArea = bill.subjects?.policyArea?.name.toLowerCase() || ''
  const allSubjects = [...subjects, policyArea].join(' ')

  // Conservative-leaning topics
  const conservativeKeywords = ['border', 'immigration', 'defense', 'military', 'gun', 'second amendment', 'tax cut', 'regulation']
  const isConservative = conservativeKeywords.some(kw => allSubjects.includes(kw))

  // Liberal-leaning topics
  const liberalKeywords = ['climate', 'healthcare', 'abortion', 'reproductive', 'voting rights', 'minimum wage', 'social security', 'medicare']
  const isLiberal = liberalKeywords.some(kw => allSubjects.includes(kw))

  // Bipartisan topics
  const bipartisanKeywords = ['infrastructure', 'veterans', 'agriculture', 'postal']
  const isBipartisan = bipartisanKeywords.some(kw => allSubjects.includes(kw))

  if (isBipartisan) {
    return {
      democratSupport: 60,
      republicanSupport: 55,
      confidence: 'medium'
    }
  }

  if (isConservative) {
    return sponsorParty === 'R' || sponsorParty === 'Republican' ? {
      democratSupport: 20,
      republicanSupport: 85,
      confidence: 'medium'
    } : {
      democratSupport: 35,
      republicanSupport: 70,
      confidence: 'low'
    }
  }

  if (isLiberal) {
    return sponsorParty === 'D' || sponsorParty === 'Democratic' ? {
      democratSupport: 85,
      republicanSupport: 20,
      confidence: 'medium'
    } : {
      democratSupport: 70,
      republicanSupport: 35,
      confidence: 'low'
    }
  }

  // Default: slight lean toward sponsor's party
  if (sponsorParty === 'D' || sponsorParty === 'Democratic') {
    return {
      democratSupport: 65,
      republicanSupport: 45,
      confidence: 'low'
    }
  } else if (sponsorParty === 'R' || sponsorParty === 'Republican') {
    return {
      democratSupport: 45,
      republicanSupport: 65,
      confidence: 'low'
    }
  }

  // Truly unknown
  return {
    democratSupport: 50,
    republicanSupport: 50,
    confidence: 'low'
  }
}
