"use client"

import { useWallet } from "@/context/wallet-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function WalletConnectionModal() {
  const { isModalOpen, closeConnectModal, connectWallet, isConnecting } = useWallet()

  const walletOptions = [
    {
      id: "metamask",
      name: "MetaMask",
      icon: "/placeholder.svg?height=40&width=40",
      description: "Connect to your MetaMask wallet",
    },
    {
      id: "trustwallet",
      name: "Trust Wallet",
      icon: "/placeholder.svg?height=40&width=40",
      description: "Connect to your Trust Wallet",
    },
    {
      id: "walletconnect",
      name: "WalletConnect",
      icon: "/placeholder.svg?height=40&width=40",
      description: "Scan with WalletConnect to connect",
    },
    {
      id: "coinbase",
      name: "Coinbase Wallet",
      icon: "/placeholder.svg?height=40&width=40",
      description: "Connect to your Coinbase Wallet",
    },
  ]

  return (
    <Dialog open={isModalOpen} onOpenChange={(open) => !open && closeConnectModal()}>
      <DialogContent className="web3-card-featured web3-card-glow sm:max-w-md max-h-[90vh] overflow-y-auto fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center web3-gradient-text">Connect Your Wallet</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-center text-muted-foreground mb-6">
            Connect your wallet to join waitlists, access exclusive content, and participate in the WAGA ecosystem
          </p>
          <div className="space-y-3">
            {walletOptions.map((wallet) => (
              <Button
                key={wallet.id}
                variant="outline"
                className="w-full justify-between border-purple-500/30 hover:border-purple-500/60 bg-black/30 backdrop-blur py-6"
                onClick={() => connectWallet(wallet.id)}
                disabled={isConnecting}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                    <img src={wallet.icon || "/placeholder.svg"} alt={wallet.name} className="h-6 w-6" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">{wallet.name}</div>
                    <div className="text-xs text-muted-foreground">{wallet.description}</div>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </Button>
            ))}
          </div>
        </div>
        <div className="text-xs text-center text-muted-foreground">
          By connecting your wallet, you agree to our Terms of Service and Privacy Policy
        </div>
      </DialogContent>
    </Dialog>
  )
}

