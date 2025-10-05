'use client'

import { useState, useRef, useEffect } from 'react'
import * as d3 from 'd3'
import { feature } from 'topojson-client'
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
  'WA': { name: 'Washington', bills: 28, funding: '$1.2M', trending: ['Tech Innovation Act', 'Green Energy Bill'] },
  'IL': { name: 'Illinois', bills: 31, funding: '$1.5M', trending: ['Infrastructure Bill', 'Education Reform'] },
  'PA': { name: 'Pennsylvania', bills: 29, funding: '$1.4M', trending: ['Healthcare Bill', 'Tax Reform Act'] },
  'AZ': { name: 'Arizona', bills: 24, funding: '$1.1M', trending: ['Water Rights Bill', 'Immigration Reform'] },
  'GA': { name: 'Georgia', bills: 26, funding: '$1.3M', trending: ['Voting Rights Act', 'Business Tax Bill'] },
  'MI': { name: 'Michigan', bills: 27, funding: '$1.2M', trending: ['Auto Industry Bill', 'Clean Water Act'] },
  'CO': { name: 'Colorado', bills: 25, funding: '$1.0M', trending: ['Cannabis Reform', 'Outdoor Recreation Act'] },
  'OH': { name: 'Ohio', bills: 30, funding: '$1.4M', trending: ['Manufacturing Bill', 'Education Funding'] },
}

export default function USMapInteractive() {
  const mapRef = useRef<HTMLDivElement>(null)
  const [hoveredState, setHoveredState] = useState<string | null>(null)
  const [selectedState, setSelectedState] = useState<string | null>(null)

  useEffect(() => {
    if (!mapRef.current) return

    const width = 960
    const height = 600
    
    // Clear any existing SVG
    d3.select(mapRef.current).select('svg').remove()
    
    const svg = d3.select(mapRef.current)
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('class', 'w-full h-full')

    // Add glow effect
    const defs = svg.append('defs')
    
    const filter = defs.append('filter')
      .attr('id', 'glow')
    
    filter.append('feGaussianBlur')
      .attr('stdDeviation', '2')
      .attr('result', 'coloredBlur')
    
    const feMerge = filter.append('feMerge')
    feMerge.append('feMergeNode').attr('in', 'coloredBlur')
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic')

    // Create projection for US map
    const projection = d3.geoAlbersUsa()
      .scale(1200)
      .translate([width / 2, height / 2])

    const path = d3.geoPath().projection(projection)

    // State FIPS to abbreviation mapping
    const fipsToAbbr: Record<string, string> = {
      '06': 'CA', '48': 'TX', '36': 'NY', '12': 'FL', '53': 'WA',
      '17': 'IL', '42': 'PA', '04': 'AZ', '13': 'GA', '26': 'MI',
      '08': 'CO', '39': 'OH'
    }

    // Fetch US states TopoJSON data
    fetch('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json')
      .then(response => response.json())
      .then(us => {
        // Convert TopoJSON to GeoJSON
        const statesGeo: any = feature(us, us.objects.states)

        // Draw state paths
        svg.append('g')
          .selectAll('path')
          .data(statesGeo.features)
          .enter()
          .append('path')
          .attr('d', path as any)
          .attr('class', 'state-path cursor-pointer')
          .attr('fill', (d: any) => {
            // Highlight states with data
            const stateAbbr = fipsToAbbr[d.id]
            return stateAbbr && mockStateData[stateAbbr] ? 'rgba(10, 147, 150, 0.4)' : 'rgba(71, 85, 105, 0.3)'
          })
          .attr('stroke', '#0a9396')
          .attr('stroke-width', 1.5)
          .attr('filter', 'url(#glow)')
          .on('mouseenter', function(event, d: any) {
            const stateAbbr = fipsToAbbr[d.id]
            if (stateAbbr && mockStateData[stateAbbr]) {
              d3.select(this)
                .transition()
                .duration(200)
                .attr('fill', 'rgba(10, 147, 150, 0.7)')
                .attr('stroke-width', 2.5)
              
              setHoveredState(stateAbbr)
            }
          })
          .on('mouseleave', function(event, d: any) {
            const stateAbbr = fipsToAbbr[d.id]
            d3.select(this)
              .transition()
              .duration(200)
              .attr('fill', stateAbbr && mockStateData[stateAbbr] ? 'rgba(10, 147, 150, 0.4)' : 'rgba(71, 85, 105, 0.3)')
              .attr('stroke-width', 1.5)
            
            setHoveredState(null)
          })
          .on('click', function(event, d: any) {
            const stateAbbr = fipsToAbbr[d.id]
            if (stateAbbr && mockStateData[stateAbbr]) {
              setSelectedState(stateAbbr)
            }
          })

        // Add pulsing animation to random active states
        const activeStates = Object.keys(mockStateData)
        const pulseAnimation = () => {
          const randomStateAbbr = activeStates[Math.floor(Math.random() * activeStates.length)]
          const stateFips = Object.keys(fipsToAbbr).find(fips => fipsToAbbr[fips] === randomStateAbbr)
          const stateFeature = statesGeo.features.find((f: any) => f.id === stateFips)
          
          if (stateFeature && path.centroid(stateFeature as any)) {
            const [cx, cy] = path.centroid(stateFeature as any)
            
            svg.append('circle')
              .attr('cx', cx)
              .attr('cy', cy)
              .attr('r', 5)
              .attr('fill', 'none')
              .attr('stroke', '#f77f00')
              .attr('stroke-width', 2)
              .attr('opacity', 0.8)
              .transition()
              .duration(2000)
              .attr('r', 30)
              .attr('opacity', 0)
              .remove()
          }
        }

        // Pulse every 3 seconds
        const interval = setInterval(pulseAnimation, 3000)
        
        return () => {
          clearInterval(interval)
        }
      })
      .catch(error => {
        console.error('Error loading map data:', error)
      })
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

      <div ref={mapRef} className="relative h-[600px]" />

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