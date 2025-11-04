import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import slugify from "slugify"

// Optionally send a socket event for live product updates
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

// Optional: Trigger ISR cache revalidation (for /products pages)
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

// ✅ GET — fetch all products (with filtering)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get("category")
    const tag = searchParams.get("tag")
    const featured = searchParams.get("featured")

    const where: any = {}
    if (category) where.category = category
    if (tag) where.tags = { has: tag }
    if (featured === "true") where.isFeatured = true

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error("❌ GET /api/products error:", error)
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    )
  }
}

// ✅ POST — create a new product
export async function POST(req: Request) {
  try {
    const formData = await req.formData()

    const getString = (key: string) => (formData.get(key) as string) || ""
    const getNumber = (key: string) => {
      const val = formData.get(key)
      if (!val) return null
      const parsed = parseFloat(val as string)
      return isNaN(parsed) ? null : parsed
    }

    const name = getString("name")
    const price = getNumber("price")
    const mainImage = getString("mainImage")
    const rawSlug = getString("slug")

    if (!name || !price || !mainImage) {
      return NextResponse.json(
        { error: "Please fill all required fields: Name, Price, and Main Image." },
        { status: 400 }
      )
    }

    // 🧠 Slug auto-generation
    let slug =
      rawSlug && rawSlug.trim().length > 0
        ? rawSlug.trim().toLowerCase()
        : slugify(name, { lower: true, strict: true })

    // 🔁 Handle duplicate slugs
    let existing = await prisma.product.findUnique({ where: { slug } })
    if (existing) {
      let counter = 2
      let newSlug = `${slug}-${counter}`
      while (await prisma.product.findUnique({ where: { slug: newSlug } })) {
        counter++
        newSlug = `${slug}-${counter}`
      }
      slug = newSlug
    }

    const tags = getString("tags")
      ? getString("tags")
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : []

    const gallery = getString("gallery")
      ? getString("gallery")
          .split(",")
          .map((g) => g.trim())
          .filter(Boolean)
      : []

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description: getString("description"),
        shortDescription: getString("shortDescription"),
        price: price!,
        discountPrice: getNumber("discountPrice"),
        stock: parseInt(getString("stock") || "0"),
        unit: getString("unit") || null,
        mainImage,
        gallery,
        category: getString("category") || null,
        tags,
        isFeatured: formData.get("isFeatured") === "on",
      },
    })

    // 🔔 Emit real-time update to connected clients
    await emitProductUpdate()

    // 🧩 Trigger cache revalidation
    await revalidateFrontend()

    return NextResponse.json(
      { message: "✅ Product saved successfully!", product },
      { status: 201 }
    )
  } catch (error) {
    console.error("❌ POST /api/products error:", error)
    return NextResponse.json(
      { error: "Something went wrong while saving product. Please try again." },
      { status: 500 }
    )
  }
}
