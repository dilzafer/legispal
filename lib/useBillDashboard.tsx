'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface BillDashboardContextType {
  selectedBillId: string | null
  openBillDashboard: (billId: string) => void
  closeBillDashboard: () => void
}

const BillDashboardContext = createContext<BillDashboardContextType | undefined>(undefined)

export function BillDashboardProvider({ children }: { children: ReactNode }) {
  const [selectedBillId, setSelectedBillId] = useState<string | null>(null)

  const openBillDashboard = (billId: string) => {
    setSelectedBillId(billId)
  }

  const closeBillDashboard = () => {
    setSelectedBillId(null)
  }

  return (
    <BillDashboardContext.Provider value={{
      selectedBillId,
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
