"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSession } from "next-auth/react"
import axios from "axios"
import { useCart } from "@/context/CartContext"
import toast from "react-hot-toast"
import { ShoppingCart, Loader2, Flame, Search, ChevronLeft, ChevronRight } from "lucide-react"
import { motion } from "framer-motion"
import WishlistHeart from "@/components/ui/WishlistHeart"

export const dynamic = "force-dynamic"

interface Product {
  id: string
  name: string
  slug: string
  price: number
  discountPrice?: number | null
  mainImage?: string | null
  category?: string | null
  isFeatured?: boolean
  createdAt?: string
}

export default function ProductsPage() {
  const { data: session } = useSession()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { incrementCart, refreshCart } = useCart()

  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [sortBy, setSortBy] = useState("featured")
  const [category, setCategory] = useState("All")
  const [page, setPage] = useState(1)
  const perPage = 8

  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [addingId, setAddingId] = useState<string | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 300)
    return () => clearTimeout(t)
  }, [query])

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/products", { cache: "no-store" })
        const data = await res.json()
        setProducts(data)
      } catch (err) {
        console.error("Error loading products:", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const categories = useMemo(() => {
    const cats = new Set(["All"])
    products.forEach((p) => p.category && cats.add(p.category))
    return Array.from(cats)
  }, [products])

  const filtered = useMemo(() => {
    let list = [...products]

    if (debouncedQuery) {
      const q = debouncedQuery.toLowerCase()
      list = list.filter(
        (p) => p.name.toLowerCase().includes(q) || (p.category?.toLowerCase() ?? "").includes(q)
      )
    }

    if (category !== "All") {
      list = list.filter((p) => p.category === category)
    }

    switch (sortBy) {
      case "price-asc":
        list.sort((a, b) => (a.discountPrice ?? a.price) - (b.discountPrice ?? b.price))
        break
      case "price-desc":
        list.sort((a, b) => (b.discountPrice ?? b.price) - (a.discountPrice ?? a.price))
        break
      case "newest":
        list.sort(
          (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        )
        break
      case "featured":
        list.sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured))
        break
    }

    return list
  }, [products, debouncedQuery, category, sortBy])

  const totalPages = Math.ceil(filtered.length / perPage)
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  const changeQuantity = (id: string, delta: number) => {
    setQuantities((prev) => {
      const val = Math.max(1, (prev[id] || 1) + delta)
      return { ...prev, [id]: val }
    })
  }

  const addToLocalCart = async (product: Product, quantity = 1) => {
    setAddingId(product.id)
    try {
      const cart = JSON.parse(localStorage.getItem("guestCart") || "[]")
      const existing = cart.find((i: any) => i.id === product.id)
      if (existing) existing.quantity += quantity
      else cart.push({ ...product, quantity })
      localStorage.setItem("guestCart", JSON.stringify(cart))
      incrementCart(quantity)
      toast.success(`${product.name} added (${quantity}) 🛒`)
    } finally {
      setAddingId(null)
    }
  }

  const addToDbCart = async (productId: string, name: string, quantity = 1) => {
    setAddingId(productId)
    try {
      await axios.post("/api/cart", { productId, quantity })
      incrementCart(quantity)
      refreshCart()
      toast.success(`${name} added ✅`)
    } catch {
      toast.error("Error adding to cart ❌")
    } finally {
      setAddingId(null)
    }
  }

  const handleAdd = async (product: Product) => {
    const qty = quantities[product.id] || 1
    if (session?.user) await addToDbCart(product.id, product.name, qty)
    else await addToLocalCart(product, qty)
  }

  const sanitizeImage = (src?: string | null) => (!src ? "/placeholder.jpg" : src.replace("http://localhost:3000", ""))

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">

      {/* Header + Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Our Products</h1>
          <p className="text-gray-500 mt-1">Discover our best-selling juices & coconuts.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="relative flex items-center">
            <Search className="absolute left-3 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full sm:w-72 pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-200 text-sm"
            />
          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:ring-1 focus:ring-green-200"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:ring-1 focus:ring-green-200"
          >
            <option value="featured">Trending first</option>
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-[320px] bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : paginated.length ? (
        <>
          {/* ✅ STAGGER ANIMATION CONTAINER */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.08 } }
            }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
          >
            {paginated.map((p) => {
              const qty = quantities[p.id] || 1
              const isAdding = addingId === p.id

              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  whileHover={{ y: -4, scale: 1.01 }}
                  className="relative bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col"
                >
                  {p.isFeatured && (
                    <div className="absolute top-3 left-3 z-20 bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                      <Flame className="w-3.5 h-3.5" /> Trending
                    </div>
                  )}

                  <Link href={`/products/${p.slug}`} className="block">
                    <div className="relative h-64 w-full bg-gray-50">
                      <Image
                        src={sanitizeImage(p.mainImage)}
                        alt={p.name}
                        fill
                        className="object-cover transition-transform duration-500 hover:scale-105"
                        unoptimized
                      />
                    </div>

                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 text-base line-clamp-2">{p.name}</h3>
                      <p className="text-sm text-gray-500">{p.category}</p>

                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-green-700 font-bold text-lg">
                          ₹{(p.discountPrice ?? p.price).toLocaleString()}
                        </span>

                        {p.discountPrice && p.discountPrice < p.price && (
                          <>
                            <span className="text-gray-400 line-through text-sm">₹{p.price.toLocaleString()}</span>
                            <span className="text-red-600 text-xs font-bold">
                              {Math.round(((p.price - p.discountPrice) / p.price) * 100)}% off
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </Link>

                  {/* Controls */}
                  <div className="px-4 pb-4 mt-auto flex items-center gap-2">

                    {/* ❤️ Wishlist */}
                    <WishlistHeart
                      productId={p.id}
                      size={22}
                      onToggle={() => { }}
                    />

                    {/* Qty */}
                    <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-2 py-1">
                      <button onClick={() => changeQuantity(p.id, -1)} className="px-2 font-bold">–</button>
                      <span className="text-green-700 font-semibold w-5 text-center">{qty}</span>
                      <button onClick={() => changeQuantity(p.id, 1)} className="px-2 font-bold">+</button>
                    </div>

                    {/* Add */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleAdd(p)}
                      disabled={isAdding}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white font-medium transition shadow
                      ${isAdding ? "bg-green-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}
                    >
                      {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingCart className="w-4 h-4" />}
                      {isAdding ? "Adding..." : "Add"}
                    </motion.button>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-10">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className={`flex items-center gap-1 px-4 py-2 border rounded-lg ${page === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50 border-gray-200"
                  }`}
              >
                <ChevronLeft size={18} /> Prev
              </button>

              <span className="text-gray-600 font-medium">Page {page} of {totalPages}</span>

              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className={`flex items-center gap-1 px-4 py-2 border rounded-lg ${page === totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50 border-gray-200"
                  }`}
              >
                Next <ChevronRight size={18} />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16 text-gray-500">No products found. Try adjusting filters.</div>
      )}
    </div>
  )
}
