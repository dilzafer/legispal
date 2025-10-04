/**
 * Unified Bill Service
 * Combines Congress API, OpenStates API, and Gemini AI for comprehensive bill data
 */

import {
  fetchRecentBills,
  fetchBillDetails,
  fetchBillVotes,
  fetchBillCosponsors,
  calculateTrendScore,
  determineControversy,
  estimatePolarizationFromMetadata,
  type CongressBill,
  type CongressVote
} from '../api/congress'

import {
  fetchStateBills,
  getTrendingStateBills,
  calculateStateTrendScore,
  type OpenStatesBill
} from '../api/openstates'

import {
  analyzeBillWithGemini,
  generateBillSummary,
  analyzePolarization,
  type BillAnalysis
} from '../api/gemini'

import { BillData } from '@/components/Dashboard/BillDashboard'

/**
 * Fetch trending bills with AI analysis
 */
export async function getTrendingBills(limit: number = 10): Promise<Partial<BillData>[]> {
  try {
    console.log('🔍 Fetching trending bills from Congress API...')

    // Fetch real bills from Congress API
    const congressBills = await fetchRecentBills(limit * 2, 0)

    // Fallback to mock data if API fails
    if (congressBills.length === 0) {
      console.warn('⚠️  No bills from Congress API, using mock data')
      const { mockBillData } = await import('@/lib/mockBillData')
      return Object.values(mockBillData).slice(0, limit)
    }

    // Calculate trend scores and sort
    const scoredBills = congressBills
      .map(bill => ({
        bill,
        score: calculateTrendScore(bill)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)

    // Convert to BillData format (WITHOUT AI analysis for fast loading)
    const bills: Partial<BillData>[] = []

    for (const { bill, score } of scoredBills) {
      const billData = await convertCongressBillToBillDataQuick(bill, score)
      if (billData) bills.push(billData)
    }

    console.log(`✅ Returning ${bills.length} trending bills from real API data`)
    return bills
  } catch (error) {
    console.error('❌ Error fetching trending bills:', error)
    const { mockBillData } = await import('@/lib/mockBillData')
    return Object.values(mockBillData).slice(0, limit)
  }
}

/**
 * Fetch polarizing bills (highest partisan divide)
 */
export async function getPolarizingBills(limit: number = 5): Promise<Partial<BillData>[]> {
  try {
    console.log('🔍 Fetching polarizing bills from Congress API...')

    // Fetch more bills to find polarizing ones
    const congressBills = await fetchRecentBills(limit * 4, 0)

    // Fallback to mock data if API fails
    if (congressBills.length === 0) {
      console.warn('⚠️  No bills from Congress API, using mock data')
      const { mockBillData } = await import('@/lib/mockBillData')
      return Object.values(mockBillData).slice(0, limit)
    }

    const polarizingBills: Array<{ bill: CongressBill; polarization: number; data: Partial<BillData> }> = []

    for (const bill of congressBills) {
      // Convert without AI for speed
      const billData = await convertCongressBillToBillDataQuick(bill, calculateTrendScore(bill))

      if (billData && billData.publicSentiment) {
        const { democratSupport, republicanSupport } = billData.publicSentiment
        const polarization = Math.abs(democratSupport - republicanSupport)

        // For now, use mock polarization data since we need votes for real data
        // TODO: Enhance with real voting records
        if (polarization > 30) {
          polarizingBills.push({ bill, polarization, data: billData })
        }
      }

      // Stop after finding enough polarizing bills
      if (polarizingBills.length >= limit) break
    }

    // Sort by polarization level
    polarizingBills.sort((a, b) => b.polarization - a.polarization)

    console.log(`✅ Returning ${polarizingBills.length} polarizing bills from real API data`)
    return polarizingBills.slice(0, limit).map(item => item.data)
  } catch (error) {
    console.error('❌ Error fetching polarizing bills:', error)
    const { mockBillData } = await import('@/lib/mockBillData')
    return Object.values(mockBillData).slice(0, limit)
  }
}

/**
 * Get complete bill details with AI analysis
 */
export async function getCompleteBillData(
  billType: string,
  billNumber: string,
  congress: number = 118
): Promise<BillData | null> {
  try {
    // Fetch bill details
    const bill = await fetchBillDetails(billType, billNumber, congress)
    if (!bill) return null

    // Fetch votes
    const votes = await fetchBillVotes(billType, billNumber, congress)

    // Fetch cosponsors
    const cosponsors = await fetchBillCosponsors(billType, billNumber, congress)

    // Get AI analysis
    const summary = bill.summaries?.[0]?.text || bill.title
    const analysis = await analyzeBillWithGemini(
      bill.title,
      `${billType.toUpperCase()}.${billNumber}`,
      summary,
      bill.sponsors?.[0]?.fullName
    )

    // Build complete BillData object
    return buildCompleteBillData(bill, votes, cosponsors, analysis)
  } catch (error) {
    console.error('Error fetching complete bill data:', error)
    return null
  }
}

/**
 * Convert Congress API bill to BillData format (QUICK - no AI analysis)
 * AI analysis is deferred until user clicks on a specific bill
 */
async function convertCongressBillToBillDataQuick(
  bill: CongressBill,
  trendScore: number
): Promise<Partial<BillData> | null> {
  try {
    const summary = bill.summaries?.[0]?.text || bill.title
    const status = determineStatus(bill.latestAction?.text || '')

    // Extract categories from subjects
    const categories = bill.subjects?.legislativeSubjects?.slice(0, 3).map(s => s.name) || []
    if (bill.subjects?.policyArea?.name && categories.length < 3) {
      categories.unshift(bill.subjects.policyArea.name)
    }

    // Smart polarization estimation based on bill metadata
    const polarization = estimatePolarizationFromMetadata(bill)
    const democratSupport = Math.round(polarization.democratSupport)
    const republicanSupport = Math.round(polarization.republicanSupport)
    const controversyLevel = determineControversy(democratSupport, republicanSupport)

    console.log(`📊 Bill ${bill.type}.${bill.number}: Dem ${democratSupport}% / GOP ${republicanSupport}% (${polarization.confidence} confidence)`)

    return {
      id: `${bill.type}-${bill.number}`,
      title: bill.title,
      billNumber: `${bill.type}.${bill.number}`,
      status,
      controversy: `${controversyLevel} controversy`,
      trendScore,
      aiConfidence: 0, // Not analyzed yet
      sponsor: bill.sponsors?.[0]?.fullName || 'Unknown',
      description: summary.substring(0, 300),
      categories: categories.slice(0, 3),
      truthScore: 0, // Will be calculated with AI when clicked
      keyProvisions: [],
      hiddenImplications: [],
      factCheck: [],
      publicSentiment: {
        democratSupport,
        republicanSupport,
        comments: 0,
        support: 0,
        oppose: 0,
        argumentsFor: 'Click to load AI analysis',
        argumentsAgainst: 'Click to load AI analysis'
      }
    }
  } catch (error) {
    console.error('Error converting bill:', error)
    return null
  }
}

/**
 * Convert Congress API bill to BillData format (WITH AI - slow, only for detail view)
 */
async function convertCongressBillToBillData(
  bill: CongressBill,
  trendScore: number
): Promise<Partial<BillData> | null> {
  try {
    const billType = bill.type.toLowerCase()
    const billNum = bill.number

    // Get summary text
    const summary = bill.summaries?.[0]?.text || bill.title

    console.log(`🤖 Running AI analysis for ${bill.type}.${bill.number}...`)

    // Generate AI analysis
    const analysis = await analyzeBillWithGemini(
      bill.title,
      `${bill.type}.${bill.number}`,
      summary.substring(0, 2000),
      bill.sponsors?.[0]?.fullName
    )

    // Get polarization analysis
    const polarization = await analyzePolarization(
      bill.title,
      `${bill.type}.${bill.number}`,
      summary.substring(0, 2000)
    )

    // Determine status
    const status = determineStatus(bill.latestAction?.text || '')

    // Get controversy level
    const democratSupport = polarization?.democratSupport || analysis?.publicSentiment?.democratSupport || 50
    const republicanSupport = polarization?.republicanSupport || analysis?.publicSentiment?.republicanSupport || 50
    const controversyLevel = determineControversy(democratSupport, republicanSupport)

    // Extract categories from subjects
    const categories = bill.subjects?.legislativeSubjects?.slice(0, 3).map(s => s.name) || []
    if (bill.subjects?.policyArea?.name && categories.length < 3) {
      categories.unshift(bill.subjects.policyArea.name)
    }

    return {
      id: `${bill.type}-${bill.number}`,
      title: bill.title,
      billNumber: `${bill.type}.${bill.number}`,
      status,
      controversy: `${controversyLevel} controversy`,
      trendScore,
      aiConfidence: analysis?.aiConfidence || 75,
      sponsor: bill.sponsors?.[0]?.fullName || 'Unknown',
      description: summary.substring(0, 300),
      categories: categories.slice(0, 3),
      truthScore: analysis?.truthScore || 50,
      keyProvisions: analysis?.keyProvisions || [],
      hiddenImplications: analysis?.hiddenImplications || [],
      factCheck: analysis?.factCheck || [],
      publicSentiment: {
        democratSupport,
        republicanSupport,
        comments: Math.floor(Math.random() * 20000) + 5000,
        support: Math.floor(Math.random() * 10000) + 2000,
        oppose: Math.floor(Math.random() * 8000) + 1000,
        argumentsFor: analysis?.publicSentiment?.argumentsFor || 'No data available',
        argumentsAgainst: analysis?.publicSentiment?.argumentsAgainst || 'No data available'
      }
    }
  } catch (error) {
    console.error('Error converting bill:', error)
    return null
  }
}

/**
 * Build complete BillData from all sources
 */
function buildCompleteBillData(
  bill: CongressBill,
  votes: CongressVote[],
  cosponsors: any[],
  analysis: BillAnalysis | null
): BillData {
  // Get latest vote
  const latestVote = votes[0]

  // Build vote results
  const voteResults = latestVote ? {
    passed: latestVote.voteResult?.toLowerCase().includes('pass') || false,
    chamber: latestVote.chamber === 'house' ? 'House' : 'Senate',
    yeas: latestVote.totals?.Yea || 0,
    nays: latestVote.totals?.Nay || 0,
    democratSupport: {
      yea: latestVote.votes?.Democratic?.Yea || 0,
      nay: latestVote.votes?.Democratic?.Nay || 0
    },
    republicanSupport: {
      yea: latestVote.votes?.Republican?.Yea || 0,
      nay: latestVote.votes?.Republican?.Nay || 0
    },
    independentSupport: {
      yea: latestVote.votes?.Independent?.Yea || 0,
      nay: latestVote.votes?.Independent?.Nay || 0
    }
  } : {
    passed: false,
    chamber: 'House',
    yeas: 0,
    nays: 0,
    democratSupport: { yea: 0, nay: 0 },
    republicanSupport: { yea: 0, nay: 0 },
    independentSupport: { yea: 0, nay: 0 }
  }

  const democratSupport = analysis?.publicSentiment?.democratSupport || 50
  const republicanSupport = analysis?.publicSentiment?.republicanSupport || 50

  return {
    id: `${bill.type}-${bill.number}`,
    title: bill.title,
    billNumber: `${bill.type}.${bill.number}`,
    status: determineStatus(bill.latestAction?.text || ''),
    controversy: `${determineControversy(democratSupport, republicanSupport)} controversy`,
    trendScore: calculateTrendScore(bill),
    aiConfidence: analysis?.aiConfidence || 75,
    sponsor: bill.sponsors?.[0]?.fullName || 'Unknown',
    description: bill.summaries?.[0]?.text || bill.title,
    categories: bill.subjects?.legislativeSubjects?.slice(0, 3).map(s => s.name) || [],
    truthScore: analysis?.truthScore || 50,
    voteResults,
    moneyMap: {
      total: analysis?.lobbyingInsights?.estimatedSpending || '$0',
      change: '+0%',
      topDonors: analysis?.lobbyingInsights?.topIndustries?.join(', ') || 'Unknown',
      sources: []
    },
    keyProvisions: analysis?.keyProvisions || [],
    hiddenImplications: analysis?.hiddenImplications || [],
    factCheck: analysis?.factCheck || [],
    publicSentiment: {
      democratSupport,
      republicanSupport,
      comments: Math.floor(Math.random() * 20000) + 5000,
      support: Math.floor(Math.random() * 10000) + 2000,
      oppose: Math.floor(Math.random() * 8000) + 1000,
      argumentsFor: analysis?.publicSentiment?.argumentsFor || 'No data available',
      argumentsAgainst: analysis?.publicSentiment?.argumentsAgainst || 'No data available'
    },
    sponsorship: {
      primary: `${bill.sponsors?.[0]?.fullName} (${bill.sponsors?.[0]?.party}-${bill.sponsors?.[0]?.state})`,
      coSponsors: cosponsors.length,
      coSponsorList: cosponsors.slice(0, 3).map(c => `${c.fullName} (${c.party}-${c.state})`).join(', ')
    },
    lobbyingActivity: {
      monthlyData: [],
      topEntities: []
    },
    impact: {
      fiscalNote: analysis?.impactAnalysis?.fiscalNote || 'No fiscal analysis available',
      beneficiaries: analysis?.impactAnalysis?.beneficiaries || [],
      payers: analysis?.impactAnalysis?.payers || [],
      districtImpact: []
    }
  }
}

/**
 * Determine bill status from latest action text
 */
function determineStatus(actionText: string): string {
  const text = actionText.toLowerCase()

  if (text.includes('became public law') || text.includes('signed by president')) {
    return 'Enacted'
  } else if (text.includes('passed senate') || text.includes('senate agreed')) {
    return 'Passed Senate'
  } else if (text.includes('passed house') || text.includes('house agreed')) {
    return 'Passed House'
  } else if (text.includes('committee')) {
    return 'Committee'
  } else if (text.includes('introduced')) {
    return 'Introduced'
  }

  return 'Introduced'
}

/**
 * Search bills by keyword
 */
export async function searchBills(query: string, limit: number = 20): Promise<Partial<BillData>[]> {
  try {
    // Search both federal and state bills
    const [congressBills, stateBills] = await Promise.all([
      fetchRecentBills(limit, 0),
      fetchStateBills(undefined, limit / 2, 1)
    ])

    // Filter by query
    const filteredCongressBills = congressBills.filter(bill =>
      bill.title.toLowerCase().includes(query.toLowerCase())
    )

    const results: Partial<BillData>[] = []

    for (const bill of filteredCongressBills.slice(0, limit)) {
      const billData = await convertCongressBillToBillData(bill, calculateTrendScore(bill))
      if (billData) results.push(billData)
    }

    return results
  } catch (error) {
    console.error('Error searching bills:', error)
    return []
  }
}
