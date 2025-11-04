export const runtime = "nodejs"
export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

/**
 * 🛒 GET → Fetch current user's cart
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email)
      return NextResponse.json({ guest: true, items: [] }, { status: 200 })

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 })

    const cart = await prisma.cart.findFirst({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                discountPrice: true,
                mainImage: true,
              },
            },
          },
        },
      },
    })

    const formatted = (cart?.items || []).map((i) => ({
      id: i.product.id,
      name: i.product.name,
      price: i.product.price,
      discountPrice: i.product.discountPrice,
      imageUrl: i.product.mainImage,
      quantity: i.quantity,
    }))

    return NextResponse.json({ items: formatted })
  } catch (error) {
    console.error("❌ GET /api/cart error:", error)
    return NextResponse.json(
      { error: "Failed to fetch cart" },
      { status: 500 }
    )
  }
}

/**
 * ➕ POST → Add item to cart
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 })

    const { productId, quantity = 1 } = await req.json()
    if (!productId)
      return NextResponse.json({ error: "Missing productId" }, { status: 400 })

    let cart = await prisma.cart.findFirst({ where: { userId: user.id } })
    if (!cart)
      cart = await prisma.cart.create({ data: { userId: user.id } })

    const existing = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId },
    })

    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
      })
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId, quantity },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("❌ POST /api/cart error:", error)
    return NextResponse.json(
      { error: "Failed to add to cart" },
      { status: 500 }
    )
  }
}

/**
 * ✏️ PUT → Update item quantity (increase or decrease)
 */
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { productId, quantityDelta } = await req.json()
    if (!productId || typeof quantityDelta !== "number") {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 })

    const cart = await prisma.cart.findFirst({
      where: { userId: user.id },
    })
    if (!cart)
      return NextResponse.json({ error: "Cart not found" }, { status: 404 })

    const existingItem = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId },
    })
    if (!existingItem)
      return NextResponse.json({ error: "Item not found" }, { status: 404 })

    const newQuantity = existingItem.quantity + quantityDelta

    if (newQuantity <= 0) {
      await prisma.cartItem.delete({ where: { id: existingItem.id } })
      return NextResponse.json({
        success: true,
        message: "Item removed from cart",
      })
    } else {
      const updated = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      })
      return NextResponse.json({ success: true, item: updated })
    }
  } catch (error) {
    console.error("❌ PUT /api/cart error:", error)
    return NextResponse.json(
      { error: "Failed to update cart quantity" },
      { status: 500 }
    )
  }
}

/**
 * 🗑️ DELETE → Remove a product from cart
 */
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { productId } = await req.json()
    if (!productId)
      return NextResponse.json({ error: "Missing productId" }, { status: 400 })

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 })

    const cart = await prisma.cart.findFirst({
      where: { userId: user.id },
    })
    if (!cart)
      return NextResponse.json({ error: "Cart not found" }, { status: 404 })

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id, productId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("❌ DELETE /api/cart error:", error)
    return NextResponse.json(
      { error: "Failed to delete cart item" },
      { status: 500 }
    )
  }
}
