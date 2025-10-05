export interface GroundingMetadata {
  webSearchQueries: string[]
  groundingChunks: Array<{
    web?: {
      uri: string
      title: string
    }
  }>
  groundingSupports: Array<{
    segment: {
      startIndex: number
      endIndex: number
      text: string
    }
    groundingChunkIndices: number[]
  }>
}

export interface LegislativeAnalysis {
  summary: string
  keyEvents: string[]
  trendingBills: string[]
  politicalClimate: string
  predictions: string[]
  confidence: number
  lastUpdated: string
  groundingMetadata?: GroundingMetadata | null
}

export async function getLegislativeAnalysis(): Promise<LegislativeAnalysis> {
  try {
    // Try the main analysis route first
    let response = await fetch('/api/gemini/analysis', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    // Check if we got grounding metadata (indicating real-time data)
    if (data.groundingMetadata && data.groundingMetadata.webSearchQueries && data.groundingMetadata.webSearchQueries.length > 0) {
      console.log('Successfully got grounded analysis with', data.groundingMetadata.webSearchQueries.length, 'search queries')
      return data
    }
    
    // If no grounding metadata, try the legacy route for more reliable grounding
    console.log('No grounding metadata found, trying legacy route...')
    response = await fetch('/api/gemini/analysis-legacy', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const legacyData = await response.json()
    return legacyData
  } catch (error) {
    console.error('Error fetching legislative analysis:', error)
    // Return mock data on error
    return getMockLegislativeAnalysis()
  }
}

function getMockLegislativeAnalysis(): LegislativeAnalysis {
  return {
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
    lastUpdated: new Date().toISOString()
  }
}

export interface NewsSummary {
  summary: string
  groundingMetadata?: GroundingMetadata | null
}

export async function getRecentNewsSummary(): Promise<NewsSummary> {
  try {
    const response = await fetch('/api/gemini/news', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching news summary:', error)
    return {
      summary: "Unable to fetch recent news summary. Please check your API configuration.",
      groundingMetadata: null
    }
  }
}

// Function to add inline citations to text based on grounding metadata
export function addCitationsToText(text: string, groundingMetadata: GroundingMetadata | null): string {
  if (!groundingMetadata || !groundingMetadata.groundingSupports || !groundingMetadata.groundingChunks) {
    return text
  }

  const supports = groundingMetadata.groundingSupports
  const chunks = groundingMetadata.groundingChunks

  // Sort supports by endIndex in descending order to avoid shifting issues when inserting
  const sortedSupports = [...supports].sort((a, b) => (b.segment?.endIndex ?? 0) - (a.segment?.endIndex ?? 0))

  let result = text

  for (const support of sortedSupports) {
    const endIndex = support.segment?.endIndex
    if (endIndex === undefined || !support.groundingChunkIndices?.length) {
      continue
    }

    const citationLinks = support.groundingChunkIndices
      .map(i => {
        const chunk = chunks[i]
        const uri = chunk?.web?.uri
        const title = chunk?.web?.title
        if (uri) {
          return `[${i + 1}](${uri})`
        }
        return null
      })
      .filter(Boolean)

    if (citationLinks.length > 0) {
      const citationString = citationLinks.join(", ")
      result = result.slice(0, endIndex) + citationString + result.slice(endIndex)
    }
  }

  return result
}
