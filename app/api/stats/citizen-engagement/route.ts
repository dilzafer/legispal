import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { dashboardCacheService } from '@/lib/firebase'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function GET(request: NextRequest) {
  try {
    // Try cache first
    const cached = await dashboardCacheService.getCachedDashboardStats()
    if (cached && cached.citizenEngagement && cached.citizenEngagement.totalComments > 0) {
      console.log('✅ Using cached citizen engagement data')
      return NextResponse.json({
        count: cached.citizenEngagement.totalComments,
        formatted: `${(cached.citizenEngagement.totalComments / 1000).toFixed(1)}K`,
        change: cached.citizenEngagement.trend === 'up' ? `+${cached.citizenEngagement.percentChange}%` : 
                cached.citizenEngagement.trend === 'down' ? `-${cached.citizenEngagement.percentChange}%` : '0%',
        timeframe: 'vs last month',
        lastUpdated: cached.cachedAt.toDate().toISOString(),
        source: 'cached',
        _fromCache: true,
      })
    }

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      return NextResponse.json({
        count: 89500,
        formatted: '89.5K',
        change: '+5%',
        timeframe: 'vs last month',
        lastUpdated: new Date().toISOString(),
        source: 'mock'
      })
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const prompt = `
    Please provide accurate, real-time information about citizen engagement with government and political processes in the United States for the current month.

    Requirements:
    - Return ONLY a JSON object with this exact structure:
    {
      "count": number (total engagement count, no commas),
      "formatted": "string (e.g., '89.5K' or '1.2M')",
      "change": "string (e.g., '+5%' or '-12%')",
      "timeframe": "string (e.g., 'vs last month' or 'vs same period last year')",
      "lastUpdated": "ISO date string",
      "source": "string describing the source"
    }

    - The count should represent citizen engagement metrics such as:
      * Congressional contact (calls, emails, letters to representatives)
      * Public participation in hearings and town halls
      * Civic engagement platforms and government websites
      * Voting registration activities
      * Public comment submissions on regulations
    - The change should reflect recent trends (monthly or yearly comparison)
    - Use the most recent data available from the past week
    - Be specific about the timeframe for the change percentage
    - Focus on measurable civic participation activities

    Return ONLY the JSON object, no other text.
    `

    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [{ text: prompt }]
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
      const percentChange = parseInt(parsedResponse.change?.replace(/[^0-9-]/g, '') || '5')
      const trend = percentChange > 0 ? 'up' : percentChange < 0 ? 'down' : 'stable'
      
      await dashboardCacheService.cacheCitizenEngagement(
        parsedResponse.count || 89500,
        Math.floor((parsedResponse.count || 89500) / 100),
        ['Healthcare', 'Climate', 'Economy'],
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
      const countMatch = text.match(/(\d+(?:\.\d+)?)\s*[KM]?/i)
      const changeMatch = text.match(/([+-]\d+(?:\.\d+)?%)/i)
      
      let count = 89500
      let formatted = '89.5K'
      
      if (countMatch) {
        const value = parseFloat(countMatch[1])
        const unit = text.match(/\d+(?:\.\d+)?\s*([KM])/i)?.[1]?.toUpperCase()
        
        if (unit === 'M') {
          count = value * 1000000
          formatted = `${value.toFixed(1)}M`
        } else if (unit === 'K') {
          count = value * 1000
          formatted = `${value.toFixed(1)}K`
        } else {
          count = value
          formatted = value.toLocaleString()
        }
      }
      
      return NextResponse.json({
        count,
        formatted,
        change: changeMatch ? changeMatch[1] : '+5%',
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
      count: 89500,
      formatted: '89.5K',
      change: '+5%',
      timeframe: 'vs last month',
      lastUpdated: new Date().toISOString(),
      source: 'fallback',
      error: 'API unavailable'
    }, { status: 500 })
  }
}
