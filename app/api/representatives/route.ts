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
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.Gemini_API_key
    if (!apiKey) {
      return `${name} represents ${state} in the ${chamber}.`
    }

    const model = 'gemini-2.0-flash-exp'
    const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta'

    const prompt = `Write a single concise sentence (under 150 characters) describing ${name}, a ${party} ${chamber === 'House' ? 'Representative' : 'Senator'} from ${state} who has served for ${yearsInOffice} years. Focus on their role and experience. Do not include quotes or extra formatting.`

    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 60,
      }
    }

    const response = await fetch(
      `${GEMINI_API_BASE}/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      }
    )

    if (!response.ok) {
      return `${name} represents ${state} in the ${chamber}.`
    }

    const data = await response.json()
    const bio = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()

    if (bio && bio.length > 0 && !bio.toLowerCase().includes('write a')) {
      // Clean up the bio - remove quotes if present
      return bio.replace(/^["']|["']$/g, '').substring(0, 200)
    }

    return `${name} represents ${state} in the ${chamber}.`
  } catch (error) {
    console.error('Error generating bio:', error)
    return `${name} represents ${state} in the ${chamber}.`
  }
}

/**
 * Fetch committee data from unitedstates/congress-legislators GitHub repo
 */
async function fetchCommitteeMemberships(bioguideId: string): Promise<string[]> {
  try {
    const response = await fetch(
      'https://raw.githubusercontent.com/unitedstates/congress-legislators/main/committee-membership-current.yaml',
      { next: { revalidate: 86400 } } // Cache for 24 hours
    )

    if (!response.ok) return []

    const yamlText = await response.text()

    // Simple YAML parsing for committee memberships
    // Format is typically: bioguideId: committee abbreviations
    const committees: string[] = []
    const lines = yamlText.split('\n')
    let inMemberSection = false

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Check if this is our member's section
      if (line.includes(bioguideId)) {
        inMemberSection = true
        continue
      }

      // If we're in the member's section, extract committee names
      if (inMemberSection) {
        // Stop if we hit another member
        if (line.match(/^[A-Z]\d{6}:/)) {
          break
        }

        // Extract committee abbreviation (e.g., "- HSAG" -> "Agriculture")
        const match = line.match(/^\s*-\s*([A-Z]+)/)
        if (match) {
          const abbr = match[1]
          // Map common abbreviations to full names
          const committeeMap: Record<string, string> = {
            'HSAG': 'Agriculture',
            'HSAP': 'Appropriations',
            'HSAS': 'Armed Services',
            'HSBA': 'Financial Services',
            'HSBU': 'Budget',
            'HSED': 'Education and Labor',
            'HSEN': 'Energy and Commerce',
            'HSET': 'Ethics',
            'HSFA': 'Foreign Affairs',
            'HSGO': 'Oversight and Reform',
            'HSHA': 'House Administration',
            'HSIF': 'Energy and Commerce',
            'HSII': 'Natural Resources',
            'HSJU': 'Judiciary',
            'HSPW': 'Transportation and Infrastructure',
            'HSRU': 'Rules',
            'HSSM': 'Small Business',
            'HSSO': 'Science, Space, and Technology',
            'HSVR': 'Veterans\' Affairs',
            'HSWM': 'Ways and Means',
            'SSAF': 'Agriculture',
            'SSAP': 'Appropriations',
            'SSAS': 'Armed Services',
            'SSBK': 'Banking',
            'SSBU': 'Budget',
            'SSCM': 'Commerce',
            'SSEG': 'Energy and Natural Resources',
            'SSEV': 'Environment and Public Works',
            'SSFI': 'Finance',
            'SSFR': 'Foreign Relations',
            'SSGA': 'Homeland Security',
            'SSHR': 'Health, Education, Labor, and Pensions',
            'SLIA': 'Indian Affairs',
            'SSJU': 'Judiciary',
            'SSRA': 'Rules',
            'SSSB': 'Small Business',
            'SSVA': 'Veterans\' Affairs'
          }

          if (committeeMap[abbr]) {
            committees.push(committeeMap[abbr])
          }
        }
      }
    }

    return committees
  } catch (error) {
    console.error(`Error fetching committee memberships for ${bioguideId}:`, error)
    return []
  }
}

/**
 * Transform Congress API member into Representative format
 */
async function transformMember(member: CongressMember): Promise<Representative | null> {
  try {
    // Get chamber from the basic member data (no need for extra API call)
    const chamber = getCurrentChamber(member)

    if (!chamber) {
      console.warn(`⚠️ Could not determine chamber for ${member.bioguideId}`)
      return null
    }

    const party = normalizePartyName(member.partyName)
    const website = getMemberWebsite(member.bioguideId, chamber)

    // Calculate years in office from basic member data (if terms available)
    // Otherwise we'll estimate or fetch details only when needed
    let yearsInOffice = calculateYearsInOffice(member)

    // If we couldn't calculate from basic data, use a default or skip fetching details to avoid rate limits
    if (yearsInOffice === 0) {
      // Set to 1 as a placeholder - could fetch details later if needed
      yearsInOffice = 1
    }

    // Don't fetch committee memberships or detailed member info during initial load
    // to avoid overwhelming the APIs - these can be loaded on-demand
    const committeeMemberships: string[] = []

    // Use a simple bio template instead of Gemini to avoid rate limits on initial load
    const bio = `${member.name} represents ${member.state} in the ${chamber === 'House' ? 'House of Representatives' : 'Senate'}.`

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
      committeeMemberships,
      sponsoredBills: [], // Will be populated when expanded
      votingRecord: {
        totalVotes: 0, // Not available from free APIs
        partyUnity: 0, // Not available from free APIs
        bipartisanVotes: 0 // Not available from free APIs
      },
      contactInfo: {
        website,
        email: '', // Not publicly available in API
        phone: '', // Would need detailed member fetch
        office: '' // Would need detailed member fetch
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
