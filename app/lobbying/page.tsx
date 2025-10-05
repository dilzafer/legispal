'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Search, Filter, ArrowLeft, ChevronDown, ChevronUp, DollarSign, Calendar, Building, Target, Loader2, Shield, User, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import BillDashboardScan from '@/components/Dashboard/BillDashboardScan'
import { BillDashboardProvider, useBillDashboard } from '@/lib/useBillDashboard'
import { mockBillData } from '@/lib/mockBillData'
import EthicsAnalysisPopup from '@/components/Lobbying/EthicsAnalysisPopup'
import { LobbyistProfile } from '@/lib/api/workers'

interface LobbyingActivity {
  id: string
  client: string
  lobbyist: string
  amount: number
  quarter: string
  year: number
  issue: string
  description: string
  relatedBills: string[]
  disclosureDate: string
  lobbyingFirm: string
  category: 'Energy' | 'Healthcare' | 'Technology' | 'Finance' | 'Defense' | 'Agriculture' | 'Transportation' | 'Education' | 'Other'
  target: 'House' | 'Senate' | 'Both' | 'Administration'
  status: 'Active' | 'Completed' | 'Pending'
}

interface LobbyingStats {
  totalSpending: number
  activeActivities: number
  uniqueBills: number
  averagePerActivity: number
  period: string
  totalFilings?: number
  sampleSize?: number
  estimatedByAI?: boolean
}

function LobbyingContent() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterTarget, setFilterTarget] = useState<string>('all')
  const [expandedActivity, setExpandedActivity] = useState<string | null>(null)
  const [expandedLobbyists, setExpandedLobbyists] = useState<Set<string>>(new Set())
  const [activities, setActivities] = useState<LobbyingActivity[]>([])
  const [stats, setStats] = useState<LobbyingStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [ethicsPopupOpen, setEthicsPopupOpen] = useState(false)
  const [selectedLobbyistProfile, setSelectedLobbyistProfile] = useState<LobbyistProfile | null>(null)
  const { openBillDashboard } = useBillDashboard()

  // Fetch lobbying data on mount
  useEffect(() => {
    async function fetchLobbyingData() {
      try {
        setLoading(true)
        setError(null)

        // Use 2024 Q4 data (most recent complete quarter with activities)
        const year = 2024
        const period = 'Q4'

        // Fetch activities and stats in parallel
        const [activitiesRes, statsRes] = await Promise.all([
          fetch(`/api/lobbying/filings?filing_year=${year}&filing_type=${period}&page_size=100`),
          fetch(`/api/lobbying/stats?filing_year=${year}&filing_period=fourth_quarter`)
        ])

        if (!activitiesRes.ok || !statsRes.ok) {
          throw new Error('Failed to fetch lobbying data')
        }

        const activitiesData = await activitiesRes.json()
        const statsData = await statsRes.json()

        setActivities(activitiesData.activities || [])
        setStats(statsData)

        console.log('✅ Loaded', activitiesData.activities?.length || 0, 'lobbying activities')
      } catch (err) {
        console.error('Error fetching lobbying data:', err)
        setError('Failed to load lobbying data. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchLobbyingData()
  }, [])

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Energy': return 'text-green-400 bg-green-400/10'
      case 'Healthcare': return 'text-blue-400 bg-blue-400/10'
      case 'Technology': return 'text-purple-400 bg-purple-400/10'
      case 'Finance': return 'text-yellow-400 bg-yellow-400/10'
      case 'Defense': return 'text-red-400 bg-red-400/10'
      case 'Agriculture': return 'text-orange-400 bg-orange-400/10'
      case 'Transportation': return 'text-cyan-400 bg-cyan-400/10'
      case 'Education': return 'text-pink-400 bg-pink-400/10'
      default: return 'text-gray-400 bg-gray-400/10'
    }
  }

  const getTargetColor = (target: string) => {
    switch (target) {
      case 'House': return 'text-blue-400 bg-blue-400/10'
      case 'Senate': return 'text-green-400 bg-green-400/10'
      case 'Both': return 'text-purple-400 bg-purple-400/10'
      case 'Administration': return 'text-yellow-400 bg-yellow-400/10'
      default: return 'text-gray-400 bg-gray-400/10'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'text-green-400 bg-green-400/10'
      case 'Completed': return 'text-gray-400 bg-gray-400/10'
      case 'Pending': return 'text-yellow-400 bg-yellow-400/10'
      default: return 'text-gray-400 bg-gray-400/10'
    }
  }

  const getControversyColor = (level: string) => {
    switch (level) {
      case 'Low': return 'text-green-400 bg-green-400/10'
      case 'Medium': return 'text-yellow-400 bg-yellow-400/10'
      case 'High': return 'text-red-400 bg-red-400/10'
      default: return 'text-gray-400 bg-gray-400/10'
    }
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const filteredActivities = activities
    .filter(activity => {
      const matchesSearch = searchTerm === '' ||
        activity.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.lobbyist.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.issue.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.lobbyingFirm.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = filterCategory === 'all' || activity.category === filterCategory
      const matchesTarget = filterTarget === 'all' || activity.target === filterTarget
      return matchesSearch && matchesCategory && matchesTarget
    })
    .sort((a, b) => b.amount - a.amount) // Sort by amount descending

  const toggleExpanded = (activityId: string) => {
    setExpandedActivity(expandedActivity === activityId ? null : activityId)
  }

  const toggleLobbyistExpanded = (activityId: string) => {
    const newExpanded = new Set(expandedLobbyists)
    if (newExpanded.has(activityId)) {
      newExpanded.delete(activityId)
    } else {
      newExpanded.add(activityId)
    }
    setExpandedLobbyists(newExpanded)
  }

  const handleAnalyzeEthics = (activity: LobbyingActivity) => {
    const lobbyistProfile: LobbyistProfile = {
      name: activity.lobbyist,
      firm: activity.lobbyingFirm,
      client: activity.client,
      amount: activity.amount,
      issue: activity.issue,
      description: activity.description,
      relatedBills: activity.relatedBills,
      disclosureDate: activity.disclosureDate,
      category: activity.category,
      target: activity.target,
      status: activity.status
    }
    setSelectedLobbyistProfile(lobbyistProfile)
    setEthicsPopupOpen(true)
  }

  const closeEthicsPopup = () => {
    setEthicsPopupOpen(false)
    setSelectedLobbyistProfile(null)
  }

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
                  <MessageCircle className="text-democracy-gold" size={24} />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Lobbying Activity</h1>
                  <p className="text-sm text-gray-400">Track lobbying expenditures and their impact on legislation</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="text-democracy-gold animate-spin" size={48} />
            <span className="ml-4 text-white text-lg">Loading lobbying data...</span>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-6 text-center">
            <p className="text-red-400 text-lg">{error}</p>
          </div>
        )}

        {/* Main Content */}
        {!loading && !error && (
          <>
            {/* Summary Stats */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {stats?.estimatedByAI && (
                <div className="mb-4 text-xs text-gray-400 flex items-center gap-2 justify-end">
                  <span className="inline-flex items-center gap-1 bg-purple-500/10 border border-purple-500/20 rounded-full px-3 py-1">
                    <span className="text-purple-400">✨</span>
                    <span>AI-estimated from 500 sample filings out of {stats.totalFilings?.toLocaleString()}</span>
                  </span>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-slate-900/70 rounded-xl p-6 border border-white/10">
                  <div className="flex items-center gap-3 mb-2">
                    <DollarSign className="text-green-400" size={24} />
                    <h3 className="text-lg font-semibold text-white">Total Spending</h3>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {formatAmount(stats?.totalSpending || 0)}
                  </div>
                  <p className="text-sm text-gray-400 mt-1">{stats?.period || 'Current Year'}</p>
                </div>

                <div className="bg-slate-900/70 rounded-xl p-6 border border-white/10">
                  <div className="flex items-center gap-3 mb-2">
                    <Building className="text-blue-400" size={24} />
                    <h3 className="text-lg font-semibold text-white">Active Activities</h3>
                  </div>
                  <div className="text-2xl font-bold text-white">{stats?.activeActivities || 0}</div>
                  <p className="text-sm text-gray-400 mt-1">Lobbying activities</p>
                </div>

                <div className="bg-slate-900/70 rounded-xl p-6 border border-white/10">
                  <div className="flex items-center gap-3 mb-2">
                    <Target className="text-purple-400" size={24} />
                    <h3 className="text-lg font-semibold text-white">Related Bills</h3>
                  </div>
                  <div className="text-2xl font-bold text-white">{stats?.uniqueBills || 0}</div>
                  <p className="text-sm text-gray-400 mt-1">Unique bills</p>
                </div>

                <div className="bg-slate-900/70 rounded-xl p-6 border border-white/10">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="text-yellow-400" size={24} />
                    <h3 className="text-lg font-semibold text-white">Avg. Per Activity</h3>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {formatAmount(stats?.averagePerActivity || 0)}
                  </div>
                  <p className="text-sm text-gray-400 mt-1">Average spending</p>
                </div>
              </div>
            </motion.div>

            {/* Search and Filter Controls */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="bg-slate-900/70 rounded-xl p-6 border border-white/10">
                <div className="flex flex-col gap-4">
                  {/* Search Bar */}
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="text"
                        placeholder="Search lobbying activities by client, lobbyist, issue, or description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-democracy-gold focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Filters */}
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Category Filter */}
                    <div className="md:w-48">
                      <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <select
                          value={filterCategory}
                          onChange={(e) => setFilterCategory(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-democracy-gold focus:border-transparent appearance-none"
                        >
                          <option value="all">All Categories</option>
                          <option value="Energy">Energy</option>
                          <option value="Healthcare">Healthcare</option>
                          <option value="Technology">Technology</option>
                          <option value="Finance">Finance</option>
                          <option value="Defense">Defense</option>
                          <option value="Agriculture">Agriculture</option>
                          <option value="Transportation">Transportation</option>
                          <option value="Education">Education</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    {/* Target Filter */}
                    <div className="md:w-48">
                      <select
                        value={filterTarget}
                        onChange={(e) => setFilterTarget(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-democracy-gold focus:border-transparent appearance-none"
                      >
                        <option value="all">All Targets</option>
                        <option value="House">House</option>
                        <option value="Senate">Senate</option>
                        <option value="Both">Both Chambers</option>
                        <option value="Administration">Administration</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Results Count */}
                <div className="mt-4 text-sm text-gray-400">
                  Showing {filteredActivities.length} of {activities.length} lobbying activities
                </div>
              </div>
            </motion.div>

            {/* Lobbying Activities */}
            <div className="space-y-6">
              {filteredActivities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-slate-900/80 rounded-xl border border-white/10 overflow-hidden"
                >
                  {/* Activity Header */}
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="text-xl font-bold text-white">{activity.client}</h3>
                          <div className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(activity.category)}`}>
                            {activity.category}
                          </div>
                          <div className={`text-xs px-2 py-1 rounded-full ${getTargetColor(activity.target)}`}>
                            {activity.target}
                          </div>
                          <div className={`text-xs px-2 py-1 rounded-full ${getStatusColor(activity.status)}`}>
                            {activity.status}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 mb-3 text-sm text-gray-400 flex-wrap">
                          <span>Lobbyist: <span className="text-white">{activity.lobbyist}</span></span>
                          <span>Firm: <span className="text-white">{activity.lobbyingFirm}</span></span>
                          <span>Quarter: <span className="text-white">{activity.quarter} {activity.year}</span></span>
                        </div>

                        <h4 className="text-lg font-semibold text-white mb-2">{activity.issue}</h4>
                        <p className="text-gray-300 mb-3">{activity.description}</p>

                        <div className="flex items-center justify-between">
                          <div className="text-2xl font-bold text-green-400">
                            {formatAmount(activity.amount)}
                          </div>
                          <div className="text-sm text-gray-400">
                            Disclosure: {new Date(activity.disclosureDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      {activity.relatedBills.length > 0 && (
                        <button
                          onClick={() => toggleExpanded(activity.id)}
                          className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          {expandedActivity === activity.id ? <ChevronUp className="text-white" size={20} /> : <ChevronDown className="text-white" size={20} />}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded Content - Related Bills */}
                  <AnimatePresence>
                    {expandedActivity === activity.id && activity.relatedBills.length > 0 && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-white/10"
                      >
                        <div className="p-6">
                          <h4 className="text-lg font-semibold text-white mb-4">Related Bills</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {activity.relatedBills.map((billId) => {
                              const bill = mockBillData[billId]
                              if (!bill) {
                                return (
                                  <div key={billId} className="bg-slate-800/50 rounded-lg p-4 border border-white/5">
                                    <span className="text-xs font-mono text-gray-400">{billId}</span>
                                    <p className="text-sm text-gray-400 mt-1">Bill data loading...</p>
                                  </div>
                                )
                              }

                              return (
                                <motion.div
                                  key={billId}
                                  className="bg-slate-800/50 rounded-lg p-4 border border-white/5 hover:bg-slate-800/70 transition-all cursor-pointer group"
                                  onClick={() => openBillDashboard(billId)}
                                >
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-mono text-gray-400">{bill.billNumber}</span>
                                        <div className={`text-xs px-2 py-1 rounded-full ${getControversyColor(bill.controversy.split(' ')[0])}`}>
                                          {bill.controversy.split(' ')[0]}
                                        </div>
                                      </div>
                                      <h5 className="text-white font-semibold group-hover:text-truth-green transition-colors mb-1">
                                        {bill.title}
                                      </h5>
                                      <p className="text-xs text-gray-400 mb-2">{bill.sponsor}</p>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-lg font-bold text-white">{bill.trendScore}</div>
                                      <div className="text-xs text-gray-400">Score</div>
                                    </div>
                                  </div>
                                  <p className="text-sm text-gray-300 mb-3 line-clamp-2">{bill.description}</p>
                                  <div className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-3">
                                      <div className="flex items-center gap-1">
                                        <span className="text-green-400">{bill.voteResults.yeas.toLocaleString()}</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <span className="text-red-400">{bill.voteResults.nays.toLocaleString()}</span>
                                      </div>
                                    </div>
                                    <span className="text-gray-400">{bill.status}</span>
                                  </div>
                                </motion.div>
                              )
                            })}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Expandable Lobbyist Details */}
                  <div className="border-t border-white/10">
                    <button
                      onClick={() => toggleLobbyistExpanded(activity.id)}
                      className="w-full p-4 hover:bg-slate-800/50 transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <User className="text-gray-400" size={20} />
                        <span className="text-white font-medium">Lobbyist Details</span>
                      </div>
                      {expandedLobbyists.has(activity.id) ? 
                        <ChevronUp className="text-gray-400" size={20} /> : 
                        <ChevronRight className="text-gray-400" size={20} />
                      }
                    </button>
                    
                    <AnimatePresence>
                      {expandedLobbyists.has(activity.id) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="border-t border-white/5"
                        >
                          <div className="p-6 bg-slate-800/30">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <h5 className="text-sm font-semibold text-gray-400 mb-2">Lobbyist Information</h5>
                                <div className="space-y-2 text-sm">
                                  <div>
                                    <span className="text-gray-400">Name:</span>
                                    <span className="text-white ml-2">{activity.lobbyist}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-400">Firm:</span>
                                    <span className="text-white ml-2">{activity.lobbyingFirm}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-400">Client:</span>
                                    <span className="text-white ml-2">{activity.client}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div>
                                <h5 className="text-sm font-semibold text-gray-400 mb-2">Activity Details</h5>
                                <div className="space-y-2 text-sm">
                                  <div>
                                    <span className="text-gray-400">Amount:</span>
                                    <span className="text-green-400 ml-2 font-semibold">
                                      {formatAmount(activity.amount)}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-400">Period:</span>
                                    <span className="text-white ml-2">{activity.quarter} {activity.year}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-400">Status:</span>
                                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getStatusColor(activity.status)}`}>
                                      {activity.status}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="mt-6 pt-4 border-t border-white/10">
                              <div className="flex items-center justify-between">
                                <h5 className="text-sm font-semibold text-gray-400">Ethics Analysis</h5>
                                <button
                                  onClick={() => handleAnalyzeEthics(activity)}
                                  className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors text-sm"
                                >
                                  <Shield size={16} />
                                  Analyze Ethics
                                </button>
                              </div>
                              <p className="text-xs text-gray-500 mt-2">
                                Get AI-powered analysis of transparency, compliance, and ethical concerns using Cloudflare Workers AI
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Empty State */}
            {filteredActivities.length === 0 && activities.length > 0 && (
              <motion.div
                className="text-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="text-gray-400 mb-4">
                  <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No lobbying activities found</h3>
                  <p>Try adjusting your search terms or filter criteria.</p>
                </div>
              </motion.div>
            )}

            {/* No Data State */}
            {activities.length === 0 && (
              <motion.div
                className="text-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="text-gray-400 mb-4">
                  <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No lobbying data available</h3>
                  <p>Unable to load lobbying activities at this time.</p>
                </div>
              </motion.div>
            )}
          </>
        )}
      </main>

      {/* Bill Dashboard Overlay */}
      <BillDashboardScan />

      {/* Ethics Analysis Popup */}
      <EthicsAnalysisPopup
        isOpen={ethicsPopupOpen}
        onClose={closeEthicsPopup}
        lobbyistProfile={selectedLobbyistProfile}
      />
    </div>
  )
}

export default function LobbyingPage() {
  return (
    <BillDashboardProvider>
      <LobbyingContent />
    </BillDashboardProvider>
  )
}
