import type { Metadata } from 'next'
import { IBM_Plex_Serif } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/Layout/Sidebar'
import ConditionalHeader from '@/components/Layout/ConditionalHeader'
import { BillDashboardProvider } from '@/lib/useBillDashboard'
import BillDashboardScan from '@/components/Dashboard/BillDashboardScan'
import FloatingTTSButton from '@/components/TextToSpeech/FloatingTTSButton'

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
        <BillDashboardProvider>
          <Sidebar />

          <div className="ml-64 min-h-screen">
            <ConditionalHeader />

            <main className="px-8 py-6">
              {children}
            </main>
          </div>

          {/* Global Bill Dashboard Overlay */}
          <BillDashboardScan />
          
          {/* Text-to-Speech Floating Button */}
          <FloatingTTSButton />
        </BillDashboardProvider>
      </body>
    </html>
  )
}