"use client"

import { useState } from "react"
import axios from "axios"
import { useSession } from "next-auth/react"
import { useCart } from "@/context/CartContext"
import toast from "react-hot-toast"

interface AddToCartFormProps {
  productId: string
  productName: string
  productPrice?: number
  discountPrice?: number | null
  mainImage?: string
}

export default function AddToCartForm({
  productId,
  productName,
  productPrice,
  discountPrice,
  mainImage,
}: AddToCartFormProps) {
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)
  const { data: session } = useSession()
  const { incrementCart, refreshCart } = useCart()

  const handleAddToCart = async () => {
    setLoading(true)

    try {
      if (session?.user) {
        // ✅ Logged-in user → save to DB
        await axios.post("/api/cart", { productId, quantity })
        incrementCart(quantity)
        toast.success(`${productName} added to your cart 🛒`)
      } else {
        // 🧠 Guest cart → store full product info locally
        const guestCart = JSON.parse(localStorage.getItem("guestCart") || "[]")

        const existing = guestCart.find((i: any) => i.id === productId)
        if (existing) {
          existing.quantity += quantity
        } else {
          guestCart.push({
            id: productId,
            name: productName,
            price: productPrice ?? 0,
            discountPrice: discountPrice ?? null,
            mainImage: mainImage ?? "/placeholder.jpg",
            quantity,
          })
        }

        localStorage.setItem("guestCart", JSON.stringify(guestCart))
        incrementCart(quantity)
        toast.success(`${productName} added to cart ✅`)
      }

      // 🔁 Sync + broadcast
      const bc = new BroadcastChannel("cart-updates")
      bc.postMessage("updated")
      bc.close()
      window.dispatchEvent(new Event("cart-updated"))

      refreshCart()
    } catch (err) {
      console.error("Add to cart error:", err)
      toast.error("Error adding to cart ❌")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-4 mt-6 flex-wrap">
      <div className="flex items-center border rounded-lg">
        <button
          type="button"
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          className="px-3 py-1 text-lg"
        >
          –
        </button>
        <span className="px-4 py-1 font-semibold">{quantity}</span>
        <button
          type="button"
          onClick={() => setQuantity((q) => q + 1)}
          className="px-3 py-1 text-lg"
        >
          +
        </button>
      </div>

      <button
        onClick={handleAddToCart}
        disabled={loading}
        className={`bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition ${
          loading ? "opacity-70 cursor-not-allowed" : ""
        }`}
      >
        {loading ? "Adding..." : "🛒 Add to Cart"}
      </button>
    </div>
  )
}
