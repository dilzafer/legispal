'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Users, Search, Filter, ArrowLeft, Mail, Phone, MapPin, Globe, ChevronDown, ChevronUp } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import BillDashboardScan from '@/components/Dashboard/BillDashboardScan'
import { BillDashboardProvider, useBillDashboard } from '@/lib/useBillDashboard'
import { mockRepresentatives, representativeBills, Representative, RepresentativeBill } from '@/lib/mockRepresentativeData'

function RepresentativesContent() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterParty, setFilterParty] = useState<string>('all')
  const [filterChamber, setFilterChamber] = useState<string>('all')
  const [selectedRep, setSelectedRep] = useState<Representative | null>(null)
  const [expandedRep, setExpandedRep] = useState<string | null>(null)
  const { openBillDashboard } = useBillDashboard()

  const getPartyColor = (party: string) => {
    switch (party) {
      case 'Democrat': return 'text-blue-400 bg-blue-400/10'
      case 'Republican': return 'text-red-400 bg-red-400/10'
      case 'Independent': return 'text-purple-400 bg-purple-400/10'
      default: return 'text-gray-400 bg-gray-400/10'
    }
  }

  const getControversyColor = (level: string) => {
    switch (level) {
      case 'Low': return 'text-green-400 bg-green-400/10'
      case 'Medium': return 'text-yellow-400 bg-yellow-400/10'
      case 'High': return 'text-red-400 bg-red-400/10'
      default: return 'text-gray-400 bg-gray-400/10'
    }
  }

  const filteredRepresentatives = mockRepresentatives
    .filter(rep => {
      const matchesSearch = rep.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           rep.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           rep.title.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesParty = filterParty === 'all' || rep.party === filterParty
      const matchesChamber = filterChamber === 'all' || rep.chamber === filterChamber
      return matchesSearch && matchesParty && matchesChamber
    })

  const toggleExpanded = (repId: string) => {
    setExpandedRep(expandedRep === repId ? null : repId)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="bg-slate-950/80 backdrop-blur-sm border-b border-white/10 sticky top-0 z-50">
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
                  <Users className="text-democracy-gold" size={24} />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">My Representatives</h1>
                  <p className="text-sm text-gray-400">Search and explore your congressional representatives</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Controls */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="bg-slate-900/70 rounded-xl p-6 border border-white/10">
            <div className="flex flex-col gap-4">
              {/* Search Bar */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search representatives by name, state, or title..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-democracy-gold focus:border-transparent"
                  />
                </div>
              </div>
              
              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-4">
                {/* Party Filter */}
                <div className="md:w-48">
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <select
                      value={filterParty}
                      onChange={(e) => setFilterParty(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-democracy-gold focus:border-transparent appearance-none"
                    >
                      <option value="all">All Parties</option>
                      <option value="Democrat">Democrat</option>
                      <option value="Republican">Republican</option>
                      <option value="Independent">Independent</option>
                    </select>
                  </div>
                </div>

                {/* Chamber Filter */}
                <div className="md:w-48">
                  <select
                    value={filterChamber}
                    onChange={(e) => setFilterChamber(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-democracy-gold focus:border-transparent appearance-none"
                  >
                    <option value="all">All Chambers</option>
                    <option value="House">House of Representatives</option>
                    <option value="Senate">Senate</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Results Count */}
            <div className="mt-4 text-sm text-gray-400">
              Showing {filteredRepresentatives.length} of {mockRepresentatives.length} representatives
            </div>
          </div>
        </motion.div>

        {/* Representatives Grid */}
        <div className="space-y-6">
          {filteredRepresentatives.map((rep, index) => (
            <motion.div
              key={rep.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-slate-900/80 rounded-xl border border-white/10 overflow-hidden"
            >
              {/* Representative Header */}
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-white">{rep.name}</h3>
                      <div className={`text-xs px-2 py-1 rounded-full ${getPartyColor(rep.party)}`}>
                        {rep.party}
                      </div>
                      <div className="text-sm text-gray-400">
                        {rep.chamber} • {rep.state} {rep.district && `• ${rep.district} District`}
                      </div>
                    </div>
                    <p className="text-gray-300 mb-3">{rep.bio}</p>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                      <div>Years in Office: <span className="text-white">{rep.yearsInOffice}</span></div>
                      <div>Total Votes: <span className="text-white">{rep.votingRecord.totalVotes.toLocaleString()}</span></div>
                      <div>Party Unity: <span className="text-white">{rep.votingRecord.partyUnity}%</span></div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => toggleExpanded(rep.id)}
                    className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    {expandedRep === rep.id ? <ChevronUp className="text-white" size={20} /> : <ChevronDown className="text-white" size={20} />}
                  </button>
                </div>
              </div>

              {/* Expanded Content */}
              <AnimatePresence>
                {expandedRep === rep.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-white/10"
                  >
                    <div className="p-6 space-y-6">
                      {/* Committees */}
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-3">Committee Memberships</h4>
                        <div className="flex flex-wrap gap-2">
                          {rep.committeeMemberships.map((committee, idx) => (
                            <span key={idx} className="px-3 py-1 bg-slate-800 rounded-full text-sm text-gray-300">
                              {committee}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Contact Info */}
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-3">Contact Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center gap-2 text-gray-300">
                            <Mail size={16} />
                            <a href={`mailto:${rep.contactInfo.email}`} className="hover:text-white transition-colors">
                              {rep.contactInfo.email}
                            </a>
                          </div>
                          <div className="flex items-center gap-2 text-gray-300">
                            <Phone size={16} />
                            <a href={`tel:${rep.contactInfo.phone}`} className="hover:text-white transition-colors">
                              {rep.contactInfo.phone}
                            </a>
                          </div>
                          <div className="flex items-center gap-2 text-gray-300">
                            <MapPin size={16} />
                            <span>{rep.contactInfo.office}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-300">
                            <Globe size={16} />
                            <a href={rep.contactInfo.website} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                              Official Website
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* Sponsored Bills */}
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-3">Sponsored Bills</h4>
                        {representativeBills[rep.id] && representativeBills[rep.id].length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {representativeBills[rep.id].map((bill) => (
                              <motion.div
                                key={bill.id}
                                className="bg-slate-800/50 rounded-lg p-4 border border-white/5 hover:bg-slate-800/70 transition-all cursor-pointer group"
                                onClick={() => openBillDashboard(bill.id)}
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-xs font-mono text-gray-400">{bill.id}</span>
                                      <div className={`text-xs px-2 py-1 rounded-full ${getControversyColor(bill.controversy)}`}>
                                        {bill.controversy}
                                      </div>
                                    </div>
                                    <h5 className="text-white font-semibold group-hover:text-truth-green transition-colors mb-1">
                                      {bill.title}
                                    </h5>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-lg font-bold text-white">{bill.trendScore}</div>
                                    <div className="text-xs text-gray-400">Score</div>
                                  </div>
                                </div>
                                <p className="text-sm text-gray-300 mb-3 line-clamp-2">{bill.summary}</p>
                                <div className="flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1">
                                      <span className="text-green-400">{bill.supportersCount.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <span className="text-red-400">{bill.opposersCount.toLocaleString()}</span>
                                    </div>
                                  </div>
                                  <span className="text-gray-400">{new Date(bill.date).toLocaleDateString()}</span>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-400">No sponsored bills available.</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredRepresentatives.length === 0 && (
          <motion.div 
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="text-gray-400 mb-4">
              <Users size={48} className="mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No representatives found</h3>
              <p>Try adjusting your search terms or filter criteria.</p>
            </div>
          </motion.div>
        )}
      </main>

      {/* Bill Dashboard Overlay */}
      <BillDashboardScan />
    </div>
  )
}

export default function RepresentativesPage() {
  return (
    <BillDashboardProvider>
      <RepresentativesContent />
    </BillDashboardProvider>
  )
}
