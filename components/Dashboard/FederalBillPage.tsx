'use client'

import { motion } from 'framer-motion'
import { UserCircle2, AlertTriangle, FileText, Users, Building, Scale, CheckCircle } from 'lucide-react'
import { BillData } from '@/components/Dashboard/BillDashboard'

interface FederalBillPageProps {
  billData: BillData
}

export default function FederalBillPage({ billData }: FederalBillPageProps) {
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
      <div className="relative flex items-center justify-between w-full py-6 px-8">
        {/* Background connecting line */}
        <div className="absolute top-1/4 left-0 right-0 h-0.5 bg-gray-600" style={{ marginTop: '1.5rem' }} />

        {steps.map((step, index) => {
          const isCompleted = index < currentIndex
          const isCurrent = index === currentIndex

          return (
            <div key={step.name} className="flex flex-col items-center relative z-10" style={{ flex: 1 }}>
              {/* Step Circle */}
              <div className="relative">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isCompleted
                      ? 'bg-green-500 text-white shadow-md shadow-green-500/30'
                      : isCurrent
                        ? 'bg-white text-slate-900 shadow-md shadow-white/30'
                        : 'bg-gray-700 text-gray-400 shadow-sm shadow-gray-700/20'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <step.icon className="w-6 h-6" />
                  )}
                </div>
              </div>

              {/* Step Label */}
              <div className={`mt-3 text-center ${
                isCompleted ? 'text-green-400 font-semibold' : isCurrent ? 'text-white font-bold' : 'text-gray-500'
              }`}>
                <div className="text-base tracking-wide">{step.name}</div>
                {isCurrent && (
                  <div className="text-xs text-gray-400 mt-1 font-normal tracking-normal">Current</div>
                )}
              </div>
            </div>
          )
        })}

        {/* Green progress line overlay */}
        {currentIndex > 0 && (
          <div
            className="absolute top-1/4 left-0 h-0.5 bg-green-500 transition-all duration-300"
            style={{
              marginTop: '1.5rem',
              width: `${(currentIndex / (steps.length - 1)) * 100}%`
            }}
          />
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen text-white font-sans antialiased">
      {/* Header */}
      <header className="sticky top-0 z-10 p-4">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center">
            {/* Status Progress */}
            <div className="w-full max-w-4xl">
              {getStatusSteps()}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 md:p-8">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
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
                    <p className="text-2xl font-bold text-white">{billData.publicSentiment.comments.toLocaleString()}</p>
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

          {/* Sponsorship & Lobbying */}
          <section className="mt-8 bg-slate-800/50 rounded-xl p-6 border border-white/10">
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
          </section>

          {/* Impact Explainers */}
          <section className="mt-8 bg-slate-800/50 rounded-xl p-6 border border-white/10">
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
    </div>
  )
}
