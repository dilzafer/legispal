'use client'

import { usePathname } from 'next/navigation'
import SearchBar from './SearchBar'

export default function ConditionalHeader() {
  const pathname = usePathname()
  
  // Hide header on search page since it has its own header
  if (pathname === '/search') {
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
