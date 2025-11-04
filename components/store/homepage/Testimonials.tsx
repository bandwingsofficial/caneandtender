export default function Testimonials() {
  const testimonials = [
    {
      name: "Priya S.",
      text: "The freshest tender coconuts I’ve ever had! Love the delivery service and the quality.",
    },
    {
      name: "Ravi K.",
      text: "Sugarcane juice tastes exactly like the one from the farm. I order weekly!",
    },
    {
      name: "Aditi M.",
      text: "Healthy, refreshing and natural — absolutely love this brand!",
    },
  ]

  return (
    <div className="grid md:grid-cols-3 gap-8">
      {testimonials.map((t) => (
        <div
          key={t.name}
          className="bg-white border border-green-100 shadow-md rounded-2xl p-6 text-center hover:shadow-lg transition"
        >
          <p className="italic text-gray-600">“{t.text}”</p>
          <p className="mt-4 font-semibold text-green-700">– {t.name}</p>
        </div>
      ))}
    </div>
  )
}
