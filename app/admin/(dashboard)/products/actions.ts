"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function deleteProduct(formData: FormData) {
  const id = formData.get("id") as string
  if (!id) return

  await prisma.product.delete({ where: { id } })
  revalidatePath("/admin/products")
}
