'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, Calendar, User, Building2, Mic, X, MapPin } from 'lucide-react'
import type { Bill, Jurisdiction } from '@/backend/types/openstates'

export default function SearchBar() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [searchResults, setSearchResults] = useState<Bill[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<string>('')
  const [jurisdictions, setJurisdictions] = useState<Jurisdiction[]>([])

  // Fetch jurisdictions on mount
  useEffect(() => {
    const fetchJurisdictions = async () => {
      try {
        const response = await fetch('/api/jurisdictions?classification=state&per_page=52')
        if (response.ok) {
          const data = await response.json()
          setJurisdictions(data.results || [])
        }
      } catch (error) {
        console.error('Failed to fetch jurisdictions:', error)
      }
    }
    fetchJurisdictions()
  }, [])

  // Debounced search
  useEffect(() => {
    const searchBills = async () => {
      if (searchQuery.length < 3) {
        setSearchResults([])
        return
      }

      setIsSearching(true)
      try {
        const params = new URLSearchParams({
          q: searchQuery,
          per_page: '5',
        })
        
        if (selectedJurisdiction) {
          params.append('jurisdiction', selectedJurisdiction)
        }

        const response = await fetch(`/api/bills/search?${params}`)
        if (response.ok) {
          const data = await response.json()
          setSearchResults(data.results || [])
        }
      } catch (error) {
        console.error('Search error:', error)
      } finally {
        setIsSearching(false)
      }
    }

    const timeoutId = setTimeout(searchBills, 300)
    return () => clearTimeout(timeoutId)
  }, [searchQuery, selectedJurisdiction])

  const handleBillClick = (bill: Bill) => {
    // Navigate to bill detail page
    router.push(`/bills/${bill.id}`)
    setSearchQuery('')
    setSearchResults([])
  }

  const handleVoiceSearch = () => {
    setIsListening(!isListening)
    // Voice search implementation would go here
  }

  return (
    <motion.div 
      className="relative w-full max-w-4xl mx-auto"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-truth-green/20 to-democracy-gold/20 rounded-2xl blur-xl" />
        
        <div className="relative bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-white/10 p-2">
          <div className="flex items-center gap-3">
            <Search className="text-gray-400 ml-3" size={20} />
            
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search bills, representatives, or topics..."
              className="flex-1 bg-transparent text-white placeholder-gray-400 py-3 px-2 outline-none text-sm"
            />
            
            <div className="flex items-center gap-2 mr-2">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleVoiceSearch}
                className={`p-2 rounded-lg transition-colors ${
                  isListening ? 'bg-red-500 text-white' : 'bg-white/5 text-gray-400 hover:text-white'
                }`}
              >
                <Mic size={18} />
              </motion.button>
              
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFilters(!showFilters)}
                className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white transition-colors"
              >
                <Filter size={18} />
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-slate-800/95 backdrop-blur-xl rounded-xl border border-white/10 p-4 z-10"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400 mb-2 flex items-center gap-2">
                  <MapPin size={14} />
                  State/Jurisdiction
                </label>
                <select 
                  value={selectedJurisdiction}
                  onChange={(e) => setSelectedJurisdiction(e.target.value)}
                  className="w-full bg-white/5 text-sm text-gray-300 rounded-lg px-3 py-2 outline-none border border-white/10 focus:border-truth-green/50"
                >
                  <option value="">All States</option>
                  {jurisdictions.map((jurisdiction) => (
                    <option key={jurisdiction.id} value={jurisdiction.name}>
                      {jurisdiction.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="text-xs text-gray-400 mb-2 block">Classification</label>
                <select className="w-full bg-white/5 text-sm text-gray-300 rounded-lg px-3 py-2 outline-none border border-white/10 focus:border-truth-green/50">
                  <option value="">All Types</option>
                  <option value="bill">Bill</option>
                  <option value="resolution">Resolution</option>
                  <option value="concurrent resolution">Concurrent Resolution</option>
                  <option value="joint resolution">Joint Resolution</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {searchQuery && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 right-0 mt-2 bg-slate-800/95 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden z-20"
        >
          {isSearching ? (
            <div className="px-4 py-6 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-truth-green mx-auto mb-2"></div>
              <p className="text-sm text-gray-400">Searching state bills...</p>
            </div>
          ) : searchResults.length > 0 ? (
            searchResults.map((bill, index) => (
              <motion.div
                key={bill.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleBillClick(bill)}
                className="px-4 py-3 hover:bg-white/5 cursor-pointer transition-colors border-b border-white/5 last:border-b-0"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 bg-truth-green/20 text-truth-green rounded text-xs font-semibold">
                        {bill.identifier}
                      </span>
                      <span className="px-2 py-0.5 bg-democracy-gold/20 text-democracy-gold rounded text-xs">
                        {bill.jurisdiction.name}
                      </span>
                    </div>
                    <p className="text-sm text-white font-medium truncate">{bill.title}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {bill.latest_action_description || 'No recent action'}
                      {bill.latest_action_date && ` • ${new Date(bill.latest_action_date).toLocaleDateString()}`}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-gray-400">No bills found. Try a different search term.</p>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}