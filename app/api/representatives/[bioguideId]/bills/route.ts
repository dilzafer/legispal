import { NextRequest, NextResponse } from 'next/server'
import { fetchMemberSponsoredBills, type SponsoredBill } from '@/lib/api/members'
import { analyzeBillPolarization } from '@/lib/api/gemini'
import { fetchBillDetails } from '@/lib/api/congress'

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

/**
 * Determine bill status from latest action
 */
function determineBillStatus(latestAction?: { actionDate: string; text: string }): 'Introduced' | 'Committee' | 'House' | 'Senate' | 'Enacted' {
  if (!latestAction) return 'Introduced'

  const actionText = latestAction.text.toLowerCase()

  if (actionText.includes('became public law') || actionText.includes('enacted')) {
    return 'Enacted'
  }
  if (actionText.includes('senate')) {
    return 'Senate'
  }
  if (actionText.includes('house') && !actionText.includes('committee')) {
    return 'House'
  }
  if (actionText.includes('committee') || actionText.includes('referred to')) {
    return 'Committee'
  }

  return 'Introduced'
}

/**
 * Calculate a trend score based on bill activity
 */
function calculateTrendScore(bill: SponsoredBill): number {
  let score = 50 // Base score

  // Recent activity increases score
  if (bill.introducedDate) {
    const daysSinceIntroduction = Math.floor(
      (Date.now() - new Date(bill.introducedDate).getTime()) / (1000 * 60 * 60 * 24)
    )
    if (daysSinceIntroduction < 30) score += 25
    else if (daysSinceIntroduction < 90) score += 15
  }

  // Has action recently
  if (bill.latestAction) {
    const daysSinceAction = Math.floor(
      (Date.now() - new Date(bill.latestAction.actionDate).getTime()) / (1000 * 60 * 60 * 24)
    )
    if (daysSinceAction < 7) score += 20
    else if (daysSinceAction < 30) score += 10
  }

  return Math.min(100, Math.max(0, score))
}

/**
 * Transform Congress API bill into RepresentativeBill format
 */
async function transformBill(bill: SponsoredBill): Promise<RepresentativeBill> {
  try {
    // Include congress number in bill ID to ensure correct bill is loaded
    // Format: "118-HR-5615" (congress-type-number)
    const billId = `${bill.congress}-${bill.type.toUpperCase()}-${bill.number}`
    const title = bill.title || 'Untitled Bill'
    const status = determineBillStatus(bill.latestAction)
    const date = bill.introducedDate || bill.latestAction?.actionDate || new Date().toISOString()
    const categories = bill.policyArea?.name ? [bill.policyArea.name] : ['General']

    // Fetch full bill details for summary
    const billDetails = await fetchBillDetails(
      bill.type.toLowerCase(),
      bill.number.toString(),
      bill.congress
    )

    // Get summary from bill details or use title
    const summary = billDetails?.summaries?.[0]?.text?.substring(0, 200) || title.substring(0, 200)

    // Calculate trend score
    const trendScore = calculateTrendScore(bill)

    // Analyze polarization with Gemini AI
    let controversy: 'Low' | 'Medium' | 'High' = 'Low'
    let democratSupport = 50
    let republicanSupport = 50

    try {
      const polarization = await analyzeBillPolarization(
        title,
        billId,
        summary,
        undefined, // sponsor not available in this context
        categories
      )

      if (polarization) {
        // Map controversy level
        if (polarization.controversyLevel === 'extreme' || polarization.controversyLevel === 'high') {
          controversy = 'High'
        } else if (polarization.controversyLevel === 'medium') {
          controversy = 'Medium'
        } else {
          controversy = 'Low'
        }

        democratSupport = polarization.democratSupport
        republicanSupport = polarization.republicanSupport
      }
    } catch (error) {
      console.warn(`⚠️ Could not analyze polarization for ${billId}:`, error)
    }

    // Estimate supporter/opposer counts based on polarization
    // These are simulated values for demonstration
    const baseCount = Math.floor(Math.random() * 5000) + 1000
    const supportersCount = Math.floor(baseCount * (democratSupport + republicanSupport) / 100)
    const opposersCount = Math.floor(baseCount * (200 - democratSupport - republicanSupport) / 100)

    return {
      id: billId,
      title,
      status,
      date,
      summary,
      controversy,
      trendScore,
      supportersCount,
      opposersCount,
      categories
    }
  } catch (error) {
    console.error(`Error transforming bill ${bill.type}-${bill.number}:`, error)

    // Return minimal data on error
    return {
      id: `${bill.type.toUpperCase()}-${bill.number}`,
      title: bill.title || 'Untitled Bill',
      status: 'Introduced',
      date: bill.introducedDate || new Date().toISOString(),
      summary: bill.title || 'No summary available',
      controversy: 'Low',
      trendScore: 50,
      supportersCount: 0,
      opposersCount: 0,
      categories: ['General']
    }
  }
}

/**
 * GET /api/representatives/[bioguideId]/bills
 * Fetch sponsored bills for a specific representative
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bioguideId: string }> }
) {
  const { bioguideId } = await params

  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10', 10)

    console.log(`📡 Fetching sponsored bills for ${bioguideId}...`)

    // Fetch sponsored bills from Congress API
    const sponsoredBills = await fetchMemberSponsoredBills(bioguideId, limit)

    if (sponsoredBills.length === 0) {
      return NextResponse.json({
        bills: [],
        total: 0,
        bioguideId
      })
    }

    console.log(`🔄 Transforming ${sponsoredBills.length} bills...`)

    // Transform bills with polarization analysis
    // Process in batches to avoid overwhelming Gemini API
    const batchSize = 5
    const transformedBills: RepresentativeBill[] = []

    for (let i = 0; i < sponsoredBills.length; i += batchSize) {
      const batch = sponsoredBills.slice(i, i + batchSize)
      const batchResults = await Promise.all(
        batch.map(bill => transformBill(bill))
      )
      transformedBills.push(...batchResults)

      // Small delay between batches to avoid rate limiting
      if (i + batchSize < sponsoredBills.length) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }

    console.log(`✅ Returning ${transformedBills.length} bills for ${bioguideId}`)

    return NextResponse.json({
      bills: transformedBills,
      total: transformedBills.length,
      bioguideId,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ Error fetching representative bills:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch bills',
        bills: [],
        bioguideId
      },
      { status: 500 }
    )
  }
}
