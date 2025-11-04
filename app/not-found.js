'use client';

import { motion } from "framer-motion";
import Link from "next/link";
import { Home, RefreshCcw } from "lucide-react";
import React from "react";

export default function NotFound() {
  const positions = React.useMemo(() => Array.from({ length: 10 }, (_, i) => i * 40), []);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-green-300 via-green-100 to-white text-center p-6 overflow-hidden">
      {/* Floating sugarcane leaves */}
      <div className="pointer-events-none select-none absolute inset-0 overflow-hidden">
        {positions.map((x, i) => (
          <motion.div
            key={i}
            initial={{ y: -50, x }}
            animate={{ y: [0, 800], rotate: [0, 20, -20, 0] }}
            transition={{ duration: 6 + i * 0.3, repeat: Infinity, delay: i * 0.2 }}
            className="absolute text-green-700 text-3xl"
          >
            🌿
          </motion.div>
        ))}

        {/* Tractor + Cow */}
        <motion.div
          className="absolute bottom-10 left-0 text-4xl"
          initial={{ x: -200 }}
          animate={{ x: [ -200, 600 ] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
          🚜
        </motion.div>

        <motion.div
          className="absolute bottom-20 right-5 text-5xl"
          initial={{ x: 40 }}
          animate={{ x: [40, 0, 40] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          🐮
        </motion.div>
      </div>

      {/* Cane Cartoon */}
      <motion.div
        initial={{ scale: 0.8, y: -30 }}
        animate={{ scale: 1, y: [0, -15, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="z-10 mb-4"
      >
        <img
          src="/sugarcane-cartoon.png"
          width="150"
          height="150"
          alt="Sugarcane Cartoon"
          className="drop-shadow-xl"
        />
      </motion.div>

      {/* Title */}
      <motion.h1
        className="text-5xl font-extrabold text-green-800 mb-3 drop-shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        404 — Lost in the Cane Fields 🌾
      </motion.h1>

      <p className="text-gray-700 mb-6 max-w-md font-medium">
        You wandered into the sugar farm and got stuck between sweet dreams 🍬 and tall cane crops!
      </p>

      {/* Buttons */}
      <div className="flex gap-4 z-10">
        <Link href="/">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 bg-green-700 text-white px-6 py-3 rounded-xl font-semibold shadow-md hover:bg-green-800"
          >
            <Home size={20} /> Go Home
          </motion.button>
        </Link>

        <motion.button
          onClick={() => window.location.reload()}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 bg-yellow-500 text-white px-6 py-3 rounded-xl font-semibold shadow-md hover:bg-yellow-600"
        >
          <RefreshCcw size={20} /> Try Again
        </motion.button>
      </div>

      {/* Fog */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-28 bg-white opacity-70 blur-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
    </div>
  );
}