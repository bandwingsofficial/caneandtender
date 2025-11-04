import {
  LayoutDashboard,
  BarChart3,
  Factory,
  Store,
  Package,
  ShoppingBag,
  FileSpreadsheet,
  Users,
  UserCog,
  Coins,
  Settings,
  Database,
  ShieldCheck,
  BriefcaseBusiness,
  LogOut,
} from "lucide-react"

export const sidebarConfig = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/admin/dashboard",
    roles: ["superadmin", "companyadmin", "outletmanager", "inventoryclerk"],
  },
  {
    label: "Analytics",
    icon: BarChart3,
    href: "/admin/analytics",
    roles: ["superadmin", "companyadmin"],
  },
  {
    section: "Company & Outlets",
    items: [
      {
        label: "Companies",
        icon: Factory,
        href: "/admin/companies",
        roles: ["superadmin"],
      },
      {
        label: "Outlets",
        icon: Store,
        href: "/admin/outlets",
        roles: ["superadmin", "companyadmin"],
      },
    ],
  },
  {
    section: "Products, Inventory & Tenders",
    items: [
      {
        label: "Products",
        icon: Package,
        href: "/admin/products",
        roles: ["superadmin", "companyadmin", "outletmanager"],
      },
      {
        label: "Inventory",
        icon: FileSpreadsheet,
        href: "/admin/inventory",
        roles: ["superadmin", "companyadmin", "inventoryclerk"],
      },
      {
        label: "Orders",
        icon: ShoppingBag,
        href: "/admin/orders",
        roles: ["superadmin", "companyadmin"],
      },
      {
        label: "Tenders (Sugarcane & Coconut)",
        icon: BriefcaseBusiness,
        href: "/admin/tenders",
        roles: ["superadmin", "companyadmin", "tendermanager"],
      },
      {
        label: "Bids & Awards",
        icon: Coins,
        href: "/admin/bids",
        roles: ["superadmin", "companyadmin", "tendermanager"],
      },
    ],
  },
  {
    section: "Users & Roles",
    items: [
      {
        label: "All Users",
        icon: Users,
        href: "/admin/users",
        roles: ["superadmin", "companyadmin"],
      },
      {
        label: "Roles & Permissions",
        icon: UserCog,
        href: "/admin/roles",
        roles: ["superadmin"],
      },
      {
        label: "Audit Logs",
        icon: ShieldCheck,
        href: "/admin/audit",
        roles: ["superadmin", "companyadmin"],
      },
    ],
  },
  {
    section: "System Settings",
    items: [
      {
        label: "Admin Settings",
        icon: Settings,
        href: "/admin/settings",
        roles: ["superadmin", "companyadmin"],
      },
      {
        label: "Database & Backups",
        icon: Database,
        href: "/admin/database",
        roles: ["superadmin"],
      },
      {
        label: "Logout",
        icon: LogOut,
        href: "/logout",
        roles: [
          "superadmin",
          "companyadmin",
          "outletmanager",
          "inventoryclerk",
          "tendermanager",
        ],
      },
    ],
  },
]
