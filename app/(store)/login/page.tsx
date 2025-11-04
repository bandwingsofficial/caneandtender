import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import CustomerLoginForm from "@/components/store/auth/CustomerLoginForm"

export default async function LoginPage() {
  const session = await getServerSession(authOptions)

  if (session?.user?.role === "CUSTOMER") redirect("/")
  if (session?.user?.role === "ADMIN") redirect("/admin/dashboard")

  return <CustomerLoginForm />
}
