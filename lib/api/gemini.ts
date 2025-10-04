/**
 * Gemini AI Integration for Bill Analysis
 * Uses Google's Gemini API with grounding for accurate legislative analysis
 * Documentation: https://ai.google.dev/gemini-api/docs/google-search
 */

export interface BillAnalysis {
  truthScore: number
  aiConfidence: number
  keyProvisions: string[]
  hiddenImplications: string[]
  factCheck: Array<{
    label: string
    percentage: number
    color: string
  }>
  publicSentiment: {
    democratSupport: number
    republicanSupport: number
    argumentsFor: string
    argumentsAgainst: string
  }
  lobbyingInsights?: {
    topIndustries: string[]
    estimatedSpending: string
  }
  impactAnalysis?: {
    fiscalNote: string
    beneficiaries: string[]
    payers: string[]
  }
}

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta'

/**
 * Get Gemini API key from environment
 */
function getGeminiApiKey(): string {
  return process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.Gemini_API_key || ''
}

/**
 * Analyze a bill using Gemini AI with Google Search grounding
 * @param billTitle The bill title
 * @param billNumber The bill number (e.g., "H.R.2024")
 * @param billText The bill text or summary
 * @param sponsor The bill sponsor
 */
export async function analyzeBillWithGemini(
  billTitle: string,
  billNumber: string,
  billText: string,
  sponsor?: string
): Promise<BillAnalysis | null> {
  try {
    const apiKey = getGeminiApiKey()
    if (!apiKey) {
      console.error('Gemini API key not found')
      return null
    }

    // Use Gemini 2.0 Flash with grounding for factual accuracy
    const model = 'gemini-2.0-flash-exp'

    const prompt = createAnalysisPrompt(billTitle, billNumber, billText, sponsor)

    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.4, // Lower temperature for more factual responses
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
      tools: [{
        google_search: {} // Enable Google Search grounding (note: underscore, not camelCase)
      }]
    }

    const response = await fetch(
      `${GEMINI_API_BASE}/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Gemini API error:', response.status, errorText)
      return null
    }

    const data = await response.json()

    // Extract the generated text
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text
    if (!generatedText) {
      console.error('No text generated from Gemini')
      return null
    }

    // Parse the structured response
    return parseGeminiAnalysis(generatedText)
  } catch (error) {
    console.error('Error analyzing bill with Gemini:', error)
    return null
  }
}

/**
 * Create a detailed prompt for bill analysis
 */
function createAnalysisPrompt(
  billTitle: string,
  billNumber: string,
  billText: string,
  sponsor?: string
): string {
  return `You are an expert legislative analyst. Analyze the following US bill and provide a comprehensive, factual assessment. Use Google Search to find recent news, voting records, and public opinion data about this bill.

BILL: ${billNumber} - ${billTitle}
${sponsor ? `SPONSOR: ${sponsor}` : ''}

BILL TEXT/SUMMARY:
${billText}

Please provide a JSON response with the following structure:

{
  "truthScore": <number 0-100, based on factual accuracy of bill claims and transparency>,
  "aiConfidence": <number 0-100, your confidence in this analysis>,
  "keyProvisions": [
    "<provision 1>",
    "<provision 2>",
    "<provision 3>"
  ],
  "hiddenImplications": [
    "<implication 1 that may not be obvious>",
    "<implication 2 that may not be obvious>"
  ],
  "factCheck": [
    {
      "label": "<claim being fact-checked>",
      "percentage": <0-100>,
      "color": "<#10b981 for verified, #f59e0b for uncertain, #ef4444 for disputed>"
    }
  ],
  "publicSentiment": {
    "democratSupport": <percentage 0-100>,
    "republicanSupport": <percentage 0-100>,
    "argumentsFor": "<main argument supporting the bill>",
    "argumentsAgainst": "<main argument opposing the bill>"
  },
  "lobbyingInsights": {
    "topIndustries": ["<industry 1>", "<industry 2>", "<industry 3>"],
    "estimatedSpending": "<estimated lobbying spending>"
  },
  "impactAnalysis": {
    "fiscalNote": "<estimated fiscal impact>",
    "beneficiaries": ["<group 1>", "<group 2>", "<group 3>"],
    "payers": ["<group 1>", "<group 2>", "<group 3>"]
  }
}

IMPORTANT INSTRUCTIONS:
1. Use Google Search to find the most recent and accurate information
2. Base your analysis on factual data, not speculation
3. For partisan support percentages, use actual voting records or polling data if available
4. Truth score should reflect: factual accuracy (40%), transparency (30%), evidence quality (30%)
5. AI confidence should reflect the quality and quantity of data available
6. Return ONLY the JSON object, no additional text

JSON Response:`
}

/**
 * Parse Gemini's response into structured analysis
 */
function parseGeminiAnalysis(responseText: string): BillAnalysis | null {
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
      truthScore: Math.min(100, Math.max(0, parsed.truthScore || 50)),
      aiConfidence: Math.min(100, Math.max(0, parsed.aiConfidence || 50)),
      keyProvisions: Array.isArray(parsed.keyProvisions) ? parsed.keyProvisions.slice(0, 5) : [],
      hiddenImplications: Array.isArray(parsed.hiddenImplications) ? parsed.hiddenImplications.slice(0, 3) : [],
      factCheck: Array.isArray(parsed.factCheck) ? parsed.factCheck.slice(0, 3) : [],
      publicSentiment: {
        democratSupport: Math.min(100, Math.max(0, parsed.publicSentiment?.democratSupport || 50)),
        republicanSupport: Math.min(100, Math.max(0, parsed.publicSentiment?.republicanSupport || 50)),
        argumentsFor: parsed.publicSentiment?.argumentsFor || 'No data available',
        argumentsAgainst: parsed.publicSentiment?.argumentsAgainst || 'No data available'
      },
      lobbyingInsights: parsed.lobbyingInsights,
      impactAnalysis: parsed.impactAnalysis
    }
  } catch (error) {
    console.error('Error parsing Gemini analysis:', error)
    console.error('Response text:', responseText)
    return null
  }
}

/**
 * Generate a quick summary of a bill using Gemini
 */
export async function generateBillSummary(
  billTitle: string,
  billText: string,
  maxLength: number = 200
): Promise<string> {
  try {
    const apiKey = getGeminiApiKey()
    if (!apiKey) return billText.substring(0, maxLength) + '...'

    const model = 'gemini-2.0-flash-exp'

    const prompt = `Summarize this bill in ${maxLength} characters or less. Be concise and factual.

BILL: ${billTitle}

TEXT:
${billText.substring(0, 2000)}

Summary:`

    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 100,
      }
    }

    const response = await fetch(
      `${GEMINI_API_BASE}/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      }
    )

    if (!response.ok) return billText.substring(0, maxLength) + '...'

    const data = await response.json()
    const summary = data.candidates?.[0]?.content?.parts?.[0]?.text || billText

    return summary.substring(0, maxLength) + (summary.length > maxLength ? '...' : '')
  } catch (error) {
    console.error('Error generating summary:', error)
    return billText.substring(0, maxLength) + '...'
  }
}

/**
 * Analyze partisan polarization of a bill
 */
export async function analyzePolarization(
  billTitle: string,
  billNumber: string,
  billText: string
): Promise<{
  polarizationScore: number
  democratSupport: number
  republicanSupport: number
  keyDivisions: string[]
} | null> {
  try {
    const apiKey = getGeminiApiKey()
    if (!apiKey) return null

    const model = 'gemini-2.0-flash-exp'

    const prompt = `Analyze the partisan polarization of this bill. Use Google Search to find voting records and public statements.

BILL: ${billNumber} - ${billTitle}

TEXT:
${billText.substring(0, 2000)}

Return JSON with:
{
  "polarizationScore": <0-100, where 100 is extremely polarized>,
  "democratSupport": <percentage 0-100>,
  "republicanSupport": <percentage 0-100>,
  "keyDivisions": ["<division point 1>", "<division point 2>"]
}

JSON Response:`

    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 500,
      },
      tools: [{
        google_search: {}
      }]
    }

    const response = await fetch(
      `${GEMINI_API_BASE}/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      }
    )

    if (!response.ok) return null

    const data = await response.json()
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!responseText) return null

    // Parse JSON response
    let jsonText = responseText.trim()
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '')
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '')
    }

    return JSON.parse(jsonText)
  } catch (error) {
    console.error('Error analyzing polarization:', error)
    return null
  }
}
