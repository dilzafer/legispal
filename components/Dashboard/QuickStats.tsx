'use client'

import { motion } from 'framer-motion'
import { Activity, DollarSign, Users, FileText } from 'lucide-react'

const stats = [
  {
    label: 'Active Bills',
    value: '1,234',
    change: '+12%',
    icon: FileText,
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/10'
  },
  {
    label: 'Lobbying This Month',
    value: '$45.2M',
    change: '+23%',
    icon: DollarSign,
    color: 'text-green-400',
    bgColor: 'bg-green-400/10'
  },
  {
    label: 'Citizen Engagement',
    value: '89.5K',
    change: '+5%',
    icon: Users,
    color: 'text-purple-400',
    bgColor: 'bg-purple-400/10'
  },
  {
    label: 'Truth Score Average',
    value: '73%',
    change: '-2%',
    icon: Activity,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400/10'
  }
]

export default function QuickStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-slate-900/50 rounded-xl p-4 backdrop-blur-sm border border-white/10"
        >
          <div className="flex items-center justify-between mb-2">
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon size={20} className={stat.color} />
            </div>
            <span className={`text-xs font-semibold ${
              stat.change.startsWith('+') ? 'text-green-400' : 'text-red-400'
            }`}>
              {stat.change}
            </span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}