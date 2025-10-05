import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { searchBillsWithNaturalLanguage } from '@/lib/services/billVectorIndex'
import { fetchRecentBills } from '@/lib/api/congress'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: NextRequest) {
  try {
    const { query, includeBills = true, maxResults = 20 } = await request.json()

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      )
    }

    console.log(`🔍 Natural Language Search: Processing query "${query}"`)

    let searchResults = {
      bills: [] as any[],
      analysis: `Search results for "${query}"`,
      source: 'Vector Search + AI Analysis',
      groundingMetadata: null as any,
      searchTime: 0
    }

    try {
      // Use natural language vector search
      const vectorSearchResult = await searchBillsWithNaturalLanguage(query, maxResults)
      
      if (vectorSearchResult.results.length > 0) {
        // Transform vector search results to expected format
        searchResults.bills = vectorSearchResult.results.map(result => {
          // Ensure billId is in correct format (e.g., "HR-5615" or "118-HR-5615")
          const billId = result.billId || `unknown-${Date.now()}`

          return {
            id: billId,
            title: result.title,
            sponsor: result.metadata.sponsor || 'Unknown',
            date: result.metadata.date || new Date().toISOString().split('T')[0],
            trendScore: Math.round(result.similarity * 100), // Convert similarity to 0-100 scale
            summary: result.summary,
            tags: result.metadata.tags || ['Legislation'],
            supportersCount: Math.round(result.similarity * 5000) + 1000,
            opposersCount: Math.round(result.similarity * 3000) + 500,
            controversyLevel: 'medium',
            billNumber: billId,
            status: result.metadata.status || 'Introduced',
            similarity: result.similarity,
            relevanceReason: `Semantic similarity: ${(result.similarity * 100).toFixed(1)}% match`
          }
        })

        searchResults.analysis = `Found ${vectorSearchResult.results.length} bills semantically similar to "${query}" using vector search`
        searchResults.searchTime = vectorSearchResult.searchTime

        console.log(`✅ Vector search found ${vectorSearchResult.results.length} similar bills for "${query}"`)

        // Optionally enhance with Gemini analysis for better context
        if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here' && searchResults.bills.length > 0) {
          try {
            const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
            
            const billTitles = searchResults.bills.map(bill => bill.title).join(', ')
            const prompt = `The user searched for: "${query}"

Here are the bills found using semantic similarity search:
${billTitles}

Provide a brief, natural explanation to answer the search query and any relevant news related to the bills. Focus on the semantic connection and legislative themes. Keep it concise (1-2 sentences).`

            const result = await model.generateContent({
              contents: [{
        role: 'user',
        parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.3,
                topP: 0.8,
                topK: 40
              }
            })

            const response = await result.response
            const enhancedAnalysis = response.text().trim()
            
            searchResults.analysis = enhancedAnalysis
            searchResults.groundingMetadata = result.response.candidates?.[0]?.groundingMetadata

          } catch (geminiError) {
            console.warn('Could not enhance with Gemini analysis:', geminiError)
            // Keep the original analysis
          }
        }

      } else {
        // Fallback to keyword search if no vector results
        console.log('🔄 No vector results found, falling back to keyword search...')
        
        const recentBills = await fetchRecentBills(50, 0)
        const matchingBills = recentBills.filter(bill => 
          bill.title.toLowerCase().includes(query.toLowerCase()) ||
          bill.sponsors?.some(sponsor => 
            sponsor.fullName?.toLowerCase().includes(query.toLowerCase())
          ) ||
          bill.summaries?.some(summary => 
            summary.text?.toLowerCase().includes(query.toLowerCase())
          )
        ).slice(0, maxResults)

        searchResults.bills = matchingBills.map(bill => {
          // Create proper bill ID: congress-type-number or type-number
          const billId = `${bill.congress}-${bill.type.toUpperCase()}-${bill.number}`

          return {
            id: billId,
            title: bill.title,
            sponsor: bill.sponsors?.[0]?.fullName || 'Unknown',
            date: bill.introducedDate || bill.latestAction?.actionDate || new Date().toISOString().split('T')[0],
            trendScore: Math.floor(Math.random() * 40) + 60,
            summary: bill.summaries?.[0]?.text || bill.title,
            tags: bill.subjects?.legislativeSubjects?.slice(0, 3).map(s => s.name) || ['Legislation'],
            supportersCount: Math.floor(Math.random() * 5000) + 1000,
            opposersCount: Math.floor(Math.random() * 3000) + 500,
            controversyLevel: 'medium',
            billNumber: `${bill.type.toUpperCase()}.${bill.number}`,
            status: bill.latestAction?.text || 'Introduced'
          }
        })

        searchResults.analysis = `Found ${searchResults.bills.length} bills matching "${query}" using keyword search`
        searchResults.source = 'Keyword Search Fallback'
      }

    } catch (error) {
      console.error('❌ Error in natural language search:', error)
      
      // Final fallback to basic search
      const recentBills = await fetchRecentBills(maxResults, 0)
      searchResults.bills = recentBills.map(bill => {
        // Create proper bill ID: congress-type-number
        const billId = `${bill.congress}-${bill.type.toUpperCase()}-${bill.number}`

        return {
          id: billId,
          title: bill.title,
          sponsor: bill.sponsors?.[0]?.fullName || 'Unknown',
          date: bill.introducedDate || bill.latestAction?.actionDate || new Date().toISOString().split('T')[0],
          trendScore: Math.floor(Math.random() * 40) + 60,
          summary: bill.summaries?.[0]?.text || bill.title,
          tags: bill.subjects?.legislativeSubjects?.slice(0, 3).map(s => s.name) || ['Legislation'],
          supportersCount: Math.floor(Math.random() * 5000) + 1000,
          opposersCount: Math.floor(Math.random() * 3000) + 500,
          controversyLevel: 'medium',
          billNumber: `${bill.type.toUpperCase()}.${bill.number}`,
          status: bill.latestAction?.text || 'Introduced'
        }
      })

      searchResults.analysis = `Found ${searchResults.bills.length} recent bills (fallback mode)`
      searchResults.source = 'Fallback Search'
    }

    return NextResponse.json(searchResults)

  } catch (error) {
    console.error('❌ Error in Gemini search:', error)
    return NextResponse.json({
      bills: [],
      analysis: 'Search failed due to an internal error.',
      source: 'error',
      groundingMetadata: null
    }, { status: 500 })
  }
}
