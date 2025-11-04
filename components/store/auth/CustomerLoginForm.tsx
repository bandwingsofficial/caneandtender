"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

export default function CustomerLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/"; // ✅ default homepage

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    if (res?.error) {
      toast.error("Invalid email or password");
    } else {
      toast.success("Logged in successfully ✅");
      router.push(callbackUrl); // ✅ return to intended page OR home
    }

    setLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-white">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-xl shadow-md w-96 border"
      >
        <h2 className="text-2xl font-bold text-center text-green-700 mb-6">
          Customer Login
        </h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-3 rounded-md mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-3 rounded-md mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 rounded-md font-semibold hover:bg-green-700 transition disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <div className="text-center text-sm mt-4">
          <Link href="/login/forgot" className="text-green-700 hover:underline">
            Forgot password?
          </Link>
        </div>

        <div className="text-center text-sm mt-3">
          Don't have an account?{" "}
          <Link href="/login/signup" className="text-green-700 font-semibold">
            Sign up
          </Link>
        </div>
      </form>
    </div>
  );
}
