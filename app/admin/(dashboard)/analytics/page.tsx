"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts"
import { TrendingUp, Users, ShoppingBag, IndianRupee, BarChart3 } from "lucide-react"

export default function AnalyticsPage() {
  // Dummy Stats
  const stats = [
    {
      title: "Total Revenue",
      value: "₹7,82,540",
      change: "+12%",
      icon: <IndianRupee className="text-green-500" size={22} />,
      color: "bg-green-50",
    },
    {
      title: "Total Orders",
      value: "1,245",
      change: "+8%",
      icon: <ShoppingBag className="text-blue-500" size={22} />,
      color: "bg-blue-50",
    },
    {
      title: "Active Customers",
      value: "856",
      change: "+5%",
      icon: <Users className="text-amber-500" size={22} />,
      color: "bg-amber-50",
    },
    {
      title: "Avg. Order Value",
      value: "₹627",
      change: "+3%",
      icon: <BarChart3 className="text-purple-500" size={22} />,
      color: "bg-purple-50",
    },
  ]

  // Dummy sales data
  const salesData = [
    { month: "Jan", sales: 42000 },
    { month: "Feb", sales: 48000 },
    { month: "Mar", sales: 53000 },
    { month: "Apr", sales: 50000 },
    { month: "May", sales: 58000 },
    { month: "Jun", sales: 62000 },
    { month: "Jul", sales: 69000 },
  ]

  // Revenue share
  const pieData = [
    { name: "Juice", value: 45 },
    { name: "Coconut", value: 25 },
    { name: "Jaggery", value: 20 },
    { name: "Sugar", value: 10 },
  ]
  const COLORS = ["#22c55e", "#3b82f6", "#facc15", "#ef4444"]

  // Region Sales
  const regionData = [
    { region: "North", sales: 22000 },
    { region: "South", sales: 18000 },
    { region: "East", sales: 25000 },
    { region: "West", sales: 27000 },
  ]

  return (
    <div className="space-y-10">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          📊 Business Analytics
        </h1>
        <p className="text-gray-500 mt-1">
          Insights and metrics to track your sugarcane business performance.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <div
            key={i}
            className={`p-5 rounded-xl shadow-md flex items-center justify-between ${s.color}`}
          >
            <div>
              <p className="text-gray-500 text-sm font-medium">{s.title}</p>
              <h2 className="text-2xl font-bold text-gray-800 mt-1">
                {s.value}
              </h2>
              <span className="text-sm text-green-600 font-semibold">
                {s.change}
              </span>
            </div>
            <div className="p-3 bg-white rounded-full shadow-sm">{s.icon}</div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Line Chart */}
        <div className="xl:col-span-2 bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
            <TrendingUp className="text-green-500" size={20} />
            Monthly Sales Overview
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
              <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            💰 Revenue Share
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bar Chart Section */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          🗺️ Regional Sales Performance
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={regionData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis dataKey="region" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="sales" fill="#10b981" radius={[5, 5, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <InsightCard
          title="Best Performing Product"
          value="Sugarcane Juice"
          desc="Highest revenue contributor this quarter."
          color="from-green-400 to-emerald-500"
        />
        <InsightCard
          title="Top Customer Region"
          value="Western India"
          desc="Accounts for 35% of total orders."
          color="from-blue-400 to-indigo-500"
        />
        <InsightCard
          title="Monthly Growth Rate"
          value="+6.2%"
          desc="Steady rise compared to previous months."
          color="from-yellow-400 to-orange-500"
        />
      </div>
    </div>
  )
}

// 🧩 Insight Card Component
function InsightCard({
  title,
  value,
  desc,
  color,
}: {
  title: string
  value: string
  desc: string
  color: string
}) {
  return (
    <div
      className={`p-5 rounded-xl shadow text-white bg-gradient-to-r ${color}`}
    >
      <p className="text-sm font-medium opacity-90">{title}</p>
      <h3 className="text-2xl font-bold mt-2">{value}</h3>
      <p className="text-xs mt-2 opacity-85">{desc}</p>
    </div>
  )
}
