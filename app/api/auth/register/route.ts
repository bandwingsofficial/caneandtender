import { NextResponse } from "next/server"
import bcrypt from "bcrypt"
import { prisma } from "@/lib/prisma"
import { Role } from "@/app/generated/prisma"

export async function POST(req: Request) {
  const { email, password } = await req.json()

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return NextResponse.json({ error: "Exists" }, { status: 400 })

  const hash = await bcrypt.hash(password, 10)

  await prisma.user.create({
    data: {
      email,
      passwordHash: hash,
      name: email.split("@")[0],
      role: Role.CUSTOMER,
    },
  })

  return NextResponse.json({ ok: true })
}
