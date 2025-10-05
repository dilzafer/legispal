'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { DollarSign, Building2, User, ArrowRight, RefreshCw } from 'lucide-react'
import {
  ResponsiveContainer,
  Sankey,
  Tooltip,
  Rectangle
} from 'recharts'
import type { CampaignFinanceData } from '@/lib/services/campaignFinanceService'

const nodeColors: Record<string, string> = {
  'Oil & Gas': '#f59e0b',
  'Pharmaceuticals': '#8b5cf6',
  'Tech Companies': '#3b82f6',
  'Defense Contractors': '#ef4444',
}

export default function MoneyFlow() {
  const [financeData, setFinanceData] = useState<CampaignFinanceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchFinanceData()
  }, [])

  const fetchFinanceData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/finance/dashboard')

      if (!response.ok) {
        throw new Error('Failed to fetch campaign finance data')
      }

      const data: CampaignFinanceData = await response.json()
      setFinanceData(data)
    } catch (err) {
      console.error('Error fetching finance data:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const customNodeContent = (props: any) => {
    const { x, y, width, height, index, payload } = props

    // First 4 nodes are typically industry sectors (sources)
    const isSource = index < 4
    const color = isSource ? nodeColors[payload.name] || '#64748b' : '#475569'

    return (
      <g key={`node-${index}`}>
        <Rectangle
          key={`rect-${index}`}
          x={x}
          y={y}
          width={width}
          height={height}
          fill={color}
          fillOpacity={0.8}
        />
        <text
          key={`text-${index}`}
          x={isSource ? x - 8 : x + width / 2}
          y={y + height / 2}
          textAnchor={isSource ? 'end' : 'middle'}
          dominantBaseline="middle"
          fill="white"
          fontSize="12"
          fontWeight={isSource ? 500 : 400}
        >
          {payload.name}
        </text>
      </g>
    )
  }

  const formatCurrency = (amount: number): string => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`
    }
    return `$${amount.toLocaleString()}`
  }

  return (
    <motion.div
      className="bg-slate-900/50 rounded-2xl p-6 backdrop-blur-sm border border-white/10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-500/20 rounded-lg">
            <DollarSign className="text-green-500" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Campaign Finance Flow</h2>
            <p className="text-sm text-gray-400">Follow the money trail</p>
          </div>
        </div>

        <div className="flex gap-2 text-xs items-center ml-auto">
          <div className="flex items-center gap-1.5">
            <Building2 size={14} className="text-gray-400" />
            <span className="text-gray-400">Donors</span>
          </div>
          <ArrowRight size={14} className="text-gray-400" />
          <div className="flex items-center gap-1.5">
            <User size={14} className="text-gray-400" />
            <span className="text-gray-400">Recipients</span>
          </div>

          {!loading && (
            <button
              onClick={fetchFinanceData}
              className="ml-2 p-1 hover:bg-green-500/20 rounded transition-colors"
              title="Refresh data"
            >
              <RefreshCw size={14} className="text-green-400 hover:text-green-300" />
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="h-[400px] flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="animate-spin text-green-500 mx-auto mb-2" size={32} />
            <p className="text-sm text-gray-400">Loading campaign finance data...</p>
          </div>
        </div>
      ) : error ? (
        <div className="h-[400px] flex items-center justify-center">
          <div className="text-center">
            <p className="text-sm text-red-400 mb-2">Error loading data</p>
            <p className="text-xs text-gray-500">{error}</p>
            <button
              onClick={fetchFinanceData}
              className="mt-4 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors text-sm"
            >
              Retry
            </button>
          </div>
        </div>
      ) : financeData ? (
        <>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <Sankey
                data={{ nodes: financeData.nodes, links: financeData.links }}
                nodeWidth={15}
                nodePadding={50}
                margin={{ top: 20, right: 80, bottom: 20, left: 120 }}
                node={customNodeContent}
                link={{ stroke: '#0a9396', strokeOpacity: 0.5 }}
              >
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(30, 41, 59, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    color: '#ffffff',
                  }}
                  labelStyle={{ color: '#ffffff' }}
                  itemStyle={{ color: '#ffffff' }}
                  formatter={(value: number) => `$${value.toLocaleString()}`}
                />
              </Sankey>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-1">Total Tracked</p>
              <p className="text-xl font-bold text-white">
                {formatCurrency(financeData.totals.tracked)}
              </p>
              <p className="text-xs text-green-400">{financeData.totals.period}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-1">Dark Money</p>
              <p className="text-xl font-bold text-white">
                {formatCurrency(financeData.totals.darkMoney)}
              </p>
              <p className="text-xs text-yellow-400">Estimated</p>
            </div>
          </div>
        </>
      ) : null}
    </motion.div>
  )
}
