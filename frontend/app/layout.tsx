import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'WAGA  - Blockchain Coffee Traceability',
  description: 'Track coffee from farm to cup with complete transparency using blockchain technology, Chainlink oracles, and IPFS storage.',
  keywords: [
    'coffee',
    'blockchain',
    'ethereum',
    'chainlink',
    'ipfs',
    'ethiopia',
    'traceability',
    'web3',
  ],
  openGraph: {
    title: 'WAGA - Onchain Coffee  OffChain Impact',
    description: 'Fair and Transparent farm to cup',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white text-gray-900 antialiased`}>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  )
}
