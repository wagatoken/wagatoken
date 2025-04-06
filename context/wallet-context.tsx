"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type WalletContextType = {
  address: string | null
  isConnecting: boolean
  isConnected: boolean
  connectWallet: (provider: string) => Promise<void>
  disconnectWallet: () => void
  openConnectModal: () => void
  closeConnectModal: () => void
  isModalOpen: boolean
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Check if wallet is already connected on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedAddress = localStorage.getItem("walletAddress")
      if (savedAddress) {
        setAddress(savedAddress)
        setIsConnected(true)
      }
    }
  }, [])

  const connectWallet = async (provider: string) => {
    setIsConnecting(true)

    try {
      // Simulate wallet connection
      // In a real implementation, this would use the actual provider APIs
      await new Promise((resolve) => setTimeout(resolve, 1000))

      let connectedAddress: string

      switch (provider) {
        case "metamask":
          connectedAddress = "0x71C7656EC7ab88b098defB751B7401B5f6d8976F"
          break
        case "trustwallet":
          connectedAddress = "0x2B5AD5c4795c026514f8317c7a215E218DcCD6cF"
          break
        case "walletconnect":
          connectedAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F"
          break
        default:
          connectedAddress = "0x" + Math.random().toString(16).slice(2, 42)
      }

      setAddress(connectedAddress)
      setIsConnected(true)
      localStorage.setItem("walletAddress", connectedAddress)
      closeConnectModal()
    } catch (error) {
      console.error("Error connecting wallet:", error)
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = () => {
    setAddress(null)
    setIsConnected(false)
    localStorage.removeItem("walletAddress")
  }

  const openConnectModal = () => {
    setIsModalOpen(true)
  }

  const closeConnectModal = () => {
    setIsModalOpen(false)
  }

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnecting,
        isConnected,
        connectWallet,
        disconnectWallet,
        openConnectModal,
        closeConnectModal,
        isModalOpen,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}

