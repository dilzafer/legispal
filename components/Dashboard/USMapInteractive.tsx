'use client'

import { useState, useRef, useEffect } from 'react'
import * as d3 from 'd3'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, TrendingUp, DollarSign } from 'lucide-react'

interface StateData {
  name: string
  bills: number
  funding: string
  trending: string[]
}

const mockStateData: Record<string, StateData> = {
  'CA': { name: 'California', bills: 47, funding: '$2.3M', trending: ['Climate Action Bill', 'Housing Reform Act'] },
  'TX': { name: 'Texas', bills: 38, funding: '$3.1M', trending: ['Energy Independence Act', 'Border Security Bill'] },
  'NY': { name: 'New York', bills: 42, funding: '$1.8M', trending: ['Financial Reform Act', 'Healthcare Access Bill'] },
  'FL': { name: 'Florida', bills: 35, funding: '$2.5M', trending: ['Education Reform Bill', 'Hurricane Relief Act'] },
}

export default function USMapInteractive() {
  const mapRef = useRef<HTMLDivElement>(null)
  const [hoveredState, setHoveredState] = useState<string | null>(null)
  const [selectedState, setSelectedState] = useState<string | null>(null)

  useEffect(() => {
    if (!mapRef.current) return

    const width = 800
    const height = 500
    
    // Clear any existing SVG
    d3.select(mapRef.current).select('svg').remove()
    
    const svg = d3.select(mapRef.current)
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('class', 'w-full h-full')

    // Create simplified US states representation
    const states = [
      { id: 'CA', x: 50, y: 200, label: 'CA' },
      { id: 'TX', x: 400, y: 350, label: 'TX' },
      { id: 'NY', x: 700, y: 150, label: 'NY' },
      { id: 'FL', x: 650, y: 400, label: 'FL' },
      { id: 'WA', x: 80, y: 80, label: 'WA' },
      { id: 'IL', x: 550, y: 200, label: 'IL' },
      { id: 'PA', x: 680, y: 180, label: 'PA' },
      { id: 'AZ', x: 200, y: 320, label: 'AZ' },
      { id: 'GA', x: 620, y: 330, label: 'GA' },
      { id: 'MI', x: 580, y: 160, label: 'MI' },
      { id: 'CO', x: 350, y: 250, label: 'CO' },
      { id: 'OH', x: 620, y: 200, label: 'OH' },
    ]

    // Add glow effect
    const defs = svg.append('defs')
    
    const filter = defs.append('filter')
      .attr('id', 'glow')
    
    filter.append('feGaussianBlur')
      .attr('stdDeviation', '3')
      .attr('result', 'coloredBlur')
    
    const feMerge = filter.append('feMerge')
    feMerge.append('feMergeNode').attr('in', 'coloredBlur')
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic')

    // Create state circles
    const stateGroups = svg.selectAll('.state')
      .data(states)
      .enter()
      .append('g')
      .attr('class', 'state cursor-pointer')
      .attr('transform', d => `translate(${d.x}, ${d.y})`)

    // Add circles for states
    stateGroups.append('circle')
      .attr('r', 40)
      .attr('fill', 'rgba(10, 147, 150, 0.3)')
      .attr('stroke', '#0a9396')
      .attr('stroke-width', 2)
      .attr('filter', 'url(#glow)')
      .on('mouseenter', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 45)
          .attr('fill', 'rgba(10, 147, 150, 0.5)')
        
        setHoveredState(d.id)
      })
      .on('mouseleave', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 40)
          .attr('fill', 'rgba(10, 147, 150, 0.3)')
        
        setHoveredState(null)
      })
      .on('click', function(event, d) {
        setSelectedState(d.id)
      })

    // Add state labels
    stateGroups.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.3em')
      .attr('fill', 'white')
      .attr('font-size', '16')
      .attr('font-weight', 'bold')
      .attr('pointer-events', 'none')
      .text(d => d.label)

    // Add pulsing animation to random states
    const pulseAnimation = () => {
      const randomState = states[Math.floor(Math.random() * states.length)]
      
      svg.append('circle')
        .attr('cx', randomState.x)
        .attr('cy', randomState.y)
        .attr('r', 40)
        .attr('fill', 'none')
        .attr('stroke', '#f77f00')
        .attr('stroke-width', 3)
        .attr('opacity', 0.8)
        .transition()
        .duration(2000)
        .attr('r', 60)
        .attr('opacity', 0)
        .remove()
    }

    // Pulse every 3 seconds
    const interval = setInterval(pulseAnimation, 3000)
    
    return () => {
      clearInterval(interval)
    }
  }, [])

  const stateData = hoveredState ? mockStateData[hoveredState] || {
    name: hoveredState,
    bills: Math.floor(Math.random() * 50),
    funding: `$${(Math.random() * 5).toFixed(1)}M`,
    trending: ['Sample Bill 1', 'Sample Bill 2']
  } : null

  return (
    <motion.div 
      className="relative bg-slate-900/50 rounded-2xl p-6 backdrop-blur-sm border border-white/10"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Legislative Activity Map</h2>
          <p className="text-sm text-gray-400">Real-time bill tracking across states</p>
        </div>
        
        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-truth-green" />
            <span className="text-gray-400">Active</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-democracy-gold animate-pulse" />
            <span className="text-gray-400">New Activity</span>
          </div>
        </div>
      </div>

      <div ref={mapRef} className="relative h-[500px]" />

      <AnimatePresence>
        {stateData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute top-20 right-8 bg-slate-800/95 backdrop-blur-xl rounded-xl p-4 border border-white/20 w-64"
          >
            <h3 className="text-lg font-semibold text-white mb-3">{stateData.name}</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-400">
                  <FileText size={16} />
                  <span className="text-sm">Active Bills</span>
                </div>
                <span className="text-white font-semibold">{stateData.bills}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-400">
                  <DollarSign size={16} />
                  <span className="text-sm">Lobbying</span>
                </div>
                <span className="text-white font-semibold">{stateData.funding}</span>
              </div>
              
              <div className="pt-2 border-t border-white/10">
                <div className="flex items-center gap-2 text-gray-400 mb-2">
                  <TrendingUp size={16} />
                  <span className="text-sm">Trending Bills</span>
                </div>
                {stateData.trending.map((bill, index) => (
                  <div key={index} className="text-xs text-gray-300 mb-1.5 pl-6">
                    • {bill}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}