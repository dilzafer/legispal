'use client'

import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { BillData } from '@/components/Dashboard/BillDashboard'
import { getCompleteBillData } from '@/lib/services/billService'

interface BillDashboardContextType {
  selectedBillId: string | null
  selectedBillData: BillData | null
  loading: boolean
  openBillDashboard: (billId: string) => void
  closeBillDashboard: () => void
}

const BillDashboardContext = createContext<BillDashboardContextType | undefined>(undefined)

export function BillDashboardProvider({ children }: { children: ReactNode }) {
  const [selectedBillId, setSelectedBillId] = useState<string | null>(null)
  const [selectedBillData, setSelectedBillData] = useState<BillData | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function loadBillData() {
      if (!selectedBillId) {
        setSelectedBillData(null)
        return
      }

      setLoading(true)

      try {
        // Parse bill ID - supports multiple formats:
        // 1. New format: "118-HR-5615" (congress-type-number)
        // 2. Legacy dash format: "HR-2024" or "S-3041" (type-number, assumes current congress)
        // 3. Dot format: "HR.5349" or "S.1234" (type.number, assumes current congress)
        // 4. Congress dot format: "118-HR.5349" (congress-type.number)
        let congress = 118 // Default to current congress
        let typePrefix: string
        let number: string

        const newFormatMatch = selectedBillId.match(/^(\d+)-([A-Z]+)-(\d+)$/)
        const legacyDashMatch = selectedBillId.match(/^([A-Z]+)-(\d+)$/)
        const dotFormatMatch = selectedBillId.match(/^([A-Z]+)\.(\d+)$/)
        const congressDotMatch = selectedBillId.match(/^(\d+)-([A-Z]+)\.(\d+)$/)

        if (newFormatMatch) {
          // New format with congress number
          const [, congressNum, type, billNum] = newFormatMatch
          congress = parseInt(congressNum, 10)
          typePrefix = type
          number = billNum
        } else if (congressDotMatch) {
          // Congress dot format
          const [, congressNum, type, billNum] = congressDotMatch
          congress = parseInt(congressNum, 10)
          typePrefix = type
          number = billNum
        } else if (legacyDashMatch) {
          // Legacy dash format without congress number
          const [, type, billNum] = legacyDashMatch
          typePrefix = type
          number = billNum
        } else if (dotFormatMatch) {
          // Dot format without congress number
          const [, type, billNum] = dotFormatMatch
          typePrefix = type
          number = billNum
        } else {
          console.error('Invalid bill ID format:', selectedBillId)
          setLoading(false)
          return
        }

        const billType = typePrefix.toLowerCase() === 's' ? 's' : typePrefix.toLowerCase()

        console.log(`🔍 Loading bill: ${billType.toUpperCase()}-${number} from Congress ${congress}`)

        // Fetch complete bill data from APIs
        const billData = await getCompleteBillData(billType, number, congress)

        if (billData) {
          setSelectedBillData(billData)
        } else {
          console.warn('Could not load bill data for:', selectedBillId)
        }
      } catch (error) {
        console.error('Error loading bill data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadBillData()
  }, [selectedBillId])

  const openBillDashboard = (billId: string) => {
    setSelectedBillId(billId)
  }

  const closeBillDashboard = () => {
    setSelectedBillId(null)
    setSelectedBillData(null)
  }

  return (
    <BillDashboardContext.Provider value={{
      selectedBillId,
      selectedBillData,
      loading,
      openBillDashboard,
      closeBillDashboard
    }}>
      {children}
    </BillDashboardContext.Provider>
  )
}

export function useBillDashboard() {
  const context = useContext(BillDashboardContext)
  if (context === undefined) {
    throw new Error('useBillDashboard must be used within a BillDashboardProvider')
  }
  return context
}
