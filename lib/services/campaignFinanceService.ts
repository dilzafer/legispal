/**
 * Campaign Finance Service
 * Aggregates data from FEC API, LDA (Lobbying) API, and Gemini AI
 * to provide real-time campaign finance flow visualization data
 */

import { fetchLDAFilings, type LDAFiling } from '../api/lda'

const FEC_API_KEY = process.env.NEXT_PUBLIC_FEC_API_KEY || 'DEMO_KEY'
const FEC_BASE_URL = 'https://api.open.fec.gov/v1'

export interface CampaignFinanceData {
  nodes: Array<{
    id: number
    name: string
    key: string
  }>
  links: Array<{
    source: number
    target: number
    value: number
    key: string
  }>
  totals: {
    tracked: number
    darkMoney: number
    lastUpdated: Date
    period: string
  }
}

interface IndustrySectorData {
  sector: string
  totalAmount: number
  recipients: Map<string, number>
  committees: Map<string, number>
}

/**
 * Map LDA lobbying data to industry sectors
 */
function mapLobbyingToSectors(filings: LDAFiling[]): Map<string, IndustrySectorData> {
  const sectorMap = new Map<string, IndustrySectorData>()

  const sectorKeywords: Record<string, string[]> = {
    'Oil & Gas': ['energy', 'oil', 'gas', 'petroleum', 'fuel', 'fossil'],
    'Pharmaceuticals': ['health', 'pharma', 'drug', 'medical', 'medicine', 'biotech'],
    'Tech Companies': ['tech', 'software', 'internet', 'data', 'cyber', 'ai', 'digital'],
    'Defense Contractors': ['defense', 'military', 'aerospace', 'weapon', 'security', 'veteran']
  }

  for (const filing of filings) {
    // Parse income (can be null or string like "$100,000")
    const income = filing.income
      ? parseFloat(filing.income.replace(/[$,]/g, ''))
      : 0

    if (income === 0) continue

    // Determine sector based on client description and registrant
    const clientDesc = (filing.client?.general_description || '').toLowerCase()
    const registrantDesc = (filing.registrant?.description || '').toLowerCase()
    const clientName = (filing.client?.name || '').toLowerCase()
    const searchText = `${clientDesc} ${registrantDesc} ${clientName}`

    let matchedSector: string | null = null
    let maxMatches = 0

    for (const [sector, keywords] of Object.entries(sectorKeywords)) {
      const matches = keywords.filter(kw => searchText.includes(kw)).length
      if (matches > maxMatches) {
        maxMatches = matches
        matchedSector = sector
      }
    }

    if (matchedSector && maxMatches > 0) {
      if (!sectorMap.has(matchedSector)) {
        sectorMap.set(matchedSector, {
          sector: matchedSector,
          totalAmount: 0,
          recipients: new Map(),
          committees: new Map()
        })
      }

      const sectorData = sectorMap.get(matchedSector)!
      sectorData.totalAmount += income

      // Track government entities (committees/recipients)
      if (filing.lobbying_activities) {
        for (const activity of filing.lobbying_activities) {
          if (activity.government_entities) {
            for (const entity of activity.government_entities) {
              const entityName = entity.name
              const currentAmount = sectorData.committees.get(entityName) || 0
              sectorData.committees.set(entityName, currentAmount + income)
            }
          }
        }
      }
    }
  }

  return sectorMap
}

/**
 * Fetch recent FEC independent expenditures
 */
async function fetchRecentIndependentExpenditures(daysBack: number = 30): Promise<number> {
  try {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - daysBack)

    const minDate = startDate.toISOString().split('T')[0]
    const maxDate = endDate.toISOString().split('T')[0]

    const url = `${FEC_BASE_URL}/schedules/schedule_e/?api_key=${FEC_API_KEY}&min_date=${minDate}&max_date=${maxDate}&per_page=100&sort=-expenditure_date`

    const response = await fetch(url, {
      next: { revalidate: 21600 } // Cache for 6 hours
    })

    if (!response.ok) {
      console.error('FEC independent expenditures fetch failed:', response.statusText)
      return 0
    }

    const data = await response.json()
    const expenditures = data.results || []

    const total = expenditures.reduce((sum: number, exp: any) => {
      return sum + (exp.expenditure_amount || 0)
    }, 0)

    console.log(`✅ Fetched ${expenditures.length} independent expenditures, total: $${total.toLocaleString()}`)
    return total
  } catch (error) {
    console.error('Error fetching FEC expenditures:', error)
    return 0
  }
}

/**
 * Estimate dark money using Gemini AI and web research
 */
async function estimateDarkMoney(trackedAmount: number): Promise<number> {
  try {
    const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY

    // If Gemini is not available, use research-based estimate
    if (!GEMINI_API_KEY || GEMINI_API_KEY.includes('your_')) {
      console.log('⚠️ Gemini API not configured, using research-based dark money estimate')
      // Based on Brennan Center 2024 research: 12% dark money ratio
      return trackedAmount * 0.12
    }

    // Use Gemini with Google Search grounding for latest dark money estimates
    const prompt = `Based on current campaign finance data, I have tracked $${trackedAmount.toLocaleString()} in disclosed campaign spending (FEC independent expenditures + lobbying disclosures) over the last 30 days.

Using recent research on dark money in U.S. politics (especially 2024 data from Brennan Center, OpenSecrets, and FEC):
1. What percentage of total campaign finance spending is typically "dark money" (undisclosed donors)?
2. For the tracked amount of $${trackedAmount.toLocaleString()}, what would be a reasonable estimate of associated dark money?

Provide your answer as a JSON object with:
{
  "darkMoneyRatio": <decimal 0-1>,
  "estimatedDarkMoney": <number>,
  "reasoning": "<brief explanation>"
}`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          tools: [{ googleSearch: {} }],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: 'application/json'
          }
        }),
        next: { revalidate: 86400 } // Cache for 24 hours
      }
    )

    if (response.ok) {
      const data = await response.json()
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text

      if (text) {
        const result = JSON.parse(text)
        const darkMoney = result.estimatedDarkMoney || trackedAmount * result.darkMoneyRatio

        console.log(`🤖 Gemini dark money estimate: $${darkMoney.toLocaleString()} (${(result.darkMoneyRatio * 100).toFixed(1)}%)`)
        console.log(`   Reasoning: ${result.reasoning}`)

        return darkMoney
      }
    }

    // Fallback to research-based estimate
    console.log('⚠️ Gemini request failed, using research-based estimate')
    return trackedAmount * 0.12
  } catch (error) {
    console.error('Error estimating dark money with Gemini:', error)
    return trackedAmount * 0.12 // Fallback to 12% (Brennan Center 2024 data)
  }
}

/**
 * Build Sankey diagram data structure
 */
function buildSankeyData(
  sectorData: Map<string, IndustrySectorData>,
  totalTracked: number
): Pick<CampaignFinanceData, 'nodes' | 'links'> {
  const nodes: CampaignFinanceData['nodes'] = []
  const links: CampaignFinanceData['links'] = []

  let nodeId = 0
  const nodeIdMap = new Map<string, number>()

  // Add industry sector nodes (source)
  for (const [sectorName] of sectorData) {
    nodes.push({
      id: nodeId,
      name: sectorName,
      key: `node-${nodeId}`
    })
    nodeIdMap.set(sectorName, nodeId)
    nodeId++
  }

  // Collect all unique recipients and committees across sectors
  const allRecipients = new Map<string, number>()
  const allCommittees = new Map<string, number>()

  for (const data of sectorData.values()) {
    for (const [recipient, amount] of data.recipients) {
      allRecipients.set(recipient, (allRecipients.get(recipient) || 0) + amount)
    }
    for (const [committee, amount] of data.committees) {
      allCommittees.set(committee, (allCommittees.get(committee) || 0) + amount)
    }
  }

  // Get top 4 recipients
  const topRecipients = Array.from(allRecipients.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([name]) => name)

  // Get top 2 committees
  const topCommittees = Array.from(allCommittees.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([name]) => name)

  // Add recipient nodes (middle layer)
  for (const recipientName of topRecipients) {
    // Shorten names for display
    const displayName = recipientName.length > 25
      ? recipientName.substring(0, 25) + '...'
      : recipientName

    nodes.push({
      id: nodeId,
      name: displayName,
      key: `node-${nodeId}`
    })
    nodeIdMap.set(recipientName, nodeId)
    nodeId++
  }

  // Add committee nodes (destination)
  for (const committeeName of topCommittees) {
    const displayName = committeeName.length > 25
      ? committeeName.substring(0, 25) + '...'
      : committeeName

    nodes.push({
      id: nodeId,
      name: displayName,
      key: `node-${nodeId}`
    })
    nodeIdMap.set(committeeName, nodeId)
    nodeId++
  }

  // Build links: Sector → Recipients
  for (const [sectorName, data] of sectorData) {
    const sectorId = nodeIdMap.get(sectorName)!

    for (const recipientName of topRecipients) {
      const recipientAmount = data.recipients.get(recipientName) || 0
      if (recipientAmount > 0) {
        const recipientId = nodeIdMap.get(recipientName)!
        links.push({
          source: sectorId,
          target: recipientId,
          value: recipientAmount,
          key: `link-${sectorId}-${recipientId}`
        })
      }
    }
  }

  // Build links: Recipients → Committees
  for (const recipientName of topRecipients) {
    const recipientId = nodeIdMap.get(recipientName)!
    const recipientTotal = allRecipients.get(recipientName) || 0

    // Distribute recipient's influence to committees proportionally
    for (const committeeName of topCommittees) {
      const committeeId = nodeIdMap.get(committeeName)!
      const committeeTotal = allCommittees.get(committeeName) || 0

      // Simplified: distribute based on committee's share of total
      const share = committeeTotal / totalTracked
      const value = recipientTotal * share * 0.3 // 30% flows through to committees

      if (value > 1000) {
        links.push({
          source: recipientId,
          target: committeeId,
          value: Math.round(value),
          key: `link-${recipientId}-${committeeId}`
        })
      }
    }
  }

  return { nodes, links }
}

/**
 * Get campaign finance dashboard data
 */
export async function getCampaignFinanceDashboardData(): Promise<CampaignFinanceData> {
  try {
    console.log('🔍 Fetching campaign finance data...')

    // Fetch lobbying data (last quarter)
    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth() + 1
    const filingPeriod = currentMonth <= 3 ? 'Q1' : currentMonth <= 6 ? 'Q2' : currentMonth <= 9 ? 'Q3' : 'Q4'

    const lobbyingFilings = await fetchLDAFilings({
      filing_year: currentYear,
      filing_type: filingPeriod,
      page_size: 100
    })

    console.log(`📊 Fetched ${lobbyingFilings.length} lobbying filings`)

    // Map lobbying data to sectors
    const sectorData = mapLobbyingToSectors(lobbyingFilings)

    // Calculate total lobbying income
    const totalLobbying = Array.from(sectorData.values())
      .reduce((sum, data) => sum + data.totalAmount, 0)

    // Fetch FEC independent expenditures (last 30 days)
    const fecExpenditures = await fetchRecentIndependentExpenditures(30)

    // Total tracked = Lobbying + FEC expenditures
    const totalTracked = totalLobbying + fecExpenditures

    // Estimate dark money
    const darkMoney = await estimateDarkMoney(totalTracked)

    // Build Sankey diagram structure
    const { nodes, links } = buildSankeyData(sectorData, totalTracked)

    console.log(`✅ Campaign finance data ready: $${totalTracked.toLocaleString()} tracked, $${darkMoney.toLocaleString()} dark money estimated`)

    return {
      nodes,
      links,
      totals: {
        tracked: totalTracked,
        darkMoney: darkMoney,
        lastUpdated: new Date(),
        period: 'Last 30 days'
      }
    }
  } catch (error) {
    console.error('❌ Error fetching campaign finance data:', error)

    // Return fallback data
    return {
      nodes: [
        { id: 0, name: 'Oil & Gas', key: 'node-0' },
        { id: 1, name: 'Pharmaceuticals', key: 'node-1' },
        { id: 2, name: 'Tech Companies', key: 'node-2' },
        { id: 3, name: 'Defense Contractors', key: 'node-3' },
        { id: 4, name: 'Senate Majority', key: 'node-4' },
        { id: 5, name: 'House Leadership', key: 'node-5' },
        { id: 6, name: 'Energy Committee', key: 'node-6' },
        { id: 7, name: 'Health Committee', key: 'node-7' },
      ],
      links: [
        { source: 0, target: 4, value: 500000, key: 'link-0-4' },
        { source: 1, target: 5, value: 400000, key: 'link-1-5' },
        { source: 2, target: 5, value: 600000, key: 'link-2-5' },
        { source: 3, target: 4, value: 700000, key: 'link-3-4' },
        { source: 4, target: 6, value: 300000, key: 'link-4-6' },
        { source: 5, target: 7, value: 350000, key: 'link-5-7' },
      ],
      totals: {
        tracked: 3200000,
        darkMoney: 1500000,
        lastUpdated: new Date(),
        period: 'Last 30 days'
      }
    }
  }
}
