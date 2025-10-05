import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export interface BillEmbedding {
  billId: string
  title: string
  summary: string
  fullText: string
  embedding: number[]
  metadata: {
    sponsor?: string
    date?: string
    status?: string
    tags?: string[]
  }
}

/**
 * Generate embedding for text using Gemini's embedding model
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      // Fallback: generate mock embedding
      console.warn('⚠️ No Gemini API key, using mock embedding')
      return generateMockEmbedding(text)
    }

    const model = genAI.getGenerativeModel({ model: 'embedding-001' })
    
    // Clean and prepare text for embedding
    const cleanText = text
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 1000) // Limit text length for embedding

    const result = await model.embedContent(cleanText)
    const embedding = result.embedding.values

    console.log(`✅ Generated embedding for text: "${cleanText.substring(0, 50)}..."`)
    return embedding

  } catch (error) {
    console.error('❌ Error generating embedding:', error)
    // Fallback to mock embedding
    return generateMockEmbedding(text)
  }
}

/**
 * Generate embeddings for multiple bills
 */
export async function generateBillEmbeddings(bills: any[]): Promise<BillEmbedding[]> {
  console.log(`🔄 Generating embeddings for ${bills.length} bills...`)
  
  const embeddings: BillEmbedding[] = []
  
  for (const bill of bills) {
    try {
      // Combine title, summary, and key metadata for embedding
      const fullText = [
        bill.title || '',
        bill.summaries?.[0]?.text || '',
        bill.sponsors?.[0]?.fullName || '',
        bill.subjects?.legislativeSubjects?.map((s: any) => s.name).join(' ') || ''
      ].join(' ')

      const embedding = await generateEmbedding(fullText)
      
      embeddings.push({
        billId: bill.billId,
        title: bill.title || 'Untitled Bill',
        summary: bill.summaries?.[0]?.text || '',
        fullText,
        embedding,
        metadata: {
          sponsor: bill.sponsors?.[0]?.fullName,
          date: bill.introducedDate,
          status: bill.latestAction?.text,
          tags: bill.subjects?.legislativeSubjects?.map((s: any) => s.name) || []
        }
      })

      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100))
      
    } catch (error) {
      console.error(`❌ Error generating embedding for bill ${bill.billId}:`, error)
    }
  }
  
  console.log(`✅ Generated ${embeddings.length} bill embeddings`)
  return embeddings
}

/**
 * Generate a mock embedding for fallback purposes
 */
function generateMockEmbedding(text: string): number[] {
  // Create a deterministic "embedding" based on text characteristics
  const words = text.toLowerCase().split(/\s+/)
  const embedding = new Array(768).fill(0)
  
  // Simple hash-based approach for mock embeddings
  words.forEach((word, index) => {
    const hash = word.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0)
      return a & a
    }, 0)
    
    const position = Math.abs(hash) % 768
    embedding[position] += 1 / (index + 1)
  })
  
  // Normalize the embedding
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0))
  return embedding.map(val => val / magnitude)
}

/**
 * Calculate cosine similarity between two embeddings
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Embeddings must have the same length')
  }
  
  let dotProduct = 0
  let normA = 0
  let normB = 0
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  
  normA = Math.sqrt(normA)
  normB = Math.sqrt(normB)
  
  if (normA === 0 || normB === 0) {
    return 0
  }
  
  return dotProduct / (normA * normB)
}

/**
 * Find most similar bills using cosine similarity
 */
export function findSimilarBills(
  queryEmbedding: number[],
  billEmbeddings: BillEmbedding[],
  topK: number = 10
): Array<{ bill: BillEmbedding; similarity: number }> {
  const similarities = billEmbeddings.map(bill => ({
    bill,
    similarity: cosineSimilarity(queryEmbedding, bill.embedding)
  }))
  
  return similarities
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK)
}
