import { NextResponse } from 'next/server'
import { getCampaignFinanceDashboardData } from '@/lib/services/campaignFinanceService'

export const revalidate = 21600 // Revalidate every 6 hours

export async function GET() {
  try {
    console.log('📊 API: Fetching campaign finance dashboard data...')

    const data = await getCampaignFinanceDashboardData()

    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ API Error fetching campaign finance data:', error)

    return NextResponse.json(
      {
        error: 'Failed to fetch campaign finance data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
