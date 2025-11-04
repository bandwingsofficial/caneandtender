import { NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import fs from "fs"

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // 📁 Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), "public", "uploads")
    if (!fs.existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true })

    // 🧩 Generate safe file name
    const ext = path.extname(file.name)
    const base = path.basename(file.name, ext)
    const filename = `${Date.now()}-${base.replace(/\s+/g, "_")}${ext}`

    // 🧠 Save file
    const buffer = Buffer.from(await file.arrayBuffer())
    const filepath = path.join(uploadDir, filename)
    await writeFile(filepath, buffer)

    // 🟢 ✅ Return **relative** URL (not http://localhost)
    const fileUrl = `/uploads/${filename}`

    return NextResponse.json({ url: fileUrl })
  } catch (err) {
    console.error("❌ Upload error:", err)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
