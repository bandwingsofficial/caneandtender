"use client"

import { SessionProvider, useSession } from "next-auth/react"
import { CartProvider } from "@/context/CartContext"
import { ReactNode } from "react"

function InnerProviders({ children }: { children: ReactNode }) {
  const { status } = useSession()

  // ⏳ Prevent CartProvider mount until session is known
  if (status === "loading") return null

  return <CartProvider>{children}</CartProvider>
}

export default function RootProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <InnerProviders>{children}</InnerProviders>
    </SessionProvider>
  )
}
