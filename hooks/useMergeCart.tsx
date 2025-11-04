"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import axios from "axios"

export function useMergeCart() {
  const { data: session, status } = useSession()

  useEffect(() => {
    // Only run once when user logs in
    if (status === "authenticated") {
      const guestCart = JSON.parse(localStorage.getItem("guestCart") || "[]")
      if (guestCart.length > 0) {
        axios
          .post("/api/cart/merge", { guestCart })
          .then(() => {
            localStorage.removeItem("guestCart")
            console.log("🛒 Guest cart merged successfully!")
          })
          .catch((err) => console.error("Cart merge failed:", err))
      }
    }
  }, [status, session])
}
