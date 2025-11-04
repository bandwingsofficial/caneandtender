"use client"

import Link from "next/link"
import Image from "next/image"
import { CupSoda, Droplets, Flower2 } from "lucide-react"

const categories = [
  {
    name: "Sugarcane Juice",
    icon: <CupSoda className="w-10 h-10 text-yellow-400 drop-shadow-md" />,
    image: "/categories/sugarcane.jpg",
    href: "/products?s=Sugarcane",
    gradient: "from-green-200 via-yellow-100 to-green-300",
  },
  {
    name: "Tender Coconut",
    icon: <Droplets className="w-10 h-10 text-cyan-400 drop-shadow-md" />,
    image: "/categories/coconut.jpg",
    href: "/products?s=Coconut",
    gradient: "from-green-100 via-teal-100 to-green-200",
  },
  {
    name: "Organic Honey",
    icon: <Flower2 className="w-10 h-10 text-amber-400 drop-shadow-md" />,
    image: "/categories/honey.jpg",
    href: "/products?s=Honey",
    gradient: "from-amber-100 via-yellow-50 to-orange-100",
  },
]

export default function Categories() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
      {categories.map((cat) => (
        <Link
          key={cat.name}
          href={cat.href}
          className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br ${cat.gradient} shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2`}
        >
          {/* 🌿 Background Image Blur */}
          <div className="absolute inset-0 opacity-20">
            <Image
              src={cat.image}
              alt={cat.name}
              fill
              className="object-cover blur-sm scale-110"
              sizes="100vw"
            />
          </div>

          {/* 🧃 Content */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center py-16 px-6 space-y-5">
            <div className="p-4 rounded-full bg-white/30 backdrop-blur-sm shadow-md group-hover:scale-110 transition-transform duration-300">
              {cat.icon}
            </div>

            <h3 className="text-2xl font-bold text-green-800 tracking-tight drop-shadow-sm">
              {cat.name}
            </h3>

            <span className="bg-white/40 text-green-900 px-6 py-2 rounded-full text-sm font-medium backdrop-blur-sm shadow-inner group-hover:bg-white/60 transition">
              Shop Now →
            </span>
          </div>
        </Link>
      ))}
    </div>
  )
}
