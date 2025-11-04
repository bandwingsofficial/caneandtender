import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"

export default async function AccountPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return redirect("/login")
  }

  // If admin, redirect to admin dashboard
  if (session.user.role === "ADMIN") {
    return redirect("/admin/dashboard")
  }

  // ✅ Customer account page
  return (
    <div className="max-w-4xl mx-auto py-10">
      <h1 className="text-2xl font-bold">My Account</h1>
      <p className="text-gray-600 mt-2">Welcome {session.user.name}</p>

      <div className="mt-6 space-y-4">
        <a href="/orders" className="text-green-600 underline">My Orders</a><br/>
        <a href="/profile" className="text-green-600 underline">Edit Profile</a><br/>
        <a href="/logout" className="text-red-600 underline">Logout</a>
      </div>
    </div>
  )
}
