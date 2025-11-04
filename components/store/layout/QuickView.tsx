"use client"

import Image from "next/image"
import { X, ShoppingCart, Loader2, Flame, Heart } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"
import { useCart } from "@/context/CartContext"
import { useSession } from "next-auth/react"
import axios from "axios"
import toast from "react-hot-toast"

interface QuickViewProps {
  product: any
  onClose: () => void
}

export default function QuickView({ product, onClose }: QuickViewProps) {
  const { data: session } = useSession()
  const { incrementCart, refreshCart } = useCart()
  const [isAdding, setIsAdding] = useState(false)
  const [wishAnim, setWishAnim] = useState(false)

  // ✅ Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [])

  // 🧠 Image cleaner
  const getImageSrc = (src: string | null | undefined) => {
    if (!src) return "/placeholder.jpg"
    return src.replace("http://localhost:3000", "")
  }

  // ❤️ Wishlist animation
  const handleWishlist = () => {
    setWishAnim(true)
    toast.success("Added to wishlist ❤️")
    setTimeout(() => setWishAnim(false), 700)
  }

  // 🛒 Guest cart
  const addToLocalCart = async () => {
    setIsAdding(true)
    try {
      const cart = JSON.parse(localStorage.getItem("guestCart") || "[]")
      const exists = cart.find((i: any) => i.id === product.id)
      exists ? (exists.quantity += 1) : cart.push({ ...product, quantity: 1 })
      localStorage.setItem("guestCart", JSON.stringify(cart))

      incrementCart(1)
      window.dispatchEvent(new Event("cart-updated"))

      toast.success(`${product.name} added 🛒`)
      onClose()
    } catch {
      toast.error("Error adding to cart")
    } finally {
      setIsAdding(false)
    }
  }

  // 🛒 DB cart
  const addToDbCart = async () => {
    setIsAdding(true)
    try {
      await axios.post("/api/cart", { productId: product.id, quantity: 1 })
      incrementCart(1)
      refreshCart()
      window.dispatchEvent(new Event("cart-updated"))

      toast.success(`${product.name} added ✅`)
      onClose()
    } catch {
      toast.error("Error adding to cart")
    } finally {
      setIsAdding(false)
    }
  }

  const handleAddToCart = async () => {
    if (session?.user) addToDbCart()
    else addToLocalCart()
  }

  const showDiscount =
    product.discountPrice && product.discountPrice < product.price

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4"
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="relative w-full max-w-3xl bg-white backdrop-blur-xl border border-white/30 shadow-2xl rounded-2xl overflow-hidden"
        >
          {/* ❌ Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/70 hover:bg-white p-2 rounded-full shadow-sm transition backdrop-blur-md"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>

          {/* 🔥 Trending Badge */}
          {product.isFeatured && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute top-4 left-4 z-[60] bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg flex items-center gap-1"
            >
              <Flame className="w-3 h-3 text-white" /> Trending
            </motion.div>
          )}


          <div className="grid md:grid-cols-2 gap-6 p-6">
            {/* 🖼️ Image */}
            <div className="relative w-full h-72 rounded-xl overflow-hidden border border-white/40">
              <Image
                src={getImageSrc(product.mainImage)}
                alt={product.name}
                fill
                className="object-cover"
                unoptimized
              />
            </div>

            {/* 📝 Content */}
            <div className="flex flex-col justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {product.name}
                </h2>
                {product.category && (
                  <p className="text-sm text-gray-500 mb-3 capitalize">
                    {product.category}
                  </p>
                )}


                {showDiscount ? (
                  <div className="flex items-center gap-2 mb-3">
                    <p className="text-green-700 text-2xl font-bold">
                      ₹{product.discountPrice?.toLocaleString()}
                    </p>
                    <p className="text-gray-400 line-through text-lg">
                      ₹{product.price.toLocaleString()}
                    </p>
                    <span className="text-red-500 text-sm font-semibold">
                      {Math.round(((product.price - product.discountPrice!) / product.price) * 100)}% OFF
                    </span>
                  </div>
                ) : (

                  <p className="text-green-700 text-2xl font-bold mb-3">
                    ₹{product.price.toLocaleString()}
                  </p>
                )}

                <p className="text-gray-600 text-sm leading-relaxed">
                  {product.description || "No description"}
                </p>
              </div>

              <div className="flex gap-3 mt-6">
                {/* ❤️ Wishlist */}
                {/* ❤️ Wishlist */}
                <motion.button
                  whileTap={{ scale: 0.8 }}
                  onClick={async () => {
                    setWishAnim(true);

                    // Save wishlist local / backend later
                    const list = JSON.parse(localStorage.getItem("wishlist") || "[]");
                    if (!list.find((x: any) => x.id === product.id)) {
                      list.push(product);
                      localStorage.setItem("wishlist", JSON.stringify(list));
                      window.dispatchEvent(new Event("wishlist-updated"));
                    }

                    toast.success("Added to Wishlist ❤️");

                    // Close after animation
                    setTimeout(() => {
                      setWishAnim(false);
                      onClose();
                    }, 500);
                  }}
                  className="px-4 py-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 transition"
                >
                  <motion.div
                    animate={wishAnim ? { scale: [1, 1.4, 1], rotate: [0, -10, 10, 0] } : {}}
                    transition={{ duration: 0.45 }}
                  >
                    <Heart
                      className={`w-5 h-5 ${wishAnim ? "text-red-500 fill-red-500" : "text-gray-600"
                        }`}
                    />
                  </motion.div>
                </motion.button>


                {/* 🛒 Add to Cart */}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleAddToCart}
                  disabled={isAdding}
                  className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-white font-semibold transition ${isAdding
                      ? "bg-green-400"
                      : "bg-green-600 hover:bg-green-700"
                    }`}
                >
                  {isAdding ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> Adding...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" /> Add to Cart
                    </>
                  )}
                </motion.button>

                {/* Close */}
                <button
                  onClick={onClose}
                  className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
