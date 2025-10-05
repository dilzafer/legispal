'use client'

import { usePathname } from 'next/navigation'
import SearchBar from './SearchBar'

export default function ConditionalHeader() {
  const pathname = usePathname()

  // Hide header on pages that have their own headers
  if (pathname === '/search' || pathname === '/trending' || pathname === '/lobbying' || pathname === '/representatives') {
    return null
  }
  
  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-white/10">
      <div className="px-8 py-6">
        <SearchBar />
      </div>
    </header>
  )
}
