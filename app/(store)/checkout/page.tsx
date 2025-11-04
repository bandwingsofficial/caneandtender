"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import axios from "axios"
import Image from "next/image"
import Link from "next/link"
import toast from "react-hot-toast"

interface CartItem {
  id: string
  name: string
  price: number | null
  discountPrice?: number | null
  quantity: number
  imageUrl?: string
}

export default function CheckoutPage() {
  const { data: session } = useSession()
  const [userRole, setUserRole] = useState<string | null>(null)
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [roleLoading, setRoleLoading] = useState(true)
  const [paying, setPaying] = useState(false);

  const [checkoutData, setCheckoutData] = useState({
    name: "",
    phone: "",
    address1: "",
    address2: "",
    city: "",
    pincode: "",
  });

  const updateField = (field: string, value: string) => {
    setCheckoutData((prev) => ({ ...prev, [field]: value }));
  };

  // 🧩 Fetch user role
  useEffect(() => {
    const getRole = async () => {
      if (!session?.user) {
        setUserRole(null)
        setRoleLoading(false)
        return
      }
      try {
        const { data } = await axios.get("/api/user/role")
        setUserRole(data.role)
      } catch (err) {
        console.error("Failed to fetch user role", err)
        setUserRole(null)
      } finally {
        setRoleLoading(false)
      }
    }
    getRole()
  }, [session])

  // 🧩 Fetch cart data
  useEffect(() => {
    const fetchCart = async () => {
      try {
        if (session?.user) {
          const { data } = await axios.get("/api/cart", {
            headers: { "Cache-Control": "no-store" },
          })
          setItems(data.items || [])
        } else {
          const localCart = JSON.parse(localStorage.getItem("guestCart") || "[]")
          setItems(localCart)
        }
      } catch (err) {
        console.error("Checkout cart load error:", err)
        toast.error("Failed to load cart ❌")
      } finally {
        setLoading(false)
      }
    }
    fetchCart()
  }, [session])

  // 🧮 Helpers
  const safeNum = (v: any) =>
    typeof v === "number" ? v : v ? parseFloat(v) : 0

  const subtotal = items.reduce(
    (sum, i) => sum + safeNum(i.discountPrice ?? i.price) * (i.quantity || 0),
    0
  )

  const discount = items.reduce(
    (sum, i) =>
      sum +
      ((safeNum(i.price) - safeNum(i.discountPrice ?? i.price)) *
        (i.quantity || 1)),
    0
  )

  const shipping = subtotal > 500 ? 0 : 40
  const tax = subtotal * 0.05
  const total = subtotal + shipping + tax

  const isCustomer = userRole === "CUSTOMER"
  const canCheckout = session?.user && isCustomer

  // ✅ Razorpay order handler
  const handlePlaceOrder = async () => {
    if (!canCheckout) {
      toast.error("Login as customer first");
      return;
    }

    // Validate basic fields
    if (!checkoutData.name || !checkoutData.phone || !checkoutData.address1 || !checkoutData.city || !checkoutData.pincode) {
      toast.error("Please fill all required details");
      return;
    }

    try {
      setPaying(true);

      // 1️⃣ Create backend order + razorpay order
      const { data } = await axios.post("/api/payments/create-order", {
        customer: checkoutData,
        items,
        totalAmount: total,
      });

      const { razorpayOrderId, orderId, amount, key } = data;

      // 2️⃣ Load Razorpay script
      const scr = document.createElement("script");
      scr.src = "https://checkout.razorpay.com/v1/checkout.js";
      document.body.appendChild(scr);
      await new Promise((res) => (scr.onload = res));

      // 3️⃣ Open Razorpay popup
      const rzp = new (window as any).Razorpay({
        key,
        order_id: razorpayOrderId,
        amount: amount * 100,
        currency: "INR",
        name: "Sugarcane Tender",
        description: "Order Payment",
        prefill: {
          name: checkoutData.name,
          email: session?.user?.email,
          contact: checkoutData.phone,
        },
        theme: { color: "#16a34a" },
        handler: async (res: any) => {
          await axios.post("/api/payments/verify", {
            orderId,
            ...res,
          });
          toast.success("Payment successful ✅");
          window.location.href = `/orders/${orderId}`;
        },
        modal: {
          ondismiss: () => toast("Payment cancelled ❌"),
        },
      });

      rzp.open();
    } catch (err) {
      console.error(err);
      toast.error("Payment failed to start");
    } finally {
      setPaying(false);
    }
  };


  if (loading || roleLoading)
    return (
      <div className="text-center py-20 text-gray-600 animate-pulse">
        Loading checkout...
      </div>
    )

  if (!items.length)
    return (
      <div className="max-w-3xl mx-auto text-center py-20">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Your cart is empty 🛒
        </h2>
        <Link
          href="/products"
          className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
        >
          Continue Shopping
        </Link>
      </div>
    )

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-10">
      {/* 🧾 Left: Checkout Form */}
      <div className="lg:col-span-2 bg-white p-8 rounded-xl shadow-md border relative overflow-hidden">
        {/* ✅ Form content layer */}
        <div className="relative z-[1]">
          <h1 className="text-2xl font-bold text-green-700 mb-6">Checkout Details</h1>

          <form className="space-y-6">
            {/* 👤 Personal Info */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-3">
                Personal Information
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={checkoutData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  className="w-full border p-3 rounded-lg focus:ring-1 focus:ring-green-300"
                  required
                />
                <input
                  type="text"
                  placeholder="Phone Number"
                  value={checkoutData.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  className="w-full border p-3 rounded-lg focus:ring-1 focus:ring-green-300"
                  required
                />
              </div>
            </div>

            {/* 📦 Address */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-3">
                Delivery Address
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Address Line 1"
                  value={checkoutData.address1}
                  onChange={(e) => updateField("address1", e.target.value)}
                  className="w-full border p-3 rounded-lg focus:ring-1 focus:ring-green-300"
                  required
                />
                <input
                  type="text"
                  placeholder="Address Line 2 (Optional)"
                  value={checkoutData.address2}
                  onChange={(e) => updateField("address2", e.target.value)}
                  className="w-full border p-3 rounded-lg focus:ring-1 focus:ring-green-300"
                />
                <input
                  type="text"
                  placeholder="City"
                  value={checkoutData.city}
                  onChange={(e) => updateField("city", e.target.value)}
                  className="w-full border p-3 rounded-lg focus:ring-1 focus:ring-green-300"
                  required
                />
                <input
                  type="text"
                  placeholder="Pincode"
                  value={checkoutData.pincode}
                  onChange={(e) => updateField("pincode", e.target.value)}
                  className="w-full border p-3 rounded-lg focus:ring-1 focus:ring-green-300"
                  required
                />
              </div>
            </div>

            {/* 💳 Payment */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-3">
                Payment Method
              </h2>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  className="flex-1 border border-green-500 text-green-700 rounded-lg p-3 hover:bg-green-50 font-semibold transition"
                >
                  💳 Credit / Debit Card
                </button>
                <button
                  type="button"
                  className="flex-1 border border-gray-300 text-gray-700 rounded-lg p-3 hover:bg-gray-50 font-semibold transition"
                >
                  🏦 UPI / Google Pay
                </button>
              </div>

              <div className="flex items-center gap-3 mt-4">
                {["visa", "mastercard", "paypal", "google-pay"].map((icon) => (
                  <Image
                    key={icon}
                    src={`/icons/${icon}.png`}
                    width={40}
                    height={25}
                    alt={icon}
                    className="opacity-80"
                    unoptimized
                  />
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={!canCheckout}
              className={`w-full py-3 rounded-lg font-semibold transition ${canCheckout
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-gray-400 text-white cursor-not-allowed"
                }`}
            >
              {paying ? "Processing..." : "Pay Now 🛒"}
            </button>
          </form>
        </div>

        {/* ✅ Overlay Background (blur only background, not text) */}
        {!canCheckout && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-[2] pointer-events-none"></div>
        )}

        {/* ✅ Blur background only when user is not a customer */}
        {!canCheckout && (
          <>
            {/* ✅ Background blur layer */}
            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-[2] pointer-events-none"></div>

            {/* ✅ Overlay Message (sharp text + login button) */}
            <div className="absolute inset-0 z-[3] flex flex-col items-center justify-center text-center px-8">
              <p className="text-lg font-semibold text-gray-800 mb-3 drop-shadow-lg">
                🔒 Please log in to continue checkout
              </p>

              <p className="text-gray-600 text-sm mb-6 drop-shadow">
                Your cart items are saved — sign in to complete your order.
              </p>

              <Link
                href={`/login?callbackUrl=/checkout`}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition shadow-md"
              >
                Sign In / Sign Up as Customer
              </Link>
            </div>
          </>
        )}

      </div>


      {/* 💰 Right: Order Summary */}
      <div className="bg-gray-50 border p-6 rounded-xl shadow-sm h-fit sticky top-20">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Order Summary
        </h2>

        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between gap-3">
              <div className="flex items-center gap-3">
                {item.imageUrl?.includes("localhost") ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    width={50}
                    height={50}
                    className="rounded-md border object-cover"
                  />
                ) : (
                  <Image
                    src={item.imageUrl || "/placeholder.jpg"}
                    alt={item.name}
                    width={50}
                    height={50}
                    className="rounded-md border object-cover"
                    unoptimized
                  />
                )}
                <div>
                  <p className="font-semibold text-gray-800">{item.name}</p>
                  <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                </div>
              </div>
              <p className="font-semibold text-green-700">
                ₹{(
                  (safeNum(item.discountPrice ?? item.price) * item.quantity) ||
                  0
                ).toFixed(2)}
              </p>
            </div>
          ))}
        </div>

        <hr className="my-4" />

        <div className="space-y-2 text-sm text-gray-700">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Discount</span>
            <span className="text-red-600">-₹{discount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>
              {shipping === 0 ? (
                <span className="text-green-600 font-medium">Free</span>
              ) : (
                `₹${shipping.toFixed(2)}`
              )}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Tax (5%)</span>
            <span>₹{tax.toFixed(2)}</span>
          </div>
        </div>

        <hr className="my-4" />

        <div className="flex justify-between text-lg font-bold text-green-700">
          <span>Total</span>
          <span>₹{total.toFixed(2)}</span>
        </div>

        <p className="text-xs text-gray-500 mt-3 text-center">
          All prices include applicable taxes and discounts.
        </p>
      </div>
    </div>
  )
}
