'use client'

import { motion } from 'framer-motion'
import { Zap, ThumbsDown, ThumbsUp, MessageCircle } from 'lucide-react'
import { useBillDashboard } from '@/lib/useBillDashboard'

interface PolarizingBill {
  id: string
  title: string
  democratSupport: number
  republicanSupport: number
  debatePoints: { left: string; right: string }
  comments: number
}

const mockPolarizingBills: PolarizingBill[] = [
  {
    id: 'HR-2024',
    title: 'Federal Abortion Rights Protection Act',
    democratSupport: 85,
    republicanSupport: 15,
    debatePoints: {
      left: 'Protects fundamental healthcare rights and bodily autonomy for all Americans',
      right: 'Represents federal overreach into state healthcare decisions and religious beliefs'
    },
    comments: 15234
  },
  {
    id: 'S-3041',
    title: 'Border Security Enhancement Act',
    democratSupport: 25,
    republicanSupport: 75,
    debatePoints: {
      left: 'Humanitarian concerns ignored and could harm border communities',
      right: 'Essential for national security and controlling illegal immigration'
    },
    comments: 8921
  },
  {
    id: 'HR-5555',
    title: 'Universal Background Check Act',
    democratSupport: 87,
    republicanSupport: 13,
    debatePoints: {
      left: 'Common-sense gun safety measure that will save lives',
      right: 'Infringes on Second Amendment rights and won\'t prevent crime'
    },
    comments: 12456
  }
]

export default function PolarizingBills() {
  const { openBillDashboard } = useBillDashboard()
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
        {mockPolarizingBills.map((bill, index) => (
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