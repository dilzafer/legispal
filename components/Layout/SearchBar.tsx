'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, Calendar, User, Building2, Mic, X } from 'lucide-react'

export default function SearchBar() {
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [isListening, setIsListening] = useState(false)

  const suggestions = [
    'Healthcare reform bill HR-3755',
    'Infrastructure spending 2024',
    'Climate action initiatives',
    'Defense budget allocation'
  ]

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
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="text-xs text-gray-400 mb-2 block">Date Range</label>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Calendar size={16} />
                  <span>Last 30 days</span>
                </div>
              </div>
              
              <div>
                <label className="text-xs text-gray-400 mb-2 block">Sponsor</label>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <User size={16} />
                  <span>Any sponsor</span>
                </div>
              </div>
              
              <div>
                <label className="text-xs text-gray-400 mb-2 block">Committee</label>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Building2 size={16} />
                  <span>All committees</span>
                </div>
              </div>
              
              <div>
                <label className="text-xs text-gray-400 mb-2 block">Status</label>
                <select className="w-full bg-white/5 text-sm text-gray-300 rounded-lg px-3 py-1.5 outline-none">
                  <option>All statuses</option>
                  <option>Introduced</option>
                  <option>In committee</option>
                  <option>Passed House</option>
                  <option>Passed Senate</option>
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
          {suggestions
            .filter(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((suggestion, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="px-4 py-3 hover:bg-white/5 cursor-pointer transition-colors border-b border-white/5 last:border-b-0"
              >
                <p className="text-sm text-white">{suggestion}</p>
                <p className="text-xs text-gray-400 mt-0.5">Recently updated</p>
              </motion.div>
            ))}
        </motion.div>
      )}
    </motion.div>
  )
}