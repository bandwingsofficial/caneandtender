"use client"

import { useState } from "react"
import {
  User,
  Mail,
  Phone,
  Globe,
  Lock,
  Bell,
  Shield,
  Save,
  Camera,
  Moon,
  Sun,
  DollarSign,
  Users
} from "lucide-react"

export default function AdminSettingsPage() {
  const [theme, setTheme] = useState("light")

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Shield className="text-green-600" /> Admin Settings
        </h1>
        <p className="text-gray-500 mt-1">
          Manage your account, preferences, and system configurations.
        </p>
      </div>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Profile Settings */}
        <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            👤 Profile Information
          </h2>
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src="/admin-avatar.png"
                  alt="Admin Avatar"
                  className="w-16 h-16 rounded-full border-2 border-green-500 object-cover"
                />
                <button className="absolute bottom-0 right-0 bg-green-600 p-1 rounded-full text-white">
                  <Camera size={14} />
                </button>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Admin User</h3>
                <p className="text-sm text-gray-500">Super Administrator</p>
              </div>
            </div>

            <InputField icon={<User />} label="Full Name" value="Admin User" />
            <InputField
              icon={<Mail />}
              label="Email"
              value="admin@example.com"
            />
            <InputField icon={<Phone />} label="Phone" value="+91 98765 43210" />

            <button className="mt-4 bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2">
              <Save size={16} /> Save Changes
            </button>
          </div>
        </div>

        {/* Site Information */}
        <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            🌐 Site Information
          </h2>
          <div className="space-y-5">
            <InputField
              icon={<Globe />}
              label="Website Name"
              value="FreshDrinks"
            />
            <InputField
              icon={<Mail />}
              label="Support Email"
              value="support@freshdrinks.com"
            />
            <InputField
              icon={<Phone />}
              label="Customer Care"
              value="+91 99887 66554"
            />
            <textarea
              placeholder="Business Address"
              defaultValue="No. 23, Green Street, Bengaluru - 560001"
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-green-500 outline-none"
            />
            <button className="mt-4 bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2">
              <Save size={16} /> Update Info
            </button>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            🔒 Security Settings
          </h2>
          <div className="space-y-4">
            <InputField icon={<Lock />} label="Change Password" value="" type="password" />
            <ToggleField
              icon={<Shield />}
              label="Enable Two-Factor Authentication (2FA)"
            />
            <ToggleField icon={<Bell />} label="Email Login Alerts" />
            <button className="mt-4 bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2">
              <Save size={16} /> Update Security
            </button>
          </div>
        </div>

        {/* Theme & Notifications */}
        <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            🎨 Preferences
          </h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-700">
                {theme === "light" ? (
                  <Sun className="text-yellow-500" />
                ) : (
                  <Moon className="text-gray-700" />
                )}
                <p>Theme Mode</p>
              </div>
              <button
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium"
              >
                Switch to {theme === "light" ? "Dark" : "Light"}
              </button>
            </div>

            <ToggleField icon={<Bell />} label="Order Notifications" />
            <ToggleField icon={<Users />} label="New User Alerts" />
            <ToggleField icon={<DollarSign />} label="Revenue Reports" />

            <button className="mt-4 bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2">
              <Save size={16} /> Save Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* 🧩 Reusable Input Component */
function InputField({
  icon,
  label,
  value,
  type = "text",
}: {
  icon: React.ReactNode
  label: string
  value: string
  type?: string
}) {
  return (
    <div>
      <label className="block text-sm text-gray-600 font-medium mb-1">
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-2.5 text-gray-400">{icon}</span>
        <input
          type={type}
          defaultValue={value}
          className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
        />
      </div>
    </div>
  )
}

/* 🧩 Reusable Toggle Component */
function ToggleField({
  icon,
  label,
}: {
  icon: React.ReactNode
  label: string
}) {
  const [enabled, setEnabled] = useState(false)
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-gray-700">
        {icon}
        <p>{label}</p>
      </div>
      <button
        onClick={() => setEnabled(!enabled)}
        className={`w-12 h-6 rounded-full transition-all duration-300 ${
          enabled ? "bg-green-600" : "bg-gray-300"
        } relative`}
      >
        <div
          className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${
            enabled ? "right-0.5" : "left-0.5"
          }`}
        ></div>
      </button>
    </div>
  )
}
