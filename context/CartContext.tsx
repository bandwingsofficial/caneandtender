"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react"
import { useSession } from "next-auth/react"
import axios from "axios"

interface CartContextType {
  cartCount: number
  refreshCart: () => Promise<void>
  incrementCart: (qty?: number) => void
  decrementCart: (qty?: number) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  const [cartCount, setCartCount] = useState(0)

  /** 🧠 Fetch cart data from API or local storage */
  const refreshCart = useCallback(async () => {
    try {
      if (status === "authenticated" && session?.user) {
        // 🧩 Make sure cookies/session are sent
        const { data } = await axios.get("/api/cart", {
          headers: { "Cache-Control": "no-store" },
          withCredentials: true, // ✅ critical fix
        })

        const count =
          data?.items?.reduce((sum: number, i: any) => sum + i.quantity, 0) || 0
        setCartCount(count)
      } else if (status === "unauthenticated") {
        // 🧱 Guest cart from localStorage
        const cart = localStorage.getItem("guestCart")
        if (cart) {
          const parsed = JSON.parse(cart)
          const count = parsed.reduce(
            (sum: number, item: any) => sum + (item.quantity || 0),
            0
          )
          setCartCount(count)
        } else {
          setCartCount(0)
        }
      }
    } catch (err: any) {
      // 🧩 Graceful handling of 401s or other API errors
      if (err?.response?.status === 401) {
        console.warn("Cart fetch unauthorized — using local cart.")
        const cart = localStorage.getItem("guestCart")
        if (cart) {
          const parsed = JSON.parse(cart)
          const count = parsed.reduce(
            (sum: number, item: any) => sum + (item.quantity || 0),
            0
          )
          setCartCount(count)
        } else {
          setCartCount(0)
        }
      } else {
        console.error("Error refreshing cart:", err)
      }
    }
  }, [status, session])

  /** 🔄 Cross-tab & local event broadcast */
  const broadcastUpdate = useCallback(() => {
    try {
      const bc = new BroadcastChannel("cart-updates")
      bc.postMessage("updated")
      bc.close()
      window.dispatchEvent(new Event("cart-updated"))
    } catch (err) {
      console.warn("Broadcast not supported:", err)
    }
  }, [])

  /** ➕ / ➖ Instant UI updates */
  const incrementCart = useCallback(
    (qty = 1) => {
      setCartCount((c) => c + qty)
      broadcastUpdate()
    },
    [broadcastUpdate]
  )

  const decrementCart = useCallback(
    (qty = 1) => {
      setCartCount((c) => Math.max(0, c - qty))
      broadcastUpdate()
    },
    [broadcastUpdate]
  )

  /** 🪄 Initialize on mount + listen for updates */
  useEffect(() => {
    if (status !== "loading") refreshCart()

    const bc = new BroadcastChannel("cart-updates")
    bc.onmessage = () => refreshCart()

    const localUpdateHandler = () => refreshCart()
    window.addEventListener("cart-updated", localUpdateHandler)

    const storageHandler = (e: StorageEvent) => {
      if (e.key === "guestCart") refreshCart()
    }
    window.addEventListener("storage", storageHandler)

    return () => {
      bc.close()
      window.removeEventListener("cart-updated", localUpdateHandler)
      window.removeEventListener("storage", storageHandler)
    }
  }, [status, refreshCart])

  return (
    <CartContext.Provider
      value={{ cartCount, refreshCart, incrementCart, decrementCart }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used within CartProvider")
  return ctx
}
