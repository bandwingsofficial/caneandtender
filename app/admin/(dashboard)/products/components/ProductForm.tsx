"use client"

import React, { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ImagePlus, X, Loader2, Check } from "lucide-react"
import toast from "react-hot-toast"

import { z } from "zod"
import { useForm, SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

// -------------------- ZOD SCHEMA --------------------
const productSchema = z.object({
  name: z.string().min(1, "Product name required"),
  slug: z.string().optional(),
  shortDescription: z.string().optional(),
  category: z.string().min(1, "Select a category"),
  price: z.coerce.number().min(1, "Price must be > 0"),
  discountPrice: z.coerce.number().optional(),
  stock: z.coerce.number().optional(),
  unit: z.string().optional(),
  tags: z.string().optional(),
  description: z.string().optional(),
  isFeatured: z.boolean().optional(),
  mainImage: z.string().min(1, "Main image required"),
  gallery: z.array(z.string()).optional(),
})

type FormValues = z.infer<typeof productSchema>

// -------------------- COMPONENT --------------------
export default function ProductForm({ product }: { product?: any }) {
  const router = useRouter()
  const params = useSearchParams()
  const isEditing = Boolean(product?.id)

  // UI state (images)
  const [loading, setLoading] = useState(false)
  const [mainImage, setMainImage] = useState<string | null>(product?.mainImage || null)
  const [gallery, setGallery] = useState<string[]>(product?.gallery || [])
  const [dragMainOver, setDragMainOver] = useState(false)
  const [dragGalleryOver, setDragGalleryOver] = useState(false)

  const categories = ["Sugarcane Juices", "Coconut"]

  useEffect(() => {
    if (params.get("updated") === "1") {
      toast.success("✅ Product updated successfully!")
      router.replace("/admin/products")
    }
  }, [params, router])

  // -------------------- RHF SETUP --------------------
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, touchedFields },
  } = useForm<FormValues>({
    // note: some ts setups require `as any` for resolver; try without first
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      name: product?.name || "",
      slug: product?.slug || "",
      shortDescription: product?.shortDescription || "",
      category: product?.category || "",
      price: product?.price ?? undefined,
      discountPrice: product?.discountPrice ?? undefined,
      stock: product?.stock ?? undefined,
      unit: product?.unit || "",
      tags: product?.tags?.join(", ") || "",
      description: product?.description || "",
      isFeatured: product?.isFeatured || false,
      mainImage: product?.mainImage || "",
      gallery: product?.gallery || [],
    },
  })

  // Auto-slug from name
  const nameValue = watch("name")
  useEffect(() => {
    if (!nameValue) return
    const slug = nameValue
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
    setValue("slug", slug, { shouldValidate: true })
  }, [nameValue, setValue])

  // Live word count for description
  const descriptionValue = watch("description") || ""
  const wordCount = descriptionValue.trim()
    ? descriptionValue.trim().split(/\s+/).filter(Boolean).length
    : 0

  // -------------------- UPLOAD HELPERS --------------------
  const uploadFile = async (file: File): Promise<string | null> => {
    const fd = new FormData()
    fd.append("file", file)
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      if (!res.ok) throw new Error("Upload failed")
      const data = await res.json()
      return data.url || null
    } catch (err) {
      console.error("Upload error:", err)
      toast.error("❌ Failed to upload image")
      return null
    }
  }

  // Click-to-upload handlers
  const handleMainImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const preview = URL.createObjectURL(file)
    setMainImage(preview)
    const uploadedUrl = await uploadFile(file)
    if (uploadedUrl) {
      setMainImage(uploadedUrl)
      setValue("mainImage", uploadedUrl, { shouldValidate: true })
    }
  }

  const handleGalleryImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return

    const previews = files.map((f) => URL.createObjectURL(f))
    setGallery((prev) => [...prev, ...previews])

    const uploadedUrls: string[] = []
    for (const f of files) {
      const url = await uploadFile(f)
      if (url) uploadedUrls.push(url)
    }
    const final = [...gallery.filter((g) => !g.startsWith("blob:")), ...uploadedUrls]
    setGallery(final)
    setValue("gallery", final, { shouldValidate: true })
  }

  // Drag & drop handlers (MAIN)
  const onMainDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragMainOver(true)
  }
  const onMainDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragMainOver(false)
  }
  const onMainDrop = async (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragMainOver(false)

    const file = e.dataTransfer.files?.[0]
    if (!file) return
    const preview = URL.createObjectURL(file)
    setMainImage(preview)
    const uploadedUrl = await uploadFile(file)
    if (uploadedUrl) {
      setMainImage(uploadedUrl)
      setValue("mainImage", uploadedUrl, { shouldValidate: true })
    }
  }

  // Drag & drop handlers (GALLERY)
  const onGalleryDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragGalleryOver(true)
  }
  const onGalleryDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragGalleryOver(false)
  }
  const onGalleryDrop = async (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragGalleryOver(false)

    const files = Array.from(e.dataTransfer.files ?? [])
    if (!files.length) return

    const previews = files.map((f) => URL.createObjectURL(f))
    setGallery((prev) => [...prev, ...previews])

    const uploadedUrls: string[] = []
    for (const f of files) {
      const url = await uploadFile(f)
      if (url) uploadedUrls.push(url)
    }
    const final = [...gallery.filter((g) => !g.startsWith("blob:")), ...uploadedUrls]
    setGallery(final)
    setValue("gallery", final, { shouldValidate: true })
  }

  // Remove images
  const removeMainImage = () => {
    setMainImage(null)
    setValue("mainImage", "", { shouldValidate: true })
  }
  const removeGalleryImage = (index: number) => {
    setGallery((prev) => {
      const next = prev.filter((_, i) => i !== index)
      setValue("gallery", next, { shouldValidate: true })
      return next
    })
  }

  // -------------------- SUBMIT --------------------
  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    setLoading(true)
    try {
      const fd = new FormData()
      // convert arrays to CSV for your current API
      Object.entries(values).forEach(([k, v]) => {
        if (Array.isArray(v)) fd.append(k, v.join(","))
        else fd.append(k, String(v ?? ""))
      })

      const method = isEditing ? "PUT" : "POST"
      const url = isEditing ? `/api/products/${product?.id}` : "/api/products"

      const res = await fetch(url, { method, body: fd })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        toast.error(data?.error || "❌ Failed to save product")
        return
      }

      toast.success(isEditing ? "✅ Product updated successfully!" : "✅ Product created successfully!")
      router.replace("/admin/products?updated=1")
    } catch (err) {
      console.error(err)
      toast.error("❌ Something went wrong while saving product")
    } finally {
      setLoading(false)
    }
  }

  // -------------------- UI HELPERS --------------------
  const fieldClass = (field: keyof FormValues) =>
    `w-full border p-2 rounded-md focus:ring-2 outline-none transition
    ${errors[field] ? "border-red-500 animate-shake ring-red-200" : touchedFields[field] ? "border-green-500 ring-green-100" : "border-gray-300"}`

  const successIcon = (field: keyof FormValues) =>
    touchedFields[field] && !errors[field] ? <Check className="text-green-600 w-4 h-4 ml-2" /> : null

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg p-8 border border-gray-100 space-y-8"
      encType="multipart/form-data"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 auto-rows-fr">
        {/* LEFT SIDE */}
        <div className="flex flex-col gap-6 h-full">
          {/* Basic Info */}
          <section className="p-6 border border-gray-200 rounded-xl shadow-sm flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-green-700 mb-2">🧩 Basic Info</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
              <div className="flex items-center">
                <input
                  {...register("name")}
                  placeholder="Enter product name"
                  className={fieldClass("name")}
                />
                {successIcon("name")}
              </div>
              {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug (auto)</label>
              <input
                {...register("slug")}
                placeholder="Auto-generated from name"
                className={fieldClass("slug")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
              <input
                {...register("shortDescription")}
                placeholder="e.g., Natural cold-pressed sugarcane juice."
                className={fieldClass("shortDescription")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <div className="flex items-center">
                <select
                  {...register("category")}
                  className={fieldClass("category")}
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat}>{cat}</option>
                  ))}
                </select>
                {successIcon("category")}
              </div>
              {errors.category && <p className="text-red-500 text-sm">{errors.category.message}</p>}
            </div>
          </section>

          {/* Pricing */}
          <section className="p-6 border border-gray-200 rounded-xl shadow-sm flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-green-700 mb-2">💰 Pricing</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
              <div className="flex items-center">
                <input
                  type="number"
                  step="0.01"
                  {...register("price", { valueAsNumber: true })}
                  placeholder="Enter price"
                  className={fieldClass("price")}
                />
                {successIcon("price")}
              </div>
              {errors.price && <p className="text-red-500 text-sm">{errors.price.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount Price</label>
              <input
                type="number"
                step="0.01"
                {...register("discountPrice", { valueAsNumber: true })}
                placeholder="Discount price"
                className={fieldClass("discountPrice")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
              <input
                type="number"
                {...register("stock", { valueAsNumber: true })}
                placeholder="Available stock"
                className={fieldClass("stock")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
              <input
                {...register("unit")}
                placeholder="ml, pcs, etc."
                className={fieldClass("unit")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
              <input
                {...register("tags")}
                placeholder="Comma-separated tags (e.g., organic, cold-pressed)"
                className={fieldClass("tags")}
              />
            </div>
          </section>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex flex-col gap-6 h-full">
          {/* Images */}
          <section className="p-6 border border-gray-200 rounded-xl shadow-sm flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-green-700 mb-2">🖼️ Product Images</h2>

            {/* Main Image - Drag & Drop + Click */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Main Image *</label>
              {!mainImage ? (
                <label
                  onDragOver={onMainDragOver}
                  onDragLeave={onMainDragLeave}
                  onDrop={onMainDrop}
                  className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition mt-2
                    ${dragMainOver ? "bg-green-50 border-green-400" : "border-gray-300 hover:bg-green-50"}`}
                >
                  <ImagePlus className="w-8 h-8 text-gray-400" />
                  <span className="text-gray-500 text-sm mt-1">Click or drag file here</span>
                  <input type="file" accept="image/*" onChange={handleMainImage} hidden />
                </label>
              ) : (
                <div className="relative w-36 h-36 mt-2">
                  <img src={mainImage} alt="Main" className="object-cover w-full h-full rounded-lg border" />
                  <button
                    type="button"
                    onClick={removeMainImage}
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              {errors.mainImage && <p className="text-red-500 text-sm">{errors.mainImage.message}</p>}
            </div>

            {/* Gallery - Drag & Drop + Click */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gallery Images</label>
              <label
                onDragOver={onGalleryDragOver}
                onDragLeave={onGalleryDragLeave}
                onDrop={onGalleryDrop}
                className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition mt-2
                  ${dragGalleryOver ? "bg-green-50 border-green-400" : "border-gray-300 hover:bg-green-50"}`}
              >
                <ImagePlus className="w-6 h-6 text-gray-400" />
                <span className="text-gray-500 text-sm mt-1">Click or drag multiple images</span>
                <input type="file" multiple accept="image/*" onChange={handleGalleryImages} hidden />
              </label>

              {gallery.length > 0 && (
                <div className="grid grid-cols-4 gap-3 mt-3">
                  {gallery.map((src, i) => (
                    <div key={i} className="relative group">
                      <img src={src} alt={`Gallery ${i}`} className="object-cover w-24 h-24 rounded-lg border" />
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(i)}
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Description */}
          <section className="p-6 border border-gray-200 rounded-xl shadow-sm flex flex-col gap-2">
            <h2 className="text-lg font-semibold text-green-700 mb-2">🧾 Description</h2>
            <textarea
              {...register("description")}
              placeholder="Write full product details..."
              rows={5}
              className={fieldClass("description") + " resize-none"}
            />
            {/* Live word count */}
            <div className="text-xs text-gray-500 mt-1">Word count: {wordCount}</div>

            <label className="flex items-center gap-2 text-sm text-gray-700 mt-3">
              <input type="checkbox" {...register("isFeatured")} />
              Mark as Featured
            </label>
          </section>
        </div>
      </div>

      {/* ✅ SAVE / UPDATE / CANCEL BUTTONS */}
      <div className="flex justify-end gap-4 pt-6 border-t border-gray-100 mt-8">
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="flex items-center justify-center gap-2 bg-gray-200 text-gray-700 font-medium px-6 py-3 rounded-lg hover:bg-gray-300 transition"
        >
          ✖ Cancel
        </button>

        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 bg-green-600 text-white font-semibold px-8 py-3 rounded-lg hover:bg-green-700 transition"
        >
          {loading ? (
            <Loader2 className="animate-spin w-5 h-5" />
          ) : isEditing ? (
            "💾 Update Product"
          ) : (
            "💾 Save Product"
          )}
        </button>
      </div>

      {/* Shake animation */}
      <style>{`
        .animate-shake { animation: shake .2s ease-in-out; }
        @keyframes shake {
          0%{transform:translateX(0)}
          25%{transform:translateX(-4px)}
          50%{transform:translateX(4px)}
          75%{transform:translateX(-4px)}
          100%{transform:translateX(0)}
        }
      `}</style>
    </form>
  )
}
