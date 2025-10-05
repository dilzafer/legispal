import { NextRequest, NextResponse } from 'next/server'
import { getPolarizingBills } from '@/lib/services/billService'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '5')

    console.log(`🔍 API: Fetching ${limit} polarizing bills...`)

    const bills = await getPolarizingBills(limit)

    console.log(`✅ API: Returning ${bills.length} polarizing bills`)

    return NextResponse.json({
      success: true,
      count: bills.length,
      bills
    })
  } catch (error) {
    console.error('❌ API: Error fetching polarizing bills:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch polarizing bills',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
