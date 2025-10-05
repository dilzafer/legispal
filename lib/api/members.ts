/**
 * Congress.gov Members API Integration
 * Fetch current and historical members of Congress with their biographical data
 * Documentation: https://github.com/LibraryOfCongress/api.congress.gov/blob/main/Documentation/MemberEndpoint.md
 */

export interface CongressMember {
  bioguideId: string
  name: string
  partyName?: string
  state: string
  district?: number
  chamber?: string
  depiction?: {
    imageUrl?: string
  }
  terms?: {
    item: Array<{
      startYear: number
      endYear: number
      chamber: string
    }>
  }
  updateDate?: string
}

export interface MemberDetails extends CongressMember {
  honorificName?: string
  directOrderName?: string
  firstName?: string
  lastName?: string
  middleName?: string
  birthYear?: number
  deathYear?: number
  party?: string
  leadership?: Array<{
    type: string
    congress: number
  }>
  sponsoredLegislation?: {
    count: number
    url: string
  }
  cosponsoredLegislation?: {
    count: number
    url: string
  }
  addressInformation?: {
    officeAddress?: string
    city?: string
    district?: string
    phoneNumber?: string
    officeCode?: string
  }
}

export interface SponsoredBill {
  congress: number
  type: string
  number: string
  title: string
  url: string
  introducedDate?: string
  latestAction?: {
    actionDate: string
    text: string
  }
  policyArea?: {
    name: string
  }
}

const CONGRESS_API_BASE = 'https://api.congress.gov/v3'
const CURRENT_CONGRESS = 118 // 118th Congress (2023-2025)

/**
 * Get Congress API key from environment
 */
function getCongressApiKey(): string {
  return process.env.NEXT_PUBLIC_CONGRESS_API_KEY || ''
}

/**
 * Fetch all current members of Congress
 * @param limit Number of members to fetch (max 250)
 * @param offset Pagination offset
 */
export async function fetchCurrentMembers(
  limit: number = 250,
  offset: number = 0
): Promise<CongressMember[]> {
  try {
    const apiKey = getCongressApiKey()
    if (!apiKey || apiKey.includes('your_') || apiKey.includes('_here')) {
      console.warn('⚠️  Congress API key not configured')
      return []
    }

    const url = `${CONGRESS_API_BASE}/member?currentMember=true&limit=${limit}&offset=${offset}&api_key=${apiKey}&format=json`

    console.log('🔍 Fetching current members from Congress API...')
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      },
      next: { revalidate: 3600 } // Cache for 1 hour
    })

    if (!response.ok) {
      console.error('❌ Congress API members error:', response.status, response.statusText)
      return []
    }

    const data = await response.json()
    const members = data.members || []
    console.log(`✅ Fetched ${members.length} current members`)
    return members
  } catch (error) {
    console.error('❌ Error fetching current members:', error)
    return []
  }
}

/**
 * Fetch detailed information about a specific member
 * @param bioguideId The member's BioGuide ID (e.g., "D000096")
 */
export async function fetchMemberDetails(bioguideId: string): Promise<MemberDetails | null> {
  try {
    const apiKey = getCongressApiKey()
    if (!apiKey || apiKey.includes('your_') || apiKey.includes('_here')) {
      console.warn('⚠️  Congress API key not configured')
      return null
    }

    const url = `${CONGRESS_API_BASE}/member/${bioguideId}?api_key=${apiKey}&format=json`

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      },
      next: { revalidate: 3600 }
    })

    if (!response.ok) {
      console.error(`❌ Error fetching member ${bioguideId}:`, response.status)
      return null
    }

    const data = await response.json()
    return data.member || null
  } catch (error) {
    console.error(`❌ Error fetching member details for ${bioguideId}:`, error)
    return null
  }
}

/**
 * Fetch sponsored legislation by a member
 * @param bioguideId The member's BioGuide ID
 * @param limit Number of bills to fetch
 * @param offset Pagination offset
 */
export async function fetchMemberSponsoredBills(
  bioguideId: string,
  limit: number = 20,
  offset: number = 0
): Promise<SponsoredBill[]> {
  try {
    const apiKey = getCongressApiKey()
    if (!apiKey || apiKey.includes('your_') || apiKey.includes('_here')) {
      console.warn('⚠️  Congress API key not configured')
      return []
    }

    const url = `${CONGRESS_API_BASE}/member/${bioguideId}/sponsored-legislation?limit=${limit}&offset=${offset}&api_key=${apiKey}&format=json`

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      },
      next: { revalidate: 3600 }
    })

    if (!response.ok) {
      console.error(`❌ Error fetching sponsored bills for ${bioguideId}:`, response.status)
      return []
    }

    const data = await response.json()
    return data.sponsoredLegislation || []
  } catch (error) {
    console.error(`❌ Error fetching sponsored bills for ${bioguideId}:`, error)
    return []
  }
}

/**
 * Fetch cosponsored legislation by a member
 * @param bioguideId The member's BioGuide ID
 * @param limit Number of bills to fetch
 */
export async function fetchMemberCosponsoredBills(
  bioguideId: string,
  limit: number = 20
): Promise<SponsoredBill[]> {
  try {
    const apiKey = getCongressApiKey()
    if (!apiKey || apiKey.includes('your_') || apiKey.includes('_here')) {
      return []
    }

    const url = `${CONGRESS_API_BASE}/member/${bioguideId}/cosponsored-legislation?limit=${limit}&api_key=${apiKey}&format=json`

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      },
      next: { revalidate: 3600 }
    })

    if (!response.ok) {
      return []
    }

    const data = await response.json()
    return data.cosponsoredLegislation || []
  } catch (error) {
    console.error(`❌ Error fetching cosponsored bills for ${bioguideId}:`, error)
    return []
  }
}

/**
 * Calculate years in office from member terms
 */
export function calculateYearsInOffice(member: CongressMember | MemberDetails): number {
  if (!member.terms || !member.terms.item || member.terms.item.length === 0) {
    return 0
  }

  const currentYear = new Date().getFullYear()
  const earliestTerm = member.terms.item.reduce((earliest, term) => {
    return term.startYear < earliest.startYear ? term : earliest
  })

  return currentYear - earliestTerm.startYear
}

/**
 * Determine current chamber from member terms
 */
export function getCurrentChamber(member: CongressMember | MemberDetails): 'House' | 'Senate' | null {
  if (!member.terms || !member.terms.item || member.terms.item.length === 0) {
    return null
  }

  // Get most recent term
  const latestTerm = member.terms.item.reduce((latest, term) => {
    return term.endYear > latest.endYear ? term : latest
  })

  if (latestTerm.chamber === 'House of Representatives') return 'House'
  if (latestTerm.chamber === 'Senate') return 'Senate'
  return null
}

/**
 * Generate official website URL for a member
 */
export function getMemberWebsite(bioguideId: string, chamber: 'House' | 'Senate' | null): string {
  if (!chamber) return `https://bioguide.congress.gov/search/bio/${bioguideId}`

  if (chamber === 'House') {
    return `https://www.house.gov/representatives`
  } else {
    return `https://www.senate.gov/senators`
  }
}

/**
 * Normalize party name to standard format
 */
export function normalizePartyName(party?: string): 'Democrat' | 'Republican' | 'Independent' {
  if (!party) return 'Independent'

  const normalized = party.toLowerCase()
  if (normalized.includes('democrat') || normalized === 'd') return 'Democrat'
  if (normalized.includes('republican') || normalized === 'r') return 'Republican'
  return 'Independent'
}
