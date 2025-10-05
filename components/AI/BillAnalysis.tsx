'use client'

import { motion } from 'framer-motion'
import { Bot, Eye, AlertCircle, CheckCircle, XCircle, Brain, TrendingUp, Clock, Activity, ExternalLink } from 'lucide-react'
import { useState, useEffect } from 'react'
import { getLegislativeAnalysis, getRecentNewsSummary, LegislativeAnalysis, NewsSummary, addCitationsToText, GroundingMetadata } from '@/lib/geminiService'


// Component to render text with clickable citations
const TextWithCitations = ({ text, groundingMetadata }: { text: string, groundingMetadata?: GroundingMetadata | null }) => {
  if (!groundingMetadata || !groundingMetadata.groundingSupports || !groundingMetadata.groundingChunks) {
    return <span>{text}</span>
  }

  const supports = groundingMetadata.groundingSupports
  const chunks = groundingMetadata.groundingChunks

  // Sort supports by endIndex in descending order to avoid shifting issues when inserting
  const sortedSupports = [...supports].sort((a, b) => (b.segment?.endIndex ?? 0) - (a.segment?.endIndex ?? 0))

  let result = text
  const citationMap = new Map<number, { uri: string, title: string, index: number }>()

  for (const support of sortedSupports) {
    const endIndex = support.segment?.endIndex
    if (endIndex === undefined || !support.groundingChunkIndices?.length) {
      continue
    }

    const citationLinks = support.groundingChunkIndices
      .map(i => {
        const chunk = chunks[i]
        const uri = chunk?.web?.uri
        const title = chunk?.web?.title || 'Source'
        if (uri) {
          const citationIndex = i + 1
          citationMap.set(citationIndex, { uri, title, index: citationIndex })
          return citationIndex
        }
        return null
      })
      .filter(Boolean)

    if (citationLinks.length > 0) {
      const citationString = citationLinks.map(c => `[${c}]`).join(', ')
      result = result.slice(0, endIndex) + citationString + result.slice(endIndex)
    }
  }

  // Parse the result to make citations clickable
  const parts = result.split(/(\[\d+\])/g)
  
  return (
    <span>
      {parts.map((part, index) => {
        const citationMatch = part.match(/\[(\d+)\]/)
        if (citationMatch) {
          const citationNum = parseInt(citationMatch[1])
          const citationInfo = citationMap.get(citationNum)
          if (citationInfo) {
            return (
              <a
                key={index}
                href={citationInfo.uri}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-truth-green hover:text-democracy-gold transition-colors underline decoration-dotted"
              >
                {part}
                <ExternalLink size={10} />
              </a>
            )
          }
        }
        return part
      })}
    </span>
  )
}

export default function BillAnalysis() {
  const [analysis, setAnalysis] = useState<LegislativeAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [newsSummary, setNewsSummary] = useState<NewsSummary | null>(null)

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setLoading(true)
        const [legislativeAnalysis, recentNews] = await Promise.all([
          getLegislativeAnalysis(),
          getRecentNewsSummary()
        ])
        setAnalysis(legislativeAnalysis)
        setNewsSummary(recentNews)
      } catch (error) {
        console.error('Error fetching analysis:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalysis()
    
    // Refresh every 30 minutes
    const interval = setInterval(fetchAnalysis, 30 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const getAnalysisIcon = (type: string) => {
    switch (type) {
      case 'positive': return <CheckCircle size={16} className="text-green-400" />
      case 'negative': return <XCircle size={16} className="text-red-400" />
      case 'neutral': return <AlertCircle size={16} className="text-yellow-400" />
      default: return null
    }
  }

  if (loading) {
    return (
      <motion.div 
        className="bg-slate-900/50 rounded-2xl p-6 backdrop-blur-sm border border-white/10 h-[650px] overflow-y-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-truth-green/20 rounded-lg">
              <Brain className="text-truth-green" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">AI Analysis</h2>
              <p className="text-sm text-gray-400">Analyzing legislative landscape...</p>
            </div>
          </div>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-slate-700 rounded w-3/4"></div>
          <div className="h-4 bg-slate-700 rounded w-1/2"></div>
          <div className="h-4 bg-slate-700 rounded w-2/3"></div>
        </div>
      </motion.div>
    )
  }

  if (!analysis) {
    return (
      <motion.div 
        className="bg-slate-900/50 rounded-2xl p-6 backdrop-blur-sm border border-white/10 h-[650px] overflow-y-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-truth-green/20 rounded-lg">
            <Brain className="text-truth-green" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">AI Analysis</h2>
            <p className="text-sm text-gray-400">Unable to load analysis</p>
          </div>
        </div>
        <p className="text-gray-400">Please check your API configuration and try again.</p>
      </motion.div>
    )
  }

  return (
    <motion.div 
      className="bg-slate-900/50 rounded-2xl p-6 backdrop-blur-sm border border-white/10 h-[650px] overflow-y-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-truth-green/20 rounded-lg">
            <Brain className="text-truth-green" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">AI Analysis</h2>
            <p className="text-sm text-gray-400">Legislative Landscape Overview</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Confidence</span>
          <div className="relative w-20 h-20">
            <svg className="transform -rotate-90 w-20 h-20">
              <circle
                cx="40"
                cy="40"
                r="30"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="6"
                fill="none"
              />
              <circle
                cx="40"
                cy="40"
                r="30"
                stroke="url(#gradient)"
                strokeWidth="6"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 30}`}
                strokeDashoffset={`${2 * Math.PI * 30 * (1 - analysis.confidence / 100)}`}
                className="transition-all duration-1000"
              />
              <defs>
                <linearGradient id="gradient">
                  <stop offset="0%" stopColor="#0a9396" />
                  <stop offset="100%" stopColor="#f77f00" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold text-white">{analysis.confidence}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Recent News Summary */}
        {newsSummary && (
          <div className="bg-gradient-to-r from-truth-green/10 to-democracy-gold/10 rounded-lg p-4 border border-truth-green/20">
            <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
              <Clock size={18} className="text-truth-green" />
              This Week's Highlights
            </h3>
            <div className="text-gray-300 text-sm leading-relaxed">
              <TextWithCitations 
                text={newsSummary.summary} 
                groundingMetadata={newsSummary.groundingMetadata} 
              />
            </div>
          </div>
        )}

        {/* Legislative Landscape Summary Title */}
        <div>
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Bot size={18} className="text-truth-green" />
            Legislative Landscape Summary
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Key Events */}
          <div>
            <h4 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
              <Activity size={14} />
              Key Events This Week
            </h4>
            <ul className="space-y-3">
              {analysis.keyEvents.map((event, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-sm text-gray-300 flex items-start gap-2"
                >
                  <span className="text-truth-green mt-1 flex-shrink-0">•</span>
                  <span>{event.replace(/^\*\*(.*?):\*\*\s*/, '$1: ').replace(/^"(.*)"$/, '$1')}</span>
                </motion.li>
              ))}
            </ul>
          </div>
          
          {/* Trending Bills */}
          <div>
            <h4 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
              <TrendingUp size={14} />
              Trending Bills
            </h4>
            <ul className="space-y-3">
              {analysis.trendingBills.map((bill, index) => {
                const billText = typeof bill === 'string' ? bill : String(bill);
                return (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 + 0.2 }}
                    className="text-sm text-gray-300 flex items-start gap-2"
                  >
                    <span className="text-democracy-gold mt-1 flex-shrink-0">•</span>
                    <span>{billText.replace(/^\*\*(.*?):\*\*\s*/, '$1: ').replace(/^"(.*)"$/, '$1')}</span>
                  </motion.li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Political Climate */}
        <div className="bg-slate-800/50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-400 mb-3">Political Climate</h4>
          <div className="text-sm text-gray-300 leading-relaxed">
            {/* Split political climate into bullet points */}
            {analysis.politicalClimate.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0).map((sentence, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-2 mb-2"
              >
                <span className="text-blue-400 mt-1 flex-shrink-0">•</span>
                <span>{sentence.trim().replace(/^"(.*)"$/, '$1') + (sentence.trim().endsWith('.') ? '' : '.')}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Predictions */}
        <div className="bg-gradient-to-r from-slate-800/30 to-slate-700/30 rounded-lg p-4 border border-white/5">
          <h4 className="text-sm font-semibold text-gray-400 mb-3">Upcoming Predictions</h4>
          <div className="space-y-2">
            {analysis.predictions.map((prediction, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 + 0.4 }}
                className="flex items-start gap-3"
              >
                <AlertCircle size={14} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-300">{prediction}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Search Queries Used */}
        {analysis.groundingMetadata?.webSearchQueries && analysis.groundingMetadata.webSearchQueries.length > 0 && (
          <div className="bg-slate-800/30 rounded-lg p-4 border border-white/5">
            <h4 className="text-sm font-semibold text-gray-400 mb-2">Sources Consulted</h4>
            <div className="flex flex-wrap gap-2 mb-3">
              {analysis.groundingMetadata.webSearchQueries.map((query, index) => (
                <span
                  key={index}
                  className="text-xs bg-slate-700/50 text-gray-300 px-2 py-1 rounded-full"
                >
                  "{query}"
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Last Updated */}
        <div className="text-xs text-gray-500 text-center">
          Last updated: {new Date(analysis.lastUpdated).toLocaleString()}
        </div>
      </div>
    </motion.div>
  )
}