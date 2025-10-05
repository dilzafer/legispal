'use client'

import { motion } from 'framer-motion'
import { TrendingUp, Users, Calendar, AlertTriangle, ArrowLeft, Search, Filter } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
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
}

const mockBills: Bill[] = [
  {
    id: 'HR-2024',
    title: 'Federal Abortion Rights Protection Act',
    sponsor: 'Rep. Anna Davis (D-CA)',
    date: '2024-10-01',
    trendScore: 87,
    summary: 'This bill creates comprehensive protections for abortion rights at the federal level, establishing a national standard that supersedes state restrictions.',
    tags: ['Healthcare', 'Rights', 'Federal'],
    supportersCount: 8934,
    opposersCount: 6300,
    controversyLevel: 'high'
  },
  {
    id: 'S-3041',
    title: 'Border Security Enhancement Act',
    sponsor: 'Sen. Michael Johnson (R-TX)',
    date: '2024-09-28',
    trendScore: 92,
    summary: 'This bill increases border security funding and establishes new immigration enforcement measures at the southern border.',
    tags: ['Immigration', 'Security', 'Border'],
    supportersCount: 2234,
    opposersCount: 6687,
    controversyLevel: 'medium'
  },
  {
    id: 'HR-5555',
    title: 'Universal Background Check Act',
    sponsor: 'Rep. Sarah Martinez (D-CO)',
    date: '2024-09-25',
    trendScore: 78,
    summary: 'This bill expands background check requirements to cover all firearm sales, including private transactions and gun shows.',
    tags: ['Gun Control', 'Safety', 'Background Checks'],
    supportersCount: 8923,
    opposersCount: 3533,
    controversyLevel: 'high'
  },
  {
    id: 'HR-4567',
    title: 'Clean Energy Infrastructure Act',
    sponsor: 'Rep. James Wilson (D-CA)',
    date: '2024-09-20',
    trendScore: 85,
    summary: 'Allocates $50B for renewable energy infrastructure and creates tax incentives for solar adoption nationwide.',
    tags: ['Climate', 'Energy', 'Infrastructure'],
    supportersCount: 2340,
    opposersCount: 1120,
    controversyLevel: 'medium'
  },
  {
    id: 'S-7890',
    title: 'Digital Privacy Protection Act',
    sponsor: 'Sen. Maria Garcia (D-NY)',
    date: '2024-09-18',
    trendScore: 88,
    summary: 'Establishes comprehensive data protection standards for tech companies and strengthens consumer privacy rights.',
    tags: ['Privacy', 'Technology', 'Consumer Rights'],
    supportersCount: 3450,
    opposersCount: 890,
    controversyLevel: 'low'
  },
  {
    id: 'HR-1234',
    title: 'Healthcare Access Expansion Act',
    sponsor: 'Rep. Robert Chen (R-TX)',
    date: '2024-09-15',
    trendScore: 82,
    summary: 'Expands Medicare coverage and reduces prescription drug costs for seniors and low-income families.',
    tags: ['Healthcare', 'Medicare', 'Pharmaceuticals'],
    supportersCount: 1890,
    opposersCount: 2100,
    controversyLevel: 'high'
  }
]

function TrendingBillsContent() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterLevel, setFilterLevel] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('trendScore')
  const [sortOrder, setSortOrder] = useState<string>('desc')
  const { openBillDashboard } = useBillDashboard()

  const getControversyColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-400 bg-green-400/10'
      case 'medium': return 'text-yellow-400 bg-yellow-400/10'
      case 'high': return 'text-red-400 bg-red-400/10'
      default: return 'text-gray-400 bg-gray-400/10'
    }
  }

  const filteredAndSortedBills = mockBills
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="bg-slate-950/80 backdrop-blur-sm border-b border-white/10 sticky top-0 z-50">
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
                  <p className="text-sm text-gray-400">Most discussed legislation this week</p>
                </div>
              </div>
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
              Showing {filteredAndSortedBills.length} of {mockBills.length} bills
            </div>
          </div>
        </motion.div>

        {/* Bills Grid */}
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

              <p className="text-sm text-gray-300 mb-4 line-clamp-3">{bill.summary}</p>

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

        {/* Empty State */}
        {filteredAndSortedBills.length === 0 && (
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
