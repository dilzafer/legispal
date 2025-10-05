'use client'

import { motion } from 'framer-motion'
import { Search, FileText, Filter, TrendingUp, Users, Calendar, AlertTriangle, ExternalLink } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useBillDashboard, BillDashboardProvider } from '@/lib/useBillDashboard'
import BillDashboardScan from '@/components/Dashboard/BillDashboardScan'

interface Bill {
  id: string
  title: string
  sponsor: string
  date: string
  trendScore: number
  summary: string
  tags: string[]
  supportersCount: number
  opposersCount: number
  controversyLevel: 'low' | 'medium' | 'high'
  billNumber?: string
  status?: string
  similarity?: number
  relevanceReason?: string
}

function SearchPageContent() {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<Bill[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [filterLevel, setFilterLevel] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('relevance')
  const [searchMetadata, setSearchMetadata] = useState<{
    analysis: string
    source: string
    searchTime: number
  } | null>(null)
  const { openBillDashboard } = useBillDashboard()

  const getControversyColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-400 bg-green-400/10'
      case 'medium': return 'text-yellow-400 bg-yellow-400/10'
      case 'high': return 'text-red-400 bg-red-400/10'
      default: return 'text-gray-400 bg-gray-400/10'
    }
  }

  const handleSearch = async () => {
    if (!searchTerm.trim()) return

    setLoading(true)
    setHasSearched(true)
    
    try {
      // Use Gemini-powered search API
      const response = await fetch('/api/gemini/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchTerm,
          includeBills: true,
          maxResults: 20
        })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Natural language search results:', data)
      
      // Set search metadata
      setSearchMetadata({
        analysis: data.analysis || `Found ${data.bills.length} results`,
        source: data.source || 'Vector Search',
        searchTime: data.searchTime || 0
      })
      
      // Transform the data to match our interface
      const transformedBills: Bill[] = data.bills.map((bill: any, index: number) => {
        // Extract bill ID components - handle various formats
        let billId = bill.id || bill.billNumber

        // Ensure we have a valid, unique ID
        if (!billId || billId === 'undefined-undefined') {
          // Fallback: use index to ensure uniqueness
          billId = `bill-${Date.now()}-${index}`
        }

        return {
          id: billId,
          title: bill.title || 'Untitled Bill',
          sponsor: bill.sponsor || bill.sponsors?.[0]?.fullName || 'Unknown Sponsor',
          date: bill.date || bill.introducedDate || new Date().toISOString().split('T')[0],
          trendScore: bill.trendScore || Math.floor(Math.random() * 40) + 60,
          summary: bill.summary || bill.description || bill.title || 'No summary available',
          tags: bill.tags || bill.subjects?.legislativeSubjects?.slice(0, 3).map((s: any) => s.name) || ['Legislation'],
          supportersCount: bill.supportersCount || Math.round((bill.trendScore || 70) * 100),
          opposersCount: bill.opposersCount || Math.round((bill.trendScore || 70) * 60),
          controversyLevel: bill.controversyLevel ||
            (bill.controversy?.includes('high') ? 'high' :
             bill.controversy?.includes('medium') ? 'medium' : 'low') as 'low' | 'medium' | 'high',
          billNumber: bill.billNumber || billId,
          status: bill.status || 'Introduced',
          similarity: bill.similarity,
          relevanceReason: bill.relevanceReason
        }
      })
      
      setSearchResults(transformedBills)
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const filteredAndSortedResults = searchResults
    .filter(bill => {
      const matchesFilter = filterLevel === 'all' || bill.controversyLevel === filterLevel
      return matchesFilter
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'relevance':
          return b.trendScore - a.trendScore
        case 'date':
          return new Date(b.date).getTime() - new Date(a.date).getTime()
        case 'supporters':
          return b.supportersCount - a.supportersCount
        case 'title':
          return a.title.localeCompare(b.title)
        default:
          return b.trendScore - a.trendScore
      }
    })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 -mx-8 -my-6 px-8 py-6">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title Section */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="text-4xl font-bold text-white mb-4">Search for Legislation</h1>
          <p className="text-xl text-gray-400">Find bills, representatives, and legislative information</p>
        </motion.div>

        {/* Search Interface */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-slate-900/70 rounded-xl p-6 border border-white/10">
            <div className="flex flex-col gap-4">
              {/* Search Bar */}
              <div className="relative max-w-3xl mx-auto w-full">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Ask about healthcare, climate change, education, or any topic in natural language..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-12 pr-32 py-4 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-democracy-gold focus:border-transparent text-lg"
                />
                <button
                  onClick={handleSearch}
                  disabled={loading || !searchTerm.trim()}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-2 bg-truth-green text-white rounded-lg hover:bg-truth-green/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </div>
              
              {/* Filters and Sorting */}
              {hasSearched && (
                <div className="flex flex-col md:flex-row gap-4 pt-4 border-t border-white/10">
                  {/* Filter Dropdown */}
                  <div className="md:w-48">
                    <div className="relative">
                      <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <select
                        value={filterLevel}
                        onChange={(e) => setFilterLevel(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-democracy-gold focus:border-transparent appearance-none"
                      >
                        <option value="all">All Controversy Levels</option>
                        <option value="low">Low Controversy</option>
                        <option value="medium">Medium Controversy</option>
                        <option value="high">High Controversy</option>
                      </select>
                    </div>
                  </div>

                  {/* Sort By Dropdown */}
                  <div className="md:w-48">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-democracy-gold focus:border-transparent appearance-none"
                    >
                      <option value="relevance">Most Relevant</option>
                      <option value="date">Most Recent</option>
                      <option value="supporters">Most Supporters</option>
                      <option value="title">Title (A-Z)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
            
          </div>
        </motion.div>

        {/* Search Results */}
        {hasSearched && (
          <div className="space-y-6">
            {/* Results Header */}
            <motion.div 
              className="text-center mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-2xl font-semibold text-white mb-2">
                Here are some results for "{searchTerm}"
              </h2>
              <p className="text-gray-400 mb-3">
                {loading ? 'Searching...' : `Found ${filteredAndSortedResults.length} results`}
              </p>
              
              {searchMetadata && !loading && (
                <div className="bg-slate-800/50 rounded-lg p-4 max-w-4xl mx-auto">
                  <p className="text-sm text-gray-300 mb-2">
                    {searchMetadata.analysis}
                  </p>
                  <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Search size={14} />
                      {searchMetadata.source}
                    </span>
                    {searchMetadata.searchTime > 0 && (
                      <span>
                        {searchMetadata.searchTime}ms
                      </span>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
            {loading ? (
              <div className="grid grid-cols-1 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-slate-900/80 rounded-xl p-6 border border-white/10 animate-pulse">
                    <div className="h-6 bg-white/10 rounded mb-4 w-3/4"></div>
                    <div className="h-4 bg-white/10 rounded mb-2 w-1/2"></div>
                    <div className="h-4 bg-white/10 rounded mb-4 w-full"></div>
                    <div className="h-4 bg-white/10 rounded mb-4 w-2/3"></div>
                    <div className="flex gap-2 mb-4">
                      <div className="h-6 bg-white/10 rounded w-16"></div>
                      <div className="h-6 bg-white/10 rounded w-20"></div>
                    </div>
                    <div className="flex justify-between">
                      <div className="h-4 bg-white/10 rounded w-24"></div>
                      <div className="h-4 bg-white/10 rounded w-16"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredAndSortedResults.length > 0 ? (
              <div className="space-y-6">
                {filteredAndSortedResults.map((bill, index) => (
                  <motion.div
                    key={bill.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-slate-900/80 rounded-xl p-6 border border-white/10 hover:bg-slate-800/90 transition-all cursor-pointer group"
                    onClick={() => openBillDashboard(bill.id)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-sm font-mono text-gray-400">{bill.billNumber}</span>
                          <div className={`text-xs px-2 py-1 rounded-full ${getControversyColor(bill.controversyLevel)}`}>
                            {bill.controversyLevel === 'high' && <AlertTriangle size={10} className="inline mr-1" />}
                            {bill.controversyLevel} controversy
                          </div>
                          <div className="text-xs px-2 py-1 bg-blue-500/10 text-blue-400 rounded-full">
                            {bill.status}
                          </div>
                        </div>
                        <h3 className="text-xl font-semibold text-white group-hover:text-truth-green transition-colors mb-2 serif-text">
                          {bill.title}
                        </h3>
                        <p className="text-sm text-gray-400 mb-3">{bill.sponsor}</p>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-2xl font-bold text-white">
                          {bill.similarity ? `${(bill.similarity * 100).toFixed(0)}%` : bill.trendScore}
                        </div>
                        <div className="text-xs text-gray-400">
                          {bill.similarity ? 'Similarity' : 'Relevance'}
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-300 mb-4 line-clamp-3">{bill.summary}</p>

                    {bill.relevanceReason && (
                      <div className="mb-3 p-2 bg-truth-green/10 border border-truth-green/20 rounded-lg">
                        <p className="text-xs text-truth-green font-medium mb-1">Why it matches:</p>
                        <p className="text-xs text-gray-300">{bill.relevanceReason}</p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 mb-4">
                      {bill.tags.map((tag, tagIndex) => (
                        <span key={tagIndex} className="text-xs px-2 py-1 bg-white/5 rounded-md text-gray-300">
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Users size={14} className="text-green-400" />
                          <span className="text-gray-400">{bill.supportersCount.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users size={14} className="text-red-400" />
                          <span className="text-gray-400">{bill.opposersCount.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar size={14} className="text-gray-400" />
                        <span className="text-gray-400">{new Date(bill.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-900/80 rounded-xl p-12 border border-white/10 text-center">
                <Search className="mx-auto mb-4 text-gray-400" size={48} />
                <h3 className="text-lg font-semibold text-white mb-2">No results found</h3>
                <p className="text-gray-400 mb-4">Try adjusting your search terms or check the spelling.</p>
                <div className="text-sm text-gray-500">
                  <p>Try these natural language queries:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>"What bills are about healthcare reform?"</li>
                    <li>"Show me climate change legislation"</li>
                    <li>"Find bills related to student loan forgiveness"</li>
                    <li>"What's happening with infrastructure funding?"</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Welcome State */}
        {!hasSearched && (
          <motion.div 
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="text-gray-400 mb-8">
              <Search size={64} className="mx-auto mb-6 opacity-50" />
              <h3 className="text-2xl font-semibold mb-4">Discover Legislative Information</h3>
              <p className="text-lg mb-6 max-w-2xl mx-auto">
                Ask questions in natural language to find relevant bills using AI-powered semantic search. No need for exact keywords or bill numbers.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-slate-900/50 rounded-lg p-6 border border-white/10">
                <FileText className="mx-auto mb-3 text-truth-green" size={32} />
                <h4 className="font-semibold text-white mb-2">Search Bills</h4>
                <p className="text-sm text-gray-400">Find legislation by number, title, or topic area</p>
              </div>
              
              <div className="bg-slate-900/50 rounded-lg p-6 border border-white/10">
                <Users className="mx-auto mb-3 text-truth-green" size={32} />
                <h4 className="font-semibold text-white mb-2">Find Representatives</h4>
                <p className="text-sm text-gray-400">Look up your elected officials and their legislative activity</p>
              </div>
              
              <div className="bg-slate-900/50 rounded-lg p-6 border border-white/10">
                <TrendingUp className="mx-auto mb-3 text-truth-green" size={32} />
                <h4 className="font-semibold text-white mb-2">Track Progress</h4>
                <p className="text-sm text-gray-400">Monitor bill status and voting records</p>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* Bill Dashboard Overlay */}
      <BillDashboardScan />
    </div>
  )
}

export default function SearchPage() {
  return (
    <BillDashboardProvider>
      <SearchPageContent />
    </BillDashboardProvider>
  )
}
