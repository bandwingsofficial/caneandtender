import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import slugify from "slugify"

// 🔔 Emit real-time event for frontend updates
async function emitProductUpdate() {
  try {
    if (!process.env.SOCKET_EMIT_URL) return
    await fetch(`${process.env.SOCKET_EMIT_URL}/emit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "product-updated" }),
    })
  } catch (err) {
    console.warn("⚠️ Failed to emit socket event:", err)
  }
}

// ♻️ Revalidate frontend product pages (optional)
async function revalidateFrontend() {
  try {
    if (!process.env.NEXTAUTH_URL) return
    await fetch(`${process.env.NEXTAUTH_URL}/api/revalidate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: "/products" }),
    })
  } catch (err) {
    console.warn("⚠️ Failed to revalidate products page:", err)
  }
}

// ✅ GET single product (by id or slug)
export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const product = await prisma.product.findFirst({
      where: { OR: [{ id: params.id }, { slug: params.id }] },
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error("❌ GET /api/products/[id] error:", error)
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 })
  }
}

// ✅ PATCH — Inline Featured Toggle
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const { isFeatured } = await req.json()

    if (typeof isFeatured !== "boolean") {
      return NextResponse.json({ error: "Invalid isFeatured value" }, { status: 400 })
    }

    const updated = await prisma.product.update({
      where: { id: params.id },
      data: { isFeatured },
    })

    await emitProductUpdate()
    await revalidateFrontend()

    return NextResponse.json({
      message: isFeatured ? "⭐ Marked as Featured" : "⭐ Removed from Featured",
      product: updated,
    })
  } catch (error) {
    console.error("❌ PATCH /api/products/[id] error:", error)
    return NextResponse.json({ error: "Could not update featured" }, { status: 500 })
  }
}

// ✅ PUT — Update Product (full edit form)
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const formData = await req.formData()

    const getString = (key: string): string | undefined => {
      const val = formData.get(key)
      if (!val) return undefined
      return typeof val === "string" ? val.trim() : undefined
    }

    const getNumber = (key: string): number | undefined => {
      const val = formData.get(key)
      if (!val || typeof val !== "string") return undefined
      const num = parseFloat(val)
      return isNaN(num) ? undefined : num
    }

    const getArray = (key: string): string[] => {
      const val = formData.get(key)
      if (typeof val === "string" && val.length > 0) {
        return val.split(",").map((v) => v.trim())
      }
      return []
    }

    const name = getString("name") || ""
    const slug = getString("slug") || slugify(name, { lower: true, strict: true })
    const description = getString("description") || ""
    const shortDescription = getString("shortDescription")
    const category = getString("category")
    const unit = getString("unit")
    const price = getNumber("price") ?? 0
    const discountPrice = getNumber("discountPrice")
    const stock = getNumber("stock") ?? 0
    const tags = getArray("tags")
    const mainImage = getString("mainImage") || ""
    const gallery = getArray("gallery")
    const isFeatured = formData.get("isFeatured") === "on"

    // Check slug conflict
    if (slug) {
      const existing = await prisma.product.findFirst({
        where: { slug, NOT: { id: params.id } },
      })
      if (existing) {
        return NextResponse.json(
          { error: `Slug \"${slug}\" is already in use.` },
          { status: 409 }
        )
      }
    }

    const updated = await prisma.product.update({
      where: { id: params.id },
      data: {
        name,
        slug,
        description,
        shortDescription: shortDescription ?? undefined,
        category: category ?? undefined,
        unit: unit ?? undefined,
        price,
        discountPrice,
        stock,
        tags,
        mainImage,
        gallery,
        isFeatured,
      },
    })

    await emitProductUpdate()
    await revalidateFrontend()

    return NextResponse.json({
      message: "✅ Product updated successfully!",
      product: updated,
    })
  } catch (error) {
    console.error("❌ PUT /api/products/[id] error:", error)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}

// ✅ DELETE Product
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.product.delete({ where: { id: params.id } })

    await emitProductUpdate()
    await revalidateFrontend()

    return NextResponse.json({ message: "🗑️ Product deleted successfully" })
  } catch (error) {
    console.error("❌ DELETE /api/products/[id] error:", error)
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}
