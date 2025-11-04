import { prisma } from "@/lib/prisma"
import ProductTable from "@/app/admin/(dashboard)/products/components/ProductTable"

export const dynamic = "force-dynamic"

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="p-8 space-y-6">
      <ProductTable products={products} />
    </div>
  )
}
