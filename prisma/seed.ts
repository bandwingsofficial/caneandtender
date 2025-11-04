// import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"
import { PrismaClient } from "../app/generated/prisma/index.js"



const prisma = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 10)

  await prisma.user.upsert({
    where: { email: "admin@sugarcane.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@sugarcane.com",
      passwordHash,
      role: "ADMIN",
    },
  })

  console.log("✅ Admin created: admin@sugarcane.com / admin123")
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e)
    prisma.$disconnect()
  })
