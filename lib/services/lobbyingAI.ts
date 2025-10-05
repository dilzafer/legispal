/**
 * Gemini AI Service for Lobbying Insights
 * Uses lightweight Gemini Flash model for factual, brief text generation
 */

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta'

function getGeminiApiKey(): string {
  return process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY || ''
}

/**
 * Generate a brief summary of lobbying activity
 */
export async function generateActivitySummary(
  client: string,
  issue: string,
  description: string,
  amount: number
): Promise<string> {
  try {
    const apiKey = getGeminiApiKey()
    if (!apiKey) {
      console.warn('⚠️  Gemini API key not configured')
      return description.substring(0, 150) + '...'
    }

    const model = 'gemini-2.0-flash-exp'

    const prompt = `Summarize this lobbying activity in 1-2 concise sentences. Be factual and objective.

Client: ${client}
Issue: ${issue}
Amount: $${amount.toLocaleString()}
Description: ${description.substring(0, 500)}

Provide a brief, factual summary (max 100 words):`

    const requestBody = {
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.3, // Low temperature for factual accuracy
        maxOutputTokens: 150,
      }
    }

    const response = await fetch(
      `${GEMINI_API_BASE}/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      }
    )

    if (!response.ok) {
      console.error('Gemini API error:', response.status)
      return description.substring(0, 150) + '...'
    }

    const data = await response.json()
    const summary = data.candidates?.[0]?.content?.parts?.[0]?.text || description

    return summary.trim()
  } catch (error) {
    console.error('Error generating activity summary:', error)
    return description.substring(0, 150) + '...'
  }
}

/**
 * Analyze lobbying impact on legislation
 */
export async function analyzeLobbyingImpact(
  client: string,
  issue: string,
  amount: number,
  relatedBills: string[]
): Promise<string> {
  try {
    const apiKey = getGeminiApiKey()
    if (!apiKey) {
      return 'Analysis unavailable - API key not configured'
    }

    const model = 'gemini-2.0-flash-exp'

    const prompt = `Analyze the potential impact of this lobbying activity. Be factual and objective.

Client: ${client}
Issue: ${issue}
Amount: $${amount.toLocaleString()}
Related Bills: ${relatedBills.join(', ') || 'None specified'}

Provide a brief analysis (2-3 sentences) of:
1. What this lobbying effort likely aims to achieve
2. The potential legislative impact

Be factual and avoid speculation:`

    const requestBody = {
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 200,
      },
      tools: [{
        google_search: {} // Enable grounding for factual accuracy
      }]
    }

    const response = await fetch(
      `${GEMINI_API_BASE}/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      }
    )

    if (!response.ok) {
      return 'Analysis unavailable'
    }

    const data = await response.json()
    const analysis = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Analysis unavailable'

    return analysis.trim()
  } catch (error) {
    console.error('Error analyzing lobbying impact:', error)
    return 'Analysis unavailable'
  }
}

/**
 * Generate trend analysis for lobbying data
 */
export async function generateTrendAnalysis(
  totalSpending: number,
  topIssues: Array<{ issue: string; count: number }>,
  timeframe: string
): Promise<string> {
  try {
    const apiKey = getGeminiApiKey()
    if (!apiKey) {
      return 'Trend analysis unavailable - API key not configured'
    }

    const model = 'gemini-2.0-flash-exp'

    const issuesText = topIssues.map(i => `${i.issue} (${i.count} activities)`).join(', ')

    const prompt = `Analyze lobbying trends based on this data. Be factual and data-driven.

Timeframe: ${timeframe}
Total Spending: $${totalSpending.toLocaleString()}
Top Issues: ${issuesText}

Provide a brief analysis (2-3 sentences) highlighting:
1. Key spending patterns
2. Most active issue areas
3. What this indicates about lobbying priorities

Be factual and avoid speculation:`

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
        body: JSON.stringify(requestBody)
      }
    )

    if (!response.ok) {
      return `Lobbying spending reached $${totalSpending.toLocaleString()} during ${timeframe}, with primary focus on ${topIssues[0]?.issue || 'various issues'}.`
    }

    const data = await response.json()
    const analysis = data.candidates?.[0]?.content?.parts?.[0]?.text ||
      `Lobbying spending reached $${totalSpending.toLocaleString()} during ${timeframe}.`

    return analysis.trim()
  } catch (error) {
    console.error('Error generating trend analysis:', error)
    return `Lobbying spending reached $${totalSpending.toLocaleString()} during ${timeframe}.`
  }
}

/**
 * Generate brief explanation of a lobbying firm's focus
 */
export async function explainLobbyingFirm(
  firmName: string,
  clientCount: number,
  topIssues: string[]
): Promise<string> {
  try {
    const apiKey = getGeminiApiKey()
    if (!apiKey) {
      return `${firmName} represents ${clientCount} clients focusing on ${topIssues.join(', ')}.`
    }

    const model = 'gemini-2.0-flash-exp'

    const prompt = `Provide a brief, factual description of this lobbying firm's work.

Firm: ${firmName}
Number of Clients: ${clientCount}
Key Issue Areas: ${topIssues.join(', ')}

Provide 1-2 sentences describing what this firm specializes in. Be factual:`

    const requestBody = {
      contents: [{
        parts: [{ text: prompt }]
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      }
    )

    if (!response.ok) {
      return `${firmName} represents ${clientCount} clients focusing on ${topIssues.join(', ')}.`
    }

    const data = await response.json()
    const description = data.candidates?.[0]?.content?.parts?.[0]?.text ||
      `${firmName} represents ${clientCount} clients.`

    return description.trim()
  } catch (error) {
    console.error('Error explaining lobbying firm:', error)
    return `${firmName} represents ${clientCount} clients.`
  }
}
