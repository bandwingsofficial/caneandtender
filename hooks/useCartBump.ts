"use client";

import { useEffect, useState } from "react";

export default function useCartBump() {
  const [bumpKey, setBumpKey] = useState(0);

  useEffect(() => {
    const onUpdate = () => setBumpKey((k) => k + 1);
    window.addEventListener("cart-updated", onUpdate);
    return () => window.removeEventListener("cart-updated", onUpdate);
  }, []);

  return { bumpKey };
}
