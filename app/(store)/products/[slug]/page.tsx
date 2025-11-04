import { prisma } from "@/lib/prisma"
import ProductDetailClient from "@/components/store/products/ProductDetailClient"

export const dynamic = "force-dynamic"

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
  })

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto text-center py-24 text-gray-600">
        <h2 className="text-2xl font-semibold mb-2">Product Not Found</h2>
        <a href="/products" className="text-green-600 hover:underline">
          ← Back to products
        </a>
      </div>
    )
  }

  // ✅ Convert nulls to undefined (for TS safety)
  const safeProduct = {
    ...product,
    shortDescription: product.shortDescription ?? undefined,
    category: product.category ?? undefined,
    mainImage: product.mainImage ?? undefined,
    gallery: product.gallery ?? [],
    tags: product.tags ?? [],
  }

  return <ProductDetailClient product={safeProduct} />
}
