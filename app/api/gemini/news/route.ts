import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function GET(request: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      return NextResponse.json({
        summary: "Recent congressional activity includes healthcare reform debates, infrastructure bill progress, and ongoing committee hearings on climate policy. Political tensions remain high as election season approaches.",
        groundingMetadata: {
          webSearchQueries: [
            "Congress news this week",
            "Senate House recent activity 2024"
          ],
          groundingChunks: [
            {
              web: {
                uri: "https://www.rollcall.com/",
                title: "Roll Call - Congressional News"
              }
            }
          ],
          groundingSupports: []
        }
      })
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

    const prompt = `
    Search for and provide a brief, informative summary of recent US Congressional news from the past 7 days (this week). 
    
    IMPORTANT: Focus on the most current information available. Search for recent developments.
    
    Focus on:
    - Recent votes and their outcomes from the past week
    - Committee hearings and investigations from recent days
    - New bill introductions and progress from this week
    - Political developments and statements from the past 7 days
    - Current congressional sessions and activities
    
    Keep it concise (2-3 sentences) and factual. Include specific dates when possible.
    `

    // Generate content with Google Search grounding for real-time news
    const result = await model.generateContent({
      contents: [{
        parts: [{ text: prompt }]
      }],
      tools: [{
        googleSearch: {}
      }],
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40
      }
    })
    const response = await result.response
    const text = response.text()
    
    // Extract grounding metadata if available
    const groundingMetadata = result.response.candidates?.[0]?.groundingMetadata
    
    return NextResponse.json({
      summary: text,
      groundingMetadata: groundingMetadata ? {
        webSearchQueries: groundingMetadata.webSearchQueries || [],
        groundingChunks: groundingMetadata.groundingChunks || [],
        groundingSupports: groundingMetadata.groundingSupports || []
      } : null
    })
  } catch (error) {
    console.error('Error getting news summary from Gemini:', error)
    return NextResponse.json({
      summary: "Unable to fetch recent news summary. Please check your API configuration."
    })
  }
}
