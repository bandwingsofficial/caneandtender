"use client"

import { Toaster, ToastBar } from "react-hot-toast"
import RootProvider from "@/components/providers/RootProvider"
import Header from "@/components/store/layout/Header"
import Footer from "@/components/store/layout/Footer"
import { CheckCircle2, AlertTriangle, Loader2, Info } from "lucide-react"

export default function RootClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <RootProvider>
      <Header />
      <main className="pt-20 flex-grow">{children}</main>
      <Footer />

      {/* ✅ Minimal Modern Toast */}
      <Toaster
  position="bottom-right"
  toastOptions={{
    duration: 2200,
    style: {
      background: "rgba(255,255,255,0.8)",
      backdropFilter: "blur(10px)",
      borderRadius: "12px",
      padding: "8px 12px",
      fontSize: "13px",
      border: "1px solid rgba(0,0,0,0.08)",
      display: "flex",
      alignItems: "center",
    },
  }}
>
  {(t) => (
    <ToastBar toast={t}>
      {({ message }) => (
        <div className="flex items-center gap-2 text-sm font-semibold text-green-700">

          {/* ✅ Sugarcane theme emoji icons */}
          {t.type === "success" && <span className="text-green-600 text-lg">🌱</span>}
          {t.type === "error" && <span className="text-red-600 text-lg">🍂</span>}
          {t.type === "loading" && <span className="animate-pulse text-lg">🌾</span>}
          {!["success","error","loading"].includes(t.type!) && (
            <span className="text-yellow-600 text-lg">🍬</span>
          )}

          <span className="text-[13px]">{message}</span>
        </div>
      )}
    </ToastBar>
  )}
</Toaster>

    </RootProvider>
  )
}
