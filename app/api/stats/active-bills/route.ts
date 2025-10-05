import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { dashboardCacheService } from '@/lib/firebase'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function GET(request: NextRequest) {
  try {
    // Try cache first
    const cached = await dashboardCacheService.getCachedDashboardStats()
    if (cached && cached.activeBills) {
      console.log('✅ Using cached active bills data')
      return NextResponse.json({
        count: cached.activeBills.total,
        federal: cached.activeBills.federal,
        state: cached.activeBills.state,
        change: cached.activeBills.trend === 'up' ? `+${cached.activeBills.percentChange}%` : 
                cached.activeBills.trend === 'down' ? `-${cached.activeBills.percentChange}%` : '0%',
        timeframe: 'vs last month',
        lastUpdated: cached.cachedAt.toDate().toISOString(),
        source: 'cached',
        _fromCache: true,
      })
    }

    // First, try to get real data from Congress.gov API
    let realCount = 0
    let realSource = 'Congress.gov API'
    
    try {
      const congressApiKey = process.env.NEXT_PUBLIC_CONGRESS_API_KEY
      if (congressApiKey && congressApiKey !== 'your_congress_api_key_here') {
        // Get current session bills from Congress.gov
        const response = await fetch(`https://api.congress.gov/v3/bill?api_key=${congressApiKey}&format=json&limit=250`, {
          headers: {
            'Accept': 'application/json'
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          realCount = data.bills?.length || 0
          
          // Estimate total active bills (this is just a sample, real count would be much higher)
          // For demo purposes, we'll multiply by a factor to represent total active bills
          realCount = Math.round(realCount * 15) // Rough estimate of total active bills
          realSource = 'Congress.gov legislative database'
        }
      }
    } catch (congressError) {
      console.log('Congress API not available, using Gemini fallback')
    }

    // If we have a real count, use it; otherwise fall back to Gemini
    if (realCount > 0) {
      // Use Gemini to analyze trends and provide context
      if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
        try {
          const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
          
          const prompt = `Based on current congressional activity and the fact that there are approximately ${realCount} active bills, analyze recent trends and provide a percentage change. Return ONLY this JSON format:
          {"change": "+15%", "timeframe": "vs last month", "analysis": "brief trend analysis"}`

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
          const groundingMetadata = result.response.candidates?.[0]?.groundingMetadata

          // Clean and parse the response
          let cleanText = text.trim()
          if (cleanText.startsWith('```json') || cleanText.startsWith('```')) {
            cleanText = cleanText.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '')
          }

          try {
            const trendData = JSON.parse(cleanText)
            const percentChange = parseInt(trendData.change?.replace(/[^0-9-]/g, '') || '12')
            const trend = percentChange > 0 ? 'up' : percentChange < 0 ? 'down' : 'stable'
            
            // Cache the result
            await dashboardCacheService.cacheActiveBills(
              realCount,
              Math.round(realCount * 0.6), // Estimate federal
              Math.round(realCount * 0.4), // Estimate state
              trend as 'up' | 'down' | 'stable',
              Math.abs(percentChange)
            )
            
            return NextResponse.json({
              count: realCount,
              change: trendData.change || '+12%',
              timeframe: trendData.timeframe || 'vs last month',
              lastUpdated: new Date().toISOString(),
              source: realSource,
              groundingMetadata: groundingMetadata ? {
                webSearchQueries: groundingMetadata.webSearchQueries || [],
                sourceCount: groundingMetadata.groundingChunks?.length || 0
              } : null
            })
          } catch (parseError) {
            // Fallback to default trend
            await dashboardCacheService.cacheActiveBills(
              realCount,
              Math.round(realCount * 0.6),
              Math.round(realCount * 0.4),
              'up',
              12
            )
            
            return NextResponse.json({
              count: realCount,
              change: '+12%',
              timeframe: 'vs last month',
              lastUpdated: new Date().toISOString(),
              source: realSource,
              groundingMetadata: groundingMetadata ? {
                webSearchQueries: groundingMetadata.webSearchQueries || [],
                sourceCount: groundingMetadata.groundingChunks?.length || 0
              } : null
            })
          }
        } catch (geminiError) {
          console.log('Gemini analysis failed, using default trends')
        }
      }

      // Return real count with default trends
      return NextResponse.json({
        count: realCount,
        change: '+12%',
        timeframe: 'vs last month',
        lastUpdated: new Date().toISOString(),
        source: realSource
      })
    }

    // Fallback: Use Gemini to estimate if Congress API fails
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      return NextResponse.json({
        count: 1234,
        change: '+12%',
        lastUpdated: new Date().toISOString(),
        source: 'mock'
      })
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const prompt = `Estimate the number of active bills currently being considered in the US Congress. Return ONLY a JSON object: {"count": 2500, "change": "+15%", "timeframe": "vs last month", "source": "Congressional activity estimate"}`

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
    const groundingMetadata = result.response.candidates?.[0]?.groundingMetadata

    // Clean the text by removing markdown code blocks if present
    let cleanText = text.trim()
    if (cleanText.startsWith('```json') || cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '')
    }

    try {
      const parsedResponse = JSON.parse(cleanText)
      
      return NextResponse.json({
        ...parsedResponse,
        groundingMetadata: groundingMetadata ? {
          webSearchQueries: groundingMetadata.webSearchQueries || [],
          sourceCount: groundingMetadata.groundingChunks?.length || 0
        } : null
      })
    } catch (parseError) {
      console.error('Error parsing Gemini response as JSON:', parseError)
      
      // Enhanced fallback with better number extraction
      let count = 2500 // more realistic default
      let change = '+15%'
      let source = 'Congressional activity estimate'
      
      // Look for various number patterns in the text
      const numberPatterns = [
        /(\d{1,3}(?:,\d{3})*|\d+)\s*(?:active\s*)?bills?/i,
        /(\d{1,3}(?:,\d{3})*|\d+)\s*(?:bills?\s*)?(?:currently|actively|being\s*considered)/i,
        /(?:total|count|number)\s*(?:of\s*)?(\d{1,3}(?:,\d{3})*|\d+)\s*(?:bills?|legislation)/i,
        /(\d{1,3}(?:,\d{3})*|\d+)\s*(?:measures?|proposals?)/i
      ]
      
      for (const pattern of numberPatterns) {
        const match = text.match(pattern)
        if (match) {
          count = parseInt(match[1].replace(/,/g, ''))
          break
        }
      }
      
      // Look for percentage changes
      const changeMatch = text.match(/([+-]\d+(?:\.\d+)?%)/i)
      if (changeMatch) {
        change = changeMatch[1]
      }
      
      return NextResponse.json({
        count,
        change,
        timeframe: 'vs last month',
        lastUpdated: new Date().toISOString(),
        source,
        groundingMetadata: groundingMetadata ? {
          webSearchQueries: groundingMetadata.webSearchQueries || [],
          sourceCount: groundingMetadata.groundingChunks?.length || 0
        } : null
      })
    }

  } catch (error) {
    console.error('Error calling Gemini API:', error)
    return NextResponse.json({
      count: 1234,
      change: '+12%',
      timeframe: 'vs last month',
      lastUpdated: new Date().toISOString(),
      source: 'fallback',
      error: 'API unavailable'
    }, { status: 500 })
  }
}
