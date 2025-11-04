"use client"

import React, { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  Trash2,
  Search,
  Star,
  PencilLine,
  ArrowLeft,
  ArrowRight,
  FileSpreadsheet,
  Filter,
} from "lucide-react"
import toast from "react-hot-toast"

// Small confirm dialog (inline, no external libs)
function ConfirmDialog({
  open,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}: {
  open: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="mt-2 text-sm text-gray-600">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-lg bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

// Skeleton row for loading state
function SkeletonRow() {
  return (
    <tr className="animate-pulse border-b last:border-none">
      <td className="px-4 py-3">
        <div className="h-4 w-4 rounded bg-gray-200" />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-md bg-gray-200" />
          <div className="space-y-2">
            <div className="h-3 w-40 rounded bg-gray-200" />
            <div className="h-2 w-24 rounded bg-gray-100" />
          </div>
        </div>
      </td>
      <td className="px-4 py-3"><div className="h-3 w-24 rounded bg-gray-200" /></td>
      <td className="px-4 py-3"><div className="h-3 w-16 rounded bg-gray-200" /></td>
      <td className="px-4 py-3"><div className="h-3 w-10 rounded bg-gray-200" /></td>
      <td className="px-4 py-3 text-center"><div className="mx-auto h-5 w-5 rounded-full bg-gray-200" /></td>
      <td className="px-4 py-3 text-right">
        <div className="ml-auto h-8 w-20 rounded bg-gray-200" />
      </td>
    </tr>
  )
}

export default function ProductTable({ products }: { products: any[] }) {
  // keep local copy so we can optimistically update on toggle/delete
  const [rows, setRows] = useState<any[]>(products || [])
  useEffect(() => setRows(products || []), [products])

  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [confirm, setConfirm] = useState<{ open: boolean; ids: string[]; singleName?: string }>(
    { open: false, ids: [] }
  )

  // simulate initial load + page transitions shimmer
  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 450)
    return () => clearTimeout(t)
  }, [])

  const perPage = 8

  // derived filters
  const categories = useMemo(
    () => Array.from(new Set((rows || []).map((p) => p.category).filter(Boolean))).sort(),
    [rows]
  )
  const [categoryFilter, setCategoryFilter] = useState<string>("All")
  const [featuredFilter, setFeaturedFilter] = useState<"All" | "Featured" | "Not Featured">("All")

  const filteredProducts = useMemo(() => {
    const q = search.toLowerCase()
    return rows
      .filter((p) =>
        q
          ? (p.name?.toLowerCase().includes(q) ||
             p.category?.toLowerCase().includes(q) ||
             (p.tags ? p.tags.join(",").toLowerCase().includes(q) : false))
          : true
      )
      .filter((p) => (categoryFilter === "All" ? true : p.category === categoryFilter))
      .filter((p) =>
        featuredFilter === "All"
          ? true
          : featuredFilter === "Featured"
          ? !!p.isFeatured
          : !p.isFeatured
      )
  }, [rows, search, categoryFilter, featuredFilter])

  const totalResults = filteredProducts.length
  const totalPages = Math.max(1, Math.ceil(totalResults / perPage))
  const startIndex = (page - 1) * perPage + 1
  const endIndex = Math.min(startIndex + perPage - 1, totalResults)
  const paginated = filteredProducts.slice(startIndex - 1, endIndex)

  // selection
  const toggleSelect = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  const selectAll = (checked: boolean) => setSelected(checked ? paginated.map((p) => p.id) : [])

  // inline featured toggle (optimistic)
  const toggleFeatured = async (id: string) => {
    const item = rows.find((r) => r.id === id)
    if (!item) return
    const next = !item.isFeatured

    // optimistic UI
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, isFeatured: next } : r)))

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: next }),
      })
      if (!res.ok) throw new Error("Failed to toggle featured")
      toast.success(next ? "⭐ Marked as featured" : "⭐ Removed from featured")
    } catch (e) {
      // revert
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, isFeatured: !next } : r)))
      toast.error("Could not update featured")
    }
  }

  // delete (single)
  const requestDeleteSingle = (id: string, name: string) => setConfirm({ open: true, ids: [id], singleName: name })

  const doDelete = async (ids: string[]) => {
    setConfirm({ open: false, ids: [] })
    if (!ids.length) return

    // show shimmer while deleting
    setIsLoading(true)
    try {
      if (ids.length === 1) {
        const res = await fetch(`/api/products/${ids[0]}`, { method: "DELETE" })
        if (!res.ok) throw new Error("Delete failed")
      } else {
        const res = await fetch("/api/products/bulk-delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids }),
        })
        if (!res.ok) throw new Error("Bulk delete failed")
      }

      setRows((prev) => prev.filter((r) => !ids.includes(r.id)))
      setSelected((prev) => prev.filter((id) => !ids.includes(id)))
      toast.success(ids.length === 1 ? "🗑️ Product deleted" : `🗑️ Deleted ${ids.length} products`)
    } catch (err) {
      console.error(err)
      toast.error("❌ Error while deleting")
    } finally {
      // brief shimmer
      setTimeout(() => setIsLoading(false), 300)
    }
  }

  const deleteSelected = () => {
    if (selected.length === 0) return toast.error("No products selected")
    setConfirm({ open: true, ids: selected })
  }

  // export (CSV quick export)
  const exportCSV = () => {
  if (!filteredProducts.length) return toast.error("No data to export")

  const headers = [
    "Name",
    "Slug",
    "Category",
    "Price",
    "DiscountPrice",
    "Stock",
    "Featured",
    "Tags",
  ]

  const rowsCsv = filteredProducts.map((p) => [
    p.name ?? "",
    p.slug ?? "",
    p.category ?? "",
    p.price ?? "",
    p.discountPrice ?? "",
    p.stock ?? "",
    p.isFeatured ? "Yes" : "No",
    Array.isArray(p.tags) ? p.tags.join("|") : "",
  ])

  const csv = [headers, ...rowsCsv]
    .map((row) =>
      row
        .map((cell) =>
          `"${String(cell).replaceAll('"', '""')}"`
        )
        .join(",")
    )
    .join("\n")

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "products_export.csv"
  a.click()
  URL.revokeObjectURL(url)

  toast.success("📄 Exported CSV")
}


  // page change shimmer
  const goToPage = (num: number) => {
    setIsLoading(true)
    setPage(num)
    setTimeout(() => setIsLoading(false), 250)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-green-700">Products</h1>

        <div className="flex items-center gap-3">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-green-700 shadow-sm ring-1 ring-gray-200 hover:bg-green-50"
            title="Export CSV"
          >
            <FileSpreadsheet className="h-4 w-4" /> Export
          </button>

          {selected.length > 0 && (
            <button
              onClick={deleteSelected}
              className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white shadow-sm transition hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4" /> Delete ({selected.length})
            </button>
          )}

          <Link
            href="/admin/products/new"
            className="rounded-lg bg-green-600 px-4 py-2 text-white shadow-sm transition hover:bg-green-700"
          >
            ➕ Add Product
          </Link>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2 outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-2 shadow-sm">
          <Filter className="h-4 w-4 text-gray-500" />
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value)
              setPage(1)
            }}
            className="rounded-md border border-gray-200 px-2 py-1 text-sm outline-none"
          >
            <option>All</option>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <select
            value={featuredFilter}
            onChange={(e) => {
              setFeaturedFilter(e.target.value as any)
              setPage(1)
            }}
            className="rounded-md border border-gray-200 px-2 py-1 text-sm outline-none"
          >
            <option>All</option>
            <option>Featured</option>
            <option>Not Featured</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
        <table className="min-w-full text-sm text-gray-700">
          <thead className="bg-green-50/70 text-gray-800">
            <tr>
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  checked={selected.length === paginated.length && paginated.length > 0}
                  onChange={(e) => selectAll(e.target.checked)}
                />
              </th>
              <th className="px-4 py-3 text-left font-semibold">Product</th>
              <th className="px-4 py-3 text-left font-semibold">Category</th>
              <th className="px-4 py-3 text-left font-semibold">Price</th>
              <th className="px-4 py-3 text-left font-semibold">Stock</th>
              <th className="px-4 py-3 text-center font-semibold">Featured</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>

          <tbody>
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
              : paginated.map((p) => (
                  <tr
                    key={p.id}
                    className={`border-b last:border-none transition hover:bg-green-50/50 ${
                      selected.includes(p.id) ? "bg-green-50" : ""
                    }`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.includes(p.id)}
                        onChange={() => toggleSelect(p.id)}
                      />
                    </td>

                    <td className="px-4 py-3 font-medium">
                      <div className="flex items-center gap-3">
                        {p.mainImage ? (
                          <img
                            src={p.mainImage}
                            alt={p.name}
                            className="h-10 w-10 rounded-md border border-gray-100 object-cover shadow-sm"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-100 text-xs text-gray-400">
                            N/A
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-800">{p.name}</p>
                          <p className="text-xs text-gray-400">{p.slug}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-gray-600">{p.category || "—"}</td>
                    <td className="px-4 py-3">
                      ₹{p.discountPrice ?? p.price}
                      {p.discountPrice && (
                        <span className="ml-2 text-xs text-gray-400 line-through">₹{p.price}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{p.stock ?? 0}</td>

                    {/* Inline Featured Toggle */}
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleFeatured(p.id)}
                        className="inline-flex items-center justify-center"
                        title={p.isFeatured ? "Unmark featured" : "Mark as featured"}
                      >
                        <Star
                          className={`h-5 w-5 transition ${p.isFeatured ? "fill-yellow-400 text-yellow-500" : "text-gray-300"}`}
                        />
                      </button>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/admin/products/${p.id}/edit`}
                          className="rounded-lg p-2 text-green-600 transition hover:bg-green-100"
                          title="Edit"
                        >
                          <PencilLine className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => requestDeleteSingle(p.id, p.name)}
                          className="rounded-lg p-2 text-red-600 transition hover:bg-red-100"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

            {!isLoading && paginated.length === 0 && (
              <tr>
                <td colSpan={7} className="py-10 text-center text-gray-500">
                  No products found 😕
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer (always visible) */}
      <div className="mt-6 flex flex-col items-center justify-between gap-3 md:flex-row">
        <p className="text-sm text-gray-600">
          Showing {" "}
          <span className="font-medium text-gray-800">{totalResults === 0 ? 0 : startIndex}-{endIndex}</span>{" "}
          of {" "}
          <span className="font-medium text-gray-800">{totalResults}</span> results
        </p>

        <div className="flex items-center gap-2">
          <button
            onClick={() => goToPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="rounded-lg border bg-gray-100 px-3 py-1.5 hover:bg-gray-200 disabled:opacity-50"
          >
            <ArrowLeft className="inline h-4 w-4" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              onClick={() => goToPage(num)}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${
                page === num ? "border-green-600 bg-green-600 text-white" : "bg-white hover:bg-gray-100"
              }`}
            >
              {num}
            </button>
          ))}

          <button
            onClick={() => goToPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="rounded-lg border bg-gray-100 px-3 py-1.5 hover:bg-gray-200 disabled:opacity-50"
          >
            <ArrowRight className="inline h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Confirm dialog */}
      <ConfirmDialog
        open={confirm.open}
        title={confirm.singleName ? `Delete \"${confirm.singleName}\"?` : `Delete ${confirm.ids.length} product(s)?`}
        message={
          confirm.singleName
            ? "This action cannot be undone. The product will be permanently deleted."
            : "This will permanently delete the selected products."
        }
        confirmText="Delete"
        cancelText="Cancel"
        onCancel={() => setConfirm({ open: false, ids: [] })}
        onConfirm={() => doDelete(confirm.ids)}
      />

      {/* Row hover transition helper styles */}
      <style>{`
        .fade-enter { opacity: 0; }
        .fade-enter-active { opacity: 1; transition: opacity .2s; }
      `}</style>
    </div>
  )
}
