'use client'

import { motion } from 'framer-motion'
import { TrendingUp, Users, Calendar, AlertTriangle, ChevronRight } from 'lucide-react'
import { useBillDashboard } from '@/lib/useBillDashboard'
import { useState, useEffect } from 'react'
import { getTrendingBills } from '@/lib/services/billService'
import Link from 'next/link'

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

export default function TrendingBills() {
  const { openBillDashboard } = useBillDashboard()
  const [bills, setBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadTrendingBills() {
      try {
        setLoading(true)
        const trendingBills = await getTrendingBills(5)

        // Transform to expected format
        const transformedBills: Bill[] = trendingBills
          .filter(bill => bill.id && bill.title)
          .map(bill => {
            // Calculate realistic engagement metrics from bill metadata
            const trendScore = bill.trendScore || 50
            const baseEngagement = trendScore * 100 // Base engagement from trend
            const demSupport = bill.publicSentiment?.democratSupport || 50
            const repSupport = bill.publicSentiment?.republicanSupport || 50

            return {
              id: bill.id!,
              title: bill.title!,
              sponsor: bill.sponsor || 'Unknown',
              date: bill.billNumber || new Date().toISOString().split('T')[0], // Use bill number as identifier, fallback to current date
              trendScore,
              summary: bill.description || bill.title || '',
              tags: bill.categories || [],
              supportersCount: Math.round(baseEngagement * (demSupport / 100)),
              opposersCount: Math.round(baseEngagement * (repSupport / 100)),
              controversyLevel: (bill.controversy?.includes('high') ? 'high' :
                               bill.controversy?.includes('medium') ? 'medium' : 'low') as 'low' | 'medium' | 'high'
            }
          })

        setBills(transformedBills)
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

  if (loading) {
    return (
      <motion.div
        className="bg-slate-900/50 rounded-2xl p-6 backdrop-blur-sm border border-white/10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-democracy-gold/20 rounded-lg">
              <TrendingUp className="text-democracy-gold" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Trending Bills</h2>
              <p className="text-sm text-gray-400">Most discussed legislation this week</p>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-slate-800/50 rounded-xl p-4 animate-pulse">
              <div className="h-6 bg-white/10 rounded mb-2 w-3/4"></div>
              <div className="h-4 bg-white/10 rounded mb-2 w-1/2"></div>
              <div className="h-4 bg-white/10 rounded w-full"></div>
            </div>
          ))}
        </div>
      </motion.div>
    )
  }

  if (error) {
    return (
      <motion.div
        className="bg-slate-900/50 rounded-2xl p-6 backdrop-blur-sm border border-white/10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-500/20 rounded-lg">
            <AlertTriangle className="text-red-500" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Trending Bills</h2>
            <p className="text-sm text-red-400">{error}</p>
          </div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-4 border border-yellow-500/20">
          <p className="text-sm text-gray-300 mb-2">
            <span className="font-semibold text-yellow-400">Missing API Key:</span> To display trending bills, you need a Congress.gov API key.
          </p>
          <ol className="text-xs text-gray-400 space-y-1 ml-4 list-decimal">
            <li>Get your free API key at <a href="https://api.congress.gov/sign-up/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">api.congress.gov/sign-up</a></li>
            <li>Add to .env.local: <code className="bg-slate-900 px-1 rounded">NEXT_PUBLIC_CONGRESS_API_KEY=your_key</code></li>
            <li>Restart the dev server: <code className="bg-slate-900 px-1 rounded">npm run dev</code></li>
          </ol>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div 
      className="bg-slate-900/50 rounded-2xl p-6 backdrop-blur-sm border border-white/10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-democracy-gold/20 rounded-lg">
            <TrendingUp className="text-democracy-gold" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Trending Bills</h2>
            <p className="text-sm text-gray-400">Most discussed legislation this week</p>
          </div>
        </div>
        
        <Link href="/trending" className="text-truth-green hover:text-truth-green/80 transition-colors flex items-center gap-1 text-sm">
          View all
          <ChevronRight size={16} />
        </Link>
      </div>

      <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2 scrollbar-thin">
        {bills.length === 0 && !loading && (
          <div className="bg-slate-800/50 rounded-lg p-6 border border-yellow-500/20 text-center">
            <AlertTriangle className="mx-auto mb-3 text-yellow-400" size={32} />
            <p className="text-sm text-gray-300 mb-2">
              <span className="font-semibold text-yellow-400">No bills loaded</span>
            </p>
            <p className="text-xs text-gray-400 mb-3">
              This usually means the Congress.gov API key is missing or invalid.
            </p>
            <div className="bg-slate-900/50 rounded-lg p-3 text-left">
              <p className="text-xs text-gray-300 mb-2 font-semibold">Quick Fix:</p>
              <ol className="text-xs text-gray-400 space-y-1 ml-4 list-decimal">
                <li>Get your free API key at <a href="https://api.congress.gov/sign-up/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">api.congress.gov/sign-up</a></li>
                <li>Add to .env.local: <code className="bg-slate-800 px-1 rounded">NEXT_PUBLIC_CONGRESS_API_KEY=your_key</code></li>
                <li>Restart: <code className="bg-slate-800 px-1 rounded">npm run dev</code></li>
              </ol>
            </div>
          </div>
        )}
        {bills.map((bill, index) => (
          <motion.div
            key={bill.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-slate-800/50 rounded-xl p-4 hover:bg-slate-800/70 transition-all cursor-pointer group"
            onClick={() => openBillDashboard(bill.id)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-xs font-mono text-gray-400">{bill.id}</span>
                  <div className={`text-xs px-2 py-0.5 rounded-full ${getControversyColor(bill.controversyLevel)}`}>
                    {bill.controversyLevel === 'high' && <AlertTriangle size={10} className="inline mr-1" />}
                    {bill.controversyLevel} controversy
                  </div>
                </div>
                <h3 className="text-white font-semibold group-hover:text-truth-green transition-colors serif-text">
                  {bill.title}
                </h3>
                <p className="text-sm text-gray-400 mt-1">{bill.sponsor}</p>
              </div>
              
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{bill.trendScore}</div>
                <div className="text-xs text-gray-400">Trend Score</div>
              </div>
            </div>

            <p className="text-sm text-gray-300 mb-3">{bill.summary}</p>

            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {bill.tags.map((tag, tagIndex) => (
                  <span key={tagIndex} className="text-xs px-2 py-1 bg-white/5 rounded-md text-gray-300">
                    {tag}
                  </span>
                ))}
              </div>
              
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <Users size={14} className="text-green-400" />
                  <span className="text-gray-400">{bill.supportersCount.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users size={14} className="text-red-400" />
                  <span className="text-gray-400">{bill.opposersCount.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar size={14} className="text-gray-400" />
                  <span className="text-gray-400">{new Date(bill.date).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}