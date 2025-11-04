"use client"

import { useState } from "react"
import {
  Users,
  Search,
  UserPlus,
  ShieldCheck,
  Clock,
  Ban,
} from "lucide-react"

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState("")

  // Dummy Data
  const customers = [
    {
      id: "#CUST-001",
      name: "Ramesh Kumar",
      email: "ramesh@example.com",
      joined: "Jan 20, 2025",
      status: "Active",
    },
    {
      id: "#CUST-002",
      name: "Priya Sharma",
      email: "priya@example.com",
      joined: "Feb 10, 2025",
      status: "Active",
    },
    {
      id: "#CUST-003",
      name: "Sneha Rao",
      email: "sneha@example.com",
      joined: "Mar 05, 2025",
      status: "Inactive",
    },
    {
      id: "#CUST-004",
      name: "Akshay Patel",
      email: "akshay@example.com",
      joined: "Mar 20, 2025",
      status: "Active",
    },
    {
      id: "#CUST-005",
      name: "John D’Souza",
      email: "john@example.com",
      joined: "Apr 12, 2025",
      status: "Active",
    },
  ]

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Users className="text-green-600" /> Customer Management
          </h1>
          <p className="text-gray-500 mt-1">
            View, search, and manage all registered customers.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 w-full"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard
          icon={<Users className="text-blue-500" size={22} />}
          title="Total Customers"
          value="856"
          color="bg-blue-50"
        />
        <SummaryCard
          icon={<UserPlus className="text-green-500" size={22} />}
          title="New This Month"
          value="42"
          color="bg-green-50"
        />
        <SummaryCard
          icon={<ShieldCheck className="text-emerald-500" size={22} />}
          title="Active"
          value="790"
          color="bg-emerald-50"
        />
        <SummaryCard
          icon={<Ban className="text-red-500" size={22} />}
          title="Inactive"
          value="66"
          color="bg-red-50"
        />
      </div>

      {/* Customers Table */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          All Customers
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-600 text-left border-b">
                <th className="py-3 px-4">Customer ID</th>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Joined</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((cust) => (
                <tr
                  key={cust.id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="py-3 px-4 font-medium text-gray-800">
                    {cust.id}
                  </td>
                  <td className="py-3 px-4 flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-semibold">
                      {cust.name.charAt(0)}
                    </div>
                    <span>{cust.name}</span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{cust.email}</td>
                  <td className="py-3 px-4 text-gray-500">{cust.joined}</td>
                  <td className="py-3 px-4">
                    <StatusBadge status={cust.status} />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button className="text-green-600 hover:underline font-medium text-sm">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-6 text-sm text-gray-600">
          <p>Showing 1–5 of 120 customers</p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 border rounded hover:bg-gray-100">
              Prev
            </button>
            <button className="px-3 py-1 border rounded bg-green-600 text-white hover:bg-green-700">
              1
            </button>
            <button className="px-3 py-1 border rounded hover:bg-gray-100">
              2
            </button>
            <button className="px-3 py-1 border rounded hover:bg-gray-100">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// 🧩 Summary Card Component
function SummaryCard({
  icon,
  title,
  value,
  color,
}: {
  icon: React.ReactNode
  title: string
  value: string
  color: string
}) {
  return (
    <div
      className={`p-5 rounded-xl shadow-md flex items-center justify-between ${color}`}
    >
      <div>
        <p className="text-gray-500 text-sm font-medium">{title}</p>
        <h2 className="text-2xl font-bold text-gray-800 mt-1">{value}</h2>
      </div>
      <div className="p-3 bg-white rounded-full shadow-sm">{icon}</div>
    </div>
  )
}

// 🧩 Status Badge
function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    Active: "bg-green-100 text-green-700",
    Inactive: "bg-red-100 text-red-700",
  }

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${colorMap[status]}`}
    >
      {status}
    </span>
  )
}
