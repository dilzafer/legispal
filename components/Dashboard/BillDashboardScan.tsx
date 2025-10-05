'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Bookmark, Share2, GitCompare, Bell, UserCircle2, AlertTriangle, X, FileText, Users, Building, Scale, CheckCircle } from 'lucide-react'
import { mockBillData } from '@/lib/mockBillData'
import { useBillDashboard } from '@/lib/useBillDashboard'

export default function BillDashboardScan() {
  const { selectedBillId, selectedBillData, loading, closeBillDashboard } = useBillDashboard()

  const billData = selectedBillData || (selectedBillId ? mockBillData[selectedBillId] : null)


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
    if (!billData) return null
    
    const steps = [
      { name: 'Introduced', icon: FileText },
      { name: 'Committee', icon: Users },
      { name: 'House', icon: Building },
      { name: 'Senate', icon: Scale },
      { name: 'Enacted', icon: CheckCircle }
    ]
    
    const currentStep = billData.status.toLowerCase()
    const currentIndex = steps.findIndex(step => step.name.toLowerCase() === currentStep)
    
    return (
      <div className="flex items-center justify-between w-full px-4 py-2">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex
          const isCurrent = index === currentIndex
          const isPending = index > currentIndex
          
          return (
            <div key={step.name} className="flex flex-col items-center relative flex-1">
              {/* Step Circle */}
              <div className="relative z-10">
                <div 
                  className={`w-12 h-12 rounded-full border-3 flex items-center justify-center text-lg font-bold transition-all duration-300 ${
                    isCompleted 
                      ? 'bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/30' 
                      : isCurrent 
                        ? 'bg-white border-white text-slate-900 shadow-lg shadow-white/30' 
                        : 'bg-gray-700 border-gray-600 text-gray-400'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-6 h-6 text-white" />
                  ) : (
                    <step.icon className="w-6 h-6" />
                  )}
                </div>
              </div>
              
              {/* Step Label */}
              <div className={`mt-3 text-center ${
                isCompleted ? 'text-green-400 font-semibold' : isCurrent ? 'text-white font-bold' : 'text-gray-500'
              }`}>
                <div className="text-sm font-medium">{step.name}</div>
                {isCurrent && (
                  <div className="text-xs text-gray-300 mt-1">Current</div>
                )}
              </div>
              
              {/* Progress Line */}
              {index < steps.length - 1 && (
                <div 
                  className={`absolute top-6 left-1/2 w-full h-1 z-0 transition-all duration-300 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-600'
                  }`}
                  style={{ 
                    width: 'calc(100% - 3rem)',
                    left: 'calc(50% + 1.5rem)',
                    height: '3px'
                  }}
                />
              )}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <AnimatePresence>
      {selectedBillId && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
          onClick={closeBillDashboard}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-slate-900 rounded-2xl w-full max-w-7xl max-h-[95vh] overflow-y-auto shadow-2xl border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Loading State */}
            {loading && !billData && (
              <div className="flex items-center justify-center p-20">
                <div className="text-center">
                  <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-truth-green border-r-transparent mb-4"></div>
                  <p className="text-gray-400">Loading bill data...</p>
                </div>
              </div>
            )}

            {/* Actual Content */}
            {billData && (
              <>
            {/* Header */}
            <header className="sticky top-0 z-10 bg-slate-900 bg-opacity-95 backdrop-blur-sm border-b border-gray-800">
              <div className="flex items-center justify-between p-6">
                {/* Status Timeline - Takes up most of the space */}
                <div className="flex-1 mr-6">
                  <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
                    {getStatusSteps()}
                  </div>
                </div>

                {/* Close Button */}
                <button
                  onClick={closeBillDashboard}
                  className="p-3 hover:bg-gray-800 rounded-full transition-colors flex-shrink-0"
                >
                  <X size={24} className="text-gray-400" />
                </button>
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
                  {billData.categories.map((category: string, index: number) => (
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
                      {/* Pie Chart - Only show if we have sources */}
                      {billData.moneyMap?.sources && billData.moneyMap.sources.length > 0 ? (
                      <div className="md:col-span-1 flex flex-col items-center">
                        <h3 className="font-semibold text-gray-300 mb-2 text-center">Funding Sources</h3>
                        <svg className="w-40 h-40" viewBox="0 0 100 100">
                          {billData.moneyMap.sources.map((source: { name: string; percentage: number; color: string }, index: number) => {
                            // Calculate angles based on percentage
                            let startAngle = 0
                            for (let i = 0; i < index; i++) {
                              startAngle += (billData.moneyMap.sources[i].percentage / 100) * 360
                            }
                            const endAngle = startAngle + (source.percentage / 100) * 360
                            
                            // Convert to radians
                            const startRad = (startAngle * Math.PI) / 180
                            const endRad = (endAngle * Math.PI) / 180
                            
                            // Calculate path coordinates
                            const radius = 40
                            const x1 = 50 + radius * Math.cos(startRad)
                            const y1 = 50 + radius * Math.sin(startRad)
                            const x2 = 50 + radius * Math.cos(endRad)
                            const y2 = 50 + radius * Math.sin(endRad)
                            
                            const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0
                            
                            const pathData = [
                              `M 50 50`,
                              `L ${x1} ${y1}`,
                              `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                              `Z`
                            ].join(' ')
                            
                            return (
                              <path
                                key={index}
                                d={pathData}
                                fill={source.color}
                                stroke="#1f2937"
                                strokeWidth="0.5"
                              />
                            )
                          })}
                        </svg>
                        <div className="mt-4 space-y-1 text-xs text-gray-400">
                          {billData.moneyMap.sources.map((source: { name: string; percentage: number; color: string }, index: number) => (
                            <div key={index} className="flex items-center">
                              <span className={`w-3 h-3 mr-2 rounded-full`} style={{ backgroundColor: source.color }}></span>
                              {source.name} ({source.percentage}%)
                            </div>
                          ))}
                        </div>
                      </div>
                      ) : (
                      <div className="md:col-span-3 text-center py-8">
                        <p className="text-gray-400">No funding source data available for this bill</p>
                      </div>
                      )}
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
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl font-bold text-white">
                          {billData.truthScore}
                        </div>
                      </div>
                      <p className="text-lg font-semibold mt-2 text-white">Truth Score</p>
                    </div>

                    <div className="space-y-4 text-sm">
                      <div>
                        <h3 className="font-semibold text-gray-300 mb-2">Key Provisions</h3>
                        <ul className="space-y-1 text-gray-400 list-disc list-inside">
                          {billData.keyProvisions.map((provision: string, index: number) => (
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
                          {billData.hiddenImplications.map((implication: string, index: number) => (
                            <li key={index}>{implication}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-300 mb-2">Fact Check Analysis</h3>
                        <div className="space-y-2">
                          {billData.factCheck.map((check: { label: string; percentage: number; color: string }, index: number) => (
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
                      <h3 className="font-bold text-center text-white">Partisan Support for {billData.billNumber}</h3>
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
                      <svg width="100%" height="200" className="text-xs text-gray-400">
                        <g className="bars" fill="#10b981">
                          {billData.lobbyingActivity.monthlyData.map((data: { month: string; amount: string }, index: number) => {
                            // Extract numeric value and scale it properly
                            const numericValue = parseInt(data.amount.replace(/[^\d]/g, ''))
                            // Scale to use most of the available height (max 160px)
                            const maxValue = Math.max(...billData.lobbyingActivity.monthlyData.map((d: { month: string; amount: string }) => parseInt(d.amount.replace(/[^\d]/g, ''))))
                            const height = (numericValue / maxValue) * 160
                            const barWidth = 12 // Increased from 10%
                            const barSpacing = 8 // Space between bars
                            const xPosition = 5 + index * (barWidth + barSpacing)
                            
                            return (
                              <rect 
                                key={index}
                                x={`${xPosition}%`} 
                                y={180 - height} 
                                width={`${barWidth}%`} 
                                height={height}
                                rx="2"
                                ry="2"
                              />
                            )
                          })}
                        </g>
                        <g className="labels-money" fill="#f9fafb" textAnchor="middle" fontSize="11px" fontWeight="bold">
                          {billData.lobbyingActivity.monthlyData.map((data: { month: string; amount: string }, index: number) => {
                            const numericValue = parseInt(data.amount.replace(/[^\d]/g, ''))
                            const maxValue = Math.max(...billData.lobbyingActivity.monthlyData.map((d: { month: string; amount: string }) => parseInt(d.amount.replace(/[^\d]/g, ''))))
                            const height = (numericValue / maxValue) * 160
                            const barWidth = 12
                            const barSpacing = 8
                            const xPosition = 5 + index * (barWidth + barSpacing)
                            
                            return (
                              <text key={index} x={`${xPosition + barWidth/2}%`} y={175 - height}>{data.amount}</text>
                            )
                          })}
                        </g>
                        <g className="labels-month" fill="#9ca3af" textAnchor="middle" fontSize="10px">
                          {billData.lobbyingActivity.monthlyData.map((data: { month: string; amount: string }, index: number) => {
                            const barWidth = 12
                            const barSpacing = 8
                            const xPosition = 5 + index * (barWidth + barSpacing)
                            
                            return (
                              <text key={index} x={`${xPosition + barWidth/2}%`} y={195}>{data.month}</text>
                            )
                          })}
                        </g>
                      </svg>
                    </div>
                  </div>
                  <div className="mt-4 border-t border-gray-700 pt-4">
                    <h3 className="font-semibold text-gray-300 mb-2">Top Lobbyist Entities</h3>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {billData.lobbyingActivity.topEntities.map((entity: { name: string; amount: string; filings: number }, index: number) => (
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
                        {billData.impact.beneficiaries.map((beneficiary: string, index: number) => (
                          <li key={index}>{beneficiary}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold text-red-400 mb-2 border-b border-red-800 pb-1">WHO PAYS</h3>
                      <ul className="space-y-1 text-gray-300 list-disc list-inside">
                        {billData.impact.payers.map((payer: string, index: number) => (
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
                          {billData.impact.districtImpact.map((district: { district: string; jobGrowth: string; funding: string }, index: number) => (
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
            </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
