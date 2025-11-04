"use client"

import { useState } from "react"
import {
  Bell,
  Search,
  Menu,
  Sun,
  Moon,
  User,
  ChevronDown,
  Settings,
  LogOut,
} from "lucide-react"

export default function Header() {
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [darkMode, setDarkMode] = useState(false)

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle("dark")
  }

  const notifications = [
    { id: 1, text: "New order #ORD-115 placed", time: "2 mins ago" },
    { id: 2, text: "Stock updated for Coconut Delight", time: "1 hr ago" },
    { id: 3, text: "Customer Sneha left a review", time: "Yesterday" },
  ]

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden">
            <Menu className="text-gray-700 dark:text-gray-300" />
          </button>
          <h1 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-green-500 via-blue-500 to-purple-500">
            Sugarcane ERP
          </h1>
        </div>

        {/* Center Search Bar */}
        <div className="hidden md:flex items-center bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-1 w-80">
          <Search className="text-gray-400 dark:text-gray-500 mr-2" size={18} />
          <input
            type="text"
            placeholder="Search anything..."
            className="bg-transparent focus:outline-none text-sm w-full text-gray-700 dark:text-gray-200"
          />
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4 relative">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            title="Toggle theme"
          >
            {darkMode ? (
              <Sun className="text-yellow-400" size={20} />
            ) : (
              <Moon className="text-gray-600 dark:text-gray-300" size={20} />
            )}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Bell className="text-gray-600 dark:text-gray-300" size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg overflow-hidden">
                <div className="p-3 border-b border-gray-100 dark:border-gray-800 font-medium text-gray-800 dark:text-gray-200">
                  🔔 Notifications
                </div>
                <ul className="max-h-60 overflow-y-auto">
                  {notifications.map((note) => (
                    <li
                      key={note.id}
                      className="px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                    >
                      <p>{note.text}</p>
                      <span className="text-xs text-gray-400">{note.time}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-2 rounded-full px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <img
                src="https://i.pravatar.cc/40?img=5"
                alt="Admin"
                className="w-8 h-8 rounded-full"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200 hidden sm:block">
                Admin
              </span>
              <ChevronDown
                size={16}
                className={`text-gray-500 transition-transform ${
                  showProfile ? "rotate-180" : ""
                }`}
              />
            </button>

            {showProfile && (
              <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                <button className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <User size={16} /> Profile
                </button>
                <button className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <Settings size={16} /> Settings
                </button>
                <hr className="border-gray-100 dark:border-gray-800" />
                <button className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <LogOut size={16} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
