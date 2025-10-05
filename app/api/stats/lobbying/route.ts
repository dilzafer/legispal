import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { dashboardCacheService } from '@/lib/firebase'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function GET(request: NextRequest) {
  try {
    // Try cache first
    const cached = await dashboardCacheService.getCachedDashboardStats()
    if (cached && cached.lobbyingActivity && cached.lobbyingActivity.totalSpent > 0) {
      console.log('✅ Using cached lobbying data')
      return NextResponse.json({
        amount: cached.lobbyingActivity.totalSpent,
        formatted: `$${(cached.lobbyingActivity.totalSpent / 1000000).toFixed(1)}M`,
        change: cached.lobbyingActivity.trend === 'up' ? `+${cached.lobbyingActivity.percentChange}%` : 
                cached.lobbyingActivity.trend === 'down' ? `-${cached.lobbyingActivity.percentChange}%` : '0%',
        timeframe: 'vs last month',
        lastUpdated: cached.cachedAt.toDate().toISOString(),
        source: 'cached',
        _fromCache: true,
      })
    }

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      return NextResponse.json({
        amount: 45200000,
        formatted: '$45.2M',
        change: '+23%',
        timeframe: 'vs last month',
        lastUpdated: new Date().toISOString(),
        source: 'mock'
      })
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const prompt = `
    Please provide accurate, real-time information about lobbying spending in the United States for the current month.

    Requirements:
    - Return ONLY a JSON object with this exact structure:
    {
      "amount": number (total amount in dollars, no commas),
      "formatted": "string (e.g., '$45.2M' or '$1.2B')",
      "change": "string (e.g., '+23%' or '-8%')",
      "timeframe": "string (e.g., 'vs last month' or 'vs same month last year')",
      "lastUpdated": "ISO date string",
      "source": "string describing the source"
    }

    - The amount should be the total lobbying spending for the current month
    - Include federal lobbying data from the Lobbying Disclosure Act database
    - The change should reflect recent trends (monthly or yearly comparison)
    - Use the most recent data available from the past week
    - Be specific about the timeframe for the change percentage
    - Focus on registered lobbying activity, not campaign contributions

    Return ONLY the JSON object, no other text.
    `

    const result = await model.generateContent({
      contents: [{
        parts: [{ text: prompt }]
      }],
      tools: [{
        googleSearch: {}
      }],
      generationConfig: {
        temperature: 0.3,
        topP: 0.8,
        topK: 40
      }
    })

    const response = await result.response
    const text = response.text()
    
    // Extract grounding metadata if available
    const groundingMetadata = result.response.candidates?.[0]?.groundingMetadata

    // Clean the text by removing markdown code blocks if present
    let cleanText = text.trim()
    if (cleanText.startsWith('```json') || cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '')
    }

    try {
      const parsedResponse = JSON.parse(cleanText)
      
      // Cache the result
      const percentChange = parseInt(parsedResponse.change?.replace(/[^0-9-]/g, '') || '23')
      const trend = percentChange > 0 ? 'up' : percentChange < 0 ? 'down' : 'stable'
      
      await dashboardCacheService.cacheLobbyingActivity(
        parsedResponse.amount || 45200000,
        Math.floor(Math.random() * 500) + 100,
        ['Healthcare', 'Technology', 'Energy'],
        trend as 'up' | 'down' | 'stable',
        Math.abs(percentChange)
      )
      
      return NextResponse.json({
        ...parsedResponse,
        groundingMetadata: groundingMetadata ? {
          webSearchQueries: groundingMetadata.webSearchQueries || [],
          sourceCount: groundingMetadata.groundingChunks?.length || 0
        } : null
      })
    } catch (parseError) {
      console.error('Error parsing Gemini response as JSON:', parseError)
      console.log('Raw response text:', text)
      
      // Fallback to extracting numbers from text
      const amountMatch = text.match(/\$?(\d+(?:\.\d+)?)\s*[BMK]?/i)
      const changeMatch = text.match(/([+-]\d+(?:\.\d+)?%)/i)
      
      let amount = 45200000
      let formatted = '$45.2M'
      
      if (amountMatch) {
        const value = parseFloat(amountMatch[1])
        const unit = text.match(/\$?\d+(?:\.\d+)?\s*([BMK])/i)?.[1]?.toUpperCase()
        
        if (unit === 'B') {
          amount = value * 1000000000
          formatted = `$${(value).toFixed(1)}B`
        } else if (unit === 'M') {
          amount = value * 1000000
          formatted = `$${(value).toFixed(1)}M`
        } else if (unit === 'K') {
          amount = value * 1000
          formatted = `$${(value).toFixed(1)}K`
        } else {
          amount = value
          formatted = `$${value.toLocaleString()}`
        }
      }
      
      return NextResponse.json({
        amount,
        formatted,
        change: changeMatch ? changeMatch[1] : '+23%',
        timeframe: 'vs last month',
        lastUpdated: new Date().toISOString(),
        source: 'AI extracted from response',
        rawText: text,
        groundingMetadata: groundingMetadata ? {
          webSearchQueries: groundingMetadata.webSearchQueries || [],
          sourceCount: groundingMetadata.groundingChunks?.length || 0
        } : null
      })
    }

  } catch (error) {
    console.error('Error calling Gemini API:', error)
    return NextResponse.json({
      amount: 45200000,
      formatted: '$45.2M',
      change: '+23%',
      timeframe: 'vs last month',
      lastUpdated: new Date().toISOString(),
      source: 'fallback',
      error: 'API unavailable'
    }, { status: 500 })
  }
}
