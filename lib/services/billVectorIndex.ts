import { fetchRecentBills } from '@/lib/api/congress'
import { generateBillEmbeddings } from './embeddingsService'
import { vectorSearchService } from './vectorSearchService'

let indexInitialized = false
let lastIndexUpdate = 0
const INDEX_CACHE_DURATION = 30 * 60 * 1000 // 30 minutes

/**
 * Initialize the vector index with recent bills
 */
export async function initializeBillVectorIndex(): Promise<void> {
  if (indexInitialized && (Date.now() - lastIndexUpdate) < INDEX_CACHE_DURATION) {
    console.log('📋 Vector index already initialized and fresh')
    return
  }

  try {
    console.log('🚀 Initializing bill vector index...')
    
    // Fetch recent bills from Congress API
    const recentBills = await fetchRecentBills(100, 0) // Get more bills for better coverage
    
    if (recentBills.length === 0) {
      console.warn('⚠️ No bills found to build vector index')
      return
    }

    console.log(`📄 Processing ${recentBills.length} bills for vector index...`)
    
    // Generate embeddings for all bills
    const billEmbeddings = await generateBillEmbeddings(recentBills)
    
    if (billEmbeddings.length === 0) {
      console.warn('⚠️ No embeddings generated')
      return
    }

    // Build FAISS index
    await vectorSearchService.buildIndex(billEmbeddings)
    
    indexInitialized = true
    lastIndexUpdate = Date.now()
    
    console.log(`✅ Vector index initialized with ${billEmbeddings.length} bills`)
    
  } catch (error) {
    console.error('❌ Error initializing vector index:', error)
    // Don't throw - allow fallback to regular search
  }
}

/**
 * Search bills using natural language query
 */
export async function searchBillsWithNaturalLanguage(
  query: string,
  topK: number = 10
): Promise<{
  results: Array<{
    billId: string
    title: string
    summary: string
    similarity: number
    metadata: {
      sponsor?: string
      date?: string
      status?: string
      tags?: string[]
    }
  }>
  totalResults: number
  searchTime: number
}> {
  const startTime = Date.now()
  
  try {
    // Ensure index is initialized
    await initializeBillVectorIndex()
    
    // Search using vector similarity
    const searchResults = await vectorSearchService.search(query, topK, 0.2)
    
    const searchTime = Date.now() - startTime
    
    console.log(`🔍 Natural language search for "${query}" completed in ${searchTime}ms`)
    console.log(`📊 Found ${searchResults.length} results`)
    
    return {
      results: searchResults,
      totalResults: searchResults.length,
      searchTime
    }
    
  } catch (error) {
    console.error('❌ Error in natural language search:', error)
    
    const searchTime = Date.now() - startTime
    
    return {
      results: [],
      totalResults: 0,
      searchTime
    }
  }
}

/**
 * Get vector index statistics
 */
export function getVectorIndexStats() {
  return {
    ...vectorSearchService.getIndexStats(),
    lastUpdate: lastIndexUpdate,
    isInitialized: indexInitialized
  }
}

/**
 * Force refresh the vector index
 */
export async function refreshVectorIndex(): Promise<void> {
  indexInitialized = false
  lastIndexUpdate = 0
  vectorSearchService.clearIndex()
  await initializeBillVectorIndex()
}
