import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * 🧩 POST → Merge guest cart with logged-in user's cart
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { guestCart } = await req.json()

    // 🧠 Validate guest cart structure
    if (!guestCart || !Array.isArray(guestCart))
      return NextResponse.json({ error: "Invalid cart data" }, { status: 400 })

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    })
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 })

    // 🔹 Find or create a user cart
    let cart = await prisma.cart.findFirst({ where: { userId: user.id } })
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId: user.id } })
    }

    // 🔁 Merge logic
    const operations = guestCart.map(async (item: any) => {
      const { id: productId, quantity } = item
      if (!productId || !quantity) return null

      const existingItem = await prisma.cartItem.findFirst({
        where: { cartId: cart.id, productId },
      })

      if (existingItem) {
        // 🧮 Update existing quantity
        return prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + quantity },
        })
      } else {
        // ➕ Create new entry
        return prisma.cartItem.create({
          data: { cartId: cart.id, productId, quantity },
        })
      }
    })

    await Promise.all(operations)

    return NextResponse.json({
      success: true,
      message: "🛒 Cart merged successfully",
    })
  } catch (error: any) {
    console.error("❌ /api/cart/merge error:", error)
    return NextResponse.json(
      { error: "Failed to merge cart", details: error.message },
      { status: 500 }
    )
  }
}
