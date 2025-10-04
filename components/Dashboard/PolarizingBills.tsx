'use client'

import { motion } from 'framer-motion'
import { Zap, ThumbsDown, ThumbsUp, MessageCircle, AlertTriangle } from 'lucide-react'
import { useBillDashboard } from '@/lib/useBillDashboard'
import { useState, useEffect } from 'react'
import { getPolarizingBills } from '@/lib/services/billService'

interface PolarizingBill {
  id: string
  title: string
  democratSupport: number
  republicanSupport: number
  debatePoints: { left: string; right: string }
  comments: number
}

export default function PolarizingBills() {
  const { openBillDashboard } = useBillDashboard()
  const [bills, setBills] = useState<PolarizingBill[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadPolarizingBills() {
      try {
        setLoading(true)
        const polarizingBills = await getPolarizingBills(3)

        // Transform to expected format
        const transformedBills: PolarizingBill[] = polarizingBills
          .filter(bill => bill.id && bill.title && bill.publicSentiment)
          .map(bill => ({
            id: bill.id!,
            title: bill.title!,
            democratSupport: bill.publicSentiment!.democratSupport,
            republicanSupport: bill.publicSentiment!.republicanSupport,
            debatePoints: {
              left: bill.publicSentiment!.argumentsFor,
              right: bill.publicSentiment!.argumentsAgainst
            },
            comments: bill.publicSentiment!.comments || 0
          }))

        setBills(transformedBills)
        setError(null)
      } catch (err) {
        console.error('Error loading polarizing bills:', err)
        setError('Failed to load polarizing bills')
      } finally {
        setLoading(false)
      }
    }

    loadPolarizingBills()
  }, [])
  const PartisanMeter = ({ bill }: { bill: PolarizingBill }) => {
    const totalWidth = 300
    const demWidth = (bill.democratSupport / 100) * totalWidth
    const repWidth = (bill.republicanSupport / 100) * totalWidth

    return (
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-blue-400">Dems {bill.democratSupport}%</span>
          <span className="text-xs text-red-400">GOP {bill.republicanSupport}%</span>
        </div>

        <div className="relative h-8 rounded-full overflow-hidden flex w-full">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-400"
            initial={{ width: 0 }}
            animate={{ width: `${bill.democratSupport}%` }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />

          <motion.div
            className="h-full bg-gradient-to-r from-red-400 to-red-500"
            initial={{ width: 0 }}
            animate={{ width: `${bill.republicanSupport}%` }}
            transition={{ duration: 0.8, delay: 0.4 }}
          />

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Zap className="text-white/80" size={16} />
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <motion.div
        className="bg-slate-900/50 rounded-2xl p-6 backdrop-blur-sm border border-white/10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <Zap className="text-red-500" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Polarizing Bills</h2>
              <p className="text-sm text-gray-400">Highest partisan divide</p>
            </div>
          </div>
        </div>
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-slate-800/50 rounded-xl p-5 animate-pulse">
              <div className="h-6 bg-white/10 rounded mb-4 w-3/4"></div>
              <div className="h-8 bg-white/10 rounded mb-4"></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="h-20 bg-white/10 rounded"></div>
                <div className="h-20 bg-white/10 rounded"></div>
              </div>
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
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-500/20 rounded-lg">
            <AlertTriangle className="text-red-500" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Polarizing Bills</h2>
            <p className="text-sm text-red-400">{error}</p>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="bg-slate-900/50 rounded-2xl p-6 backdrop-blur-sm border border-white/10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-500/20 rounded-lg">
            <Zap className="text-red-500" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Polarizing Bills</h2>
            <p className="text-sm text-gray-400">Highest partisan divide</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {bills.map((bill, index) => (
          <motion.div
            key={bill.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gradient-to-r from-slate-800/50 via-slate-800/30 to-slate-800/50 rounded-xl p-5 border border-white/5 cursor-pointer hover:bg-gradient-to-r hover:from-slate-800/70 hover:via-slate-800/50 hover:to-slate-800/70 transition-all duration-200"
            onClick={() => openBillDashboard(bill.id)}
          >
            <div className="mb-4">
              <span className="text-xs font-mono text-gray-500">{bill.id}</span>
              <h3 className="text-lg font-semibold text-white mt-1 serif-text">{bill.title}</h3>
            </div>

            <PartisanMeter bill={bill} />

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/20">
                <div className="flex items-center gap-2 text-blue-400 mb-1">
                  <ThumbsUp size={14} />
                  <span className="text-xs font-semibold">Left View</span>
                </div>
                <p className="text-xs text-gray-300">{bill.debatePoints.left}</p>
              </div>
              
              <div className="bg-red-500/10 rounded-lg p-3 border border-red-500/20">
                <div className="flex items-center gap-2 text-red-400 mb-1">
                  <ThumbsDown size={14} />
                  <span className="text-xs font-semibold">Right View</span>
                </div>
                <p className="text-xs text-gray-300">{bill.debatePoints.right}</p>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-end text-gray-400">
              <MessageCircle size={14} />
              <span className="text-xs ml-1">{bill.comments.toLocaleString()} comments</span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}