"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Flame, ChevronLeft, ChevronRight, MapPin } from "lucide-react"
import AddToCartForm from "@/app/(store)/products/[slug]/AddToCartForm"
import { motion } from "framer-motion"   // ✅ NEW

interface Product {
  id: string
  name: string
  slug: string
  description: string
  shortDescription?: string | null
  category?: string | null
  price: number
  discountPrice?: number | null
  stock: number
  tags?: string[] | null
  mainImage?: string | null
  gallery?: string[] | null
  isFeatured?: boolean
}

export default function ProductDetailClient({ product }: { product: Product }) {
  const [index, setIndex] = useState(0)
  const [pincode, setPincode] = useState("")
  const [deliveryMsg, setDeliveryMsg] = useState<string | null>(null)
  const [checking, setChecking] = useState(false)

  const images = [product.mainImage, ...(product.gallery || [])].filter(Boolean) as string[]
  const priceToShow = product.discountPrice ?? product.price

  const discount =
    product.discountPrice && product.discountPrice < product.price
      ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
      : null

  const next = () => setIndex((i) => (i + 1) % images.length)
  const prev = () => setIndex((i) => (i - 1 + images.length) % images.length)

  const checkPincode = () => {
    setChecking(true)
    setDeliveryMsg(null)
    setTimeout(() => {
      if (pincode.match(/^[1-9][0-9]{5}$/)) {
        setDeliveryMsg("✅ Delivery available to your area within 2-4 days.")
      } else {
        setDeliveryMsg("❌ Invalid or unsupported pincode.")
      }
      setChecking(false)
    }, 800)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -25 }}         // ✅ Fade from top
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      className="max-w-7xl mx-auto px-6 py-12"
    >
      {/* Breadcrumb */}
      <nav className="text-sm mb-8 text-gray-500">
        <Link href="/" className="hover:text-green-600">Home</Link> /{" "}
        <Link href="/products" className="hover:text-green-600">Products</Link> /{" "}
        <span className="text-gray-800">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* ✅ Animate gallery too */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut", delay: 0.1 }}
          className="relative"
        >
          <div className="relative w-full h-[400px] md:h-[500px] rounded-xl overflow-hidden shadow-lg group">
            <Image
              src={images[index] || "/placeholder.jpg"}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              unoptimized
            />

            {images.length > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-700" />
                </button>
                <button
                  onClick={next}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow"
                >
                  <ChevronRight className="w-5 h-5 text-gray-700" />
                </button>
              </>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  className={`relative w-20 h-20 rounded-md overflow-hidden border-2 ${
                    i === index ? "border-green-600" : "border-transparent"
                  }`}
                >
                  <Image src={img} alt={`thumb-${i}`} fill className="object-cover" unoptimized />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* ✅ Animate details */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut", delay: 0.15 }}
          className="flex flex-col justify-between"
        >
          <div>
            {product.isFeatured && (
              <div className="inline-flex items-center bg-green-600 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">
                <Flame className="w-3.5 h-3.5 mr-1" />
                Trending
              </div>
            )}

            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>

            {product.shortDescription && (
              <p className="text-gray-500 mt-1">{product.shortDescription}</p>
            )}

            <p className="text-sm text-gray-500 mt-1">
              Category: <span className="font-medium text-gray-700">{product.category}</span>
            </p>

            {/* Price */}
            <div className="mt-6 flex items-center gap-3">
              <span className="text-3xl font-bold text-green-700">
                ₹{priceToShow.toLocaleString()}
              </span>
              {product.discountPrice && (
                <>
                  <span className="text-gray-400 line-through text-lg">
                    ₹{product.price.toLocaleString()}
                  </span>
                  {discount && (
                    <span className="text-sm font-semibold text-red-500">
                      {discount}% off
                    </span>
                  )}
                </>
              )}
            </div>

            <p className="text-xs text-gray-500 mt-1">Inclusive of all taxes</p>

            <p className="mt-3 text-sm">
              {product.stock > 0 ? (
                <span className="text-green-600 font-medium">In stock</span>
              ) : (
                <span className="text-red-500 font-medium">Out of stock</span>
              )}
            </p>

            {product.tags && product.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-xs font-medium bg-gray-100 rounded-full text-gray-600"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {product.description && (
              <div className="mt-6 border-t border-gray-100 pt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>
            )}

            <AddToCartForm productId={product.id} productName={product.name} />

            {/* Check Delivery */}
            <div className="mt-6 border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-green-600" /> Check Delivery Availability
              </h3>
              <div className="flex gap-3 items-center">
                <input
                  type="text"
                  placeholder="Enter Pincode"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 w-40 text-sm focus:ring-1 focus:ring-green-200"
                />
                <button
                  onClick={checkPincode}
                  disabled={checking}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
                >
                  {checking ? "Checking..." : "Check"}
                </button>
              </div>
              {deliveryMsg && (
                <p
                  className={`text-sm mt-2 ${
                    deliveryMsg.startsWith("✅") ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {deliveryMsg}
                </p>
              )}
            </div>

            {/* Payment Icons */}
            <div className="mt-6 border-t border-gray-100 pt-4">
              <p className="text-sm text-gray-600 mb-3 font-medium">We accept</p>
              <div className="flex items-center gap-3 opacity-80">
                <Image src="/icons/visa.png" alt="Visa" width={40} height={25} />
                <Image src="/icons/google-pay.png" alt="Google Pay" width={40} height={25} />
                <Image src="/icons/mastercard.png" alt="MasterCard" width={40} height={25} />
                <Image src="/icons/card.png" alt="card" width={40} height={25} />
                <Image src="/icons/paypal.png" alt="PayPal" width={40} height={25} />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
