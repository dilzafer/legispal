'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { 
  Bookmark, 
  Share2, 
  Bell,
  UserCircle2
} from 'lucide-react'
import type { Bill } from '@/backend/types/openstates'

export default function BillDetailPage() {
  const params = useParams()
  const [bill, setBill] = useState<Bill | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBill = async () => {
      try {
        setLoading(true)
        // Decode the bill ID in case it was URL encoded
        const billId = decodeURIComponent(params.billId as string)
        const response = await fetch(`/api/bills/${encodeURIComponent(billId)}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch bill details')
        }

        const data = await response.json()
        setBill(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    if (params.billId) {
      fetchBill()
    }
  }, [params.billId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading bill details...</p>
        </div>
      </div>
    )
  }

  if (error || !bill) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <p className="text-red-500 text-xl mb-4">⚠ Error</p>
          <p className="text-gray-400">{error || 'Bill not found'}</p>
        </div>
      </div>
    )
  }

  // Calculate vote statistics
  const latestVote = bill.votes && bill.votes.length > 0 ? bill.votes[bill.votes.length - 1] : null
  const voteStats = latestVote ? latestVote.counts.reduce((acc, count) => {
    const option = count.option.toLowerCase()
    if (option === 'yes') acc.yes = count.value
    else if (option === 'no') acc.no = count.value
    else acc.other += count.value
    acc.total += count.value
    return acc
  }, { yes: 0, no: 0, other: 0, total: 0 }) : null

  // Get party breakdown from individual votes
  const partyBreakdown = latestVote?.votes.reduce((acc, vote) => {
    const party = vote.voter?.party || 'Unknown'
    const option = vote.option.toLowerCase()
    
    if (!acc[party]) acc[party] = { yes: 0, no: 0, other: 0, total: 0 }
    
    if (option === 'yes') acc[party].yes++
    else if (option === 'no') acc[party].no++
    else acc[party].other++
    acc[party].total++
    
    return acc
  }, {} as Record<string, { yes: number; no: number; other: number; total: number }>) || {}

  const getStatusSteps = () => {
    const description = bill.latest_action_description?.toLowerCase() || ''
    
    return {
      introduced: true,
      committee: description.includes('committee') || description.includes('referred'),
      passedHouse: description.includes('passed') && (description.includes('house') || description.includes('assembly')),
      passedSenate: description.includes('passed') && description.includes('senate'),
      enacted: description.includes('signed') || description.includes('enacted') || description.includes('chaptered')
    }
  }

  const status = getStatusSteps()
  const currentStep = status.enacted ? 'enacted' : status.passedSenate ? 'senate' : status.passedHouse ? 'house' : status.committee ? 'committee' : 'introduced'

  return (
    <div className="min-h-screen bg-black text-white font-sans antialiased">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-black bg-opacity-80 backdrop-blur-sm border-b border-gray-800 p-4">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Status Pill */}
            <div className="w-full md:w-auto md:flex-grow flex justify-center order-1 md:order-none">
              <div className="flex items-center gap-1 p-1 bg-gray-800 rounded-full border border-gray-700">
                {/* Mobile/Tablet versions */}
                <div className={`status-step lg:hidden text-xs px-2 py-1 rounded-full transition-all ${status.introduced ? 'completed' : ''} ${currentStep === 'introduced' ? 'active' : ''}`}>
                  Intro
                </div>
                <div className={`status-step lg:hidden text-xs px-2 py-1 rounded-full transition-all ${status.committee ? 'completed' : ''} ${currentStep === 'committee' ? 'active' : ''}`}>
                  Committee
                </div>
                <div className={`status-step lg:hidden text-xs px-2 py-1 rounded-full transition-all ${status.passedHouse ? 'completed' : ''} ${currentStep === 'house' ? 'active' : ''}`}>
                  House
                </div>
                <div className={`status-step lg:hidden text-xs px-2 py-1 rounded-full transition-all ${status.passedSenate ? 'completed' : ''} ${currentStep === 'senate' ? 'active' : ''}`}>
                  Senate
                </div>
                <div className={`status-step lg:hidden text-xs px-2 py-1 rounded-full transition-all ${status.enacted ? 'active' : ''}`}>
                  Enacted
                </div>
                
                {/* Desktop versions */}
                <div className={`status-step hidden lg:flex items-center gap-2 px-3 py-1 rounded-full transition-all ${status.introduced ? 'completed' : ''} ${currentStep === 'introduced' ? 'active' : ''}`}>
                  <span>Introduced</span>
                </div>
                <div className={`status-step hidden lg:block px-3 py-1 rounded-full transition-all ${status.committee ? 'completed' : ''} ${currentStep === 'committee' ? 'active' : ''}`}>
                  Committee
                </div>
                <div className={`status-step hidden lg:block px-3 py-1 rounded-full transition-all ${status.passedHouse ? 'completed' : ''} ${currentStep === 'house' ? 'active' : ''}`}>
                  Passed House
                </div>
                <div className={`status-step hidden lg:block px-3 py-1 rounded-full transition-all ${status.passedSenate ? 'completed' : ''} ${currentStep === 'senate' ? 'active' : ''}`}>
                  Passed Senate
                </div>
                <div className={`status-step hidden lg:block px-3 py-1 rounded-full transition-all ${status.enacted ? 'active' : ''}`}>
                  Enacted
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center space-x-2 order-2 md:order-none">
              <button className="flex items-center space-x-2 px-3 py-2 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-colors text-sm border border-gray-700">
                <Bookmark size={16} />
                <span className="hidden sm:inline">Save</span>
              </button>
              <button className="flex items-center space-x-2 px-3 py-2 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-colors text-sm border border-gray-700">
                <Share2 size={16} />
                <span className="hidden sm:inline">Share</span>
              </button>
              <button className="flex items-center space-x-2 px-3 py-2 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-colors text-sm border border-gray-700">
                <Bell size={16} />
                <span className="hidden sm:inline">Alert me</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <div className="max-w-screen-xl mx-auto p-4 md:p-8 px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <section className="mb-8 md:mb-12">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4">
              {bill.classification && bill.classification.length > 0 && (
                <span className="text-yellow-400 border border-yellow-400 text-xs font-medium px-2.5 py-0.5 rounded-full capitalize">
                  {bill.classification[0]}
                </span>
              )}
              <span className="text-sm font-semibold text-gray-300">
                {bill.jurisdiction.name} • Session {bill.session}
              </span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              <span className="text-gray-400">{bill.identifier}</span> — {bill.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-2 text-xs mb-6">
              {bill.subject && bill.subject.slice(0, 3).map((subject, i) => (
                <span key={i} className="bg-gray-700 text-gray-300 px-2 py-1 rounded-full">{subject}</span>
              ))}
              {bill.sponsorships && bill.sponsorships.length > 0 && (
                <span className="bg-blue-900/50 text-blue-300 px-2.5 py-1 rounded-full border border-blue-800">
                  Sponsor: {bill.sponsorships[0].name}
                </span>
              )}
            </div>
            
            {bill.abstracts && bill.abstracts.length > 0 && (
              <p className="text-lg text-gray-300">
                {bill.abstracts[0].abstract}
              </p>
            )}
          </section>

          {/* Top Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Vote at a Glance */}
              {latestVote && voteStats && (
                <section className="card">
                  <h2 className="text-2xl font-bold text-white mb-4">Vote at a Glance</h2>
                  
                  <div className="flex justify-between items-baseline mb-4">
                    <p className="text-lg">
                      <span className={`font-semibold ${latestVote.result === 'pass' ? 'text-green-400' : 'text-red-400'}`}>
                        {latestVote.result.charAt(0).toUpperCase() + latestVote.result.slice(1)}
                      </span>
                      {' '}({latestVote.organization.name})
                    </p>
                    <p className="text-gray-300">
                      Yeas: <span className="font-bold text-white">{voteStats.yes}</span> | 
                      Nays: <span className="font-bold text-white">{voteStats.no}</span>
                    </p>
                  </div>

                  <div className="space-y-3">
                    {Object.entries(partyBreakdown).map(([party, votes]) => {
                      const percentage = votes.total > 0 ? (votes.yes / votes.total) * 100 : 0
                      const colorClass = party.toLowerCase().includes('democrat') ? 'blue' : 
                                        party.toLowerCase().includes('republican') ? 'red' : 'gray'
                      
                      return (
                        <div key={party}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className={`font-medium text-${colorClass}-400`}>{party}</span>
                            <span className="text-gray-400">
                              {votes.yes} Yea / {votes.no} Nay
                            </span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2.5">
                            <div 
                              className={`bg-${colorClass}-500 h-2.5 rounded-full`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="mt-6 border-t border-gray-700 pt-4 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <span className="font-semibold">Key swing votes:</span>
                      <div className="flex items-center -space-x-2">
                        {latestVote.votes.slice(0, 2).map((vote, i) => (
                          <div key={i} className="relative group">
                            <UserCircle2 size={24} className="text-red-400 bg-gray-800 rounded-full" />
                            <span className="absolute hidden group-hover:block bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap">
                              {vote.voter_name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const element = document.getElementById('full-roll-call')
                        if (element) element.classList.toggle('hidden')
                      }}
                      className="text-sm text-blue-400 hover:underline"
                    >
                      See full roll call →
                    </button>
                  </div>

                  {/* Full Roll Call */}
                  <div id="full-roll-call" className="hidden mt-4 pt-4 border-t border-gray-700">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-96 overflow-y-auto">
                      {latestVote.votes.map((vote) => (
                        <div
                          key={vote.id}
                          className="flex items-center justify-between bg-gray-800 rounded px-3 py-2"
                        >
                          <span className="text-sm text-white truncate">{vote.voter_name}</span>
                          <span className={`text-xs font-semibold ml-2 ${
                            vote.option.toLowerCase() === 'yes' 
                              ? 'text-green-400' 
                              : vote.option.toLowerCase() === 'no'
                              ? 'text-red-400'
                              : 'text-gray-400'
                          }`}>
                            {vote.option}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {/* Sponsorship & Lobbying */}
              <section className="card">
                <h2 className="text-xl font-bold text-white mb-4">Sponsorship & Lobbying</h2>
                
                {bill.sponsorships && bill.sponsorships.length > 0 && (
                  <>
                    <div>
                      <h3 className="font-semibold text-gray-300">Primary Sponsor</h3>
                      {bill.sponsorships.filter(s => s.primary).map((sponsor) => (
                        <p key={sponsor.id} className="text-gray-400">{sponsor.name}</p>
                      ))}
                    </div>

                    {bill.sponsorships.filter(s => !s.primary).length > 0 && (
                      <div className="mt-3">
                        <h3 className="font-semibold text-gray-300">
                          Co-Sponsors ({bill.sponsorships.filter(s => !s.primary).length})
                        </h3>
                        <p className="text-gray-400">
                          {bill.sponsorships.filter(s => !s.primary).slice(0, 2).map(s => s.name).join(', ')}
                          {bill.sponsorships.filter(s => !s.primary).length > 2 && '... '}
                          <button className="text-blue-400 hover:underline">view all</button>
                        </p>
                      </div>
                    )}
                  </>
                )}
              </section>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-1">
              {/* AI Analysis & Truth Score */}
              <section className="card h-full">
                <h2 className="text-xl font-bold text-white mb-4">Bill Information</h2>
                
                <div className="space-y-4 text-sm">
                  {bill.abstracts && bill.abstracts.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-300 mb-2">Summary</h3>
                      <p className="text-gray-400 text-xs leading-relaxed">
                        {bill.abstracts[0].abstract.substring(0, 300)}
                        {bill.abstracts[0].abstract.length > 300 && '...'}
                      </p>
                    </div>
                  )}

                  <div className="border-t border-gray-700 pt-4">
                    <h3 className="font-semibold text-gray-300 mb-2">Status</h3>
                    <p className="text-gray-400 text-xs">
                      {bill.latest_action_description || 'No recent action'}
                    </p>
                    {bill.latest_action_date && (
                      <p className="text-gray-500 text-xs mt-1">
                        {new Date(bill.latest_action_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  {bill.versions && bill.versions.length > 0 && (
                    <div className="border-t border-gray-700 pt-4">
                      <h3 className="font-semibold text-gray-300 mb-2">Documents</h3>
                      <div className="space-y-2">
                        {bill.versions.slice(0, 3).map((version) => (
                          <div key={version.id}>
                            {version.links && version.links.length > 0 && (
                              <a
                                href={version.links[0].url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:underline text-xs block"
                              >
                                {version.note}
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="border-t border-gray-700 pt-4">
                    <a
                      href={bill.openstates_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline text-xs"
                    >
                      View on OpenStates →
                    </a>
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* Full-width sections below */}
          {bill.actions && bill.actions.length > 0 && (
            <div className="mt-8">
              <section className="card">
                <h2 className="text-xl font-bold text-white mb-4">Legislative Timeline</h2>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {bill.actions.slice().reverse().slice(0, 15).map((action, index) => (
                    <div key={action.id} className="flex gap-4 border-l-2 border-gray-700 pl-4 py-2 relative timeline-item">
                      <div className="flex-shrink-0 w-24 text-sm text-gray-400">
                        {new Date(action.date).toLocaleDateString()}
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm">{action.description}</p>
                        <p className="text-xs text-gray-400 mt-1">{action.organization.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}
        </div>
      </main>

      <style jsx>{`
        .status-step {
          padding: 4px 12px;
          border-radius: 9999px;
          font-size: 0.875rem;
          font-weight: 500;
          color: #9ca3af;
          transition: all 0.3s ease;
        }
        .status-step.active {
          background-color: #f9fafb;
          color: #111827;
          font-weight: 600;
          box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
        }
        .status-step.completed {
          color: #d1d5db;
        }
        .card {
          background-color: #1f2937;
          border: 1px solid #374151;
          border-radius: 16px;
          padding: 24px;
        }
        .timeline-item::before {
          content: '';
          position: absolute;
          left: -20px;
          top: 5px;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background-color: #4b5563;
          border: 2px solid #9ca3af;
        }
      `}</style>
    </div>
  )
}
