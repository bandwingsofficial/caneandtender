"use client"

import { useState } from "react"
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import {
  ShoppingBag,
  Package,
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
} from "lucide-react"

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"]

export default function DashboardPage() {
  const [stats] = useState({
    totalOrders: 125,
    totalProducts: 48,
    totalCustomers: 312,
    revenue: 78250,
  })

  const salesData = [
    { month: "Jan", sales: 3000 },
    { month: "Feb", sales: 4200 },
    { month: "Mar", sales: 5100 },
    { month: "Apr", sales: 4900 },
    { month: "May", sales: 6800 },
    { month: "Jun", sales: 7200 },
    { month: "Jul", sales: 8500 },
  ]

  const revenueShare = [
    { name: "Juice", value: 40000 },
    { name: "Coconut", value: 18000 },
    { name: "Jaggery", value: 12000 },
    { name: "Sugar", value: 8200 },
  ]

  const recentOrders = [
    { id: "#ORD-101", customer: "Ramesh", total: "₹1,250", status: "Delivered" },
    { id: "#ORD-102", customer: "Akshay", total: "₹980", status: "Pending" },
    { id: "#ORD-103", customer: "Priya", total: "₹2,540", status: "Shipped" },
    { id: "#ORD-104", customer: "Sneha", total: "₹1,760", status: "Delivered" },
  ]

  const activity = [
    { time: "10 mins ago", message: "New order received (#ORD-110)" },
    { time: "1 hr ago", message: "Order #ORD-105 marked as shipped" },
    { time: "3 hrs ago", message: "New product added: Coconut Delight" },
    { time: "Yesterday", message: "User Priya joined as a customer" },
  ]

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-2">
          <TrendingUp className="text-emerald-600" /> Dashboard Overview
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Key business insights and live metrics at a glance.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          color="from-emerald-200 to-emerald-150"
          icon={<ShoppingBag className="text-black" size={26} />}
          title="Total Orders"
          value={stats.totalOrders}
          change="+12% ↑"
        />
        <StatCard
          color="from-blue-200 to-blue-15"
          icon={<Package className="text-black" size={26} />}
          title="Products"
          value={stats.totalProducts}
          change="+3 new"
        />
        <StatCard
          color="from-purple-200 to-purple-150"
          icon={<Users className="text-black" size={26} />}
          title="Customers"
          value={stats.totalCustomers}
          change="+25 new"
        />
        <StatCard
          color="from-amber-200 to-orange-150"
          icon={<DollarSign className="text-black" size={26} />}
          title="Revenue"
          value={`₹${stats.revenue.toLocaleString()}`}
          change="+8% ↑"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Line Chart */}
        <div className="xl:col-span-2 bg-white p-6 rounded-2xl shadow-md border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            📈 Monthly Sales Performance
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ r: 5, fill: "#10b981" }}
              />
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            💰 Revenue Breakdown
          </h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={revenueShare}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
              >
                {revenueShare.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-3 flex-wrap mt-3 text-sm">
            {revenueShare.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-gray-700 font-medium"
              >
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[i] }}
                ></span>
                {item.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Orders + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Orders */}
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            🛒 Recent Orders
          </h2>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-left border-b">
                <th className="py-3 px-4 font-semibold">Order ID</th>
                <th className="py-3 px-4 font-semibold">Customer</th>
                <th className="py-3 px-4 font-semibold">Total</th>
                <th className="py-3 px-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b hover:bg-gray-50 transition-all"
                >
                  <td className="py-3 px-4 font-medium text-gray-800">
                    {order.id}
                  </td>
                  <td className="py-3 px-4 text-gray-700">{order.customer}</td>
                  <td className="py-3 px-4 font-semibold text-gray-900">
                    {order.total}
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={order.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Activity */}
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            🔔 Recent Activity
          </h2>
          <ul className="space-y-4">
            {activity.map((act, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle2 className="text-emerald-500 mt-1" size={18} />
                <div>
                  <p className="text-gray-800 text-sm font-medium">
                    {act.message}
                  </p>
                  <span className="text-xs text-gray-500">{act.time}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

// 🧩 Components
// 🧩 Stat Card (black text version)
function StatCard({
  title,
  value,
  change,
  icon,
  color,
}: {
  title: string
  value: string | number
  change: string
  icon: React.ReactNode
  color: string
}) {
  return (
    <div
      className={`bg-gradient-to-br ${color} rounded-xl shadow-md p-6 flex items-center justify-between hover:scale-[1.02] transition-transform border border-gray-200`}
    >
      <div>
        <h3 className="text-sm font-medium text-gray-700">{title}</h3>
        <p className="text-3xl font-extrabold mt-1 text-gray-900">{value}</p>
        <p className="text-xs font-semibold mt-1 text-gray-700">{change}</p>
      </div>
      <div className="p-3 bg-white/70 rounded-full shadow-sm">{icon}</div>
    </div>
  )
}
function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    Delivered: "bg-emerald-100 text-emerald-700",
    Pending: "bg-amber-100 text-amber-700",
    Shipped: "bg-blue-100 text-blue-700",
  }

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${colorMap[status]}`}
    >
      {status}
    </span>
  )
}
