import type React from "react"
import type { Metadata } from "next"
import { AdminNavbar } from "@/components/admin/admin-navbar"

export const metadata: Metadata = {
  title: "WAGA Admin | Manage Your Community",
  description: "Admin dashboard for managing the WAGA Protocol community.",
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col pt-16">
      {" "}
      {/* Added pt-16 for navbar spacing */}
      <AdminNavbar />
      <main className="flex-1 bg-gradient-to-b from-emerald-950/40 to-purple-950/30">{children}</main>
      {/* Footer removed from here - it's already in the root layout */}
    </div>
  )
}

