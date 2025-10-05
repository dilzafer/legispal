/**
 * Data adapter for transforming LDA API responses to UI format
 */

import { LDAFiling, LobbyingActivity as LDAActivity, extractBillReferences } from '@/lib/api/lda'

// UI Interface (matches existing lobbying page)
export interface LobbyingActivity {
  id: string
  client: string
  lobbyist: string
  amount: number
  quarter: string
  year: number
  issue: string
  description: string
  relatedBills: string[]
  disclosureDate: string
  lobbyingFirm: string
  category: 'Energy' | 'Healthcare' | 'Technology' | 'Finance' | 'Defense' | 'Agriculture' | 'Transportation' | 'Education' | 'Other'
  target: 'House' | 'Senate' | 'Both' | 'Administration'
  status: 'Active' | 'Completed' | 'Pending'
}

/**
 * Map LDA general issue codes to UI categories
 */
const ISSUE_CODE_TO_CATEGORY: Record<string, LobbyingActivity['category']> = {
  // Energy
  'ENG': 'Energy',
  'ENV': 'Energy', // Environment often overlaps with energy
  'FUE': 'Energy',
  'NAT': 'Energy', // Natural Resources
  'CLW': 'Energy', // Clean Air & Water (Clean Water)

  // Healthcare
  'HCR': 'Healthcare',
  'PHA': 'Healthcare', // Pharmaceutical
  'MED': 'Healthcare', // Medical devices
  'HEA': 'Healthcare', // Health Issues
  'MIA': 'Healthcare', // Medicare/Medicaid

  // Technology
  'TEC': 'Technology',
  'COM': 'Technology', // Communications/Telecom
  'CPI': 'Technology', // Computer Industry
  'CSP': 'Technology', // Consumer Issues/Safety/Products
  'SCI': 'Technology', // Science/Technology

  // Finance
  'BAN': 'Finance',
  'FIN': 'Finance',
  'TAX': 'Finance',
  'BNK': 'Finance',
  'INS': 'Finance', // Insurance
  'ECN': 'Finance', // Economics/Economic Development
  'RET': 'Finance', // Retirement

  // Defense
  'DEF': 'Defense',
  'HOM': 'Defense', // Homeland Security
  'WEA': 'Defense', // Weapons
  'IMM': 'Defense', // Immigration

  // Agriculture
  'AGR': 'Agriculture',
  'FOO': 'Agriculture', // Food industry

  // Transportation
  'TRA': 'Transportation',
  'AVI': 'Transportation', // Aviation
  'AUT': 'Transportation', // Automotive
  'RAI': 'Transportation', // Railroad
  'MAR': 'Transportation', // Marine/Maritime
  'ROA': 'Transportation', // Roads/Highway

  // Education
  'EDU': 'Education',
}

/**
 * Determine category from issue code or description
 */
function determineCategory(issueCode: string, description: string): LobbyingActivity['category'] {
  // First try direct mapping
  const category = ISSUE_CODE_TO_CATEGORY[issueCode.toUpperCase()]
  if (category) return category

  // Fall back to keyword matching in description
  const lower = description.toLowerCase()

  if (lower.includes('energy') || lower.includes('renewable') || lower.includes('climate') || lower.includes('carbon')) {
    return 'Energy'
  }
  if (lower.includes('health') || lower.includes('medicare') || lower.includes('medicaid') || lower.includes('drug')) {
    return 'Healthcare'
  }
  if (lower.includes('tech') || lower.includes('ai') || lower.includes('data') || lower.includes('cyber')) {
    return 'Technology'
  }
  if (lower.includes('tax') || lower.includes('finance') || lower.includes('banking') || lower.includes('securities')) {
    return 'Finance'
  }
  if (lower.includes('defense') || lower.includes('military') || lower.includes('security') || lower.includes('border')) {
    return 'Defense'
  }
  if (lower.includes('agriculture') || lower.includes('farm') || lower.includes('food')) {
    return 'Agriculture'
  }
  if (lower.includes('transport') || lower.includes('highway') || lower.includes('aviation') || lower.includes('railroad')) {
    return 'Transportation'
  }
  if (lower.includes('education') || lower.includes('school') || lower.includes('university') || lower.includes('student')) {
    return 'Education'
  }

  return 'Other'
}

/**
 * Determine target based on government entities
 */
function determineTarget(governmentEntities: string[]): LobbyingActivity['target'] {
  const entityStr = governmentEntities.join(' ').toLowerCase()

  const hasHouse = entityStr.includes('house')
  const hasSenate = entityStr.includes('senate')
  const hasWhiteHouse = entityStr.includes('white house') || entityStr.includes('executive')
  const hasAgency = entityStr.includes('department') || entityStr.includes('agency') || entityStr.includes('commission')

  if (hasWhiteHouse || hasAgency) {
    return 'Administration'
  }
  if (hasHouse && hasSenate) {
    return 'Both'
  }
  if (hasSenate) {
    return 'Senate'
  }
  if (hasHouse) {
    return 'House'
  }

  return 'Both' // Default
}

/**
 * Determine filing status based on filing type and date
 */
function determineStatus(filingType: string, filingDate: string): LobbyingActivity['status'] {
  const daysSincePosted = Math.floor(
    (Date.now() - new Date(filingDate).getTime()) / (1000 * 60 * 60 * 24)
  )

  // If filing is from current year and within last 120 days, it's active
  const currentYear = new Date().getFullYear()
  const filingYear = new Date(filingDate).getFullYear()

  if (filingYear === currentYear && daysSincePosted <= 120) {
    return 'Active'
  }

  // If it's a quarterly report from last quarter, it's active
  if (filingType.includes('Q') && daysSincePosted <= 90) {
    return 'Active'
  }

  // If it's very recent (within 30 days), it's pending review
  if (daysSincePosted <= 30) {
    return 'Pending'
  }

  return 'Completed'
}

/**
 * Convert filing period to quarter notation
 */
function getQuarterFromPeriod(period: string, filingType: string): string {
  if (filingType.includes('Q1') || period.includes('Q1')) return 'Q1'
  if (filingType.includes('Q2') || period.includes('Q2')) return 'Q2'
  if (filingType.includes('Q3') || period.includes('Q3')) return 'Q3'
  if (filingType.includes('Q4') || period.includes('Q4')) return 'Q4'
  if (period.includes('MID') || filingType.includes('MID')) return 'Q2'
  if (period.includes('YEAR-END') || filingType.includes('YEAR')) return 'Q4'

  // Default to current quarter
  const month = new Date().getMonth()
  if (month < 3) return 'Q1'
  if (month < 6) return 'Q2'
  if (month < 9) return 'Q3'
  return 'Q4'
}

/**
 * Transform LDA filing to UI LobbyingActivity format
 */
export function transformFilingToActivity(filing: LDAFiling): LobbyingActivity[] {
  const activities: LobbyingActivity[] = []

  // Parse income/expenses (they come as strings)
  const amount = parseFloat(filing.income || filing.expenses || '0') || 0

  // Check if filing has lobbying_activities array
  if (filing.lobbying_activities && filing.lobbying_activities.length > 0) {
    // Each lobbying activity within a filing becomes a separate UI activity
    for (const activity of filing.lobbying_activities) {
      const lobbyistNames = activity.lobbyists.length > 0
        ? activity.lobbyists.map(l => `${l.lobbyist.first_name} ${l.lobbyist.last_name}`).join(', ')
        : 'Unknown'

      const governmentEntityNames = activity.government_entities.map(e => e.name)
      const category = determineCategory(activity.general_issue_code, activity.description)
      const target = determineTarget(governmentEntityNames)
      const status = determineStatus(filing.filing_type, filing.dt_posted)
      const quarter = getQuarterFromPeriod(filing.filing_period, filing.filing_type)
      const relatedBills = extractBillReferences(activity.description)

      activities.push({
        id: `${filing.filing_uuid}-${activity.general_issue_code}`,
        client: filing.client.name,
        lobbyist: lobbyistNames,
        amount,
        quarter,
        year: filing.filing_year,
        issue: activity.general_issue_code_display,
        description: activity.description,
        relatedBills,
        disclosureDate: filing.dt_posted,
        lobbyingFirm: filing.registrant.name,
        category,
        target,
        status
      })
    }
  } else {
    // Registration filings or filings without activities - create one generic entry
    activities.push({
      id: filing.filing_uuid,
      client: filing.client.name,
      lobbyist: 'Not specified',
      amount,
      quarter: getQuarterFromPeriod(filing.filing_period, filing.filing_type),
      year: filing.filing_year,
      issue: filing.filing_type === 'RR' ? 'Registration' : 'General Lobbying',
      description: filing.client.general_description || 'No description available',
      relatedBills: [],
      disclosureDate: filing.dt_posted,
      lobbyingFirm: filing.registrant.name,
      category: 'Other',
      target: 'Both',
      status: determineStatus(filing.filing_type, filing.dt_posted)
    })
  }

  return activities
}

/**
 * Transform multiple filings to activities
 */
export function transformFilingsToActivities(filings: LDAFiling[]): LobbyingActivity[] {
  const allActivities: LobbyingActivity[] = []

  for (const filing of filings) {
    const activities = transformFilingToActivity(filing)
    allActivities.push(...activities)
  }

  return allActivities
}

/**
 * Filter activities by search term
 */
export function filterActivities(
  activities: LobbyingActivity[],
  searchTerm: string,
  categoryFilter: string,
  targetFilter: string
): LobbyingActivity[] {
  return activities.filter(activity => {
    const matchesSearch = searchTerm === '' ||
      activity.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.lobbyist.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.issue.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.lobbyingFirm.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = categoryFilter === 'all' || activity.category === categoryFilter
    const matchesTarget = targetFilter === 'all' || activity.target === targetFilter

    return matchesSearch && matchesCategory && matchesTarget
  })
}

/**
 * Calculate summary statistics
 */
export function calculateActivityStats(activities: LobbyingActivity[]): {
  totalSpending: number
  activeActivities: number
  uniqueBills: number
  averagePerActivity: number
} {
  const totalSpending = activities.reduce((sum, activity) => sum + activity.amount, 0)
  const uniqueBills = new Set(activities.flatMap(a => a.relatedBills)).size

  return {
    totalSpending,
    activeActivities: activities.length,
    uniqueBills,
    averagePerActivity: activities.length > 0 ? totalSpending / activities.length : 0
  }
}
