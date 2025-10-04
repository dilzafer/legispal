'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { DollarSign, Building2, User, ArrowRight } from 'lucide-react'
import { 
  ResponsiveContainer, 
  Sankey, 
  Tooltip,
  Rectangle 
} from 'recharts'

const data = {
  nodes: [
    { id: 0, name: 'Oil & Gas' },
    { id: 1, name: 'Pharmaceuticals' },
    { id: 2, name: 'Tech Companies' },
    { id: 3, name: 'Defense Contractors' },
    { id: 4, name: 'Sen. Johnson (R)' },
    { id: 5, name: 'Sen. Smith (D)' },
    { id: 6, name: 'Rep. Davis (R)' },
    { id: 7, name: 'Rep. Wilson (D)' },
    { id: 8, name: 'Energy Committee' },
    { id: 9, name: 'Health Committee' },
  ],
  links: [
    { source: 0, target: 4, value: 250000 },
    { source: 0, target: 6, value: 150000 },
    { source: 1, target: 5, value: 180000 },
    { source: 1, target: 7, value: 120000 },
    { source: 2, target: 5, value: 300000 },
    { source: 2, target: 7, value: 200000 },
    { source: 3, target: 4, value: 400000 },
    { source: 3, target: 6, value: 350000 },
    { source: 4, target: 8, value: 100000 },
    { source: 5, target: 9, value: 150000 },
    { source: 6, target: 8, value: 80000 },
    { source: 7, target: 9, value: 120000 },
  ],
}

const nodeColors: Record<string, string> = {
  'Oil & Gas': '#f59e0b',
  'Pharmaceuticals': '#8b5cf6',
  'Tech Companies': '#3b82f6',
  'Defense Contractors': '#ef4444',
}

export default function MoneyFlow() {
  const [selectedNode, setSelectedNode] = useState<string | null>(null)

  const customNodeContent = (props: any) => {
    const { x, y, width, height, index, payload } = props
    const isSource = index < 4
    const color = isSource ? nodeColors[payload.name] || '#64748b' : '#475569'

    return (
      <g key={`node-${index}`}>
        <Rectangle
          x={x}
          y={y}
          width={width}
          height={height}
          fill={color}
          fillOpacity={0.8}
        />
        <text
          x={x + width / 2}
          y={y + height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="white"
          fontSize="12"
        >
          {payload.name}
        </text>
      </g>
    )
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
        
        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-2">
            <Building2 size={14} className="text-gray-400" />
            <span className="text-gray-400">Donors</span>
          </div>
          <ArrowRight size={14} className="text-gray-400" />
          <div className="flex items-center gap-2">
            <User size={14} className="text-gray-400" />
            <span className="text-gray-400">Recipients</span>
          </div>
        </div>
      </div>

      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <Sankey
            data={data}
            nodeWidth={15}
            nodePadding={50}
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
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
          <p className="text-xl font-bold text-white">$3.2M</p>
          <p className="text-xs text-green-400">Last 30 days</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">Dark Money</p>
          <p className="text-xl font-bold text-white">$1.5M</p>
          <p className="text-xs text-yellow-400">Estimated</p>
        </div>
      </div>
    </motion.div>
  )
}