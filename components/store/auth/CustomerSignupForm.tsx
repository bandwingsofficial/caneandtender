"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

export default function CustomerSignupForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const res = await fetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })

    if (res.ok) {
      toast.success("Account created ✅ Now login")
      router.push("/login")
    } else toast.error("Email already exists")

    setLoading(false)
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <form
        onSubmit={handleSignup}
        className="bg-white p-8 rounded-xl shadow-md w-96 border"
      >
        <h2 className="text-2xl font-bold text-center text-green-700 mb-6">
          Create Account
        </h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-3 rounded-md mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-3 rounded-md mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          className="w-full bg-green-600 text-white py-2 rounded-md font-semibold hover:bg-green-700 transition"
          disabled={loading}
        >
          {loading ? "Signing up..." : "Sign up"}
        </button>
      </form>
    </div>
  )
}
