import { NextRequest, NextResponse } from 'next/server'
import { fetchNewsDataNews } from '@/lib/services/newsDataService'

export const dynamic = 'force-dynamic'
export const revalidate = 900 // Revalidate every 15 minutes

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const limit = parseInt(searchParams.get('limit') || '6')
    const apiKey = process.env.NEXT_PUBLIC_NEW_NEWS_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        {
          articles: [],
          error: 'NewsData.io API key not configured',
          message: 'Please configure NEXT_PUBLIC_NEW_NEWS_API_KEY in your environment variables'
        },
        { status: 500 }
      )
    }

    console.log('📰 API: Fetching NewsData.io congressional news...')
    
    const articles = await fetchNewsDataNews(apiKey, limit)
    
    return NextResponse.json({
      articles,
      source: 'NewsData.io',
      lastUpdated: new Date().toISOString(),
      count: articles.length
    })
    
  } catch (error) {
    console.error('❌ API Error fetching NewsData.io news:', error)
    
    return NextResponse.json(
      {
        articles: [],
        error: 'Failed to fetch congressional news',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
