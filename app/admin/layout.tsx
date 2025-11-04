import "../../app/globals.css"
import { Sora } from "next/font/google"

const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
})

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${sora.className} bg-green-50 text-gray-900 min-h-screen`}>
      {children}
    </div>
  )
}
