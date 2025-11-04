import "./globals.css";
import { Sora } from "next/font/google";
import UXProvider from "@/components/providers/UXProvider";
import PageFade from "@/components/providers/PageFade";

const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata = {
  title: "SugarTinder",
  description: "Clean, fast, delightful shopping.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${sora.className} bg-green-50 text-gray-900`}>
        <UXProvider>
          <PageFade>{children}</PageFade>
        </UXProvider>
      </body>
    </html>
  );
}
