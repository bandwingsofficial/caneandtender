"use client"

import Link from "next/link"
import { LucideIcon } from "lucide-react"
import { sidebarConfig } from "@/lib/sidebarConfig"

interface SidebarProps {
  role?: string
}

interface SidebarItem {
  label: string
  icon?: LucideIcon
  href?: string
  roles?: string[]
}

interface SidebarSection {
  section: string
  items: SidebarItem[]
}

type SidebarConfigItem = SidebarItem | SidebarSection

function isSection(item: SidebarConfigItem): item is SidebarSection {
  return (item as SidebarSection).section !== undefined
}

export default function Sidebar({ role = "superadmin" }: SidebarProps) {
  return (
    <aside className="h-screen w-64 bg-gradient-to-b from-green-700 via-emerald-600 to-teal-500 text-white shadow-xl flex flex-col">
      {/* Header */}
      <div className="px-6 py-5 border-b border-white/20 shrink-0">
        <h1 className="text-2xl font-bold tracking-wide">
          <span className="text-white">Sugarcane</span>{" "}
          <span className="text-yellow-200">& Coconut</span>
        </h1>
        <p className="text-xs text-white/60 mt-1 capitalize">{role} Panel</p>
      </div>

      {/* Scrollable middle area (hidden scrollbar) */}
      <nav className="flex-1 overflow-y-auto px-3 mt-3 no-scrollbar">
        <ul className="space-y-2 pb-6">
          {sidebarConfig.map((item: SidebarConfigItem, index: number) => {
            if (isSection(item)) {
              const visibleChildren = item.items.filter((child) =>
                child.roles?.includes(role)
              )
              if (visibleChildren.length === 0) return null

              return (
                <div key={index}>
                  <h2 className="mt-5 mb-1 px-4 text-xs uppercase text-white/60 font-semibold tracking-wider">
                    {item.section}
                  </h2>
                  {visibleChildren.map((child, i) => {
                    const Icon = child.icon
                    return (
                      <li key={i}>
                        <Link
                          href={child.href ?? "#"}
                          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/15 transition"
                        >
                          {Icon && <Icon size={20} />}
                          <span className="font-medium text-sm tracking-wide">
                            {child.label}
                          </span>
                        </Link>
                      </li>
                    )
                  })}
                </div>
              )
            } else {
              if (!item.roles?.includes(role)) return null
              const Icon = item.icon
              return (
                <li key={index}>
                  <Link
                    href={item.href ?? "#"}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/15 transition"
                  >
                    {Icon && <Icon size={20} />}
                    <span className="font-medium text-sm tracking-wide">
                      {item.label}
                    </span>
                  </Link>
                </li>
              )
            }
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-white/20 py-3 text-center text-xs text-white/70 shrink-0">
        © 2025 Sugarcane & Coconut ERP
      </div>
    </aside>
  )
}
