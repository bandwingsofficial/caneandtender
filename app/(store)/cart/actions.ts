"use server"

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { revalidatePath } from "next/cache"

/**
 * 🧹 Server Action → Clear all items from logged-in user's cart
 */
export async function clearCartAction() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email)
      return { success: false, error: "Not logged in" }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    })

    if (!user) return { success: false, error: "User not found" }

    const cart = await prisma.cart.findFirst({
      where: { userId: user.id },
    })

    // ✅ If no cart exists, nothing to clear
    if (!cart) return { success: true, message: "Cart was already empty" }

    // 🧹 Delete all items
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } })

    // 🧾 Optional: also revalidate cart count & summary page
    await revalidatePath("/cart")

    return { success: true, message: "Cart cleared successfully" }
  } catch (error: any) {
    console.error("❌ clearCartAction error:", error)
    return {
      success: false,
      error: "Something went wrong while clearing the cart",
      details: error.message,
    }
  }
}
