/**
 * NewsData.io Service
 * Provides news articles from NewsData.io API focused on congressional and legislative news
 */

export interface NewsDataArticle {
  title: string
  description: string
  url: string
  image_url: string | null
  published_at: string
  source: string
  snippet: string
}

interface NewsDataResponse {
  status: string
  totalResults: number
  results: Array<{
    title: string
    link: string
    keywords: string
    creator: string[]
    video_url: string | null
    description: string
    content: string
    pubDate: string
    image_url: string | null
    source_id: string
    category: string[]
    country: string[]
    language: string
  }>
}

/**
 * Fetch news from NewsData.io API
 */
export async function fetchNewsDataNews(apiKey: string, limit: number = 6): Promise<NewsDataArticle[]> {
  try {
    if (!apiKey) {
      throw new Error('NewsData.io API key is required')
    }

    console.log('📰 Fetching news from NewsData.io...')

    // Search for congressional and legislative news
    const params = new URLSearchParams({
      apikey: apiKey,
      q: 'congress OR senate OR house OR legislation OR bill',
      country: 'us',
      language: 'en',
      size: limit.toString()
    })

    const response = await fetch(`https://newsdata.io/api/1/news?${params.toString()}`)

    if (!response.ok) {
      throw new Error(`NewsData.io API error: ${response.status}`)
    }

    const data: NewsDataResponse = await response.json()

    if (data.status !== 'success') {
      throw new Error('NewsData.io API returned error status')
    }

    // Convert to our article format
    const articles: NewsDataArticle[] = data.results.map(article => ({
      title: article.title,
      description: article.description || article.content?.substring(0, 200) + '...' || '',
      url: article.link,
      image_url: article.image_url,
      published_at: article.pubDate,
      source: article.source_id || 'Unknown',
      snippet: article.description || article.content?.substring(0, 150) + '...' || article.title
    }))

    console.log(`✅ Found ${articles.length} news articles from NewsData.io`)
    return articles

  } catch (error) {
    console.error('Error fetching NewsData.io news:', error)
    throw error
  }
}

/**
 * Get cached news with fallback
 */
let cachedNews: NewsDataArticle[] | null = null
let cacheTimestamp: number = 0
const CACHE_DURATION = 15 * 60 * 1000 // 15 minutes

export async function getNewsDataNews(apiKey: string, limit: number = 6): Promise<NewsDataArticle[]> {
  const now = Date.now()
  
  // Return cached articles if still valid
  if (cachedNews && (now - cacheTimestamp) < CACHE_DURATION) {
    return cachedNews.slice(0, limit)
  }
  
  try {
    // Fetch new articles
    const articles = await fetchNewsDataNews(apiKey, limit)
    cachedNews = articles
    cacheTimestamp = now
    
    return articles
  } catch (error) {
    // Return cached articles if available, even if expired
    if (cachedNews) {
      console.warn('Using cached news due to API error:', error)
      return cachedNews.slice(0, limit)
    }
    
    // Return fallback articles
    return [
      {
        title: 'Congressional News Unavailable',
        description: 'Unable to fetch current congressional news. Please check your internet connection and try again.',
        url: '#',
        image_url: null,
        published_at: new Date().toISOString(),
        source: 'System',
        snippet: 'News service temporarily unavailable'
      }
    ]
  }
}
