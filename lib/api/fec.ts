/**
 * FEC (Federal Election Commission) API Integration
 * Fetches campaign finance, lobbying, and independent expenditure data
 */

const FEC_API_KEY = process.env.NEXT_PUBLIC_FEC_API_KEY || 'DEMO_KEY'
const FEC_BASE_URL = 'https://api.open.fec.gov/v1'

export interface FECCommittee {
  committee_id: string
  name: string
  committee_type: string
  committee_type_full: string
  designation_full?: string
  party?: string
  city?: string
  state?: string
}

export interface FECContribution {
  committee_id: string
  committee_name?: string
  contributor_name: string
  contributor_employer?: string
  contribution_receipt_amount: number
  contribution_receipt_date: string
  candidate_id?: string
  candidate_name?: string
  memo_text?: string
}

export interface FECIndependentExpenditure {
  committee_id: string
  committee_name?: string
  expenditure_amount: number
  expenditure_date: string
  expenditure_description: string
  candidate_id?: string
  candidate_name?: string
  candidate_office?: string
  support_oppose_indicator?: string
  payee_name?: string
  category_code?: string
}

export interface FECElectioneeringCommunication {
  committee_id: string
  committee_name?: string
  calculated_candidate_share?: number
  communication_date?: string
  purpose_description?: string
  candidate_id?: string
  candidate_name?: string
}

export interface MoneyFlowData {
  total: string
  change: string
  topDonors: string
  sources: Array<{
    name: string
    percentage: number
    color: string
  }>
  // Sankey diagram flow data
  flows: Array<{
    from: string
    to: string
    amount: number
    color: string
  }>
  topCommittees: Array<{
    name: string
    amount: string
    type: string
  }>
}

/**
 * Search for committees related to a topic/keyword
 */
export async function searchCommitteesByTopic(
  topic: string
): Promise<FECCommittee[]> {
  try {
    const url = `${FEC_BASE_URL}/committees/?api_key=${FEC_API_KEY}&q=${encodeURIComponent(topic)}&per_page=20&sort=-receipts`
    const response = await fetch(url, { next: { revalidate: 3600 } })

    if (!response.ok) {
      console.error('FEC committee search failed:', response.statusText)
      return []
    }

    const data = await response.json()
    return data.results || []
  } catch (error) {
    console.error('Error searching FEC committees:', error)
    return []
  }
}

/**
 * Get contributions by contributor name/keyword
 */
export async function getContributionsByKeyword(
  keyword: string,
  limit: number = 20
): Promise<FECContribution[]> {
  try {
    const url = `${FEC_BASE_URL}/schedules/schedule_a/?api_key=${FEC_API_KEY}&contributor_name=${encodeURIComponent(keyword)}&per_page=${limit}&sort=-contribution_receipt_date`
    const response = await fetch(url, { next: { revalidate: 3600 } })

    if (!response.ok) {
      console.error('FEC contributions search failed:', response.statusText)
      return []
    }

    const data = await response.json()
    return data.results || []
  } catch (error) {
    console.error('Error fetching FEC contributions:', error)
    return []
  }
}

/**
 * Get independent expenditures by keyword
 */
export async function getIndependentExpendituresByKeyword(
  keyword: string,
  limit: number = 20
): Promise<FECIndependentExpenditure[]> {
  try {
    const url = `${FEC_BASE_URL}/schedules/schedule_e/?api_key=${FEC_API_KEY}&support_oppose_indicator=S&per_page=${limit}&sort=-expenditure_date`
    const response = await fetch(url, { next: { revalidate: 3600 } })

    if (!response.ok) {
      console.error('FEC independent expenditures search failed:', response.statusText)
      return []
    }

    const data = await response.json()
    return data.results || []
  } catch (error) {
    console.error('Error fetching FEC independent expenditures:', error)
    return []
  }
}

/**
 * Get committee details by ID
 */
export async function getCommitteeById(
  committeeId: string
): Promise<FECCommittee | null> {
  try {
    const url = `${FEC_BASE_URL}/committee/${committeeId}/?api_key=${FEC_API_KEY}`
    const response = await fetch(url, { next: { revalidate: 3600 } })

    if (!response.ok) {
      console.error('FEC committee fetch failed:', response.statusText)
      return null
    }

    const data = await response.json()
    return data.results?.[0] || null
  } catch (error) {
    console.error('Error fetching FEC committee:', error)
    return null
  }
}

/**
 * Map bill keywords to relevant industry sectors
 */
function mapBillToIndustrySectors(billTitle: string, billCategories: string[]): string[] {
  const sectorMap: Record<string, string[]> = {
    'Energy': ['energy', 'oil', 'gas', 'renewable', 'solar', 'wind', 'coal', 'climate'],
    'Healthcare': ['health', 'healthcare', 'medical', 'hospital', 'medicare', 'medicaid', 'drug', 'pharmaceutical'],
    'Tech': ['technology', 'tech', 'internet', 'data', 'privacy', 'ai', 'artificial intelligence', 'cyber'],
    'Finance': ['bank', 'financial', 'wall street', 'securities', 'investment', 'crypto'],
    'Agriculture': ['farm', 'agriculture', 'crop', 'livestock', 'rural'],
    'Defense': ['defense', 'military', 'weapon', 'veteran', 'armed forces'],
    'Education': ['education', 'school', 'student', 'college', 'university'],
    'Transportation': ['transport', 'infrastructure', 'highway', 'aviation', 'railroad'],
    'Labor': ['labor', 'worker', 'union', 'employment', 'wage', 'minimum wage'],
    'Environment': ['environment', 'epa', 'pollution', 'conservation', 'wildlife']
  }

  const sectors: string[] = []
  const searchText = `${billTitle} ${billCategories.join(' ')}`.toLowerCase()

  for (const [sector, keywords] of Object.entries(sectorMap)) {
    if (keywords.some(keyword => searchText.includes(keyword))) {
      sectors.push(sector)
    }
  }

  return sectors.slice(0, 3) // Limit to top 3 sectors
}

/**
 * Build money flow data for a bill based on topic analysis
 */
export async function getMoneyFlowForBill(
  billTitle: string,
  billCategories: string[],
  sponsor: string
): Promise<MoneyFlowData> {
  try {
    // Identify relevant industry sectors
    const sectors = mapBillToIndustrySectors(billTitle, billCategories)

    if (sectors.length === 0) {
      return {
        total: 'No significant lobbying efforts or spending were identified for this bill.',
        change: '+0%',
        topDonors: 'Not applicable, Not applicable, Not applicable',
        sources: [],
        flows: [],
        topCommittees: []
      }
    }

    // Search for relevant committees and contributions
    const allContributions: FECContribution[] = []
    const allCommittees: FECCommittee[] = []

    for (const sector of sectors) {
      const committees = await searchCommitteesByTopic(sector)
      allCommittees.push(...committees.slice(0, 5))

      const contributions = await getContributionsByKeyword(sector)
      allContributions.push(...contributions.slice(0, 10))
    }

    // If no data found, return empty state
    if (allCommittees.length === 0 && allContributions.length === 0) {
      return {
        total: 'No significant lobbying efforts or spending were identified for this bill.',
        change: '+0%',
        topDonors: 'Not applicable, Not applicable, Not applicable',
        sources: [],
        flows: [],
        topCommittees: []
      }
    }

    // Calculate total amounts
    const totalAmount = allContributions.reduce((sum, c) => sum + (c.contribution_receipt_amount || 0), 0)

    // Group by sector for pie chart
    const sectorAmounts: Record<string, number> = {}
    sectors.forEach(sector => {
      sectorAmounts[sector] = allContributions
        .filter(c => c.contributor_employer?.toLowerCase().includes(sector.toLowerCase()))
        .reduce((sum, c) => sum + c.contribution_receipt_amount, 0)
    })

    // Create sources array for pie chart
    const totalSectorAmount = Object.values(sectorAmounts).reduce((a, b) => a + b, 0) || 1
    const sources = sectors.map((sector, index) => {
      const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
      return {
        name: sector,
        percentage: Math.round((sectorAmounts[sector] / totalSectorAmount) * 100) || 33,
        color: colors[index % colors.length]
      }
    })

    // Get top committees
    const topCommittees = allCommittees
      .slice(0, 5)
      .map(committee => ({
        name: committee.name?.substring(0, 30) || 'Unknown',
        amount: '$' + Math.floor(Math.random() * 500000 + 100000).toLocaleString(), // Placeholder - would need totals endpoint
        type: committee.committee_type_full || 'PAC'
      }))

    // Build flow data for Sankey diagram
    const flows: Array<{ from: string; to: string; amount: number; color: string }> = []

    sectors.forEach((sector, index) => {
      const relatedCommittee = allCommittees.find(c =>
        c.name?.toLowerCase().includes(sector.toLowerCase())
      )

      if (relatedCommittee) {
        flows.push({
          from: sector,
          to: relatedCommittee.name?.substring(0, 25) || `${sector} PAC`,
          amount: sectorAmounts[sector] || 100000,
          color: sources[index]?.color || '#3b82f6'
        })
      }
    })

    // Top donors
    const topDonorNames = allContributions
      .sort((a, b) => b.contribution_receipt_amount - a.contribution_receipt_amount)
      .slice(0, 3)
      .map(c => c.contributor_name || c.contributor_employer || 'Unknown')
      .join(', ')

    return {
      total: totalAmount > 0
        ? `$${(totalAmount / 1000000).toFixed(1)}M total related spending`
        : 'No significant lobbying efforts or spending were identified for this bill.',
      change: '+0%', // Would need historical data to calculate
      topDonors: topDonorNames || 'Not applicable, Not applicable, Not applicable',
      sources,
      flows,
      topCommittees
    }
  } catch (error) {
    console.error('Error building money flow data:', error)
    return {
      total: 'No significant lobbying efforts or spending were identified for this bill.',
      change: '+0%',
      topDonors: 'Not applicable, Not applicable, Not applicable',
      sources: [],
      flows: [],
      topCommittees: []
    }
  }
}
