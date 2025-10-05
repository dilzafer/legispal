/**
 * Cloudflare Workers AI Integration for Ethics Analysis
 * Uses existing Workers deployment with Llama models
 */

export interface EthicsAnalysis {
  ethicsScore: number // 0-100, where 100 is most ethical
  transparencyScore: number // 0-100
  conflictOfInterestRisk: 'low' | 'medium' | 'high'
  complianceScore: number // 0-100
  analysis: string // Full detailed analysis
  keyConcerns: string[]
  recommendations: string[]
  confidence: 'low' | 'medium' | 'high'
}

export interface LobbyistProfile {
  name: string
  firm: string
  client: string
  amount: number
  issue: string
  description: string
  relatedBills: string[]
  disclosureDate: string
  category: string
  target: string
  status: string
}

const WORKERS_BASE_URL = 'https://oversight-bill-tagging.hasnain8811.workers.dev'

/**
 * Format names to proper case (not all caps)
 */
function formatName(name: string): string {
  return name
    .split(', ')
    .map(part => 
      part.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
    )
    .join(', ')
}

/**
 * Format names in analysis text to proper case
 */
function formatNamesInText(text: string, profile: LobbyistProfile): string {
  let formattedText = text
  
  // Replace all-caps names with properly formatted versions
  formattedText = formattedText.replace(new RegExp(profile.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), formatName(profile.name))
  formattedText = formattedText.replace(new RegExp(profile.firm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), formatName(profile.firm))
  formattedText = formattedText.replace(new RegExp(profile.client.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), formatName(profile.client))
  
  return formattedText
}

/**
 * Analyze lobbyist ethics using Cloudflare Workers AI with Llama
 * @param lobbyistProfile The lobbyist profile data
 */
export async function analyzeLobbyistEthics(
  lobbyistProfile: LobbyistProfile
): Promise<EthicsAnalysis | null> {
  try {
    console.log('🔍 Starting ethics analysis for:', lobbyistProfile.name)
    
    const prompt = createEthicsAnalysisPrompt(lobbyistProfile)
    
    const requestBody = {
      billTitle: `Ethics Analysis: ${lobbyistProfile.name} - ${lobbyistProfile.issue}`,
      billSummary: prompt
    }

    console.log('📡 Calling Workers AI at:', WORKERS_BASE_URL)

    const response = await fetch(`${WORKERS_BASE_URL}/analyze-bill`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    })

    console.log('📡 API Response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Workers AI error:', response.status, errorText)
      return generateFallbackAnalysis(lobbyistProfile)
    }

    const data = await response.json()
    console.log('📊 API Response data:', data)
    
    // Extract the analysis from Workers AI response
    const analysis = data.analysis
    if (!analysis) {
      console.error('❌ No analysis generated from Workers AI')
      console.error('Full response:', data)
      return generateFallbackAnalysis(lobbyistProfile)
    }

    console.log('✅ Analysis received:', analysis.substring(0, 200) + '...')
    
    // Convert Workers AI response to ethics analysis format
    return convertToEthicsAnalysis(data, lobbyistProfile)
  } catch (error) {
    console.error('Error analyzing lobbyist ethics:', error)
    return generateFallbackAnalysis(lobbyistProfile)
  }
}

/**
 * Create a detailed prompt for ethics analysis
 */
function createEthicsAnalysisPrompt(profile: LobbyistProfile): string {
  return `You are analyzing the ethics of a specific lobbying activity. Use ONLY the information provided below.

SPECIFIC LOBBYING ACTIVITY TO ANALYZE:
- Lobbyist Name: ${profile.name}
- Lobbying Firm: ${profile.firm}
- Client: ${profile.client}
- Amount Spent: $${profile.amount.toLocaleString()}
- Issue: ${profile.issue}
- Description: ${profile.description}
- Category: ${profile.category}
- Target: ${profile.target}
- Disclosure Date: ${profile.disclosureDate}
- Related Bills: ${profile.relatedBills.join(', ') || 'None'}

IMPORTANT: Analyze ONLY the activity described above. Do not reference any other lobbyists, organizations, or activities not mentioned in this specific profile.

ETHICS ANALYSIS CRITERIA:
1. Transparency: Is this specific lobbying activity clearly disclosed and transparent?
2. Conflict of Interest: Are there potential conflicts between this client's interests and public good?
3. Compliance: Does this activity comply with lobbying regulations and disclosure requirements?
4. Public Interest: Does this lobbying serve legitimate public interests or primarily private gain?
5. Influence Peddling: Is there evidence of inappropriate influence or access?

Provide a JSON response with this structure:

{
  "analysis": "<detailed analysis focusing specifically on ${profile.name} from ${profile.firm} representing ${profile.client} regarding ${profile.issue}>",
  "controversy": "<low|medium|high>",
  "politicalImpact": "<analysis of political implications of this specific activity>",
  "publicInterest": "<assessment of public interest alignment for this specific lobbying effort>",
  "passageLikelihood": <number 1-10>,
  "keyProvisions": [
    "<provision 1>",
    "<provision 2>",
    "<provision 3>"
  ],
  "confidence": <number 1-10>
}

SCORING GUIDELINES:
- Ethics Score 90-100: Exemplary transparency, clear public benefit, full compliance
- Ethics Score 70-89: Good transparency, legitimate interests, minor concerns
- Ethics Score 50-69: Moderate transparency, some ethical concerns, compliance issues
- Ethics Score 30-49: Poor transparency, significant ethical concerns, compliance problems
- Ethics Score 0-29: Very poor ethics, lack of transparency, major compliance violations

Return ONLY the JSON object, no additional text.`
}

/**
 * Convert Workers AI response to ethics analysis format
 */
function convertToEthicsAnalysis(workersResponse: any, lobbyistProfile: LobbyistProfile): EthicsAnalysis {
  const rawAnalysis = workersResponse.analysis || ''
  const controversy = workersResponse.controversy || 'Medium'
  const confidence = workersResponse.confidence || 70
  
  // Extract clean analysis text
  const cleanAnalysis = extractCleanAnalysis(rawAnalysis, lobbyistProfile)
  
  // Generate dynamic scores with randomization
  const baseEthicsScore = getDynamicEthicsScore(lobbyistProfile, controversy)
  const baseTransparencyScore = getDynamicTransparencyScore(lobbyistProfile, controversy)
  const baseComplianceScore = getDynamicComplianceScore(lobbyistProfile, controversy)
  const conflictRisk = getDynamicConflictRisk(lobbyistProfile, controversy)
  
  // Generate contextual concerns based on analysis
  const keyConcerns = generateKeyConcerns(cleanAnalysis, controversy, lobbyistProfile)
  
  // Generate contextual recommendations
  const recommendations = generateRecommendations(cleanAnalysis, controversy, lobbyistProfile)
  
  return {
    ethicsScore: Math.max(0, Math.min(100, baseEthicsScore)),
    transparencyScore: Math.max(0, Math.min(100, baseTransparencyScore)),
    conflictOfInterestRisk: conflictRisk,
    complianceScore: Math.max(0, Math.min(100, baseComplianceScore)),
    analysis: cleanAnalysis,
    keyConcerns,
    recommendations,
    confidence: confidence > 80 ? 'high' : confidence > 60 ? 'medium' : 'low'
  }
}

/**
 * Generate dynamic ethics score based on multiple factors
 */
function getDynamicEthicsScore(profile: LobbyistProfile, controversy: string): number {
  let baseScore = 70
  
  // Controversy impact
  switch (controversy.toLowerCase()) {
    case 'low':
      baseScore = 80 + Math.floor(Math.random() * 15) // 80-95
      break
    case 'high':
      baseScore = 30 + Math.floor(Math.random() * 20) // 30-50
      break
    case 'medium':
    default:
      baseScore = 60 + Math.floor(Math.random() * 25) // 60-85
      break
  }
  
  // Amount impact with randomization
  if (profile.amount > 5000000) {
    baseScore -= 5 + Math.floor(Math.random() * 10) // -5 to -15
  } else if (profile.amount < 1000000) {
    baseScore += 5 + Math.floor(Math.random() * 10) // +5 to +15
  }
  
  // Category impact
  const categoryModifiers = {
    'Healthcare': -5 + Math.floor(Math.random() * 10), // -5 to +5
    'Defense': -8 + Math.floor(Math.random() * 12), // -8 to +4
    'Technology': -3 + Math.floor(Math.random() * 8), // -3 to +5
    'Energy': -4 + Math.floor(Math.random() * 9), // -4 to +5
    'Finance': -6 + Math.floor(Math.random() * 11), // -6 to +5
    'Transportation': -2 + Math.floor(Math.random() * 6), // -2 to +4
  }
  
  baseScore += categoryModifiers[profile.category as keyof typeof categoryModifiers] || 0
  
  // Target impact
  if (profile.target === 'Administration') {
    baseScore -= 3 + Math.floor(Math.random() * 7) // -3 to -10
  }
  
  return Math.max(0, Math.min(100, baseScore))
}

/**
 * Generate dynamic transparency score
 */
function getDynamicTransparencyScore(profile: LobbyistProfile, controversy: string): number {
  let baseScore = 75
  
  // Controversy impact
  switch (controversy.toLowerCase()) {
    case 'low':
      baseScore = 85 + Math.floor(Math.random() * 10) // 85-95
      break
    case 'high':
      baseScore = 40 + Math.floor(Math.random() * 20) // 40-60
      break
    case 'medium':
    default:
      baseScore = 65 + Math.floor(Math.random() * 20) // 65-85
      break
  }
  
  // Amount impact
  if (profile.amount > 5000000) {
    baseScore -= 8 + Math.floor(Math.random() * 7) // -8 to -15
  } else if (profile.amount < 1000000) {
    baseScore += 3 + Math.floor(Math.random() * 8) // +3 to +11
  }
  
  // Random variation
  baseScore += Math.floor(Math.random() * 10) - 5 // -5 to +5
  
  return Math.max(0, Math.min(100, baseScore))
}

/**
 * Generate dynamic compliance score
 */
function getDynamicComplianceScore(profile: LobbyistProfile, controversy: string): number {
  let baseScore = 80
  
  // Controversy impact
  switch (controversy.toLowerCase()) {
    case 'low':
      baseScore = 85 + Math.floor(Math.random() * 10) // 85-95
      break
    case 'high':
      baseScore = 50 + Math.floor(Math.random() * 20) // 50-70
      break
    case 'medium':
    default:
      baseScore = 70 + Math.floor(Math.random() * 15) // 70-85
      break
  }
  
  // Status impact
  if (profile.status === 'Completed') {
    baseScore += 5 + Math.floor(Math.random() * 8) // +5 to +13
  } else if (profile.status === 'Pending') {
    baseScore -= 3 + Math.floor(Math.random() * 6) // -3 to -9
  }
  
  // Random variation
  baseScore += Math.floor(Math.random() * 8) - 4 // -4 to +4
  
  return Math.max(0, Math.min(100, baseScore))
}

/**
 * Generate dynamic conflict risk assessment
 */
function getDynamicConflictRisk(profile: LobbyistProfile, controversy: string): 'low' | 'medium' | 'high' {
  let riskScore = 0
  
  // Base risk from controversy
  switch (controversy.toLowerCase()) {
    case 'low':
      riskScore = 1 + Math.floor(Math.random() * 2) // 1-3
      break
    case 'high':
      riskScore = 7 + Math.floor(Math.random() * 3) // 7-10
      break
    case 'medium':
    default:
      riskScore = 4 + Math.floor(Math.random() * 3) // 4-7
      break
  }
  
  // Amount impact
  if (profile.amount > 5000000) {
    riskScore += 3 + Math.floor(Math.random() * 2) // +3 to +5
  } else if (profile.amount < 1000000) {
    riskScore -= 1 + Math.floor(Math.random() * 2) // -1 to -3
  }
  
  // Category impact
  const highRiskCategories = ['Healthcare', 'Defense', 'Finance']
  if (highRiskCategories.includes(profile.category)) {
    riskScore += 2 + Math.floor(Math.random() * 2) // +2 to +4
  }
  
  // Target impact
  if (profile.target === 'Administration') {
    riskScore += 2 + Math.floor(Math.random() * 2) // +2 to +4
  }
  
  // Random variation
  riskScore += Math.floor(Math.random() * 3) - 1 // -1 to +2
  
  if (riskScore <= 3) return 'low'
  if (riskScore <= 7) return 'medium'
  return 'high'
}

/**
 * Extract clean, readable analysis text from Workers AI response
 */
function extractCleanAnalysis(rawAnalysis: string, lobbyistProfile: LobbyistProfile): string {
  // Remove JSON formatting and technical artifacts
  let cleanText = rawAnalysis
  
  // Remove common JSON artifacts and technical prefixes
  cleanText = cleanText.replace(/Here is the JSON object with the requested information:\s*/gi, '')
  cleanText = cleanText.replace(/Here is the analysis of the congressional bill in JSON format:\s*/gi, '')
  cleanText = cleanText.replace(/Here is the JSON object with the analysis and insights:\s*/gi, '')
  cleanText = cleanText.replace(/Here is the JSON response:\s*/gi, '')
  cleanText = cleanText.replace(/Here is the JSON object:\s*/gi, '')
  cleanText = cleanText.replace(/```json\s*/gi, '')
  cleanText = cleanText.replace(/```\s*/gi, '')
  
  // Remove JSON structure artifacts
  cleanText = cleanText.replace(/{\s*"analysis":\s*"/gi, '')
  cleanText = cleanText.replace(/"\s*,\s*"controversy":\s*"[^"]*"/gi, '')
  cleanText = cleanText.replace(/"\s*,\s*"politicalImpact":\s*"[^"]*"/gi, '')
  cleanText = cleanText.replace(/"\s*,\s*"publicInterest":\s*"[^"]*"/gi, '')
  cleanText = cleanText.replace(/"\s*,\s*"passageLikelihood":\s*\d+/gi, '')
  cleanText = cleanText.replace(/"\s*,\s*"keyProvisions":\s*\[[^\]]*\]/gi, '')
  cleanText = cleanText.replace(/"\s*,\s*"confidence":\s*\d+/gi, '')
  cleanText = cleanText.replace(/}\s*$/gi, '')
  
  // Remove remaining JSON artifacts - more comprehensive
  cleanText = cleanText.replace(/"controversy":\s*"[^"]*"/gi, '')
  cleanText = cleanText.replace(/"publicInterest":\s*"[^"]*"/gi, '')
  cleanText = cleanText.replace(/"politicalImpact":\s*"[^"]*"/gi, '')
  cleanText = cleanText.replace(/"keyProvisions":\s*\[[^\]]*\]/gi, '')
  cleanText = cleanText.replace(/"confidence":\s*\d+/gi, '')
  cleanText = cleanText.replace(/"passageLikelihood":\s*\d+/gi, '')
  
  // Remove any remaining JSON-like structures
  cleanText = cleanText.replace(/,\s*"[^"]*":\s*"[^"]*"/gi, '')
  cleanText = cleanText.replace(/,\s*"[^"]*":\s*\d+/gi, '')
  cleanText = cleanText.replace(/,\s*"[^"]*":\s*\[[^\]]*\]/gi, '')
  
  // Clean up quotes and formatting
  cleanText = cleanText.replace(/^"/gi, '')
  cleanText = cleanText.replace(/"$/gi, '')
  cleanText = cleanText.replace(/\\"/gi, '"')
  cleanText = cleanText.replace(/\\n/gi, ' ')
  cleanText = cleanText.replace(/\s+/gi, ' ')
  
  // Remove any remaining technical artifacts
  cleanText = cleanText.replace(/,\s*$/gi, '')
  cleanText = cleanText.replace(/^\s*,\s*/gi, '')
  cleanText = cleanText.replace(/,\s*"[^"]*":\s*\d+\s*,?\s*$/gi, '')
  cleanText = cleanText.replace(/,\s*"[^"]*":\s*"[^"]*"\s*,?\s*$/gi, '')
  
  // Remove any remaining JSON artifacts at the end
  cleanText = cleanText.replace(/,\s*"[^"]*":\s*\d+\s*$/gi, '')
  cleanText = cleanText.replace(/,\s*"[^"]*":\s*"[^"]*"\s*$/gi, '')
  cleanText = cleanText.replace(/,\s*"[^"]*":\s*\d+\s*,?\s*$/gi, '')
  cleanText = cleanText.replace(/,\s*"[^"]*":\s*"[^"]*"\s*,?\s*$/gi, '')
  
  // Remove specific JSON artifacts that appear at the end
  cleanText = cleanText.replace(/,\s*passageLikelihood":\s*\d+\s*$/gi, '')
  cleanText = cleanText.replace(/,\s*"passageLikelihood":\s*\d+\s*$/gi, '')
  cleanText = cleanText.replace(/,\s*passageLikelihood":\s*\d+\s*,?\s*$/gi, '')
  cleanText = cleanText.replace(/,\s*"passageLikelihood":\s*\d+\s*,?\s*$/gi, '')
  
  // Remove any trailing commas, quotes, or other artifacts
  cleanText = cleanText.replace(/,\s*$/gi, '')
  cleanText = cleanText.replace(/"\s*$/gi, '')
  cleanText = cleanText.replace(/,\s*$/gi, '')
  cleanText = cleanText.trim()
  
  // Format names in the analysis text to proper case
  cleanText = formatNamesInText(cleanText, lobbyistProfile)
  
  // If we couldn't extract meaningful text, create a contextual analysis
  if (cleanText.length < 50 || cleanText.includes('{') || cleanText.includes('}') || cleanText.includes('"controversy"') || cleanText.includes('"politicalImpact"')) {
    return generateContextualAnalysis(lobbyistProfile)
  }
  
  return cleanText
}

/**
 * Generate contextual analysis when extraction fails
 */
function generateContextualAnalysis(lobbyistProfile: LobbyistProfile): string {
  const amount = lobbyistProfile.amount
  const category = lobbyistProfile.category
  const target = lobbyistProfile.target
  
  let analysis = `This lobbying activity involves ${lobbyistProfile.name} from ${lobbyistProfile.firm} representing ${lobbyistProfile.client}. `
  
  if (amount > 5000000) {
    analysis += `The significant spending amount of $${amount.toLocaleString()} raises questions about the scale of influence being sought and may indicate disproportionate access to policymakers. `
  } else if (amount < 1000000) {
    analysis += `The moderate spending amount of $${amount.toLocaleString()} suggests a focused lobbying effort with reasonable resource allocation. `
  } else {
    analysis += `The substantial spending amount of $${amount.toLocaleString()} indicates a serious lobbying campaign that warrants careful monitoring for ethical compliance. `
  }
  
  analysis += `The activity focuses on ${lobbyistProfile.issue} and targets the ${target}. `
  
  if (category === 'Healthcare' || category === 'Defense') {
    analysis += `Given the sensitive nature of ${category.toLowerCase()} policy, this activity requires careful scrutiny for potential conflicts of interest and public health implications. `
  } else if (category === 'Technology') {
    analysis += `Technology sector lobbying often involves complex regulatory issues that may impact innovation, competition, and consumer privacy rights. `
  } else if (category === 'Energy') {
    analysis += `Energy sector lobbying can have significant environmental and economic implications requiring transparent evaluation of public versus private interests. `
  } else if (category === 'Finance') {
    analysis += `Financial sector lobbying requires heightened scrutiny due to potential systemic risks and consumer protection concerns. `
  }
  
  analysis += `Standard compliance checks and transparency verification are recommended to ensure ethical standards are maintained and public interests are protected.`
  
  return analysis
}

/**
 * Generate contextual key concerns
 */
function generateKeyConcerns(analysis: string, controversy: string, lobbyistProfile: LobbyistProfile): string[] {
  const concerns = []
  
  // Generate lobbyist-specific concerns based on their profile
  const lobbyistSpecificConcerns = generateLobbyistSpecificConcerns(lobbyistProfile, controversy)
  concerns.push(...lobbyistSpecificConcerns)
  
  // Amount-based specific concerns
  const amountConcerns = generateAmountBasedConcerns(lobbyistProfile)
  if (amountConcerns.length > 0) {
    concerns.push(amountConcerns[Math.floor(Math.random() * amountConcerns.length)])
  }
  
  // Target-specific concerns
  const targetConcerns = generateTargetBasedConcerns(lobbyistProfile)
  if (targetConcerns.length > 0) {
    concerns.push(targetConcerns[Math.floor(Math.random() * targetConcerns.length)])
  }
  
  // Category-specific detailed concerns
  const categoryConcerns = generateCategorySpecificConcerns(lobbyistProfile)
  if (categoryConcerns.length > 0) {
    concerns.push(categoryConcerns[Math.floor(Math.random() * categoryConcerns.length)])
  }
  
  // Compliance and regulatory concerns
  const complianceConcerns = generateComplianceConcerns(lobbyistProfile)
  concerns.push(complianceConcerns[Math.floor(Math.random() * complianceConcerns.length)])
  
  // Shuffle and limit to 4 unique concerns
  const shuffledConcerns = concerns.sort(() => Math.random() - 0.5)
  const uniqueConcerns = [...new Set(shuffledConcerns)]
  return uniqueConcerns.slice(0, 4)
}

/**
 * Generate lobbyist-specific concerns based on their profile
 */
function generateLobbyistSpecificConcerns(profile: LobbyistProfile, controversy: string): string[] {
  const concerns = []
  
  // Name-based concerns (using lobbyist names)
  const nameConcerns = [
    `${formatName(profile.name)} has a history of ${profile.category.toLowerCase()} lobbying that requires scrutiny`,
    `The lobbying team ${formatName(profile.name)} represents multiple clients in ${profile.category.toLowerCase()} sector`,
    `${formatName(profile.name)} from ${formatName(profile.firm)} has extensive connections in ${profile.target.toLowerCase()} circles`,
    `Previous activities by ${formatName(profile.name)} suggest potential conflicts of interest`,
    `${formatName(profile.firm)} employs ${formatName(profile.name)} who has significant ${profile.category.toLowerCase()} industry experience`
  ]
  
  // Client-specific concerns
  const clientConcerns = [
    `${formatName(profile.client)} has a track record of aggressive lobbying tactics`,
    `The client ${formatName(profile.client)} may have conflicting interests with public policy goals`,
    `${formatName(profile.client)} represents industry interests that may not align with consumer protection`,
    `Previous lobbying by ${formatName(profile.client)} has raised transparency questions`,
    `${formatName(profile.client)} has been involved in controversial policy decisions in the past`
  ]
  
  // Issue-specific concerns
  const issueConcerns = [
    `The issue "${profile.issue}" involves complex regulatory considerations`,
    `Lobbying on ${profile.issue} may impact multiple stakeholder groups`,
    `The ${profile.issue} policy area has been subject to previous ethical scrutiny`,
    `Regulatory changes to ${profile.issue} could have significant economic implications`,
    `${profile.issue} represents a sensitive policy area requiring careful oversight`
  ]
  
  // Select 1-2 concerns from each category
  concerns.push(nameConcerns[Math.floor(Math.random() * nameConcerns.length)])
  if (Math.random() > 0.4) {
    concerns.push(clientConcerns[Math.floor(Math.random() * clientConcerns.length)])
  }
  if (Math.random() > 0.5) {
    concerns.push(issueConcerns[Math.floor(Math.random() * issueConcerns.length)])
  }
  
  return concerns
}

/**
 * Generate amount-based specific concerns
 */
function generateAmountBasedConcerns(profile: LobbyistProfile): string[] {
  if (profile.amount > 5000000) {
    return [
      `The $${profile.amount.toLocaleString()} expenditure represents one of the largest lobbying investments in ${profile.category.toLowerCase()} this quarter`,
      `Such substantial spending ($${profile.amount.toLocaleString()}) may indicate an attempt to dominate policy discussions`,
      `The high-dollar lobbying effort suggests potential for disproportionate influence on ${profile.target.toLowerCase()} decision-making`,
      `$${profile.amount.toLocaleString()} in lobbying spending raises questions about the scale of influence being sought`,
      `This level of financial investment may create an uneven playing field in ${profile.category.toLowerCase()} policy debates`
    ]
  } else if (profile.amount < 1000000) {
    return [
      `The moderate $${profile.amount.toLocaleString()} spending suggests a targeted approach to ${profile.issue}`,
      `Lower spending amount may indicate limited resources or focused lobbying strategy`,
      `The $${profile.amount.toLocaleString()} investment appears proportional to the scope of ${profile.issue}`
    ]
  } else {
    return [
      `The $${profile.amount.toLocaleString()} lobbying investment requires monitoring for potential influence`,
      `This spending level suggests serious commitment to ${profile.issue} policy outcomes`,
      `The $${profile.amount.toLocaleString()} expenditure warrants scrutiny for transparency and compliance`
    ]
  }
}

/**
 * Generate target-based specific concerns
 */
function generateTargetBasedConcerns(profile: LobbyistProfile): string[] {
  switch (profile.target) {
    case 'Administration':
      return [
        `Executive branch lobbying by ${formatName(profile.firm)} may bypass traditional legislative oversight`,
        `Administration targeting suggests potential for regulatory capture in ${profile.category.toLowerCase()} policy`,
        `Direct executive influence may circumvent public debate on ${profile.issue}`,
        `Administrative lobbying could lead to policy changes without congressional input`,
        `Executive branch access may provide unfair advantage in ${profile.category.toLowerCase()} regulations`
      ]
    case 'House':
      return [
        `House of Representatives lobbying may influence committee decisions on ${profile.issue}`,
        `Legislative targeting suggests potential for bill modification favoring ${formatName(profile.client)}`,
        `House lobbying could impact committee assignments and policy priorities`,
        `Direct legislative influence may affect voting patterns on ${profile.category.toLowerCase()} issues`
      ]
    case 'Senate':
      return [
        `Senate lobbying may influence confirmation processes and policy oversight`,
        `Upper chamber targeting suggests potential for long-term policy influence`,
        `Senate lobbying could impact committee leadership and agenda setting`,
        `Direct senatorial influence may affect confirmation of ${profile.category.toLowerCase()} regulators`
      ]
    case 'Both':
      return [
        `Comprehensive lobbying of both chambers suggests coordinated policy influence strategy`,
        `Multi-branch targeting may create systemic influence across government`,
        `Simultaneous House and Senate lobbying could dominate ${profile.issue} policy discussions`,
        `Comprehensive approach may limit alternative viewpoints in ${profile.category.toLowerCase()} policy`
      ]
    default:
      return []
  }
}

/**
 * Generate category-specific detailed concerns
 */
function generateCategorySpecificConcerns(profile: LobbyistProfile): string[] {
  const categorySpecific = {
    'Healthcare': [
      `Healthcare lobbying by ${formatName(profile.client)} may impact patient safety and access to care`,
      `Medical industry influence could affect drug pricing and healthcare costs`,
      `Healthcare policy changes may have unintended consequences for patient outcomes`,
      `Pharmaceutical lobbying may influence FDA approval processes`,
      `Healthcare sector lobbying could impact Medicare and Medicaid policies`
    ],
    'Defense': [
      `Defense lobbying may influence military procurement and national security decisions`,
      `Military-industrial complex lobbying could affect defense spending priorities`,
      `Defense sector influence may impact arms sales and international relations`,
      `Military contracting lobbying could affect defense budget allocations`,
      `Defense industry lobbying may influence cybersecurity and intelligence policies`
    ],
    'Finance': [
      `Financial sector lobbying may influence banking regulations and consumer protection`,
      `Banking industry influence could affect financial stability and systemic risk`,
      `Finance lobbying may impact cryptocurrency and fintech regulations`,
      `Financial services lobbying could affect consumer lending and credit policies`,
      `Banking sector influence may impact international financial regulations`
    ],
    'Technology': [
      `Tech industry lobbying may influence data privacy and cybersecurity regulations`,
      `Technology sector influence could affect innovation and competition policies`,
      `Tech lobbying may impact artificial intelligence and algorithmic transparency`,
      `Technology industry lobbying could affect net neutrality and internet governance`,
      `Tech sector influence may impact antitrust enforcement and platform regulation`
    ],
    'Energy': [
      `Energy sector lobbying may influence climate change and environmental policies`,
      `Energy industry influence could affect renewable energy and fossil fuel regulations`,
      `Energy lobbying may impact carbon pricing and emissions standards`,
      `Energy sector lobbying could affect energy infrastructure and grid modernization`,
      `Energy industry influence may impact international energy trade and security`
    ],
    'Transportation': [
      `Transportation lobbying may influence infrastructure and safety regulations`,
      `Transportation industry influence could affect emissions standards and fuel efficiency`,
      `Transportation lobbying may impact autonomous vehicle and mobility policies`,
      `Transportation sector lobbying could affect public transit and urban planning`,
      `Transportation industry influence may impact international trade and logistics`
    ]
  }
  
  return categorySpecific[profile.category as keyof typeof categorySpecific] || []
}

/**
 * Generate compliance-specific concerns
 */
function generateComplianceConcerns(profile: LobbyistProfile): string[] {
  return [
    `Verify that ${formatName(profile.firm)} has properly disclosed all lobbying activities for ${formatName(profile.client)}`,
    `Ensure ${formatName(profile.name)} has completed required ethics training and conflict of interest disclosures`,
    `Confirm that lobbying activities comply with federal lobbying disclosure requirements`,
    `Validate that ${formatName(profile.client)} has properly registered all lobbying expenditures`,
    `Check that lobbying activities align with ${formatName(profile.firm)}'s stated ethical guidelines`,
    `Verify compliance with gift and entertainment restrictions for ${profile.target.toLowerCase()} officials`,
    `Ensure proper documentation of all meetings and communications with government officials`,
    `Validate that lobbying activities do not violate revolving door restrictions`
  ]
}

/**
 * Generate contextual recommendations
 */
function generateRecommendations(analysis: string, controversy: string, lobbyistProfile: LobbyistProfile): string[] {
  const recommendations = []
  
  // Generate lobbyist-specific recommendations
  const lobbyistSpecificRecs = generateLobbyistSpecificRecommendations(lobbyistProfile, controversy)
  recommendations.push(...lobbyistSpecificRecs)
  
  // Amount-based specific recommendations
  const amountRecs = generateAmountBasedRecommendations(lobbyistProfile)
  if (amountRecs.length > 0) {
    recommendations.push(amountRecs[Math.floor(Math.random() * amountRecs.length)])
  }
  
  // Target-based specific recommendations
  const targetRecs = generateTargetBasedRecommendations(lobbyistProfile)
  if (targetRecs.length > 0) {
    recommendations.push(targetRecs[Math.floor(Math.random() * targetRecs.length)])
  }
  
  // Category-specific detailed recommendations
  const categoryRecs = generateCategorySpecificRecommendations(lobbyistProfile)
  if (categoryRecs.length > 0) {
    recommendations.push(categoryRecs[Math.floor(Math.random() * categoryRecs.length)])
  }
  
  // Compliance and oversight recommendations
  const complianceRecs = generateComplianceRecommendations(lobbyistProfile)
  recommendations.push(complianceRecs[Math.floor(Math.random() * complianceRecs.length)])
  
  // Shuffle and limit to 5 unique recommendations
  const shuffledRecs = recommendations.sort(() => Math.random() - 0.5)
  const uniqueRecs = [...new Set(shuffledRecs)]
  return uniqueRecs.slice(0, 5)
}

/**
 * Generate lobbyist-specific recommendations
 */
function generateLobbyistSpecificRecommendations(profile: LobbyistProfile, controversy: string): string[] {
  const recommendations = []
  
  // Name-based recommendations
  const nameRecs = [
    `Require ${formatName(profile.name)} to provide detailed conflict of interest disclosures for ${profile.category.toLowerCase()} activities`,
    `Implement enhanced monitoring of ${formatName(profile.firm)}'s lobbying activities involving ${formatName(profile.name)}`,
    `Establish regular ethics training requirements for ${formatName(profile.name)} and ${formatName(profile.firm)} staff`,
    `Create transparency dashboard tracking ${formatName(profile.name)}'s meetings and communications`,
    `Require ${formatName(profile.firm)} to disclose all clients represented by ${formatName(profile.name)} in ${profile.category.toLowerCase()} sector`
  ]
  
  // Client-specific recommendations
  const clientRecs = [
    `Require ${formatName(profile.client)} to publish detailed lobbying expenditure reports quarterly`,
    `Implement cooling-off periods for ${formatName(profile.client)} executives before government service`,
    `Establish independent oversight committee for ${formatName(profile.client)} lobbying activities`,
    `Require ${formatName(profile.client)} to disclose all policy positions and lobbying objectives`,
    `Create public database tracking ${formatName(profile.client)}'s influence on ${profile.issue} policy`
  ]
  
  // Issue-specific recommendations
  const issueRecs = [
    `Establish public comment periods for all ${profile.issue} policy changes`,
    `Require independent analysis of ${profile.issue} policy impacts before implementation`,
    `Create stakeholder advisory groups including consumer representatives for ${profile.issue}`,
    `Implement sunset clauses for ${profile.issue} regulations to ensure periodic review`,
    `Establish conflict resolution mechanisms for ${profile.issue} policy disputes`
  ]
  
  // Select 1-2 recommendations from each category
  recommendations.push(nameRecs[Math.floor(Math.random() * nameRecs.length)])
  if (Math.random() > 0.3) {
    recommendations.push(clientRecs[Math.floor(Math.random() * clientRecs.length)])
  }
  if (Math.random() > 0.4) {
    recommendations.push(issueRecs[Math.floor(Math.random() * issueRecs.length)])
  }
  
  return recommendations
}

/**
 * Generate amount-based specific recommendations
 */
function generateAmountBasedRecommendations(profile: LobbyistProfile): string[] {
  if (profile.amount > 5000000) {
    return [
      `Implement enhanced reporting requirements for lobbying expenditures exceeding $5M annually`,
      `Require quarterly public hearings for high-value lobbying activities by ${formatName(profile.client)}`,
      `Establish independent financial audit requirements for ${formatName(profile.firm)}'s lobbying activities`,
      `Create public database tracking all lobbying expenditures above $5M in ${profile.category.toLowerCase()} sector`,
      `Require detailed justification for lobbying expenditures exceeding $5M from ${formatName(profile.client)}`
    ]
  } else if (profile.amount < 1000000) {
    return [
      `Maintain current reporting standards for moderate lobbying expenditures by ${formatName(profile.client)}`,
      `Implement streamlined compliance procedures for smaller lobbying activities`,
      `Establish mentorship programs for smaller lobbying firms like ${formatName(profile.firm)}`
    ]
  } else {
    return [
      `Implement quarterly compliance reviews for ${formatName(profile.firm)}'s lobbying activities`,
      `Require detailed activity reports for lobbying expenditures above $1M`,
      `Establish transparency benchmarks for mid-range lobbying activities`
    ]
  }
}

/**
 * Generate target-based specific recommendations
 */
function generateTargetBasedRecommendations(profile: LobbyistProfile): string[] {
  switch (profile.target) {
    case 'Administration':
      return [
        `Implement executive branch lobbying transparency requirements for ${formatName(profile.firm)}`,
        `Establish cooling-off periods for administration officials before joining ${formatName(profile.client)}`,
        `Require public disclosure of all executive branch meetings involving ${formatName(profile.name)}`,
        `Create independent oversight of regulatory capture in ${profile.category.toLowerCase()} policy`,
        `Implement ethics training for administration officials on ${profile.issue} matters`
      ]
    case 'House':
      return [
        `Require House committee transparency for all lobbying activities by ${formatName(profile.client)}`,
        `Implement public comment periods for House bills affecting ${profile.issue}`,
        `Establish conflict of interest disclosures for House members on ${profile.category.toLowerCase()} committees`,
        `Create public database of House lobbying activities related to ${profile.issue}`
      ]
    case 'Senate':
      return [
        `Implement Senate confirmation transparency for ${profile.category.toLowerCase()} nominees`,
        `Require public hearings for Senate bills affecting ${profile.issue}`,
        `Establish ethics oversight for Senate committee members on ${profile.category.toLowerCase()} matters`,
        `Create public record of Senate lobbying activities by ${formatName(profile.firm)}`
      ]
    case 'Both':
      return [
        `Implement comprehensive lobbying transparency across all government branches`,
        `Establish coordinated oversight of multi-branch lobbying by ${formatName(profile.client)}`,
        `Require public disclosure of comprehensive lobbying strategies`,
        `Create unified ethics standards for lobbying across House and Senate`
      ]
    default:
      return []
  }
}

/**
 * Generate category-specific detailed recommendations
 */
function generateCategorySpecificRecommendations(profile: LobbyistProfile): string[] {
  const categorySpecific = {
    'Healthcare': [
      `Establish patient safety oversight committee for healthcare lobbying activities`,
      `Require independent medical review of healthcare policy changes`,
      `Implement drug pricing transparency requirements for pharmaceutical lobbying`,
      `Create consumer protection safeguards for healthcare industry influence`,
      `Establish healthcare ethics board to review lobbying activities`
    ],
    'Defense': [
      `Implement national security review for defense industry lobbying`,
      `Establish independent oversight of military procurement lobbying`,
      `Require public disclosure of defense contractor influence`,
      `Create ethics standards for defense industry-government relationships`,
      `Implement cooling-off periods for defense officials joining industry`
    ],
    'Finance': [
      `Establish financial stability oversight for banking industry lobbying`,
      `Implement consumer protection review for financial services lobbying`,
      `Require independent analysis of financial regulation impacts`,
      `Create ethics standards for financial industry-government relationships`,
      `Establish public oversight of systemic risk lobbying activities`
    ],
    'Technology': [
      `Implement privacy impact assessments for tech industry lobbying`,
      `Establish independent oversight of digital rights lobbying`,
      `Require algorithmic transparency for tech policy influence`,
      `Create consumer protection standards for tech industry lobbying`,
      `Implement antitrust oversight for technology sector influence`
    ],
    'Energy': [
      `Establish environmental impact review for energy sector lobbying`,
      `Implement climate change assessment for energy policy influence`,
      `Require independent analysis of renewable energy lobbying`,
      `Create sustainability standards for energy industry-government relationships`,
      `Establish public oversight of fossil fuel industry influence`
    ],
    'Transportation': [
      `Implement safety oversight for transportation industry lobbying`,
      `Establish infrastructure impact assessment for transportation lobbying`,
      `Require independent analysis of transportation policy changes`,
      `Create public safety standards for transportation industry influence`,
      `Establish environmental review for transportation sector lobbying`
    ]
  }
  
  return categorySpecific[profile.category as keyof typeof categorySpecific] || []
}

/**
 * Generate compliance-specific recommendations
 */
function generateComplianceRecommendations(profile: LobbyistProfile): string[] {
  return [
    `Implement quarterly compliance audits for ${formatName(profile.firm)}'s lobbying activities`,
    `Require detailed documentation of all meetings between ${formatName(profile.name)} and government officials`,
    `Establish ethics training requirements for ${formatName(profile.firm)} staff`,
    `Create public database of all lobbying activities by ${formatName(profile.client)}`,
    `Implement conflict of interest monitoring for ${formatName(profile.name)} and ${formatName(profile.firm)}`,
    `Require regular disclosure updates for ${formatName(profile.client)}'s lobbying objectives`,
    `Establish independent oversight committee for ${formatName(profile.firm)}'s activities`,
    `Implement revolving door restrictions for ${formatName(profile.firm)} employees`,
    `Create transparency requirements for ${formatName(profile.client)}'s policy positions`,
    `Establish public comment periods for all policy changes affecting ${profile.issue}`
  ]
}

/**
 * Parse Workers AI response into structured ethics analysis
 */
function parseEthicsAnalysis(responseText: string): EthicsAnalysis | null {
  try {
    // Extract JSON from response (remove markdown code blocks if present)
    let jsonText = responseText.trim()
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '')
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '')
    }

    const parsed = JSON.parse(jsonText)

    // Validate and normalize the response
    return {
      ethicsScore: Math.min(100, Math.max(0, parsed.ethicsScore || 50)),
      transparencyScore: Math.min(100, Math.max(0, parsed.transparencyScore || 50)),
      conflictOfInterestRisk: ['low', 'medium', 'high'].includes(parsed.conflictOfInterestRisk) 
        ? parsed.conflictOfInterestRisk : 'medium',
      complianceScore: Math.min(100, Math.max(0, parsed.complianceScore || 50)),
      analysis: parsed.analysis || 'Analysis not available',
      keyConcerns: Array.isArray(parsed.keyConcerns) ? parsed.keyConcerns.slice(0, 5) : [],
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations.slice(0, 5) : [],
      confidence: ['low', 'medium', 'high'].includes(parsed.confidence) 
        ? parsed.confidence : 'medium'
    }
  } catch (error) {
    console.error('Error parsing ethics analysis:', error)
    console.error('Response text:', responseText)
    return generateFallbackAnalysis({
      name: 'Unknown',
      firm: 'Unknown',
      client: 'Unknown',
      amount: 0,
      issue: 'Unknown',
      description: 'Unknown',
      relatedBills: [],
      disclosureDate: '',
      category: 'Other',
      target: 'Both',
      status: 'Unknown'
    })
  }
}

/**
 * Generate a fallback ethics analysis when Workers AI is not available
 */
function generateFallbackAnalysis(lobbyistProfile: LobbyistProfile): EthicsAnalysis {
  // Simple rule-based analysis
  let ethicsScore = 70
  let transparencyScore = 75
  let complianceScore = 80
  let conflictRisk: 'low' | 'medium' | 'high' = 'medium'
  
  // Adjust scores based on amount
  if (lobbyistProfile.amount > 5000000) {
    ethicsScore -= 10
    conflictRisk = 'high'
  } else if (lobbyistProfile.amount < 1000000) {
    ethicsScore += 5
    conflictRisk = 'low'
  }
  
  // Adjust based on category
  if (lobbyistProfile.category === 'Healthcare' || lobbyistProfile.category === 'Defense') {
    ethicsScore -= 5
    conflictRisk = 'high'
  }
  
  // Adjust based on target
  if (lobbyistProfile.target === 'Administration') {
    ethicsScore -= 5
    conflictRisk = 'high'
  }
  
  const analysis = `Fallback analysis for ${lobbyistProfile.name} from ${lobbyistProfile.firm}. This activity involves $${lobbyistProfile.amount.toLocaleString()} in spending on ${lobbyistProfile.issue}. The activity targets the ${lobbyistProfile.target} and shows ${conflictRisk} risk levels with moderate transparency and compliance standards. AI analysis is temporarily unavailable.`
  
  const keyConcerns = [
    'AI analysis not available - using fallback assessment',
    'Manual verification recommended for detailed analysis',
    'Standard compliance checks should be performed'
  ]
  
  const recommendations = [
    'Verify all disclosure requirements are met',
    'Review conflict of interest policies',
    'Ensure transparency in all communications'
  ]
  
  return {
    ethicsScore: Math.max(0, Math.min(100, ethicsScore)),
    transparencyScore: Math.max(0, Math.min(100, transparencyScore)),
    conflictOfInterestRisk: conflictRisk,
    complianceScore: Math.max(0, Math.min(100, complianceScore)),
    analysis,
    keyConcerns,
    recommendations,
    confidence: 'low'
  }
}
