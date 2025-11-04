"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { JSX, useEffect, useRef, useState } from "react";
import { Menu, X, Bell, ShoppingBag } from "lucide-react";
import { UserRound, Receipt, ShieldCheck, LogOut, ChevronRight } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useCart } from "@/context/CartContext";
import useForceRender from "@/hooks/useForceRender";
import WishlistHeart from "@/components/ui/WishlistHeart";
import { motion } from "framer-motion";
import useCartBump from "@/hooks/useCartBump";

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const { data: session, status } = useSession();
  const { cartCount } = useCart();
  useForceRender("cart-updated");

  const userName = session?.user?.name || "User";
  const role = (session?.user as any)?.role;
  const firstLetter = userName.charAt(0).toUpperCase();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loginLink = `/login?callbackUrl=${encodeURIComponent(pathname)}`;

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const { bumpKey } = useCartBump();

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 border-b border-green-100 shadow-sm z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
        
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <img src="/logo/logo-main.png" alt="SugarTinder" className="w-56 h-14 object-contain" />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 font-medium">
          <NavLink href="/" cur={pathname} text="Home" />
          <Dot />
          <NavLink href="/about" cur={pathname} text="About" />
          <Dot />
          <NavLink href="/products" cur={pathname} text="Shop" />
          <Dot />
          <NavLink href="/contact" cur={pathname} text="Contact" />
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-4">

          {/* Wishlist */}
          <Link href="/wishlist" className="hidden sm:inline-flex">
            <WishlistHeart productId="demo" size={22} />
          </Link>

          {/* Notifications */}
          {status === "authenticated" && (
            <button className="relative hidden sm:inline-flex">
              <Bell className="h-5 w-5 text-gray-700" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
          )}

          {/* Cart */}
          <Link href="/cart" className="relative">
            <motion.div
              key={bumpKey}
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 0.32 }}
              className="relative"
            >
              <ShoppingBag className="h-6 w-6 text-gray-900" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-3 bg-emerald-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {cartCount}
                </span>
              )}
            </motion.div>
          </Link>

          {/* Account */}
          {status === "authenticated" ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(v => !v)}
                className="flex items-center gap-2 rounded-full bg-green-500 text-white pl-1 pr-3 py-1.5 hover:bg-green-600 transition shadow-sm hover:shadow"
              >
                <div className="h-8 w-8 rounded-full bg-white/30 flex items-center justify-center font-bold text-white text-sm">
                  {firstLetter}
                </div>
                <span className="hidden sm:block font-medium">{userName}</span>
              </button>

              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur rounded-xl shadow-[0_8px_28px_rgba(0,0,0,0.12)] py-2 z-50"
                >
                  {/* User Info */}
                  <div className="px-4 pb-2 border-b border-gray-200/40">
                    <div className="flex items-center gap-3 py-2">
                      <div className="h-10 w-10 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                        {firstLetter}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{userName}</p>
                        <p className="text-[11px] text-gray-500 capitalize">{role}</p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Links */}
                  <div className="py-1 text-sm text-gray-700">
                    {role === "CUSTOMER" && (
                      <>
                        <DropItem href="/account" label="My Account" icon={<UserRound className="w-4 h-4 text-green-600" />} />
                        <DropItem href="/orders" label="My Orders" icon={<Receipt className="w-4 h-4 text-green-600" />} />
                      </>
                    )}
                    {role === "ADMIN" && (
                      <DropItem href="/admin/dashboard" label="Admin Dashboard" icon={<ShieldCheck className="w-4 h-4 text-green-600" />} />
                    )}
                  </div>

                  {/* Logout */}
                  <DropItem
                    href="#"
                    label="Logout"
                    icon={<LogOut className="w-4 h-4 text-red-600" />}
                    onClick={() => signOut({ callbackUrl: "/" })}
                    logout
                  />
                </motion.div>
              )}
            </div>
          ) : (
            <Link href={loginLink} className="inline-flex items-center gap-2 rounded-full bg-green-500 text-white px-4 py-2 font-semibold hover:bg-green-600 transition shadow-sm hover:shadow">
              <UserRound className="h-4 w-4" />
              Login
            </Link>
          )}

          {/* Mobile Menu */}
          <button className="md:hidden ml-2" onClick={() => setMenuOpen(v => !v)}>
            {menuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t py-4 flex flex-col items-center gap-4">
          <NavLink href="/" cur={pathname} text="Home" />
          <NavLink href="/about" cur={pathname} text="About" />
          <NavLink href="/products" cur={pathname} text="Shop" />
          <NavLink href="/contact" cur={pathname} text="Contact" />
          {status !== "authenticated" && (
            <Link href={loginLink} className="border px-4 py-2 rounded-md">
              Login
            </Link>
          )}
        </div>
      )}
    </header>
  );
}

function Dot() {
  return <span className="h-1 w-1 rounded-full bg-gray-300 inline-block" />;
}

function NavLink({ href, cur, text }: any) {
  const active = cur === href;
  return (
    <Link href={href} className={active ? "text-emerald-700 font-semibold" : "text-gray-800 hover:text-emerald-700"}>
      {text}
    </Link>
  );
}

/* ✅ PRO DropItem with Lucide Icons + Hover Arrow */
function DropItem({
  href,
  label,
  icon,
  onClick,
  logout,
}: {
  href: string;
  label: string;
  icon?: JSX.Element;
  onClick?: () => void;
  logout?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left"
    >
      <Link
        href={href}
        className={`flex items-center justify-between px-4 py-2 text-[14px] transition 
          ${logout ? "text-red-600 hover:bg-red-50/60" : "text-gray-800 hover:bg-gray-100/70"} 
          font-medium`}
      >
        <div className="flex items-center gap-2">
          {icon}
          <span>{label}</span>
        </div>

        <motion.span
          initial={{ opacity: 0, x: -6 }}
          whileHover={{ opacity: 1, x: 0 }}
        >
          <ChevronRight size={14} className={logout ? "text-red-400" : "text-gray-400"} />
        </motion.span>
      </Link>
    </button>
  );
}
