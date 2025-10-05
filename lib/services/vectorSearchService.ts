// import { IndexFlatIP, IndexFlatL2 } from 'faiss-node'
import { BillEmbedding, generateEmbedding, findSimilarBills } from './embeddingsService'

export interface VectorSearchResult {
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
}

export class VectorSearchService {
  private billEmbeddings: BillEmbedding[] = []
  private isIndexBuilt = false

  /**
   * Build index from bill embeddings (using cosine similarity instead of FAISS)
   */
  async buildIndex(billEmbeddings: BillEmbedding[]): Promise<void> {
    if (billEmbeddings.length === 0) {
      console.warn('⚠️ No bill embeddings provided for index building')
      return
    }

    console.log(`🔄 Building vector index with ${billEmbeddings.length} bills...`)
    
    this.billEmbeddings = billEmbeddings
    this.isIndexBuilt = true
    console.log(`✅ Vector index built with ${billEmbeddings.length} bills`)
  }

  /**
   * Search for similar bills using cosine similarity
   */
  async search(
    query: string, 
    topK: number = 10,
    minSimilarity: number = 0.3
  ): Promise<VectorSearchResult[]> {
    if (!this.isIndexBuilt) {
      console.warn('⚠️ Index not built, returning empty results')
      return []
    }

    try {
      console.log(`🔍 Searching for: "${query}"`)
      
      // Use the fallback search (cosine similarity)
      return await this.fallbackSearch(query, topK, minSimilarity)
      
    } catch (error) {
      console.error('❌ Vector search error:', error)
      return []
    }
  }

  /**
   * Search using cosine similarity
   */
  private async fallbackSearch(
    query: string, 
    topK: number, 
    minSimilarity: number
  ): Promise<VectorSearchResult[]> {
    console.log('🔄 Using fallback cosine similarity search...')
    
    try {
      const queryEmbedding = await generateEmbedding(query)
      const similarBills = findSimilarBills(queryEmbedding, this.billEmbeddings, topK)
      
      return similarBills
        .filter(result => result.similarity >= minSimilarity)
        .map(result => ({
          billId: result.bill.billId,
          title: result.bill.title,
          summary: result.bill.summary,
          similarity: result.similarity,
          metadata: result.bill.metadata
        }))
        
    } catch (error) {
      console.error('❌ Fallback search error:', error)
      return []
    }
  }

  /**
   * Get index statistics
   */
  getIndexStats(): { totalBills: number; isBuilt: boolean } {
    return {
      totalBills: this.billEmbeddings.length,
      isBuilt: this.isIndexBuilt
    }
  }

  /**
   * Clear the index
   */
  clearIndex(): void {
    this.billEmbeddings = []
    this.isIndexBuilt = false
    console.log('🗑️ Vector index cleared')
  }
}

// Global instance
export const vectorSearchService = new VectorSearchService()
