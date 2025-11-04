"use client"

import { signOut } from "next-auth/react"

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/admin" })}
      className="bg-red-600 text-white text-sm px-3 py-1 rounded hover:bg-red-700"
    >
      Logout
    </button>
  )
}
