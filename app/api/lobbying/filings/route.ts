/**
 * API Route: Fetch lobbying filings
 * GET /api/lobbying/filings
 */

import { NextRequest, NextResponse } from 'next/server'
import { fetchLDAFilings } from '@/lib/api/lda'
import { transformFilingsToActivities } from '@/lib/adapters/lobbyingAdapter'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    // Extract query parameters
    const filing_year = searchParams.get('filing_year')
    const filing_period = searchParams.get('filing_period')
    const filing_type = searchParams.get('filing_type')
    const registrant_name = searchParams.get('registrant_name')
    const client_name = searchParams.get('client_name')
    const page = searchParams.get('page')
    const page_size = searchParams.get('page_size') || '100' // Default to 100 per page

    console.log('📡 API: Fetching lobbying filings with params:', {
      filing_year,
      filing_period,
      page,
      page_size
    })

    // Fetch filings from LDA API
    const response = await fetchLDAFilings({
      filing_year: filing_year ? parseInt(filing_year) : undefined,
      filing_period: filing_period || undefined,
      filing_type: filing_type || undefined,
      registrant_name: registrant_name || undefined,
      client_name: client_name || undefined,
      page: page ? parseInt(page) : undefined,
      page_size: parseInt(page_size)
    })

    // Transform filings to UI format
    const activities = transformFilingsToActivities(response.results)

    console.log(`✅ API: Transformed ${response.results.length} filings into ${activities.length} activities`)

    return NextResponse.json({
      activities,
      pagination: {
        count: response.count,
        next: response.next,
        previous: response.previous,
        current_page: page ? parseInt(page) : 1
      }
    })
  } catch (error) {
    console.error('❌ API Error fetching lobbying filings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch lobbying filings', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
