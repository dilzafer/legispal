import { NextRequest, NextResponse } from 'next/server'
import { analyzeLobbyistEthics, LobbyistProfile } from '@/lib/api/workers'

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Ethics analysis API called')
    
    const body = await request.json()
    const { lobbyistProfile } = body

    if (!lobbyistProfile) {
      console.error('❌ No lobbyist profile provided')
      return NextResponse.json(
        { error: 'Lobbyist profile is required' },
        { status: 400 }
      )
    }

    console.log('📋 Analyzing profile for:', lobbyistProfile.name)

    // Validate required fields
    const requiredFields = ['name', 'firm', 'client', 'amount', 'issue', 'description']
    for (const field of requiredFields) {
      if (!lobbyistProfile[field]) {
        console.error(`❌ Missing required field: ${field}`)
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    console.log('✅ Profile validation passed')

    // Analyze lobbyist ethics using Cloudflare Workers AI
    const analysis = await analyzeLobbyistEthics(lobbyistProfile as LobbyistProfile)

    if (!analysis) {
      console.error('❌ Analysis failed - no result returned')
      return NextResponse.json(
        { error: 'Failed to analyze lobbyist ethics' },
        { status: 500 }
      )
    }

    console.log('✅ Analysis completed successfully')
    return NextResponse.json({ analysis })
  } catch (error) {
    console.error('❌ Error in ethics analysis API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}