import Hero from "@/components/store/homepage/Hero"
import Categories from "@/components/store/homepage/Categories"
import ProductGrid from "@/components/store/homepage/ProductGrid"
import Testimonials from "@/components/store/homepage/Testimonials"

export const dynamic = "force-dynamic" // ✅ Ensures live product/category updates (no caching)

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <main className="flex-grow">
        {/* 🍹 Hero Section */}
        <Hero />

        {/* 🛒 Categories Section */}
        <section className="max-w-7xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-bold text-green-700 mb-6">
            Shop by Category
          </h2>
          <Categories />
        </section>

        {/* 🌾 Featured Products */}
        <section className="max-w-7xl mx-auto px-6 py-16 bg-green-50 rounded-2xl shadow-sm">
          <h2 className="text-3xl font-bold text-green-800 mb-2 text-center">
            Featured Products 🌿
          </h2>
          <ProductGrid />
        </section>

        {/* 💬 Testimonials */}
        <section className="max-w-7xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-bold text-green-800 mb-8 text-center">
            What Our Customers Say 💬
          </h2>
          <Testimonials />
        </section>
      </main>
    </div>
  )
}
