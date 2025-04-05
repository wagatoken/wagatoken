import type React from "react"
import type { Metadata } from "next"
import { CommunityNavbar } from "@/components/community/community-navbar"
import { CommunityProvider } from "@/context/community-context"
import { WalletProvider } from "@/context/wallet-context"
import { WalletConnectionModal } from "@/components/wallet-connection-modal"

export const metadata: Metadata = {
  title: "WAGA Community | Connect, Learn, and Grow Together",
  description:
    "Join the WAGA Protocol community to connect with other members, share knowledge, and participate in events.",
}

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <WalletProvider>
      <CommunityProvider>
        <div className="flex min-h-screen flex-col">
          <CommunityNavbar />
          <main className="flex-1 bg-gradient-to-b from-emerald-950/40 to-purple-950/30">{children}</main>
          {/* Footer removed from here - it's already in the root layout */}
        </div>
        <WalletConnectionModal />
      </CommunityProvider>
    </WalletProvider>
  )
}

