import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import AdminLoginForm from "@/components/admin/auth/LoginForm"

export default async function AdminLoginPage() {
  const session = await getServerSession(authOptions)

  // ✅ If already logged in as admin → go dashboard
  if (session?.user?.role === "ADMIN") {
    redirect("/admin/dashboard")
  }

  // ❌ If logged in as customer → do NOT loop, send to home
  if (session?.user?.role === "CUSTOMER") {
    redirect("/")
  }

  // ✅ Show admin login form
  return <AdminLoginForm />
}