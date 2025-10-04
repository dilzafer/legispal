'use client'

import { motion } from 'framer-motion'
import { 
  Home, 
  TrendingUp, 
  Users, 
  DollarSign, 
  MessageCircle, 
  Bookmark,
  Activity,
  AlertCircle,
  BarChart3,
  Shield
} from 'lucide-react'
import Link from 'next/link'

const sidebarItems = [
  { name: 'Dashboard', icon: Home, href: '/' },
  { name: 'Trending Bills', icon: TrendingUp, href: '/trending' },
  { name: 'My Representatives', icon: Users, href: '/representatives' },
  { name: 'Campaign Finance', icon: DollarSign, href: '/finance' },
  { name: 'Lobbying Activity', icon: MessageCircle, href: '/lobbying' },
  { name: 'Saved Searches', icon: Bookmark, href: '/saved' },
  { name: 'Truth Score', icon: Shield, href: '/truth-score' },
  { name: 'Citizen Pulse', icon: Activity, href: '/pulse' },
  { name: 'Alerts', icon: AlertCircle, href: '/alerts' }
]

export default function Sidebar() {
  return (
    <motion.div
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      className="fixed left-0 top-0 h-full w-64 bg-slate-900 glass-morphism border-r border-white/10 p-6 z-50"
    >
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-truth-green to-democracy-gold rounded-lg flex items-center justify-center">
            <BarChart3 size={20} className="text-white" />
          </div>
          Oversight
        </h1>
        <p className="text-xs text-gray-400 mt-1 ml-10">Truth Engine for Democracy</p>
      </motion.div>

      <nav className="space-y-1">
        {sidebarItems.map((item, index) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * index }}
          >
            <Link
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-all duration-200 text-gray-300 hover:text-white group"
            >
              <item.icon size={20} className="group-hover:text-truth-green transition-colors" />
              <span className="text-sm font-medium">{item.name}</span>
            </Link>
          </motion.div>
        ))}
      </nav>

      <motion.div 
        className="absolute bottom-6 left-6 right-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <div className="bg-gradient-to-r from-gov-blue to-gov-red p-4 rounded-lg">
          <h3 className="text-white font-semibold text-sm mb-1">Democracy Index</h3>
          <div className="flex items-end gap-1">
            <span className="text-2xl font-bold text-white">73</span>
            <span className="text-xs text-white/70 mb-1">/100</span>
          </div>
          <p className="text-xs text-white/80 mt-1">Based on transparency metrics</p>
        </div>
      </motion.div>
    </motion.div>
  )
}