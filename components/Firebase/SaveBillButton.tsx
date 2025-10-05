'use client'

import { useState } from 'react'
import { Bookmark, BookmarkCheck } from 'lucide-react'
import { savedBillsService, Timestamp } from '@/lib/firebase'

interface SaveBillButtonProps {
  billId: string
  billTitle: string
  billType: 'state' | 'federal'
  jurisdiction?: string
  userId?: string // In production, get from auth context
}

export default function SaveBillButton({
  billId,
  billTitle,
  billType,
  jurisdiction,
  userId = 'demo-user' // Replace with actual user ID from auth
}: SaveBillButtonProps) {
  const [isSaved, setIsSaved] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {
    setIsLoading(true)
    try {
      if (isSaved) {
        // Unsave logic - you'd need to store the saved bill ID
        // For now, just toggle the state
        setIsSaved(false)
      } else {
        // Save the bill
        await savedBillsService.saveBill({
          userId,
          billId,
          billTitle,
          billType,
          jurisdiction,
          savedAt: Timestamp.now(),
        })
        setIsSaved(true)
      }
    } catch (error) {
      console.error('Error saving bill:', error)
      alert('Failed to save bill. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleSave}
      disabled={isLoading}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
        isSaved
          ? 'bg-truth-green/20 text-truth-green hover:bg-truth-green/30'
          : 'bg-slate-800 text-gray-400 hover:bg-slate-700 hover:text-white'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {isSaved ? (
        <>
          <BookmarkCheck size={18} />
          <span>Saved</span>
        </>
      ) : (
        <>
          <Bookmark size={18} />
          <span>Save Bill</span>
        </>
      )}
    </button>
  )
}
