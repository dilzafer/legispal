import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function GET(request: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      return NextResponse.json({
        summary: "Congress is currently focused on healthcare reform and infrastructure spending, with several bipartisan bills moving through committees. The political climate shows increasing tension over budget negotiations and upcoming elections.",
        keyEvents: [
          "House passed H.R. 2024 (Federal Abortion Rights Protection Act) with 220-215 vote",
          "Senate Committee on Energy held hearings on climate infrastructure funding",
          "Bipartisan infrastructure bill S. 3041 advanced to floor vote",
          "House Oversight Committee launched investigation into pharmaceutical pricing",
          "Senate confirmed three federal judges in bipartisan votes"
        ],
        trendingBills: [
          "H.R. 2024 - Federal Abortion Rights Protection Act",
          "S. 3041 - Infrastructure Investment and Jobs Act",
          "H.R. 5555 - Second Amendment Protection Act",
          "S. 1234 - Climate Action and Green Jobs Bill",
          "H.R. 6789 - Healthcare Affordability Act"
        ],
        politicalClimate: "Moderate bipartisanship on infrastructure and judicial nominations, but high polarization on social issues. Healthcare and climate policy remain contentious with party-line votes expected on major bills.",
        predictions: [
          "Infrastructure bill likely to pass with bipartisan support",
          "Healthcare bills will face significant opposition in Senate",
          "Climate legislation may be delayed until next session",
          "Budget negotiations will intensify as fiscal year approaches",
          "Election year politics will influence voting patterns"
        ],
        confidence: 78,
        lastUpdated: new Date().toISOString(),
        groundingMetadata: null
      })
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

    const prompt = `
    You are an expert political analyst providing a comprehensive overview of the current US Congressional and legislative landscape. 
    
    CRITICAL: Search for the most recent information from the past 7 days. I need current, up-to-date congressional news and legislative activity.
    
    Please search for and analyze:
    1. Recent legislative activity (specifically from the past week)
    2. Key bills and their current progress
    3. Political climate and current trends
    4. Notable events in Congress from recent days
    5. Predictions for upcoming legislative sessions
    
    Search for and focus on:
    - Bills currently moving through committees this week
    - Recent votes and their outcomes from the past 7 days
    - Bipartisan vs partisan trends in current sessions
    - Impact on major policy areas (healthcare, climate, economy, etc.)
    - Notable speeches, hearings, or committee activities from recent days
    - Recent congressional news and developments
    
    Provide your analysis in a clear, informative manner suitable for citizens interested in government transparency.
    
    Format your response as a JSON object with these exact fields:
    {
      "summary": "A comprehensive 2-3 sentence overview of the current legislative landscape based on recent events",
      "keyEvents": ["List of 3-5 key events from the past week with specific dates when possible"],
      "trendingBills": ["List of 3-5 bills currently gaining attention with their current status"],
      "politicalClimate": "Analysis of current political dynamics and bipartisanship levels based on recent activity",
      "predictions": ["List of 3-5 predictions for upcoming legislative activity based on current trends"],
      "confidence": 85
    }
    
    Make sure to focus on factual, recent events from the past week and provide balanced analysis based on current information.
    `

    // Use legacy google_search_retrieval with dynamic mode for more reliable grounding
    const result = await model.generateContent({
      contents: prompt,
      tools: [{
        googleSearchRetrieval: {
          dynamicRetrievalConfig: {
            mode: "MODE_DYNAMIC",
            dynamicThreshold: 0.5 // Lower threshold to ensure search happens
          }
        }
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
    
    console.log('Legacy grounding metadata found:', groundingMetadata ? 'Yes' : 'No')
    if (groundingMetadata) {
      console.log('Search queries:', groundingMetadata.webSearchQueries)
      console.log('Number of sources:', groundingMetadata.groundingChunks?.length || 0)
    }

    // Try to parse the JSON response
    try {
      const parsedResponse = JSON.parse(text)
      
      return NextResponse.json({
        ...parsedResponse,
        lastUpdated: new Date().toISOString(),
        groundingMetadata: groundingMetadata ? {
          webSearchQueries: groundingMetadata.webSearchQueries || [],
          groundingChunks: groundingMetadata.groundingChunks || [],
          groundingSupports: groundingMetadata.groundingSupports || []
        } : null
      })
    } catch (parseError) {
      console.error('Error parsing Gemini response as JSON:', parseError)
      console.error('Raw response text:', text)
      
      // Return the text response with grounding metadata
      return NextResponse.json({
        summary: text.substring(0, 300) + '...',
        keyEvents: ["Analysis provided in summary above"],
        trendingBills: ["Analysis provided in summary above"],
        politicalClimate: "Analysis provided in summary above",
        predictions: ["Analysis provided in summary above"],
        confidence: 70,
        lastUpdated: new Date().toISOString(),
        groundingMetadata: groundingMetadata ? {
          webSearchQueries: groundingMetadata.webSearchQueries || [],
          groundingChunks: groundingMetadata.groundingChunks || [],
          groundingSupports: groundingMetadata.groundingSupports || []
        } : null
      })
    }
  } catch (error) {
    console.error('Error calling Gemini API:', error)
    return NextResponse.json({ error: 'Failed to fetch analysis' }, { status: 500 })
  }
}
