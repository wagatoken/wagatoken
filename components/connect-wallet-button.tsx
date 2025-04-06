"use client"

import { useWallet } from "@/context/wallet-context"
import { Button } from "@/components/ui/button"
import { Wallet, ChevronDown, LogOut } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function ConnectWalletButton() {
  const { address, isConnected, openConnectModal, disconnectWallet } = useWallet()

  // Format address for display (0x71C7...976F)
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  // Generate avatar fallback from address
  const generateAvatarFallback = (address: string) => {
    return address.slice(2, 4).toUpperCase()
  }

  if (isConnected && address) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="border-purple-500/40 hover:border-purple-500/70 bg-purple-500/10 h-8 px-2 relative overflow-hidden group"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-emerald-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            <span className="relative z-10 flex items-center">
              <Avatar className="h-4 w-4 mr-1">
                <AvatarFallback className="bg-emerald-900/50 text-xs">{generateAvatarFallback(address)}</AvatarFallback>
              </Avatar>
              {formatAddress(address)}
              <ChevronDown className="ml-1 h-3 w-3" />
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="bg-purple-950/95 backdrop-blur border-purple-500/20 web3-card-purple"
        >
          <DropdownMenuItem className="text-red-400 focus:text-red-400 cursor-pointer group" onClick={disconnectWallet}>
            <LogOut className="mr-2 h-4 w-4 group-hover:text-purple-400 transition-colors duration-300" />
            <span>Disconnect</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <Button
      size="sm"
      onClick={openConnectModal}
      className="web3-button-outline-glow relative overflow-hidden group h-8 px-2 border-purple-500/40 hover:border-purple-500/70 bg-purple-500/10"
    >
      <span className="relative z-10 flex items-center">
        <Wallet className="mr-1 h-3 w-3 text-purple-400 group-hover:text-purple-300 transition-colors duration-300" />
        Connect Wallet
      </span>
    </Button>
  )
}

