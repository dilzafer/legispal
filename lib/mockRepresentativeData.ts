/**
 * Representative Data Types
 * These interfaces are now used with live data from Congress.gov API
 * Mock data has been removed - see /app/api/representatives for implementation
 */

export interface Representative {
  id: string
  bioguideId: string
  name: string
  title: string
  party: 'Democrat' | 'Republican' | 'Independent'
  state: string
  district?: string
  chamber: 'House' | 'Senate'
  imageUrl?: string
  bio: string
  yearsInOffice: number
  committeeMemberships: string[]
  sponsoredBills: string[]
  votingRecord: {
    totalVotes: number
    partyUnity: number
    bipartisanVotes: number
  }
  contactInfo: {
    website: string
    email: string
    phone: string
    office: string
  }
}

export interface RepresentativeBill {
  id: string
  title: string
  status: 'Introduced' | 'Committee' | 'House' | 'Senate' | 'Enacted'
  date: string
  summary: string
  controversy: 'Low' | 'Medium' | 'High'
  trendScore: number
  supportersCount: number
  opposersCount: number
  categories: string[]
}
