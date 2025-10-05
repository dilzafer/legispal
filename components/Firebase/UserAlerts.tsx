'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X, Check } from 'lucide-react'
import { alertsService, type UserAlert } from '@/lib/firebase'
import Link from 'next/link'

interface UserAlertsProps {
  userId?: string // In production, get from auth context
}

export default function UserAlerts({ userId = 'demo-user' }: UserAlertsProps) {
  const [alerts, setAlerts] = useState<UserAlert[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const unreadCount = alerts.filter(alert => !alert.read).length

  useEffect(() => {
    loadAlerts()
  }, [userId])

  const loadAlerts = async () => {
    setIsLoading(true)
    try {
      const userAlerts = await alertsService.getUserAlerts(userId)
      setAlerts(userAlerts)
    } catch (error) {
      console.error('Error loading alerts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const markAsRead = async (alertId: string) => {
    try {
      await alertsService.markAlertAsRead(alertId)
      setAlerts(alerts.map(alert => 
        alert.id === alertId ? { ...alert, read: true } : alert
      ))
    } catch (error) {
      console.error('Error marking alert as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await alertsService.markAllAlertsAsRead(userId)
      setAlerts(alerts.map(alert => ({ ...alert, read: true })))
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const getAlertIcon = (type: UserAlert['type']) => {
    switch (type) {
      case 'bill_update':
        return '📄'
      case 'representative_vote':
        return '🗳️'
      case 'new_bill':
        return '✨'
      default:
        return '🔔'
    }
  }

  return (
    <div className="relative">
      {/* Alert Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-slate-800 transition-colors"
      >
        <Bell className="text-white" size={24} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Alerts Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-96 bg-slate-900 rounded-xl border border-white/10 shadow-xl z-50 max-h-[600px] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-white font-semibold">Notifications</h3>
                <p className="text-xs text-gray-400">{unreadCount} unread</p>
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-truth-green hover:text-truth-green/80 transition-colors"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-slate-800 rounded transition-colors"
                >
                  <X className="text-gray-400" size={18} />
                </button>
              </div>
            </div>

            {/* Alerts List */}
            <div className="overflow-y-auto flex-1">
              {isLoading ? (
                <div className="p-8 text-center text-gray-400">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-truth-green mx-auto mb-2"></div>
                  Loading alerts...
                </div>
              ) : alerts.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <Bell className="mx-auto mb-2 opacity-50" size={48} />
                  <p>No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {alerts.map((alert) => (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`p-4 hover:bg-slate-800/50 transition-colors ${
                        !alert.read ? 'bg-slate-800/30' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{getAlertIcon(alert.type)}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-white font-medium text-sm">
                              {alert.title}
                            </h4>
                            {!alert.read && (
                              <button
                                onClick={() => markAsRead(alert.id)}
                                className="p-1 hover:bg-slate-700 rounded transition-colors flex-shrink-0"
                                title="Mark as read"
                              >
                                <Check className="text-truth-green" size={16} />
                              </button>
                            )}
                          </div>
                          <p className="text-sm text-gray-400 mt-1">
                            {alert.message}
                          </p>
                          {alert.link && (
                            <Link
                              href={alert.link}
                              onClick={() => {
                                markAsRead(alert.id)
                                setIsOpen(false)
                              }}
                              className="text-xs text-truth-green hover:text-truth-green/80 mt-2 inline-block"
                            >
                              View details →
                            </Link>
                          )}
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(alert.createdAt.toDate()).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
