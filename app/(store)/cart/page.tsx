"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import axios from "axios"
import { useCart } from "@/context/CartContext"
import toast from "react-hot-toast"
import {
  Trash2,
  Minus,
  Plus,
  ArrowLeft,
  Lock,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { clearCartAction } from "./actions"

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

interface CartItem {
  id: string
  name: string
  price: number | string | null
  discountPrice?: number | string | null
  quantity: number
  imageUrl?: string
}

// ✅ Fix image URL for guest cart
const fixImageUrl = (url?: string) => {
  if (!url) return "/placeholder.jpg"
  if (url.startsWith("http")) return url
  if (!url.startsWith("/")) url = "/" + url
  return `${BASE_URL}${url}`
}

// ✅ Safe number
const safeNum = (val: any): number => {
  const num = Number(val)
  return isNaN(num) ? 0 : num
}

// ✅ Pricing helpers
const getOriginal = (item: CartItem) => safeNum(item.price)
const getFinal = (item: CartItem) => safeNum(item.discountPrice ?? item.price)
const getDiscountAmt = (item: CartItem) => getOriginal(item) - getFinal(item)

export default function CartPage() {
  const { data: session } = useSession()
  const { refreshCart, decrementCart } = useCart()
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const router = useRouter()

  // ✅ Load Cart
  useEffect(() => {
    const loadCart = async () => {
      try {
        if (session?.user) {
          const { data } = await axios.get("/api/cart")
          const fixed = data.items.map((i: any) => ({
            ...i,
            imageUrl: fixImageUrl(i.imageUrl || i.mainImage),
          }))
          setItems(fixed)
        } else {
          const local = JSON.parse(localStorage.getItem("guestCart") || "[]")
          const fixed = local.map((i: any) => ({
            ...i,
            imageUrl: fixImageUrl(i.imageUrl || i.mainImage),
          }))
          setItems(fixed)
        }
      } finally {
        setLoading(false)
      }
    }

    loadCart()
  }, [session])

  // ✅ Totals
  const subtotal = items.reduce((s, i) => s + getOriginal(i) * i.quantity, 0)
  const discount = items.reduce((s, i) => s + getDiscountAmt(i) * i.quantity, 0)
  const shipping = subtotal - discount > 500 ? 0 : 40
  const tax = (subtotal - discount) * 0.05
  const total = subtotal - discount + shipping + tax

  // ✅ Save guest cart
  const saveGuestCart = (c: CartItem[]) => {
    localStorage.setItem("guestCart", JSON.stringify(c))
    setItems(c)
  }

  // ✅ Update qty
  const updateQty = async (id: string, delta: number) => {
    const updated = items.map((item) =>
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    )
    setItems(updated)

    try {
      if (!session?.user) saveGuestCart(updated)
      else {
        await axios.put("/api/cart", { productId: id, quantityDelta: delta })
        refreshCart()
      }
    } catch {
      toast.error("Failed to update ❌")
    }
  }

  // ✅ Remove item
  const removeItem = async (id: string) => {
    const updated = items.filter((i) => i.id !== id)
    setItems(updated)
    decrementCart(1)
    toast.success("Removed 🗑️")

    if (!session?.user) return saveGuestCart(updated)
    await axios.delete("/api/cart", { data: { productId: id } })
  }

  // ✅ Clear cart
  const clearCart = async () => {
    if (session?.user) {
      const res = await clearCartAction()
      if (res.success) {
        setItems([])
        refreshCart()
        toast.success("Cart cleared ✅")
      } else toast.error("Error clearing cart")
    } else {
      localStorage.removeItem("guestCart")
      setItems([])
      refreshCart()
      toast.success("Cart cleared ✅")
    }
  }

  // ✅ Checkout
  const checkout = () => {
    setCheckoutLoading(true)
    if (!items.length) return toast.error("Cart empty ❌")
    router.push("/checkout")
  }

  if (loading) return <div className="p-10 text-center text-gray-600">Loading...</div>

  if (!items.length)
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Your cart is empty 🛒</h2>
        <Link href="/products" className="bg-green-600 text-white px-6 py-3 rounded-lg">
          Continue Shopping
        </Link>
      </div>
    )

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-10">
      {/* Cart Items */}
      <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border">
        <div className="flex justify-between mb-6">
          <h1 className="text-2xl font-bold text-green-700">Shopping Cart</h1>
          <button onClick={clearCart} className="text-red-600 font-semibold text-sm">
            <Trash2 className="w-4 h-4 inline" /> Clear All
          </button>
        </div>

        {items.map((item) => (
          <div key={item.id} className="flex flex-col sm:flex-row justify-between items-center border-b py-5 gap-4">
            <div className="flex items-center gap-4">
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-20 h-20 object-cover rounded-lg border bg-white"
              />
              <div>
                <h3 className="font-semibold text-lg">{item.name}</h3>
                <p className="text-green-700 font-medium">
                  ₹{getFinal(item).toFixed(2)}
                  {getDiscountAmt(item) > 0 && (
                    <span className="text-red-500 text-sm line-through ml-2">
                      ₹{getOriginal(item).toFixed(2)}
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center border rounded-lg">
                <button onClick={() => updateQty(item.id, -1)} className="px-3 py-1">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4">{item.quantity}</span>
                <button onClick={() => updateQty(item.id, 1)} className="px-3 py-1">
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button onClick={() => removeItem(item.id)} className="text-red-500">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}

        <div className="mt-6 flex justify-between items-center">
          <Link href="/products" className="text-green-700 font-semibold flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Continue Shopping
          </Link>

          <p className="text-lg font-semibold text-green-800">
            Subtotal: ₹{subtotal.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-gray-50 border p-6 rounded-xl shadow-sm h-fit sticky top-20">
        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
          <div className="flex justify-between"><span>Discount</span><span className="text-red-500">-₹{discount.toFixed(2)}</span></div>
          <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? "Free" : `₹${shipping.toFixed(2)}`}</span></div>
          <div className="flex justify-between"><span>Tax (5%)</span><span>₹{tax.toFixed(2)}</span></div>
        </div>

        <hr className="my-4" />

        <div className="flex justify-between text-lg font-bold text-green-700">
          <span>Total</span>
          <span>₹{total.toFixed(2)}</span>
        </div>

        <button
          disabled={checkoutLoading}
          onClick={checkout}
          className="mt-6 w-full bg-green-600 text-white py-3 rounded-lg flex justify-center gap-2"
        >
          {checkoutLoading ? <Loader2 className="animate-spin w-4 h-4" /> : <Lock className="w-4 h-4" />}
          Checkout Securely
        </button>
      </div>
    </div>
  )
}
