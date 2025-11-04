"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function addToCart(productId: string, quantity: number = 1) {
  const session = await getServerSession(authOptions)

  // 🚫 If not logged in, ignore (guest handled on client)
  if (!session?.user?.email) {
    console.log("Guest cart handled client-side")
    return
  }

  // ✅ Find user
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })
  if (!user) return

  // ✅ Ensure cart exists
  let cart = await prisma.cart.findFirst({ where: { userId: user.id } })
  if (!cart) {
    cart = await prisma.cart.create({ data: { userId: user.id } })
  }

  // ✅ Add or update cart item
  const existing = await prisma.cartItem.findFirst({
    where: { cartId: cart.id, productId },
  })

  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: { increment: quantity } },
    })
  } else {
    await prisma.cartItem.create({
      data: { cartId: cart.id, productId, quantity },
    })
  }

  // ✅ Revalidate pages using this cart
  revalidatePath("/cart")
}
