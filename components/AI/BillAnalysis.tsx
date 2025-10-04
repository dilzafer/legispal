'use client'

import { motion } from 'framer-motion'
import { Bot, Eye, AlertCircle, CheckCircle, XCircle, Brain } from 'lucide-react'

interface AnalysisPoint {
  type: 'positive' | 'negative' | 'neutral'
  text: string
  confidence: number
}

interface BillAnalysis {
  summary: string
  keyProvisions: string[]
  hiddenImplications: string[]
  beneficiaries: string[]
  potentialConcerns: string[]
  truthScore: number
  analysisPoints: AnalysisPoint[]
}

const mockAnalysis: BillAnalysis = {
  summary: "This bill proposes significant reforms to healthcare access, including expanded Medicare coverage and prescription drug pricing controls. The legislation aims to reduce out-of-pocket costs for millions of Americans while establishing new regulatory frameworks for pharmaceutical companies.",
  keyProvisions: [
    "Caps insulin prices at $35/month for all Americans",
    "Allows Medicare to negotiate drug prices directly",
    "Expands telehealth coverage permanently",
    "Creates $10B fund for rural health clinics"
  ],
  hiddenImplications: [
    "Section 302(b) could limit future generic drug approvals",
    "Funding mechanism relies on unspecified future appropriations",
    "Administrative burden may overwhelm small healthcare providers"
  ],
  beneficiaries: [
    "65M+ Medicare recipients",
    "12M Americans with diabetes",
    "Rural healthcare facilities",
    "Low-income families"
  ],
  potentialConcerns: [
    "Pharmaceutical industry lobbying against price controls",
    "Implementation timeline may be unrealistic",
    "State-level resistance in certain regions"
  ],
  truthScore: 78,
  analysisPoints: [
    { type: 'positive', text: 'Cost savings claims are backed by CBO analysis', confidence: 92 },
    { type: 'negative', text: 'Job loss projections appear exaggerated', confidence: 85 },
    { type: 'neutral', text: 'Long-term fiscal impact remains uncertain', confidence: 73 }
  ]
}

export default function BillAnalysis() {
  const getAnalysisIcon = (type: string) => {
    switch (type) {
      case 'positive': return <CheckCircle size={16} className="text-green-400" />
      case 'negative': return <XCircle size={16} className="text-red-400" />
      case 'neutral': return <AlertCircle size={16} className="text-yellow-400" />
      default: return null
    }
  }

  return (
    <motion.div 
      className="bg-slate-900/50 rounded-2xl p-6 backdrop-blur-sm border border-white/10"
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
            <p className="text-sm text-gray-400">Plain-English breakdown</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Truth Score</span>
          <div className="relative w-24 h-24">
            <svg className="transform -rotate-90 w-24 h-24">
              <circle
                cx="48"
                cy="48"
                r="36"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="48"
                cy="48"
                r="36"
                stroke="url(#gradient)"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 36}`}
                strokeDashoffset={`${2 * Math.PI * 36 * (1 - mockAnalysis.truthScore / 100)}`}
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
              <span className="text-2xl font-bold text-white">{mockAnalysis.truthScore}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
            <Bot size={18} className="text-truth-green" />
            AI Summary
          </h3>
          <p className="text-gray-300 text-sm leading-relaxed">{mockAnalysis.summary}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-semibold text-gray-400 mb-2">Key Provisions</h4>
            <ul className="space-y-2">
              {mockAnalysis.keyProvisions.map((provision, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-sm text-gray-300 flex items-start gap-2"
                >
                  <span className="text-truth-green mt-1">•</span>
                  {provision}
                </motion.li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-gray-400 mb-2 flex items-center gap-2">
              <Eye size={14} />
              Hidden Implications
            </h4>
            <ul className="space-y-2">
              {mockAnalysis.hiddenImplications.map((implication, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 + 0.4 }}
                  className="text-sm text-gray-300 flex items-start gap-2"
                >
                  <span className="text-yellow-400 mt-1">!</span>
                  {implication}
                </motion.li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-400 mb-3">Fact Check Analysis</h4>
          <div className="space-y-2">
            {mockAnalysis.analysisPoints.map((point, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 + 0.6 }}
                className="flex items-start gap-3"
              >
                {getAnalysisIcon(point.type)}
                <div className="flex-1">
                  <p className="text-sm text-gray-300">{point.text}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="flex-1 bg-slate-700 rounded-full h-1.5 overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-truth-green to-democracy-gold"
                        initial={{ width: 0 }}
                        animate={{ width: `${point.confidence}%` }}
                        transition={{ duration: 0.8, delay: index * 0.1 + 0.8 }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">{point.confidence}%</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}