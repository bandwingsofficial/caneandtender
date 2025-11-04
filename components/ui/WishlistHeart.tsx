"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";
import { useEffect, useState } from "react";

interface WishlistHeartProps {
  productId: string;
  size?: number;
  onToggle?: (isActive: boolean) => void;
}

export default function WishlistHeart({
  productId,
  size = 22,
  onToggle,
}: WishlistHeartProps) {
  const [active, setActive] = useState(false);

  // ✅ Load initial wishlist state
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("wishlist") || "[]");
    setActive(stored.includes(productId));
  }, [productId]);

  const toggle = () => {
    const stored: string[] = JSON.parse(localStorage.getItem("wishlist") || "[]");
    let newState: boolean;

    if (stored.includes(productId)) {
      // ✅ Remove from wishlist
      const filtered = stored.filter((id) => id !== productId);
      localStorage.setItem("wishlist", JSON.stringify(filtered));
      newState = false;
    } else {
      // ✅ Add to wishlist
      stored.push(productId);
      localStorage.setItem("wishlist", JSON.stringify(stored));
      newState = true;
    }

    setActive(newState);
    onToggle?.(newState);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="relative inline-flex items-center justify-center"
      aria-label="Toggle wishlist"
    >
      <motion.span
        initial={false}
        animate={{ scale: active ? 1.2 : 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 18 }}
      >
        <Heart
          className={active ? "fill-rose-500 text-rose-500" : "text-gray-700"}
          width={size}
          height={size}
        />
      </motion.span>

      <AnimatePresence>
        {active && (
          <motion.span
            key="burst"
            className="absolute inset-0 rounded-full pointer-events-none"
            initial={{ scale: 0.6, opacity: 0.6 }}
            animate={{ scale: 1.8, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
            style={{
              background:
                "radial-gradient(circle, rgba(244,63,94,.35) 0%, rgba(244,63,94,0) 70%)",
            }}
          />
        )}
      </AnimatePresence>
    </button>
  );
}
