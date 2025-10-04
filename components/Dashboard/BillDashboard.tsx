'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { Bookmark, Share2, GitCompare, Bell, UserCircle2, AlertTriangle, X } from 'lucide-react'

interface BillData {
  id: string
  title: string
  billNumber: string
  status: string
  controversy: string
  trendScore: number
  aiConfidence: number
  sponsor: string
  description: string
  categories: string[]
  truthScore: number
  voteResults: {
    passed: boolean
    chamber: string
    yeas: number
    nays: number
    democratSupport: { yea: number; nay: number }
    republicanSupport: { yea: number; nay: number }
    independentSupport: { yea: number; nay: number }
  }
  moneyMap: {
    total: string
    change: string
    topDonors: string
    sources: { name: string; percentage: number; color: string }[]
  }
  keyProvisions: string[]
  hiddenImplications: string[]
  factCheck: { label: string; percentage: number; color: string }[]
  publicSentiment: {
    democratSupport: number
    republicanSupport: number
    comments: number
    support: number
    oppose: number
    argumentsFor: string
    argumentsAgainst: string
  }
  sponsorship: {
    primary: string
    coSponsors: number
    coSponsorList: string
  }
  lobbyingActivity: {
    monthlyData: { month: string; amount: string }[]
    topEntities: { name: string; amount: string; filings: number }[]
  }
  impact: {
    fiscalNote: string
    beneficiaries: string[]
    payers: string[]
    districtImpact: { district: string; jobGrowth: string; funding: string }[]
  }
}

interface BillDashboardProps {
  billData: BillData
  isOpen: boolean
  onClose: () => void
}

export default function BillDashboard({ billData, isOpen, onClose }: BillDashboardProps) {
  const [activeTab, setActiveTab] = useState('by-industry')

  if (!isOpen) return null

  const QuickActions = () => {
    const actions = [
      { icon: Bookmark, label: 'Save' },
      { icon: Share2, label: 'Share' },
      { icon: GitCompare, label: 'Compare' },
      { icon: Bell, label: 'Alert me' },
    ]

    return (
      <div className="flex items-center space-x-1 md:space-x-2">
        {actions.map((action, index) => (
          <button key={index} className="flex items-center space-x-2 px-3 py-2 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-colors text-sm border border-gray-700">
            <action.icon size={16} />
            <span className="hidden sm:inline">{action.label}</span>
          </button>
        ))}
      </div>
    )
  }

  const SwingVotes = () => (
    <div className="flex items-center -space-x-2">
      <div className="relative group">
        <UserCircle2 size={24} className="text-red-400 bg-gray-800 rounded-full" />
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Rep. Smith (R)
        </div>
      </div>
      <div className="relative group">
        <UserCircle2 size={24} className="text-red-400 bg-gray-800 rounded-full" />
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Rep. Jones (R)
        </div>
      </div>
    </div>
  )

  const getStatusSteps = () => {
    const steps = ['Introduced', 'Committee', 'House', 'Senate', 'Enacted']
    const currentStep = billData.status.toLowerCase()
    
    return steps.map((step, index) => {
      let status = ''
      if (step.toLowerCase() === currentStep) {
        status = 'active'
      } else if (steps.indexOf(currentStep) > index) {
        status = 'completed'
      }
      
      return (
        <div key={step} className={`status-step ${status} ${index === 0 ? 'lg:flex lg:items-center lg:gap-2' : ''}`}>
          {index === 0 && <span>Introduced</span>}
          {index > 0 && <span className="hidden lg:block">{step}</span>}
          {index > 0 && <span className="lg:hidden text-xs">{step}</span>}
        </div>
      )
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] bg-transparent flex items-start justify-center p-0"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-slate-900/30 backdrop-blur-xl w-full max-w-7xl h-screen overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="sticky top-0 z-10 bg-slate-900/30 backdrop-blur-xl border-b border-gray-800 p-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Status Pill */}
            <div className="w-full md:w-auto md:flex-grow flex justify-center order-1 md:order-none">
              <div className="flex items-center p-1 bg-gray-800 rounded-full border border-gray-700">
                {getStatusSteps()}
              </div>
            </div>

            {/* Icons */}
            <div className="order-2 md:order-none flex items-center gap-4">
              <QuickActions />
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-800 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-4 md:p-8">
          {/* Hero Section */}
          <section className="mb-8 md:mb-12">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4">
              <span className="text-yellow-400 border border-yellow-400 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {billData.controversy}
              </span>
              <span className="text-sm font-semibold text-gray-300">
                Trend Score: {billData.trendScore}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              <span className="text-gray-400">{billData.billNumber}</span> — {billData.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-xs mb-6">
              {billData.categories.map((category, index) => (
                <span key={index} className="bg-gray-700 text-gray-300 px-2 py-1 rounded-full">
                  {category}
                </span>
              ))}
              <span className="bg-blue-900/50 text-blue-300 px-2.5 py-1 rounded-full border border-blue-800">
                Sponsor: {billData.sponsor}
              </span>
            </div>
            <p className="text-lg text-gray-300">{billData.description}</p>
            <div className="mt-6 text-sm text-gray-400">
              <div className="relative inline-block group cursor-pointer">
                <span className="font-semibold border-b border-dashed border-gray-500">
                  AI Confidence: {billData.aiConfidence}%
                </span>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Sources: Congress.gov API, CRS Reports
                </div>
              </div>
            </div>
          </section>

          {/* Top Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Vote at a Glance */}
              <section className="bg-slate-800/50 rounded-xl p-6 border border-white/10">
                <h2 className="text-2xl font-bold text-white mb-4">Vote at a Glance</h2>
                <div className="flex justify-between items-baseline mb-4">
                  <p className="text-lg">
                    <span className="font-semibold text-green-400">
                      {billData.voteResults.passed ? 'Passed' : 'Failed'}
                    </span> ({billData.voteResults.chamber})
                  </p>
                  <p className="text-gray-300">
                    Yeas: <span className="font-bold text-white">{billData.voteResults.yeas}</span> | 
                    Nays: <span className="font-bold text-white">{billData.voteResults.nays}</span>
                  </p>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-blue-400">Democrats</span>
                      <span className="text-gray-400">
                        {billData.voteResults.democratSupport.yea} Yea / {billData.voteResults.democratSupport.nay} Nay
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                      <div 
                        className="bg-blue-500 h-2.5 rounded-full" 
                        style={{ width: `${(billData.voteResults.democratSupport.yea / (billData.voteResults.democratSupport.yea + billData.voteResults.democratSupport.nay)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-red-400">Republicans</span>
                      <span className="text-gray-400">
                        {billData.voteResults.republicanSupport.yea} Yea / {billData.voteResults.republicanSupport.nay} Nay
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                      <div 
                        className="bg-red-500 h-2.5 rounded-full" 
                        style={{ width: `${(billData.voteResults.republicanSupport.yea / (billData.voteResults.republicanSupport.yea + billData.voteResults.republicanSupport.nay)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 border-t border-gray-700 pt-4 flex justify-between items-center">
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <span className="font-semibold">Key swing votes:</span>
                    <SwingVotes />
                  </div>
                  <a href="#" className="text-sm text-blue-400 hover:underline">See full roll call →</a>
                </div>
              </section>

              {/* Money Map */}
              <section className="bg-slate-800/50 rounded-xl p-6 border border-white/10">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-4">
                  <h2 className="text-2xl font-bold text-white">Money Map</h2>
                  <div className="text-sm bg-gray-800 border border-gray-700 rounded-full p-1 flex space-x-1">
                    <button 
                      className={`px-3 py-1 rounded-full ${activeTab === 'by-industry' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
                      onClick={() => setActiveTab('by-industry')}
                    >
                      By Industry
                    </button>
                    <button 
                      className={`px-3 py-1 rounded-full ${activeTab === 'by-organization' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
                      onClick={() => setActiveTab('by-organization')}
                    >
                      By Organization
                    </button>
                    <button 
                      className={`px-3 py-1 rounded-full ${activeTab === 'by-state' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
                      onClick={() => setActiveTab('by-state')}
                    >
                      By State
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 text-xs mb-6">
                  <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded-full">
                    Total: {billData.moneyMap.total}
                  </span>
                  <span className="bg-green-800 text-green-300 px-2 py-1 rounded-full">
                    {billData.moneyMap.change}
                  </span>
                  <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded-full">
                    Top 5: {billData.moneyMap.topDonors}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                  {/* Pie Chart */}
                  <div className="md:col-span-1 flex flex-col items-center">
                    <h3 className="font-semibold text-gray-300 mb-2 text-center">Funding Sources</h3>
                    <svg className="w-40 h-40" viewBox="0 0 64 64">
                      <g transform="translate(32,32)">
                        {billData.moneyMap.sources.map((source, index) => {
                          const startAngle = index * (360 / billData.moneyMap.sources.length)
                          const endAngle = (index + 1) * (360 / billData.moneyMap.sources.length)
                          return (
                            <path
                              key={index}
                              d={`M 0,0 L 32,0 A 32,32 0 ${endAngle - startAngle > 180 ? '1' : '0'},1 ${Math.cos((endAngle * Math.PI) / 180) * 32},${Math.sin((endAngle * Math.PI) / 180) * 32} L 0,0 Z`}
                              fill={source.color}
                              transform={`rotate(${startAngle})`}
                            />
                          )
                        })}
                      </g>
                    </svg>
                    <div className="mt-4 space-y-1 text-xs text-gray-400">
                      {billData.moneyMap.sources.map((source, index) => (
                        <div key={index} className="flex items-center">
                          <span className={`w-3 h-3 mr-2 rounded-full`} style={{ backgroundColor: source.color }}></span>
                          {source.name} ({source.percentage}%)
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sankey Diagram */}
                  <div className="w-full overflow-x-auto md:col-span-2">
                    <svg width="100%" height="200" className="min-w-[500px]">
                      <g className="nodes" fontFamily="sans-serif" fontSize="12" fill="#fff">
                        <rect x="10" y="20" width="100" height="40" rx="8" fill="#1f2937" stroke="#4b5563" />
                        <text x="60" y="45" textAnchor="middle">Energy</text>
                        <rect x="10" y="100" width="100" height="40" rx="8" fill="#1f2937" stroke="#4b5563" />
                        <text x="60" y="125" textAnchor="middle">Tech</text>
                        <rect x="180" y="20" width="120" height="40" rx="8" fill="#1f2937" stroke="#4b5563" />
                        <text x="240" y="45" textAnchor="middle">CleanFuture PAC</text>
                        <rect x="180" y="100" width="120" height="40" rx="8" fill="#1f2937" stroke="#4b5563" />
                        <text x="240" y="125" textAnchor="middle">Future Forward</text>
                        <rect x="370" y="100" width="80" height="40" rx="8" fill="#1f2937" stroke="#4b5563" />
                        <text x="410" y="125" textAnchor="middle">DNC</text>
                        <rect x="520" y="20" width="120" height="40" rx="8" fill="#1f2937" stroke="#4b5563" />
                        <text x="580" y="45" textAnchor="middle">Rep. Davis (D)</text>
                        <rect x="520" y="100" width="120" height="40" rx="8" fill="#1f2937" stroke="#4b5563" />
                        <text x="580" y="125" textAnchor="middle">Rep. Lee (D)</text>
                      </g>
                      <g className="links">
                        <path className="fill-none stroke-opacity-50 stroke-12" stroke="#3b82f6" d="M 110 40 C 145 40, 145 40, 180 40" />
                        <path className="fill-none stroke-opacity-50 stroke-12" stroke="#10b981" d="M 110 120 C 145 120, 145 120, 180 120" />
                        <path className="fill-none stroke-opacity-50 stroke-12" stroke="#3b82f6" d="M 300 40 C 410 40, 410 40, 520 40" />
                        <path className="fill-none stroke-opacity-50 stroke-12" stroke="#10b981" d="M 300 120 C 335 120, 335 120, 370 120" />
                        <path className="fill-none stroke-opacity-50 stroke-12" stroke="#10b981" d="M 450 120 C 485 120, 485 120, 520 120" />
                      </g>
                    </svg>
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column - AI Analysis */}
            <div className="lg:col-span-1">
              <section className="bg-slate-800/50 rounded-xl p-6 border border-white/10 h-full">
                <h2 className="text-xl font-bold text-white mb-4">AI Analysis & Truth Score</h2>
                <div className="text-center mb-4">
                  <div className="inline-block relative">
                    <svg className="w-24 h-24" viewBox="0 0 36 36">
                      <path className="text-gray-700" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                      <path 
                        className="text-green-500" 
                        strokeDasharray={`${billData.truthScore}, 100`} 
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="3" 
                        strokeLinecap="round" 
                      />
                    </svg>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl font-bold">
                      {billData.truthScore}
                    </div>
                  </div>
                  <p className="text-lg font-semibold mt-2">Truth Score</p>
                </div>

                <div className="space-y-4 text-sm">
                  <div>
                    <h3 className="font-semibold text-gray-300 mb-2">Key Provisions</h3>
                    <ul className="space-y-1 text-gray-400 list-disc list-inside">
                      {billData.keyProvisions.map((provision, index) => (
                        <li key={index}>{provision}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-300 mb-2 flex items-center">
                      <AlertTriangle className="text-yellow-400 mr-2" size={16} />
                      Hidden Implications
                    </h3>
                    <ul className="space-y-1 text-gray-400 list-disc list-inside">
                      {billData.hiddenImplications.map((implication, index) => (
                        <li key={index}>{implication}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-300 mb-2">Fact Check Analysis</h3>
                    <div className="space-y-2">
                      {billData.factCheck.map((check, index) => (
                        <div key={index}>
                          <div className="w-full bg-gray-700 rounded-full h-1.5">
                            <div 
                              className={`h-1.5 rounded-full`}
                              style={{ width: `${check.percentage}%`, backgroundColor: check.color }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-400">{check.label} ({check.percentage}%)</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* Full-width sections below */}
          <div className="mt-8 space-y-8">
            {/* Public Sentiment */}
            <section className="bg-slate-800/50 rounded-xl p-6 border border-white/10">
              <h2 className="text-xl font-bold text-white mb-6">Public Sentiment & Polarization</h2>

              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <div className="mb-4">
                  <h3 className="font-bold text-center">Partisan Support for {billData.billNumber}</h3>
                </div>
                
                <div className="py-2">
                  <div className="flex w-full h-3 rounded-full overflow-hidden bg-gray-700">
                    <div className="bg-blue-500" style={{ width: `${billData.publicSentiment.democratSupport}%` }}></div>
                    <div className="bg-red-500" style={{ width: `${billData.publicSentiment.republicanSupport}%` }}></div>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="font-medium text-blue-400">{billData.publicSentiment.democratSupport}% Dem Support</span>
                    <span className="font-medium text-red-400">{billData.publicSentiment.republicanSupport}% GOP Support</span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm border-t border-gray-700 pt-4">
                  <div>
                    <h4 className="font-semibold text-gray-300 mb-1">Arguments For</h4>
                    <p className="text-gray-400">{billData.publicSentiment.argumentsFor}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-300 mb-1">Arguments Against</h4>
                    <p className="text-gray-400">{billData.publicSentiment.argumentsAgainst}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex flex-wrap items-center justify-center md:justify-start gap-x-8 gap-y-4 text-center border-t border-gray-700 pt-6">
                <div>
                  <p className="text-2xl font-bold">{billData.publicSentiment.comments.toLocaleString()}</p>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Comments</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-400">{billData.publicSentiment.support.toLocaleString()}</p>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Support</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-400">{billData.publicSentiment.oppose.toLocaleString()}</p>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Oppose</p>
                </div>
              </div>
            </section>

            {/* Sponsorship & Lobbying */}
            <section className="bg-slate-800/50 rounded-xl p-6 border border-white/10">
              <h2 className="text-xl font-bold text-white mb-4">Sponsorship & Lobbying</h2>
              <div>
                <h3 className="font-semibold text-gray-300">Primary Sponsor</h3>
                <p className="text-gray-400">{billData.sponsorship.primary}</p>
              </div>
              <div className="mt-3">
                <h3 className="font-semibold text-gray-300">Co-Sponsors ({billData.sponsorship.coSponsors})</h3>
                <p className="text-gray-400">
                  {billData.sponsorship.coSponsorList}... <a href="#" className="text-blue-400 hover:underline">view all</a>
                </p>
              </div>
              <div className="mt-4 border-t border-gray-700 pt-4">
                <h3 className="font-semibold text-gray-300 mb-2">Lobbying Activity ($ Spent per Month)</h3>
                <div className="w-full">
                  <svg width="100%" height="140" className="text-xs text-gray-400">
                    <g className="bars" fill="#10b981">
                      {billData.lobbyingActivity.monthlyData.map((data, index) => {
                        const height = parseInt(data.amount.replace(/[^\d]/g, '')) / 1000 // Convert to relative height
                        return (
                          <rect 
                            key={index}
                            x={`${5 + index * 20}%`} 
                            y={140 - height} 
                            width="10%" 
                            height={height}
                          />
                        )
                      })}
                    </g>
                    <g className="labels-money" fill="#f9fafb" textAnchor="middle" fontSize="12px" fontWeight="bold">
                      {billData.lobbyingActivity.monthlyData.map((data, index) => (
                        <text key={index} x={`${10 + index * 20}%`} y={135}>{data.amount}</text>
                      ))}
                    </g>
                    <g className="labels-month" fill="#9ca3af" textAnchor="middle">
                      {billData.lobbyingActivity.monthlyData.map((data, index) => (
                        <text key={index} x={`${10 + index * 20}%`} y={155}>{data.month}</text>
                      ))}
                    </g>
                  </svg>
                </div>
              </div>
              <div className="mt-4 border-t border-gray-700 pt-4">
                <h3 className="font-semibold text-gray-300 mb-2">Top Lobbyist Entities</h3>
                <div className="flex flex-wrap gap-2 text-xs">
                  {billData.lobbyingActivity.topEntities.map((entity, index) => (
                    <span key={index} className="bg-gray-700 text-gray-300 px-2 py-1 rounded-full">
                      {entity.name} | {entity.amount} | {entity.filings} filings
                    </span>
                  ))}
                </div>
              </div>
            </section>

            {/* Impact Explainers */}
            <section className="bg-slate-800/50 rounded-xl p-6 border border-white/10">
              <h2 className="text-xl font-bold text-white mb-4">Impact Explainers</h2>
              <div className="bg-gray-800 p-3 rounded-lg mb-4">
                <p className="text-sm text-gray-300">
                  <span className="font-semibold">Fiscal Note:</span> {billData.impact.fiscalNote}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <h3 className="font-semibold text-green-400 mb-2 border-b border-green-800 pb-1">WHO BENEFITS</h3>
                  <ul className="space-y-1 text-gray-300 list-disc list-inside">
                    {billData.impact.beneficiaries.map((beneficiary, index) => (
                      <li key={index}>{beneficiary}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-red-400 mb-2 border-b border-red-800 pb-1">WHO PAYS</h3>
                  <ul className="space-y-1 text-gray-300 list-disc list-inside">
                    {billData.impact.payers.map((payer, index) => (
                      <li key={index}>{payer}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="mt-4 border-t border-gray-700 pt-4">
                <h3 className="font-semibold text-gray-300 mb-2">District Impact</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="text-xs text-gray-400 uppercase bg-gray-800">
                      <tr>
                        <th className="p-2">District</th>
                        <th className="p-2">Job Growth</th>
                        <th className="p-2">Funding Est.</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-300">
                      {billData.impact.districtImpact.map((district, index) => (
                        <tr key={index} className={index < billData.impact.districtImpact.length - 1 ? 'border-b border-gray-700' : ''}>
                          <td className="p-2">{district.district}</td>
                          <td className="p-2">{district.jobGrowth}</td>
                          <td className="p-2">{district.funding}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </div>
        </main>
      </motion.div>
    </motion.div>
  )
}
