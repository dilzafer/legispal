'use client'

import { motion } from 'framer-motion'
import QuickStats from '@/components/Dashboard/QuickStats'
import USMapInteractive from '@/components/Dashboard/USMapInteractive'
import TrendingBills from '@/components/Dashboard/TrendingBills'
import PolarizingBills from '@/components/Dashboard/PolarizingBills'
import BillAnalysis from '@/components/AI/BillAnalysis'
import MoneyFlow from '@/components/Visualizations/MoneyFlow'

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2">Democracy Dashboard</h1>
        <p className="text-gray-400">Real-time insights into government activity</p>
      </motion.div>

      <QuickStats />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lg:col-span-2">
          <USMapInteractive />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrendingBills />
        <PolarizingBills />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BillAnalysis />
        <MoneyFlow />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="bg-gradient-to-r from-truth-green/10 via-democracy-gold/10 to-gov-blue/10 rounded-2xl p-6 border border-white/10 mt-8"
      >
        <div className="text-center">
          <h3 className="text-xl font-bold text-white mb-2">Stay Informed, Stay Engaged</h3>
          <p className="text-gray-400 mb-4">Set up custom alerts for bills and representatives you care about</p>
          <button className="px-6 py-3 bg-truth-green text-white font-semibold rounded-lg hover:bg-truth-green/80 transition-colors">
            Configure Alerts
          </button>
        </div>
      </motion.div>
    </div>
  )
}