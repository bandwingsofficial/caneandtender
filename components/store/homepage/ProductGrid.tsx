"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Eye, ShoppingCart, ChevronRight, Loader2, Flame } from "lucide-react"
import QuickView from "@/components/store/layout/QuickView"
import useSWR from "swr"
import { useCart } from "@/context/CartContext"
import { useSession } from "next-auth/react"
import toast from "react-hot-toast"
import axios from "axios"

interface Product {
  id: string
  name: string
  slug: string
  price: number
  discountPrice?: number | null
  category: string | null
  isFeatured?: boolean
  mainImage?: string | null
  gallery?: string[] | null
  description?: string | null
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function ProductGrid() {
  const [category, setCategory] = useState("All")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [loadingProductId, setLoadingProductId] = useState<string | null>(null)

  const { data: products = [], error, isLoading } = useSWR<Product[]>(
    "/api/products",
    fetcher,
    { refreshInterval: 10000, revalidateOnFocus: true }
  )

  const { data: session } = useSession()
  const { incrementCart, refreshCart } = useCart()

  // 🛒 Add to local cart
  const addToLocalCart = async (product: Product) => {
    setLoadingProductId(product.id)
    try {
      const cart = JSON.parse(localStorage.getItem("guestCart") || "[]")
      const existing = cart.find((i: any) => i.id === product.id)
      if (existing) existing.quantity += 1
      else cart.push({ ...product, quantity: 1 })
      localStorage.setItem("guestCart", JSON.stringify(cart))

      incrementCart(1)
      window.dispatchEvent(new Event("cart-updated"))
      toast.success(`${product.name} added 🛒`)
    } catch (err) {
      toast.error("Error adding to cart ❌")
    } finally {
      setLoadingProductId(null)
    }
  }

  // 🛒 Add to database cart
  const addToDbCart = async (productId: string, name: string) => {
    setLoadingProductId(productId)
    try {
      await axios.post("/api/cart", { productId, quantity: 1 })
      incrementCart(1)
      refreshCart()
      window.dispatchEvent(new Event("cart-updated"))
      toast.success(`${name} added ✅`)
    } catch (err) {
      toast.error("Error adding to cart ❌")
    } finally {
      setLoadingProductId(null)
    }
  }

  // ✅ Decide cart handler
  const handleAddToCart = async (product: Product) => {
    if (session?.user) await addToDbCart(product.id, product.name)
    else await addToLocalCart(product)
  }

  const categories = ["All", "Sugarcane Juices", "Coconut", "Juices"]

  const filtered =
    category === "All"
      ? products
      : products.filter((p) =>
        p.category?.toLowerCase().includes(category.toLowerCase())
      )

  if (error)
    return (
      <section className="max-w-7xl mx-auto px-6 py-16 text-center text-red-500">
        ❌ Failed to load products.
      </section>
    )

  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      {/* 🌿 Header */}
      <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
        <div className="flex flex-wrap gap-3">
          {categories.map((cat) => (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-5 py-2 rounded-full border font-semibold transition-all ${category === cat
                  ? "bg-green-700 text-white border-green-700 shadow-md"
                  : "bg-white border-gray-200 text-gray-700 hover:border-green-400 hover:text-green-700"
                }`}
            >
              {cat}
            </motion.button>
          ))}
        </div>

        <Link
          href="/products"
          className="flex items-center gap-1 text-green-700 font-semibold hover:underline"
        >
          See All <ChevronRight size={18} />
        </Link>
      </div>

      {/* 🌀 Loading Skeletons */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-[350px] bg-gray-100 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      )}

      {/* ✅ Animated Product Grid */}
      <AnimatePresence mode="wait">
        {!isLoading && filtered.length > 0 && (
          <motion.div
            key={category}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8"
          >
            {filtered.slice(0, 10).map((product) => {
              const imgSrc =
                product.mainImage?.startsWith("http")
                  ? product.mainImage.replace("http://localhost:3000", "")
                  : product.mainImage || "/placeholder.jpg"

              const secondaryImage =
                product.gallery && product.gallery.length > 0
                  ? product.gallery[0]
                  : null

              const isLoadingButton = loadingProductId === product.id
              const showDiscount =
                product.discountPrice && product.discountPrice < product.price

              return (
                <motion.div
                  key={product.id}
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.2 }}
                  className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-gray-100 hover:border-green-200 transition-all cursor-pointer"
                >
                  {/* 🔥 Trending Badge */}
                  {product.isFeatured && (
                    <div className="absolute top-3 left-3 z-[30] bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                      <Flame className="w-3.5 h-3.5 text-white" />
                      Trending
                    </div>
                  )}

                  <Link href={`/products/${product.slug}`} className="block">
                    <div className="relative w-full h-[220px] overflow-hidden bg-gray-50">
                      <Image
                        src={imgSrc}
                        alt={product.name}
                        width={400}
                        height={220}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-[1.03]"
                        unoptimized
                      />

                      {secondaryImage && (
                        <Image
                          src={secondaryImage}
                          alt={`${product.name} secondary`}
                          width={400}
                          height={220}
                          className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-in-out"
                          unoptimized
                        />
                      )}

                      <div className="absolute inset-0 backdrop-blur-[2px] bg-black/20 opacity-0 group-hover:opacity-100 transition duration-300"></div>
                    </div>

                    <div className="p-5 flex flex-col justify-between h-[140px]">
                      <div>
                        <h3 className="font-semibold text-base text-gray-900 mb-1 line-clamp-2 group-hover:text-green-700 transition">
                          {product.name}
                        </h3>
                        {product.category && (
                          <p className="text-xs text-gray-500 mb-2">
                            {product.category}
                          </p>
                        )}
                      </div>

                      <div className="mt-auto">
                        {showDiscount ? (
                          <div className="flex items-center gap-2">
                            <p className="text-green-700 font-bold text-base">
                              ₹{product.discountPrice?.toLocaleString()}
                            </p>
                            <p className="text-gray-400 text-sm line-through">
                              ₹{product.price.toLocaleString()}
                            </p>
                            <span className="text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
                              {Math.round(((product.price - product.discountPrice!) / product.price) * 100)}% OFF
                            </span>
                          </div>
                        ) : (

                          <p className="text-green-700 font-bold text-base">
                            ₹{product.price.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>

                  <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition duration-300 z-20">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        e.preventDefault()
                        setSelectedProduct(product)
                      }}
                      className="p-2 bg-white rounded-full shadow hover:bg-green-50 transition"
                      title="Quick View"
                    >
                      <Eye className="w-5 h-5 text-green-700" />
                    </button>

                    <button
                      onClick={async (e) => {
                        e.stopPropagation()
                        e.preventDefault()
                        await handleAddToCart(product)
                      }}
                      disabled={isLoadingButton}
                      className={`p-2 rounded-full shadow transition flex items-center justify-center ${isLoadingButton
                          ? "bg-green-400 cursor-not-allowed"
                          : "bg-green-600 hover:bg-green-700"
                        }`}
                      title="Add to Cart"
                    >
                      {isLoadingButton ? (
                        <Loader2 className="w-5 h-5 text-white animate-spin" />
                      ) : (
                        <ShoppingCart className="w-5 h-5 text-white" />
                      )}
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 👁️ Quick View Modal */}
      {selectedProduct && (
        <QuickView
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </section>
  )
}
