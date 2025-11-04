"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type WLItem = { id: string; name: string; imageUrl?: string; price?: number };

type Ctx = {
  items: WLItem[];
  add: (p: WLItem) => void;
  remove: (id: string) => void;
  open: () => void;
  close: () => void;
  isOpen: boolean;
  count: number;
};

const WishlistCtx = createContext<Ctx | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WLItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try { setItems(JSON.parse(localStorage.getItem("wishlist") || "[]")); } catch {}
  }, []);
  useEffect(() => { localStorage.setItem("wishlist", JSON.stringify(items)); }, [items]);

  // allow header badge updates from elsewhere
  useEffect(() => {
    const onUpd = () => {
      try { setItems(JSON.parse(localStorage.getItem("wishlist") || "[]")); } catch {}
    };
    window.addEventListener("wishlist-updated", onUpd);
    return () => window.removeEventListener("wishlist-updated", onUpd);
  }, []);

  const ctx = useMemo<Ctx>(() => ({
    items,
    add: (p) => {
      setItems(prev => prev.find(x => x.id === p.id) ? prev : [...prev, p]);
      window.dispatchEvent(new Event("wishlist-updated"));
      setIsOpen(true);
    },
    remove: (id) => {
      setItems(prev => prev.filter(x => x.id !== id));
      window.dispatchEvent(new Event("wishlist-updated"));
    },
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    isOpen,
    count: items.length,
  }), [items, isOpen]);

  return <WishlistCtx.Provider value={ctx}>{children}</WishlistCtx.Provider>;
}
export const useWishlist = () => {
  const v = useContext(WishlistCtx);
  if (!v) throw new Error("useWishlist must be within WishlistProvider");
  return v;
};
