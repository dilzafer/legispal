'use client'

import { motion } from 'framer-motion'
import { TrendingUp, Users, Calendar, AlertTriangle, ArrowLeft, Search, Filter, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import BillDashboardScan from '@/components/Dashboard/BillDashboardScan'
import { BillDashboardProvider, useBillDashboard } from '@/lib/useBillDashboard'

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
  trendReason?: string
  publicSentiment?: {
    support: number
    oppose: number
    engagement: string
  }
  mediaAttention?: string
  source?: string
  groundingMetadata?: {
    webSearchQueries?: string[]
    sourceCount?: number
  }
}

interface TrendingBillsResponse {
  bills: Bill[]
  totalCount: number
  analysis: string
  lastUpdated: string
  source: string
  groundingMetadata?: {
    webSearchQueries?: string[]
    sourceCount?: number
  }
}

function TrendingBillsContent() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterLevel, setFilterLevel] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('trendScore')
  const [sortOrder, setSortOrder] = useState<string>('desc')
  const [bills, setBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<string>('')
  const [source, setSource] = useState<string>('')
  const [groundingMetadata, setGroundingMetadata] = useState<any>(null)
  const [expandedSources, setExpandedSources] = useState(false)
  const { openBillDashboard } = useBillDashboard()

  useEffect(() => {
    async function loadTrendingBills() {
      try {
        setLoading(true)
        console.log('Loading trending bills...')
        
        const response = await fetch('/api/bills/trending?limit=12&analysis=true')
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data: TrendingBillsResponse = await response.json()
        console.log('Trending bills data:', data)
        
        // Transform the data to match our interface
        const transformedBills: Bill[] = data.bills.map(bill => ({
          id: bill.id || `${bill.type || 'HR'}-${bill.number || '0000'}`,
          title: bill.title || 'Untitled Bill',
          sponsor: bill.sponsor || bill.sponsors?.[0]?.fullName || 'Unknown Sponsor',
          date: bill.date || bill.introducedDate || new Date().toISOString().split('T')[0],
          trendScore: bill.trendScore || Math.floor(Math.random() * 40) + 60,
          summary: bill.summary || bill.description || bill.title || 'No summary available',
          tags: bill.tags || bill.subjects?.legislativeSubjects?.slice(0, 3).map(s => s.name) || ['Legislation'],
          supportersCount: bill.supportersCount || Math.round((bill.trendScore || 70) * 100),
          opposersCount: bill.opposersCount || Math.round((bill.trendScore || 70) * 60),
          controversyLevel: bill.controversyLevel || 
            (bill.controversy?.includes('high') ? 'high' : 
             bill.controversy?.includes('medium') ? 'medium' : 'low') as 'low' | 'medium' | 'high',
          trendReason: bill.trendReason || 'Recent congressional activity',
          publicSentiment: bill.publicSentiment || {
            support: Math.floor(Math.random() * 30) + 35,
            oppose: Math.floor(Math.random() * 30) + 35,
            engagement: 'medium'
          },
          mediaAttention: bill.mediaAttention || 'medium',
          source: data.source,
          groundingMetadata: data.groundingMetadata
        }))
        
        setBills(transformedBills)
        setAnalysis(data.analysis)
        setSource(data.source)
        setGroundingMetadata(data.groundingMetadata)
        setError(null)
      } catch (err) {
        console.error('Error loading trending bills:', err)
        setError('Failed to load trending bills')
      } finally {
        setLoading(false)
      }
    }

    loadTrendingBills()
  }, [])

  const getControversyColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-400 bg-green-400/10'
      case 'medium': return 'text-yellow-400 bg-yellow-400/10'
      case 'high': return 'text-red-400 bg-red-400/10'
      default: return 'text-gray-400 bg-gray-400/10'
    }
  }

  const filteredAndSortedBills = bills
    .filter(bill => {
      const matchesSearch = bill.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           bill.sponsor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           bill.summary.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesFilter = filterLevel === 'all' || bill.controversyLevel === filterLevel
      return matchesSearch && matchesFilter
    })
    .sort((a, b) => {
      let aValue, bValue
      
      switch (sortBy) {
        case 'trendScore':
          aValue = a.trendScore
          bValue = b.trendScore
          break
        case 'supporters':
          aValue = a.supportersCount
          bValue = b.supportersCount
          break
        case 'opposers':
          aValue = a.opposersCount
          bValue = b.opposersCount
          break
        case 'date':
          aValue = new Date(a.date).getTime()
          bValue = new Date(b.date).getTime()
          break
        case 'title':
          aValue = a.title.toLowerCase()
          bValue = b.title.toLowerCase()
          break
        default:
          aValue = a.trendScore
          bValue = b.trendScore
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 -mx-8 -my-6 px-8 py-6">
      {/* Header */}
      <header className="bg-slate-950/80 backdrop-blur-sm border-b border-white/10 sticky top-0 z-50 -mx-8 px-8 -mt-6 pt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link 
                href="/"
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="text-white" size={20} />
              </Link>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-democracy-gold/20 rounded-lg">
                  <TrendingUp className="text-democracy-gold" size={24} />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Trending Bills</h1>
                  <p className="text-sm text-gray-400">
                    Most discussed legislation this week
                    {source && source !== 'mock' && (
                      <span className="ml-2 text-xs text-truth-green">
                        • {source}
                      </span>
                    )}
                  </p>
                </div>
              </div>
              
              {/* Source Dropdown */}
              {source && source !== 'mock' && groundingMetadata && (
                <div className="relative">
                  <button
                    onClick={() => setExpandedSources(!expandedSources)}
                    className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors text-sm"
                  >
                    <span className="text-truth-green">Sources ({groundingMetadata.sourceCount || 1})</span>
                    {expandedSources ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  
                  {expandedSources && (
                    <div className="absolute right-0 top-full mt-2 w-80 bg-slate-800 border border-white/10 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
                      <div className="p-4 space-y-4">
                        <div className="text-sm">
                          <p className="font-medium text-gray-300 mb-2">Data Source:</p>
                          <p className="text-xs leading-relaxed bg-slate-900/50 p-2 rounded border border-white/5">{source}</p>
                        </div>
                        
                        {groundingMetadata.webSearchQueries && groundingMetadata.webSearchQueries.length > 0 && (
                          <div className="text-sm">
                            <p className="font-medium text-gray-300 mb-2">Search Queries Used:</p>
                            <div className="space-y-2 max-h-32 overflow-y-auto">
                              {groundingMetadata.webSearchQueries.slice(0, 8).map((query: string, idx: number) => (
                                <div key={idx} className="text-xs text-gray-500 bg-slate-900/50 p-2 rounded border border-white/5">
                                  <div className="flex items-start gap-2">
                                    <span className="text-truth-green font-mono text-xs flex-shrink-0 mt-0.5">{idx + 1}.</span>
                                    <span className="leading-relaxed">
                                      {query.length > 80 ? `${query.substring(0, 80)}...` : query}
                                    </span>
                                  </div>
                                </div>
                              ))}
                              {groundingMetadata.webSearchQueries.length > 8 && (
                                <div className="text-xs text-gray-500 italic text-center py-1">
                                  +{groundingMetadata.webSearchQueries.length - 8} more queries
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {groundingMetadata.sourceCount && groundingMetadata.sourceCount > 0 && (
                          <div className="text-sm pt-2 border-t border-white/10">
                            <p className="font-medium text-gray-300 mb-1">Sources Consulted:</p>
                            <p className="text-truth-green">{groundingMetadata.sourceCount} web sources</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Controls */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="bg-slate-900/70 rounded-xl p-6 border border-white/10">
            <div className="flex flex-col gap-4">
              {/* Top Row: Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search bills, sponsors, or keywords..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-democracy-gold focus:border-transparent"
                  />
                </div>
              </div>
              
              {/* Bottom Row: Filters and Sorting */}
              <div className="flex flex-col md:flex-row gap-4">
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
                    <option value="trendScore">Trend Score</option>
                    <option value="supporters">Most Supporters</option>
                    <option value="opposers">Most Opposers</option>
                    <option value="date">Date (Newest)</option>
                    <option value="title">Title (A-Z)</option>
                  </select>
                </div>

                {/* Sort Order */}
                <div className="md:w-32">
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-democracy-gold focus:border-transparent appearance-none"
                  >
                    <option value="desc">High to Low</option>
                    <option value="asc">Low to High</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Results Count */}
            <div className="mt-4 text-sm text-gray-400">
              {loading ? (
                <span>Loading trending bills...</span>
              ) : error ? (
                <span className="text-red-400">Error loading bills: {error}</span>
              ) : (
                <span>Showing {filteredAndSortedBills.length} of {bills.length} bills</span>
              )}
            </div>
          </div>
        </motion.div>

        {/* Bills Grid */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
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
        ) : error ? (
          <div className="bg-slate-900/80 rounded-xl p-8 border border-red-500/20 text-center">
            <AlertTriangle className="mx-auto mb-4 text-red-400" size={48} />
            <h3 className="text-lg font-semibold text-white mb-2">Failed to Load Trending Bills</h3>
            <p className="text-gray-400 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-truth-green text-white rounded-lg hover:bg-truth-green/80 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {filteredAndSortedBills.map((bill, index) => (
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
                    <span className="text-xs font-mono text-gray-400">{bill.id}</span>
                    <div className={`text-xs px-2 py-1 rounded-full ${getControversyColor(bill.controversyLevel)}`}>
                      {bill.controversyLevel === 'high' && <AlertTriangle size={10} className="inline mr-1" />}
                      {bill.controversyLevel} controversy
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-white group-hover:text-truth-green transition-colors mb-2 serif-text">
                    {bill.title}
                  </h3>
                  <p className="text-sm text-gray-400 mb-3">{bill.sponsor}</p>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">{bill.trendScore}</div>
                  <div className="text-xs text-gray-400">Trend Score</div>
                </div>
              </div>

              <p className="text-sm text-gray-300 mb-3 line-clamp-3">{bill.summary}</p>

              {bill.trendReason && (
                <div className="mb-3 p-2 bg-truth-green/10 border border-truth-green/20 rounded-lg">
                  <p className="text-xs text-truth-green font-medium mb-1">Why it's trending:</p>
                  <p className="text-xs text-gray-300">{bill.trendReason}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-2 mb-4">
                {bill.tags.map((tag, tagIndex) => (
                  <span key={tagIndex} className="text-xs px-2 py-1 bg-white/5 rounded-md text-gray-300">
                    {tag}
                  </span>
                ))}
              </div>
              
              <div className="flex items-center justify-between text-xs">
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
        )}

        {/* Empty State */}
        {!loading && !error && filteredAndSortedBills.length === 0 && (
          <motion.div 
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="text-gray-400 mb-4">
              <Search size={48} className="mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No bills found</h3>
              <p>Try adjusting your search terms or filter criteria.</p>
            </div>
          </motion.div>
        )}
      </main>

      {/* Bill Dashboard Overlay */}
      <BillDashboardScan />
    </div>
  )
}

export default function TrendingBillsPage() {
  return (
    <BillDashboardProvider>
      <TrendingBillsContent />
    </BillDashboardProvider>
  )
}
