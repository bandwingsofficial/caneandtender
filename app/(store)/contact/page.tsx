export default function ContactPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-20">
      <h1 className="text-4xl font-bold text-green-800 mb-6">Contact Us 📞</h1>
      <p className="text-gray-700 mb-4">We’d love to hear from you!</p>

      <ul className="text-gray-700 space-y-2 mb-8">
        <li>📍 Belagavi, Karnataka</li>
        <li>📞 +91 98765 43210</li>
        <li>✉️ support@sugartinder.in</li>
      </ul>

      <form className="max-w-md space-y-4">
        <input
          type="text"
          placeholder="Your Name"
          className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
        />
        <input
          type="email"
          placeholder="Your Email"
          className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
        />
        <textarea
          placeholder="Your Message"
          rows={4}
          className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
        />
        <button
          type="submit"
          className="bg-green-700 text-white px-6 py-2 rounded-lg hover:bg-green-800 transition"
        >
          Send Message
        </button>
      </form>
    </div>
  )
}
