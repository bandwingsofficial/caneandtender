import { prisma } from "@/lib/prisma"
import ProductForm from "@/app/admin/(dashboard)/products/components/ProductForm"

export const dynamic = "force-dynamic"

export default async function EditProductPage({
  params,
}: {
  params: { id: string }
}) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
  })

  if (!product) {
    return (
      <div className="p-8 text-gray-600">
        <h2 className="text-xl font-semibold mb-2">❌ Product Not Found</h2>
        <p>Try refreshing or go back to the product list.</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-green-700 mb-6">✏️ Edit Product</h1>
      {/* ✅ Pass product to form for editing */}
      <ProductForm product={product} />
    </div>
  )
}
