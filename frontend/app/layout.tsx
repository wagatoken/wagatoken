import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'WAGA Coffee Platform - Ethiopian Coffee Tokenization',
  description:
    'Blockchain-powered platform for tokenizing premium Ethiopian roasted coffee with Chainlink verification and IPFS storage',
  keywords: [
    'coffee',
    'blockchain',
    'ethereum',
    'chainlink',
    'ipfs',
    'ethiopia',
    'tokenization',
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
