import { NextRequest, NextResponse } from 'next/server'
import {
  fetchMemberDetails,
  calculateYearsInOffice,
  getCurrentChamber,
  normalizePartyName,
  getMemberWebsite
} from '@/lib/api/members'

/**
 * Fetch committee data from unitedstates/congress-legislators GitHub repo
 */
async function fetchCommitteeMemberships(bioguideId: string): Promise<string[]> {
  try {
    console.log(`🔍 Fetching committee memberships for ${bioguideId}...`)

    const response = await fetch(
      'https://raw.githubusercontent.com/unitedstates/congress-legislators/main/committee-membership-current.yaml',
      { next: { revalidate: 86400 } } // Cache for 24 hours
    )

    if (!response.ok) {
      console.warn(`⚠️ Failed to fetch committee YAML: ${response.status}`)
      return []
    }

    const yamlText = await response.text()
    console.log(`✅ Fetched committee YAML (${yamlText.length} chars)`)

    // Parse YAML structure: committees are top-level keys, members are nested
    // Format: COMMITTEE_CODE:\n  - name: ...\n    bioguide: ID
    const committees: string[] = []
    const lines = yamlText.split('\n')

    let currentCommitteeCode: string | null = null
    let foundCount = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Check if this line is a committee code (starts at column 0, ends with :)
      const committeeMatch = line.match(/^([A-Z]{2,6}):$/)
      if (committeeMatch) {
        currentCommitteeCode = committeeMatch[1]
        continue
      }

      // Check if this line contains our bioguide ID
      if (currentCommitteeCode && line.includes(`bioguide: ${bioguideId}`)) {
        foundCount++
        console.log(`✓ Found ${bioguideId} in committee ${currentCommitteeCode}`)

        // Map committee code to full name
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

        if (committeeMap[currentCommitteeCode]) {
          committees.push(committeeMap[currentCommitteeCode])
        } else {
          console.warn(`⚠️ Unknown committee code: ${currentCommitteeCode}`)
        }
      }
    }

    console.log(`✅ Found ${foundCount} committees for ${bioguideId}: ${committees.join(', ') || 'None'}`)
    return committees
  } catch (error) {
    console.error(`❌ Error fetching committee memberships for ${bioguideId}:`, error)
    return []
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
      return bio.replace(/^["']|["']$/g, '').substring(0, 200)
    }

    return `${name} represents ${state} in the ${chamber}.`
  } catch (error) {
    console.error('Error generating bio:', error)
    return `${name} represents ${state} in the ${chamber}.`
  }
}

/**
 * GET /api/representatives/[bioguideId]
 * Fetch detailed information for a specific representative
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bioguideId: string }> }
) {
  try {
    const { bioguideId } = await params

    console.log(`📡 Fetching detailed info for ${bioguideId}...`)

    // Fetch full member details
    const memberDetails = await fetchMemberDetails(bioguideId)

    if (!memberDetails) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      )
    }

    const chamber = getCurrentChamber(memberDetails)
    if (!chamber) {
      return NextResponse.json(
        { error: 'Could not determine chamber' },
        { status: 500 }
      )
    }

    const yearsInOffice = calculateYearsInOffice(memberDetails)
    const party = normalizePartyName(memberDetails.partyName)

    // Generate bio with Gemini
    const bio = await generateMemberBio(
      memberDetails.name,
      party,
      memberDetails.state,
      chamber,
      yearsInOffice
    )

    return NextResponse.json({
      bio,
      yearsInOffice,
      contactInfo: {
        phone: memberDetails.addressInformation?.phoneNumber || '',
        office: memberDetails.addressInformation?.officeAddress || '',
        website: getMemberWebsite(bioguideId, chamber)
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ Error fetching member details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch member details' },
      { status: 500 }
    )
  }
}
