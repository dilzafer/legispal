import type { Metadata } from 'next'
import { IBM_Plex_Serif } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/Layout/Sidebar'
import SearchBar from '@/components/Layout/SearchBar'

const ibmPlexSerif = IBM_Plex_Serif({ 
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-ibm-plex'
})

export const metadata: Metadata = {
  title: 'Oversight - Truth Engine for Democracy',
  description: 'Making government data transparent and accessible to all citizens',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${ibmPlexSerif.className} bg-slate-950 min-h-screen`}>
        <Sidebar />
        
        <div className="ml-64 min-h-screen">
          <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-white/10">
            <div className="px-8 py-6">
              <SearchBar />
            </div>
          </header>
          
          <main className="px-8 py-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}