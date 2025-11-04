"use client"

import { useEffect, useState } from "react"
import Sidebar from "@/components/admin/layouts/Sidebar"
import Header from "@/components/admin/layouts/Header"

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)

  useEffect(() => {
    async function verify() {
      const res = await fetch("/api/auth/session")
      const data = await res.json()

      if (data?.user?.role === "ADMIN") {
        setIsAdmin(true)
      } else {
        window.location.href = "/admin/login"
      }
    }
    verify()
  }, [])

  if (isAdmin === null) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-600">
        Checking session...
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50">
        <Sidebar />
      </div>

      {/* Content area */}
      <div className="flex flex-col flex-1 ml-64">
        <Header />
        <main className="p-8 bg-gray-50 min-h-screen overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
