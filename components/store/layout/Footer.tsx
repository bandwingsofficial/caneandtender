import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-green-800 text-green-100 mt-20 py-10">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Brand Info */}
        <div>
          <h3 className="text-2xl font-bold text-yellow-400">SugarTinder</h3>
          <p className="mt-3 text-sm text-green-200 leading-relaxed">
            Fresh sugarcane juice, tender coconuts, and organic drinks —
            delivered straight from our farms to your home. 🌿
          </p>
        </div>

        {/* Links */}
        <div>
          <h4 className="font-semibold text-yellow-300 mb-3">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/" className="hover:text-yellow-300">
                Home
              </Link>
            </li>
            <li>
              <Link href="/products" className="hover:text-yellow-300">
                Products
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-yellow-300">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/cart" className="hover:text-yellow-300">
                Cart
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-semibold text-yellow-300 mb-3">Contact Us</h4>
          <p className="text-sm text-green-200">
            📞 +91 98765 43210 <br />
            ✉️ support@sugartinder.in <br />
            📍 Belagavi, Karnataka
          </p>
        </div>
      </div>

      <div className="text-center mt-8 border-t border-green-700 pt-4 text-sm text-green-300">
        © {new Date().getFullYear()} SugarTinder. All rights reserved.
      </div>
    </footer>
  )
}
