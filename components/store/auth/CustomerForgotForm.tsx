"use client"

import { useState } from "react"
import toast from "react-hot-toast"

export default function CustomerForgotForm() {
  const [email, setEmail] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    toast.success("Reset link sent to email (demo)")
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <form className="bg-white p-8 rounded-xl shadow-md w-96 border" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold text-center text-green-700 mb-6">
          Reset Password
        </h2>

        <input
          type="email"
          placeholder="Enter your email"
          className="w-full border p-3 rounded-md mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button className="w-full bg-green-600 text-white py-2 rounded-md font-semibold hover:bg-green-700 transition">
          Send Reset Link
        </button>
      </form>
    </div>
  )
}
