'use client'

import { motion } from 'framer-motion'
import { TrendingUp, Users, Calendar, AlertTriangle, ChevronRight } from 'lucide-react'
import { useBillDashboard } from '@/lib/useBillDashboard'

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
  }
]

export default function TrendingBills() {
  const { openBillDashboard } = useBillDashboard()
  const getControversyColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-400 bg-green-400/10'
      case 'medium': return 'text-yellow-400 bg-yellow-400/10'
      case 'high': return 'text-red-400 bg-red-400/10'
      default: return 'text-gray-400 bg-gray-400/10'
    }
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
        
        <button className="text-truth-green hover:text-truth-green/80 transition-colors flex items-center gap-1 text-sm">
          View all
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="space-y-4">
        {mockBills.map((bill, index) => (
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