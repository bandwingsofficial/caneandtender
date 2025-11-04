"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"

const slides = [
  {
    title: (
      <>
        Fresh <span className="text-yellow-300">Sugarcane</span> & Tender
        Coconut🥥
      </>
    ),
    desc: "100% natural, farm-fresh drinks packed with energy — straight from our fields.",
    img: "/images/sugar-cane-juice.png",
    bg: "bg-gradient-to-br from-green-800 via-green-700 to-emerald-600",
  },
  {
    title: (
      <>
        Pure <span className="text-yellow-300">Tender Coconut Water</span> 🥥
      </>
    ),
    desc: "Hydrate naturally with our hand-picked coconuts from coastal farms.",
    img: "/images/coconut-still-life.png",
    bg: "bg-gradient-to-br from-green-900 via-green-800 to-emerald-700",
  },
]

export default function Hero() {
  const [current, setCurrent] = useState(0)

  // Auto-rotate every 6 seconds
  useEffect(() => {
    const timer = setInterval(
      () => setCurrent((prev) => (prev + 1) % slides.length),
      6000
    )
    return () => clearInterval(timer)
  }, [])

  const slide = slides[current]

  return (
    <section
      className={`${slide.bg} text-white relative overflow-hidden transition-all duration-700`}
    >
      <div className="max-w-8xl mx-auto px-6 py-5 flex flex-col md:flex-row items-center gap-10 min-h-[85vh]">
        {/* 🌿 Text Section with Motion */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 60 }}
            transition={{
              duration: 0.7,
              ease: "easeOut",
            }}
            className="flex-1 space-y-6"
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-4xl md:text-6xl font-extrabold leading-tight drop-shadow-2xl"
            >
              {slide.title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-lg text-green-100 max-w-xl"
            >
              {slide.desc}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="flex gap-4 mt-6"
            >
              <Link
                href="/products"
                className="bg-yellow-400 text-green-900 font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-yellow-300 hover:scale-105 transition-transform duration-300"
              >
                Shop Now →
              </Link>
              <Link
                href="/about"
                className="border border-yellow-400 text-white font-semibold px-6 py-3 rounded-lg hover:bg-yellow-500 hover:text-green-900 hover:scale-105 transition-transform duration-300"
              >
                Learn More
              </Link>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* 🖼️ Animated Image Section */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`image-${current}`}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.05, y: -10 }}
            transition={{
              duration: 0.8,
              ease: "easeInOut",
            }}
            className="flex-1 flex justify-center"
          >
            <Image
              src={slide.img}
              alt="Sugarcane and Tender Coconut Products"
              width={500}
              height={720}
              priority
              className="drop-shadow-2xl rounded-3xl object-contain"
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}
