'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Activity, DollarSign, Users, FileText, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'
import { useState, useEffect } from 'react'

interface StatData {
  label: string
  value: string
  change: string
  icon: any
  color: string
  bgColor: string
  loading?: boolean
  source?: string
  groundingMetadata?: {
    webSearchQueries?: string[]
    sourceCount?: number
  }
}

export default function QuickStats() {
  const [stats, setStats] = useState<StatData[]>([
    {
      label: 'Active Bills',
      value: '1,234',
      change: '+12%',
      icon: FileText,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10',
      loading: true
    },
    {
      label: 'Lobbying This Month',
      value: '$45.2M',
      change: '+23%',
      icon: DollarSign,
      color: 'text-green-400',
      bgColor: 'bg-green-400/10',
      loading: true
    },
    {
      label: 'Citizen Engagement',
      value: '89.5K',
      change: '+5%',
      icon: Users,
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/10',
      loading: true
    },
    {
      label: 'Truth Score Average',
      value: '73%',
      change: '-2%',
      icon: Activity,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400/10',
      loading: false,
      source: 'calculated'
    }
  ])

  const [expandedSources, setExpandedSources] = useState<Set<string>>(new Set())

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch active bills
        const activeBillsResponse = await fetch('/api/stats/active-bills')
        if (activeBillsResponse.ok) {
          const activeBillsData = await activeBillsResponse.json()
          setStats(prev => prev.map(stat => 
            stat.label === 'Active Bills' 
              ? { 
                  ...stat, 
                  value: activeBillsData.count.toLocaleString(), 
                  change: activeBillsData.change,
                  loading: false,
                  source: activeBillsData.source,
                  groundingMetadata: activeBillsData.groundingMetadata
                }
              : stat
          ))
        }

        // Fetch lobbying data
        const lobbyingResponse = await fetch('/api/stats/lobbying')
        if (lobbyingResponse.ok) {
          const lobbyingData = await lobbyingResponse.json()
          setStats(prev => prev.map(stat => 
            stat.label === 'Lobbying This Month' 
              ? { 
                  ...stat, 
                  value: lobbyingData.formatted, 
                  change: lobbyingData.change,
                  loading: false,
                  source: lobbyingData.source,
                  groundingMetadata: lobbyingData.groundingMetadata
                }
              : stat
          ))
        }

        // Fetch citizen engagement
        const engagementResponse = await fetch('/api/stats/citizen-engagement')
        if (engagementResponse.ok) {
          const engagementData = await engagementResponse.json()
          setStats(prev => prev.map(stat => 
            stat.label === 'Citizen Engagement' 
              ? { 
                  ...stat, 
                  value: engagementData.formatted, 
                  change: engagementData.change,
                  loading: false,
                  source: engagementData.source,
                  groundingMetadata: engagementData.groundingMetadata
                }
              : stat
          ))
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
        // Keep loading states as false to show fallback data
        setStats(prev => prev.map(stat => ({ ...stat, loading: false })))
      }
    }

    fetchStats()
  }, [])

  const toggleSourceExpansion = (statLabel: string) => {
    setExpandedSources(prev => {
      const newSet = new Set(prev)
      if (newSet.has(statLabel)) {
        newSet.delete(statLabel)
      } else {
        newSet.add(statLabel)
      }
      return newSet
    })
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const isExpanded = expandedSources.has(stat.label)
        const hasSourceData = stat.source && stat.source !== 'mock' && stat.source !== 'calculated'
        
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-slate-900/50 rounded-xl p-4 backdrop-blur-sm border border-white/10 h-48 overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon size={20} className={stat.color} />
              </div>
              <div className="text-right">
                <span className={`text-xs font-semibold ${
                  stat.change.startsWith('+') ? 'text-green-400' : 'text-red-400'
                }`}>
                  {stat.change}
                </span>
                {stat.loading && (
                  <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin mt-1 ml-auto"></div>
                )}
              </div>
            </div>
            
            <div className="flex-1 overflow-hidden">
              <div className="mb-3">
                <p className="text-2xl font-bold text-white">
                  {stat.loading ? '...' : stat.value}
                </p>
                <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
              </div>

              {/* Sources section removed for cleaner UI */}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}