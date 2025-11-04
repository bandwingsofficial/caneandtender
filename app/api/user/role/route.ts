import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email)
      return NextResponse.json({ role: null, error: "Not logged in" })

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    })

    return NextResponse.json({ role: user?.role || null })
  } catch (err) {
    console.error("Role fetch failed:", err)
    return NextResponse.json({ role: null, error: "Server error" }, { status: 500 })
  }
}
