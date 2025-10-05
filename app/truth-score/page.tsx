'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Shield, ArrowLeft, TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp, Brain, Database, Eye, Scale, Zap, Info, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { truthScoreCalculation, truthScoreFactors, truthScoreInsights, TruthScoreFactor, TruthScoreInsight } from '@/lib/mockTruthScoreData'

export default function TruthScorePage() {
  const [expandedFactor, setExpandedFactor] = useState<string | null>(null)
  const [selectedInsight, setSelectedInsight] = useState<string | null>(null)

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Transparency': return Eye
      case 'Integrity': return Shield
      case 'Bias Detection': return Brain
      case 'Accountability': return Scale
      case 'Accuracy': return Database
      default: return Info
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Transparency': return 'text-cyan-400 bg-cyan-400/10'
      case 'Integrity': return 'text-green-400 bg-green-400/10'
      case 'Bias Detection': return 'text-purple-400 bg-purple-400/10'
      case 'Accountability': return 'text-blue-400 bg-blue-400/10'
      case 'Accuracy': return 'text-emerald-400 bg-emerald-400/10'
      default: return 'text-gray-400 bg-gray-400/10'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400'
    if (score >= 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="text-green-400" size={16} />
      case 'down': return <TrendingDown className="text-red-400" size={16} />
      case 'stable': return <Minus className="text-gray-400" size={16} />
      default: return <Minus className="text-gray-400" size={16} />
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-400 bg-red-400/10'
      case 'medium': return 'text-yellow-400 bg-yellow-400/10'
      case 'low': return 'text-green-400 bg-green-400/10'
      default: return 'text-gray-400 bg-gray-400/10'
    }
  }

  const toggleExpanded = (factorId: string) => {
    setExpandedFactor(expandedFactor === factorId ? null : factorId)
  }

  const toggleInsight = (insightId: string) => {
    setSelectedInsight(selectedInsight === insightId ? null : insightId)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 -mx-8 -my-6 px-8 py-6">
      {/* Header */}
      <header className="bg-slate-950/80 backdrop-blur-sm border-b border-white/10 -mx-8 px-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link 
                href="/"
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="text-white" size={20} />
              </Link>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-democracy-gold/20 rounded-lg">
                  <Shield className="text-democracy-gold" size={24} />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Truth Score Engine</h1>
                  <p className="text-sm text-gray-400">Advanced political information verification system</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Truth Score Display */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="bg-slate-900/70 rounded-xl p-8 border border-white/10 text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <svg className="w-48 h-48" viewBox="0 0 36 36">
                  <path 
                    className="text-gray-700" 
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="3" 
                  />
                  <path 
                    className="text-green-500" 
                    strokeDasharray={`${truthScoreCalculation.overall}, 100`} 
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="3" 
                    strokeLinecap="round" 
                  />
                </svg>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                  <div className="text-4xl font-bold text-white">{truthScoreCalculation.overall}</div>
                  <div className="text-sm text-gray-400">Truth Score</div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-white">{truthScoreCalculation.confidence}%</div>
                <div className="text-sm text-gray-400">Confidence Level</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{truthScoreCalculation.version}</div>
                <div className="text-sm text-gray-400">Algorithm Version</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">
                  {new Date(truthScoreCalculation.lastCalculated).toLocaleDateString()}
                </div>
                <div className="text-sm text-gray-400">Last Updated</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Methodology */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-slate-900/70 rounded-xl p-6 border border-white/10">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Brain className="text-purple-400" size={24} />
              Algorithm Methodology
            </h2>
            <p className="text-gray-300 mb-4">{truthScoreCalculation.methodology.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Factor Weights</h3>
                <ul className="space-y-2">
                  {truthScoreCalculation.methodology.factors.map((factor, index) => (
                    <li key={index} className="text-sm text-gray-400">{factor}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Validation Methods</h3>
                <ul className="space-y-2">
                  {truthScoreCalculation.methodology.validation.map((method, index) => (
                    <li key={index} className="text-sm text-gray-400">{method}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Truth Score Factors */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold text-white mb-6">Truth Score Factors</h2>
          <div className="space-y-4">
            {truthScoreFactors.map((factor, index) => {
              const CategoryIcon = getCategoryIcon(factor.category)
              return (
                <div key={factor.id} className="bg-slate-900/70 rounded-xl border border-white/10 overflow-hidden">
                  {/* Factor Header */}
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CategoryIcon className="text-white" size={20} />
                          <h3 className="text-lg font-semibold text-white">{factor.name}</h3>
                          <div className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(factor.category)}`}>
                            {factor.category}
                          </div>
                          <div className="flex items-center gap-1">
                            {getTrendIcon(factor.trend)}
                          </div>
                        </div>
                        <p className="text-gray-300 mb-3">{factor.description}</p>
                        <div className="flex items-center gap-6 text-sm text-gray-400">
                          <span>Weight: <span className="text-white">{Math.round(factor.weight * 100)}%</span></span>
                          <span>Methodology: {factor.methodology}</span>
                          <span>Updated: {new Date(factor.lastUpdated).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={`text-3xl font-bold ${getScoreColor(factor.score)}`}>
                          {factor.score}
                        </div>
                        <div className="text-sm text-gray-400">Score</div>
                      </div>
                      
                      <button
                        onClick={() => toggleExpanded(factor.id)}
                        className="p-2 hover:bg-slate-800 rounded-lg transition-colors ml-4"
                      >
                        {expandedFactor === factor.id ? <ChevronUp className="text-white" size={20} /> : <ChevronDown className="text-white" size={20} />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  <AnimatePresence>
                    {expandedFactor === factor.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-white/10"
                      >
                        <div className="p-6 space-y-6">
                          {/* Data Sources */}
                          <div>
                            <h4 className="text-lg font-semibold text-white mb-3">Data Sources</h4>
                            <div className="flex flex-wrap gap-2">
                              {factor.dataSources.map((source, idx) => (
                                <span key={idx} className="px-3 py-1 bg-slate-800 rounded-full text-sm text-gray-300">
                                  {source}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Sub-Factors */}
                          <div>
                            <h4 className="text-lg font-semibold text-white mb-3">Sub-Factor Breakdown</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {factor.details.subFactors.map((subFactor, idx) => (
                                <div key={idx} className="bg-slate-800/50 rounded-lg p-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <h5 className="text-white font-semibold">{subFactor.name}</h5>
                                    <div className={`text-lg font-bold ${getScoreColor(subFactor.score)}`}>
                                      {subFactor.score}
                                    </div>
                                  </div>
                                  <p className="text-sm text-gray-300 mb-2">{subFactor.description}</p>
                                  <div className="text-xs text-gray-400">
                                    Weight: {Math.round(subFactor.weight * 100)}%
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* AI Insights */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Zap className="text-yellow-400" size={24} />
            AI-Generated Insights
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {truthScoreInsights.map((insight, index) => (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="bg-slate-900/70 rounded-xl p-6 border border-white/10 cursor-pointer hover:bg-slate-900/80 transition-all"
                onClick={() => toggleInsight(insight.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-white">{insight.title}</h3>
                      <div className={`text-xs px-2 py-1 rounded-full ${getImpactColor(insight.impact)}`}>
                        {insight.impact} impact
                      </div>
                      <div className="text-xs text-gray-400">
                        {insight.confidence}% confidence
                      </div>
                    </div>
                    <p className="text-gray-300 mb-3">{insight.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="text-yellow-400" size={16} />
                    {selectedInsight === insight.id ? <ChevronUp className="text-white" size={16} /> : <ChevronDown className="text-white" size={16} />}
                  </div>
                </div>

                <AnimatePresence>
                  {selectedInsight === insight.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-white/10 pt-4 mt-4"
                    >
                      <div>
                        <h4 className="text-sm font-semibold text-white mb-2">Recommendation:</h4>
                        <p className="text-sm text-gray-300">{insight.recommendation}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Technical Specifications */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="bg-slate-900/70 rounded-xl p-6 border border-white/10">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Database className="text-emerald-400" size={24} />
              Technical Specifications
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Processing Engine</h3>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• Real-time data validation</li>
                  <li>• Machine learning bias detection</li>
                  <li>• Cross-source verification</li>
                  <li>• Anomaly detection algorithms</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Data Sources</h3>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• 47 government APIs</li>
                  <li>• 12 fact-checking databases</li>
                  <li>• 8 news archives</li>
                  <li>• 15 academic sources</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Update Frequency</h3>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• Real-time: Lobbying data</li>
                  <li>• Hourly: Bill status</li>
                  <li>• Daily: Media analysis</li>
                  <li>• Weekly: Accountability metrics</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
