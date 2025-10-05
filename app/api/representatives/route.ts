import { NextRequest, NextResponse } from 'next/server'
import {
  fetchCurrentMembers,
  fetchMemberDetails,
  calculateYearsInOffice,
  getCurrentChamber,
  normalizePartyName,
  getMemberWebsite,
  type CongressMember
} from '@/lib/api/members'
import { generateBillSummary } from '@/lib/api/gemini'

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

/**
 * Generate a concise bio for a member using Gemini AI
 */
async function generateMemberBio(
  name: string,
  party: string,
  state: string,
  chamber: string,
  yearsInOffice: number
): Promise<string> {
  try {
    const prompt = `Write a concise 1-sentence bio for ${name}, a ${party} ${chamber === 'House' ? 'Representative' : 'Senator'} from ${state} who has served for ${yearsInOffice} years.`

    // Use Gemini to generate a bio (max 150 characters)
    const bio = await generateBillSummary(
      `${name} - ${party} ${chamber} member`,
      prompt,
      150
    )

    return bio || `${name} represents ${state} in the ${chamber}.`
  } catch (error) {
    console.error('Error generating bio:', error)
    return `${name} represents ${state} in the ${chamber}.`
  }
}

/**
 * Transform Congress API member into Representative format
 */
async function transformMember(member: CongressMember): Promise<Representative | null> {
  try {
    const yearsInOffice = calculateYearsInOffice(member)
    const chamber = getCurrentChamber(member)

    if (!chamber) {
      console.warn(`⚠️ Could not determine chamber for ${member.bioguideId}`)
      return null
    }

    const party = normalizePartyName(member.partyName)
    const website = getMemberWebsite(member.bioguideId, chamber)

    // Generate bio using Gemini (or use default)
    const bio = await generateMemberBio(
      member.name,
      party,
      member.state,
      chamber,
      yearsInOffice
    )

    // Extract district for House members
    const district = member.district ? `${member.district}` : undefined

    return {
      id: `${chamber.toLowerCase()}-${member.bioguideId.toLowerCase()}`,
      bioguideId: member.bioguideId,
      name: member.name,
      title: chamber === 'House' ? 'Representative' : 'Senator',
      party,
      state: member.state,
      district,
      chamber,
      imageUrl: member.depiction?.imageUrl,
      bio,
      yearsInOffice,
      committeeMemberships: [], // Will be populated separately if needed
      sponsoredBills: [], // Will be populated when expanded
      votingRecord: {
        totalVotes: 0, // Would need vote data from API
        partyUnity: 0,
        bipartisanVotes: 0
      },
      contactInfo: {
        website,
        email: '', // Not available in public API
        phone: '', // Not available in basic member endpoint
        office: '' // Not available in basic member endpoint
      }
    }
  } catch (error) {
    console.error(`Error transforming member ${member.bioguideId}:`, error)
    return null
  }
}

/**
 * GET /api/representatives
 * Fetch all current representatives with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const state = searchParams.get('state')
    const party = searchParams.get('party')
    const chamber = searchParams.get('chamber')

    console.log('📡 Fetching representatives...', { state, party, chamber })

    // Fetch all current members from Congress API
    const members = await fetchCurrentMembers(250)

    if (members.length === 0) {
      return NextResponse.json({
        error: 'No members found or API error',
        representatives: []
      }, { status: 200 })
    }

    // Transform members to Representative format
    console.log(`🔄 Transforming ${members.length} members...`)
    const transformPromises = members.map(member => transformMember(member))
    const transformed = await Promise.all(transformPromises)

    // Filter out nulls and apply filters
    let representatives = transformed.filter((rep): rep is Representative => rep !== null)

    // Apply server-side filters
    if (state) {
      representatives = representatives.filter(rep => rep.state === state)
    }
    if (party && party !== 'all') {
      representatives = representatives.filter(rep => rep.party === party)
    }
    if (chamber && chamber !== 'all') {
      representatives = representatives.filter(rep => rep.chamber === chamber)
    }

    console.log(`✅ Returning ${representatives.length} representatives`)

    return NextResponse.json({
      representatives,
      total: representatives.length,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ Error in representatives API:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch representatives',
        representatives: []
      },
      { status: 500 }
    )
  }
}
