import { PrismaClient } from "../app/generated/prisma/index.js"
const prisma = new PrismaClient()

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
}

async function main() {
  await prisma.product.createMany({
    data: [
      {
        name: "Fresh Sugarcane Juice",
        slug: slugify("Fresh Sugarcane Juice"),
        description:
          "Pure, organic sugarcane juice — cold-pressed and naturally sweet.",
        shortDescription: "100% natural, no preservatives.",
        price: 80,
        discountPrice: 70,
        stock: 120,
        unit: "ml",
        category: "Sugarcane Juices",
        mainImage:
          "https://images.unsplash.com/photo-1615475276150-b60a27b9a06d?w=800",
        gallery: [
          "https://images.unsplash.com/photo-1615475276150-b60a27b9a06d?w=800",
          "https://images.unsplash.com/photo-1590080875831-2a4fdd9cfb9a?w=800",
        ],
        tags: ["organic", "natural", "cold-pressed"],
        isFeatured: true,
      },
      {
        name: "Tender Coconut Water",
        slug: slugify("Tender Coconut Water"),
        description:
          "Refreshing, mineral-rich tender coconut water sourced fresh from farms.",
        shortDescription: "Naturally hydrating, no sugar added.",
        price: 60,
        discountPrice: 50,
        stock: 200,
        unit: "pcs",
        category: "Coconut",
        mainImage:
          "https://images.unsplash.com/photo-1592928303025-3fda26c5f637?w=800",
        gallery: [
          "https://images.unsplash.com/photo-1592928303025-3fda26c5f637?w=800",
          "https://images.unsplash.com/photo-1572373672245-1d5a2f056ed9?w=800",
        ],
        tags: ["refreshing", "hydration", "natural"],
        isFeatured: true,
      },
      {
        name: "Jaggery Sugarcane Juice",
        slug: slugify("Jaggery Sugarcane Juice"),
        description:
          "Traditional sugarcane juice with a dash of organic jaggery and lemon.",
        shortDescription: "Sweetened with jaggery — rich in minerals.",
        price: 90,
        category: "Sugarcane Juices",
        mainImage:
          "https://images.unsplash.com/photo-1615485296993-4ecdc3c59a7f?w=800",
        gallery: [
          "https://images.unsplash.com/photo-1615485296993-4ecdc3c59a7f?w=800",
          "https://images.unsplash.com/photo-1606312615489-6d4a3a13b9da?w=800",
        ],
        tags: ["sweet", "healthy", "energizing"],
        isFeatured: false,
      },
      {
        name: "Coconut Lemon Cooler",
        slug: slugify("Coconut Lemon Cooler"),
        description:
          "Zesty mix of coconut water, lemon, and mint — perfect for summers.",
        shortDescription: "Cool, refreshing, and tangy.",
        price: 75,
        category: "Juices",
        mainImage:
          "https://images.unsplash.com/photo-1590080875831-2a4fdd9cfb9a?w=800",
        gallery: [
          "https://images.unsplash.com/photo-1590080875831-2a4fdd9cfb9a?w=800",
          "https://images.unsplash.com/photo-1553570739-330b8dbfcde3?w=800",
        ],
        tags: ["summer", "mint", "lemon"],
        isFeatured: false,
      },
    ],
  })

  console.log("✅ Products seeded successfully with slugs and images!")
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e)
    prisma.$disconnect()
  })
