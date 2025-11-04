"use client";

import { Toaster, ToastBar } from "react-hot-toast";
import { AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertTriangle, Info } from "lucide-react";
import React from "react";

export default function UXProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AnimatePresence mode="wait">{children}</AnimatePresence>

      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 2200,
          style: {
            background: "#111827",
            color: "#fff",
            borderRadius: 10,
            padding: "10px 12px",
            boxShadow: "0 6px 20px rgba(0,0,0,.25)",
            border: "1px solid rgba(255,255,255,.06)",
          },
        }}
      >
        {(t) => (
          <ToastBar toast={t}>
            {({ message }) => (
              <div className="flex items-center gap-2 border-l-4 border-emerald-500 pl-3">
                {t.type === "success" && <CheckCircle2 className="text-emerald-400 w-5 h-5" />}
                {t.type === "error" && <AlertTriangle className="text-red-400 w-5 h-5" />}
                {t.type === "loading" && <Info className="text-yellow-300 w-5 h-5 animate-pulse" />}
                <span className="text-sm">{message}</span>
              </div>
            )}
          </ToastBar>
        )}
      </Toaster>
    </>
  );
}
