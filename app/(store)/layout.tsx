import RootClientLayout from "@/components/store/layout/RootClientLayout";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return <RootClientLayout>{children}</RootClientLayout>;
}