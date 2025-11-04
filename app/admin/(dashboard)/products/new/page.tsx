import ProductForm from "@/app/admin/(dashboard)/products/components/ProductForm"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import slugify from "slugify"

export const dynamic = "force-dynamic"

async function createProduct(formData: FormData) {
  "use server"

  // 🔧 Helpers for clean parsing
  const getString = (key: string): string =>
    (formData.get(key) as string) || ""

  const getNumber = (key: string): number | null => {
    const val = formData.get(key)
    if (!val) return null
    const parsed = parseFloat(val as string)
    return isNaN(parsed) ? null : parsed
  }

  const getArray = (key: string): string[] => {
    const val = formData.get(key)
    if (typeof val === "string" && val.trim().length > 0) {
      return val.split(",").map((v) => v.trim())
    }
    return []
  }

  // 🧠 Extract fields safely
  const name = getString("name")
  const slug =
    getString("slug") ||
    slugify(name, { lower: true, strict: true }) // auto slug if blank
  const description = getString("description")
  const shortDescription = getString("shortDescription")
  const category = getString("category") || null
  const unit = getString("unit") || null
  const tags = getArray("tags")

  const price = getNumber("price") || 0
  const discountPrice = getNumber("discountPrice")
  const stock = parseInt(getString("stock") || "0")

  // 🖼️ Images (URLs from form for now — can be upgraded to Cloudinary)
  const mainImage = getString("mainImage")
  const gallery = getArray("gallery")

  const isFeatured = formData.get("isFeatured") === "on"

  // ✅ Save product
  await prisma.product.create({
    data: {
      name,
      slug,
      description,
      shortDescription,
      category,
      unit,
      tags,
      price,
      discountPrice,
      stock,
      mainImage,
      gallery,
      isFeatured,
    },
  })

  // 🔄 Refresh & redirect
  revalidatePath("/admin/products")
  redirect("/admin/products")
}

export default function NewProductPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-green-700 mb-6">
        ➕ Add New Product
      </h1>
      <ProductForm />
    </div>
  )
}
