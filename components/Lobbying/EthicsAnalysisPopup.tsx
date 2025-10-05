'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Shield, AlertTriangle, CheckCircle, Loader2, Star, Eye, Scale, Target } from 'lucide-react'
import { EthicsAnalysis, LobbyistProfile } from '@/lib/api/workers'

interface EthicsAnalysisPopupProps {
  isOpen: boolean
  onClose: () => void
  lobbyistProfile: LobbyistProfile | null
}

export default function EthicsAnalysisPopup({ isOpen, onClose, lobbyistProfile }: EthicsAnalysisPopupProps) {
  const [analysis, setAnalysis] = useState<EthicsAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch analysis when popup opens
  const fetchAnalysis = async () => {
    if (!lobbyistProfile) return

    try {
      setLoading(true)
      setError(null)
      setAnalysis(null)

      console.log('🔍 Fetching analysis for:', lobbyistProfile.name)

      const response = await fetch(`/api/lobbying/ethics?t=${Date.now()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lobbyistProfile }),
        cache: 'no-cache' // Ensure fresh request every time
      })

      if (!response.ok) {
        throw new Error('Failed to analyze ethics')
      }

      const data = await response.json()
      console.log('✅ Analysis received for:', lobbyistProfile.name)
      setAnalysis(data.analysis)
    } catch (err) {
      console.error('Error fetching ethics analysis:', err)
      setError('Failed to analyze lobbyist ethics. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Reset state when popup opens with new profile
  React.useEffect(() => {
    if (isOpen && lobbyistProfile) {
      console.log('🔄 Resetting popup for new profile:', lobbyistProfile.name)
      setAnalysis(null)
      setError(null)
      setLoading(false)
      fetchAnalysis()
    }
  }, [isOpen, lobbyistProfile?.name, lobbyistProfile?.firm, lobbyistProfile?.client])

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400'
    if (score >= 60) return 'text-yellow-400'
    if (score >= 40) return 'text-orange-400'
    return 'text-red-400'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-400/10 border-green-400/20'
    if (score >= 60) return 'bg-yellow-400/10 border-yellow-400/20'
    if (score >= 40) return 'bg-orange-400/10 border-orange-400/20'
    return 'bg-red-400/10 border-red-400/20'
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-400 bg-green-400/10'
      case 'medium': return 'text-yellow-400 bg-yellow-400/10'
      case 'high': return 'text-red-400 bg-red-400/10'
      default: return 'text-gray-400 bg-gray-400/10'
    }
  }

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'text-green-400'
      case 'medium': return 'text-yellow-400'
      case 'low': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          key={`ethics-popup-${lobbyistProfile?.name}-${lobbyistProfile?.firm}`}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-slate-900 rounded-xl border border-white/10 max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Shield className="text-blue-400" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Ethics Analysis</h2>
                  <p className="text-sm text-gray-400">
                    {lobbyistProfile?.name} • {lobbyistProfile?.firm}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="text-white" size={20} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="text-blue-400 animate-spin" size={48} />
                <span className="ml-4 text-white text-lg">Analyzing ethics...</span>
              </div>
            )}

            {error && (
              <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-6 text-center">
                <AlertTriangle className="text-red-400 mx-auto mb-4" size={48} />
                <p className="text-red-400 text-lg">{error}</p>
                <button
                  onClick={fetchAnalysis}
                  className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

            {analysis && (
              <div className="space-y-6">
                {/* Overall Scores */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className={`p-4 rounded-xl border ${getScoreBgColor(analysis.ethicsScore)}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="text-white" size={20} />
                      <h3 className="text-sm font-semibold text-white">Ethics Score</h3>
                    </div>
                    <div className={`text-2xl font-bold ${getScoreColor(analysis.ethicsScore)}`}>
                      {analysis.ethicsScore}
                    </div>
                    <div className="text-xs text-gray-400">Overall Rating</div>
                  </div>

                  <div className={`p-4 rounded-xl border ${getScoreBgColor(analysis.transparencyScore)}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="text-white" size={20} />
                      <h3 className="text-sm font-semibold text-white">Transparency</h3>
                    </div>
                    <div className={`text-2xl font-bold ${getScoreColor(analysis.transparencyScore)}`}>
                      {analysis.transparencyScore}
                    </div>
                    <div className="text-xs text-gray-400">Disclosure Quality</div>
                  </div>

                  <div className={`p-4 rounded-xl border ${getScoreBgColor(analysis.complianceScore)}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Scale className="text-white" size={20} />
                      <h3 className="text-sm font-semibold text-white">Compliance</h3>
                    </div>
                    <div className={`text-2xl font-bold ${getScoreColor(analysis.complianceScore)}`}>
                      {analysis.complianceScore}
                    </div>
                    <div className="text-xs text-gray-400">Regulatory</div>
                  </div>

                  <div className="p-4 rounded-xl border border-white/10 bg-slate-800/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="text-white" size={20} />
                      <h3 className="text-sm font-semibold text-white">Risk Level</h3>
                    </div>
                    <div className={`text-lg font-bold px-2 py-1 rounded-full text-xs ${getRiskColor(analysis.conflictOfInterestRisk)}`}>
                      {analysis.conflictOfInterestRisk.toUpperCase()}
                    </div>
                    <div className="text-xs text-gray-400">Conflict Risk</div>
                  </div>
                </div>

                {/* Detailed Analysis */}
                <div className="bg-slate-800/50 rounded-xl p-6 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Shield className="text-blue-400" size={20} />
                    Detailed Analysis
                  </h3>
                  <p className="text-gray-300 leading-relaxed">{analysis.analysis}</p>
                  <div className="mt-4 flex items-center gap-2 text-sm text-gray-400">
                    <span>Confidence:</span>
                    <span className={`font-semibold ${getConfidenceColor(analysis.confidence)}`}>
                      {analysis.confidence.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Key Concerns */}
                {analysis.keyConcerns.length > 0 && (
                  <div className="bg-red-900/10 rounded-xl p-6 border border-red-500/20">
                    <h3 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
                      <AlertTriangle className="text-red-400" size={20} />
                      Key Concerns
                    </h3>
                    <ul className="space-y-2">
                      {analysis.keyConcerns.map((concern, index) => (
                        <li key={index} className="flex items-start gap-2 text-gray-300">
                          <span className="text-red-400 mt-1">•</span>
                          <span>{concern}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommendations */}
                {analysis.recommendations.length > 0 && (
                  <div className="bg-green-900/10 rounded-xl p-6 border border-green-500/20">
                    <h3 className="text-lg font-semibold text-green-400 mb-4 flex items-center gap-2">
                      <CheckCircle className="text-green-400" size={20} />
                      Recommendations
                    </h3>
                    <ul className="space-y-2">
                      {analysis.recommendations.map((recommendation, index) => (
                        <li key={index} className="flex items-start gap-2 text-gray-300">
                          <span className="text-green-400 mt-1">•</span>
                          <span>{recommendation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Lobbyist Profile Summary */}
                <div className="bg-slate-800/50 rounded-xl p-6 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4">Activity Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Client:</span>
                      <span className="text-white ml-2">{lobbyistProfile?.client}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Amount:</span>
                      <span className="text-white ml-2">
                        ${lobbyistProfile?.amount.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Issue:</span>
                      <span className="text-white ml-2">{lobbyistProfile?.issue}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Category:</span>
                      <span className="text-white ml-2">{lobbyistProfile?.category}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Target:</span>
                      <span className="text-white ml-2">{lobbyistProfile?.target}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Disclosure Date:</span>
                      <span className="text-white ml-2">
                        {lobbyistProfile?.disclosureDate ? 
                          new Date(lobbyistProfile.disclosureDate).toLocaleDateString() : 
                          'N/A'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}