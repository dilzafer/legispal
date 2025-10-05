/**
 * API Route: Lobbying statistics
 * GET /api/lobbying/stats
 */

import { NextRequest, NextResponse } from 'next/server'
import { fetchLDAFilings } from '@/lib/api/lda'
import { transformFilingsToActivities, calculateActivityStats } from '@/lib/adapters/lobbyingAdapter'

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta'

function getGeminiApiKey(): string {
  return process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY || ''
}

function formatPeriod(period: string): string {
  switch (period) {
    case 'first_quarter':
      return 'First quarter'
    case 'second_quarter':
      return 'Second quarter'
    case 'third_quarter':
      return 'Third quarter'
    case 'fourth_quarter':
      return 'Fourth quarter'
    case 'mid_year':
      return 'Mid year'
    case 'year_end':
      return 'Year end'
    default:
      return period
  }
}

async function estimateAggregateStats(
  sampleStats: any,
  totalFilings: number,
  sampleSize: number,
  year: number,
  period: string
): Promise<any> {
  try {
    const apiKey = getGeminiApiKey()
    if (!apiKey) {
      // Fallback: simple extrapolation
      const multiplier = totalFilings / sampleSize
      return {
        totalSpending: Math.round(sampleStats.totalSpending * multiplier),
        activeActivities: Math.round(sampleStats.activeActivities * multiplier),
        uniqueBills: Math.round(sampleStats.uniqueBills * 2.5), // Estimate based on typical overlap
        averagePerActivity: sampleStats.averagePerActivity
      }
    }

    const model = 'gemini-2.0-flash-exp'

    const prompt = `You are a statistical analyst. Based on this sample data from ${sampleSize} lobbying filings out of ${totalFilings} total filings for ${period} ${year}, estimate realistic aggregate statistics.

Sample Data (from ${sampleSize} filings):
- Total Spending: $${sampleStats.totalSpending.toLocaleString()}
- Active Activities: ${sampleStats.activeActivities}
- Unique Bills Referenced: ${sampleStats.uniqueBills}
- Average Per Activity: $${sampleStats.averagePerActivity.toFixed(2)}

Total Filings Available: ${totalFilings}

Consider:
1. Not all filings report income (many are $0 or null)
2. Typical Q4 lobbying spending in the US is $800M - $1.2B
3. Average lobbying disclosure is around $30,000-$50,000
4. Bills are often referenced across multiple filings (overlap factor ~2-3x)

Return ONLY a JSON object with realistic estimates:
{
  "totalSpending": <estimated total spending for all ${totalFilings} filings>,
  "activeActivities": <estimated total activities>,
  "uniqueBills": <estimated unique bills (accounting for overlap)>,
  "averagePerActivity": <realistic average per activity>
}

Be conservative and realistic. Return ONLY the JSON, no other text.`

    const requestBody = {
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 200,
      }
    }

    const response = await fetch(
      `${GEMINI_API_BASE}/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        next: { revalidate: 3600 } // Cache for 1 hour
      }
    )

    if (!response.ok) {
      throw new Error('Gemini API failed')
    }

    const data = await response.json()
    let responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

    // Clean JSON formatting
    responseText = responseText.trim()
    if (responseText.startsWith('```json')) {
      responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '')
    } else if (responseText.startsWith('```')) {
      responseText = responseText.replace(/```\n?/g, '')
    }

    const estimated = JSON.parse(responseText)
    console.log('🤖 Gemini estimated stats:', estimated)
    return estimated

  } catch (error) {
    console.error('Error estimating stats with Gemini:', error)
    // Fallback: simple extrapolation
    const multiplier = totalFilings / sampleSize
    return {
      totalSpending: Math.round(sampleStats.totalSpending * multiplier),
      activeActivities: Math.round(sampleStats.activeActivities * multiplier),
      uniqueBills: Math.round(sampleStats.uniqueBills * 2.5),
      averagePerActivity: sampleStats.averagePerActivity
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const filing_year = searchParams.get('filing_year')
    const filing_period = searchParams.get('filing_period')

    console.log('📊 API: Calculating lobbying stats for:', { filing_year, filing_period })

    // Fetch sample filings (200 for better statistical accuracy)
    const response = await fetchLDAFilings({
      filing_year: filing_year ? parseInt(filing_year) : new Date().getFullYear(),
      filing_period: filing_period || undefined,
      page_size: 200
    })

    // Transform to activities
    const activities = transformFilingsToActivities(response.results)

    // Calculate statistics from sample
    const sampleStats = calculateActivityStats(activities)

    console.log('📊 Sample stats:', sampleStats, 'from', response.results.length, 'filings out of', response.count)

    // Use Gemini to estimate aggregate statistics
    const estimatedStats = await estimateAggregateStats(
      sampleStats,
      response.count,
      response.results.length,
      filing_year ? parseInt(filing_year) : new Date().getFullYear(),
      filing_period || 'year'
    )

    return NextResponse.json({
      totalSpending: estimatedStats.totalSpending,
      activeActivities: estimatedStats.activeActivities,
      uniqueBills: estimatedStats.uniqueBills,
      averagePerActivity: estimatedStats.averagePerActivity,
      period: filing_period ? formatPeriod(filing_period) : `Year ${filing_year || new Date().getFullYear()}`,
      totalFilings: response.count,
      sampleSize: response.results.length,
      estimatedByAI: true
    })
  } catch (error) {
    console.error('❌ API Error calculating lobbying stats:', error)
    return NextResponse.json(
      { error: 'Failed to calculate lobbying stats', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
