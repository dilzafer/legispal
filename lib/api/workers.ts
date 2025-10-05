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
  
  // Controversy-based concerns with randomization
  const controversyConcerns = {
    'high': [
      'High controversy level indicates significant ethical concerns',
      'Serious ethical implications require immediate attention',
      'Major transparency and compliance issues identified',
      'Significant risk of inappropriate influence detected'
    ],
    'medium': [
      'Moderate controversy level requires careful monitoring',
      'Some ethical concerns warrant ongoing scrutiny',
      'Mixed transparency indicators need verification',
      'Potential compliance issues require review'
    ],
    'low': [
      'Low controversy level but standard checks recommended',
      'Minimal concerns but due diligence still required',
      'Generally compliant but verification advised',
      'Low risk profile with routine monitoring suggested'
    ]
  }
  
  const controversyLevel = controversy.toLowerCase() as keyof typeof controversyConcerns
  const selectedConcern = controversyConcerns[controversyLevel][Math.floor(Math.random() * controversyConcerns[controversyLevel].length)]
  concerns.push(selectedConcern)
  
  // Amount-based concerns
  if (lobbyistProfile.amount > 5000000) {
    const highAmountConcerns = [
      'High spending amount may indicate disproportionate influence',
      'Significant financial investment raises access concerns',
      'Large lobbying expenditure suggests potential undue influence',
      'Substantial spending may create perception of favoritism'
    ]
    concerns.push(highAmountConcerns[Math.floor(Math.random() * highAmountConcerns.length)])
  } else if (lobbyistProfile.amount < 1000000) {
    const lowAmountConcerns = [
      'Moderate spending level suggests focused approach',
      'Reasonable expenditure indicates targeted lobbying',
      'Lower spending amount shows measured approach'
    ]
    if (Math.random() > 0.5) {
      concerns.push(lowAmountConcerns[Math.floor(Math.random() * lowAmountConcerns.length)])
    }
  }
  
  // Target-based concerns
  if (lobbyistProfile.target === 'Administration') {
    const adminConcerns = [
      'Executive branch targeting may raise access concerns',
      'Administration lobbying requires enhanced transparency',
      'Executive influence may bypass legislative oversight',
      'Administrative access could create perception issues'
    ]
    concerns.push(adminConcerns[Math.floor(Math.random() * adminConcerns.length)])
  }
  
  // Category-based concerns
  const categoryConcerns = {
    'Healthcare': [
      'Sensitive healthcare policy requires enhanced scrutiny',
      'Healthcare lobbying impacts public health outcomes',
      'Medical industry influence requires careful evaluation'
    ],
    'Defense': [
      'Defense sector lobbying requires heightened oversight',
      'Military-industrial influence needs careful monitoring',
      'National security implications require scrutiny'
    ],
    'Finance': [
      'Financial sector lobbying requires enhanced oversight',
      'Banking industry influence needs careful evaluation',
      'Financial policy lobbying impacts economic stability'
    ],
    'Technology': [
      'Tech sector lobbying requires privacy considerations',
      'Digital policy influence needs careful evaluation',
      'Technology industry lobbying impacts innovation'
    ],
    'Energy': [
      'Energy sector lobbying requires environmental scrutiny',
      'Energy policy influence needs careful evaluation',
      'Energy industry lobbying impacts climate policy'
    ]
  }
  
  const categoryConcern = categoryConcerns[lobbyistProfile.category as keyof typeof categoryConcerns]
  if (categoryConcern && Math.random() > 0.3) {
    concerns.push(categoryConcern[Math.floor(Math.random() * categoryConcern.length)])
  }
  
  // Always include compliance check
  const complianceConcerns = [
    'Verify compliance with all disclosure requirements',
    'Ensure adherence to lobbying regulations',
    'Confirm proper documentation and reporting',
    'Validate regulatory compliance standards'
  ]
  concerns.push(complianceConcerns[Math.floor(Math.random() * complianceConcerns.length)])
  
  return concerns.slice(0, 4) // Limit to 4 concerns
}

/**
 * Generate contextual recommendations
 */
function generateRecommendations(analysis: string, controversy: string, lobbyistProfile: LobbyistProfile): string[] {
  const recommendations = []
  
  // Base recommendations with randomization
  const baseRecommendations = [
    'Ensure all lobbying activities are properly disclosed',
    'Review conflict of interest policies and procedures',
    'Implement enhanced transparency measures',
    'Conduct regular compliance audits',
    'Maintain detailed documentation of all activities',
    'Establish clear ethical guidelines',
    'Monitor potential conflicts of interest',
    'Ensure public interest alignment'
  ]
  
  // Select 2-3 base recommendations randomly
  const shuffledBase = baseRecommendations.sort(() => Math.random() - 0.5)
  recommendations.push(...shuffledBase.slice(0, 2 + Math.floor(Math.random() * 2)))
  
  // Controversy-specific recommendations
  if (controversy.toLowerCase() === 'high') {
    const highControversyRecs = [
      'Implement enhanced transparency measures due to high controversy',
      'Establish independent oversight mechanisms',
      'Conduct comprehensive ethics review',
      'Implement stricter compliance monitoring',
      'Consider third-party ethics assessment'
    ]
    recommendations.push(highControversyRecs[Math.floor(Math.random() * highControversyRecs.length)])
  }
  
  // Amount-specific recommendations
  if (lobbyistProfile.amount > 5000000) {
    const highAmountRecs = [
      'Consider additional oversight for high-value lobbying activities',
      'Implement enhanced reporting requirements',
      'Establish spending transparency measures',
      'Conduct independent financial audits'
    ]
    recommendations.push(highAmountRecs[Math.floor(Math.random() * highAmountRecs.length)])
  }
  
  // Target-specific recommendations
  if (lobbyistProfile.target === 'Administration') {
    const adminRecs = [
      'Monitor executive branch access and influence patterns',
      'Implement administrative lobbying oversight',
      'Ensure executive transparency standards',
      'Monitor potential regulatory capture'
    ]
    recommendations.push(adminRecs[Math.floor(Math.random() * adminRecs.length)])
  }
  
  // Category-specific recommendations
  const categoryRecs = {
    'Healthcare': [
      'Ensure patient safety considerations',
      'Monitor healthcare industry influence',
      'Assess public health impact'
    ],
    'Defense': [
      'Monitor national security implications',
      'Assess military-industrial influence',
      'Ensure defense contractor oversight'
    ],
    'Finance': [
      'Monitor systemic risk implications',
      'Assess consumer protection impact',
      'Ensure financial stability considerations'
    ],
    'Technology': [
      'Monitor privacy and data protection',
      'Assess innovation impact',
      'Ensure digital rights considerations'
    ],
    'Energy': [
      'Monitor environmental impact',
      'Assess climate policy implications',
      'Ensure sustainable energy considerations'
    ]
  }
  
  const categoryRec = categoryRecs[lobbyistProfile.category as keyof typeof categoryRecs]
  if (categoryRec && Math.random() > 0.4) {
    recommendations.push(categoryRec[Math.floor(Math.random() * categoryRec.length)])
  }
  
  return recommendations.slice(0, 5) // Limit to 5 recommendations
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
