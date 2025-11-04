import "next";

declare module "next" {
  // ✅ Override broken internal PageProps definition
  export interface PageProps {
    params?: Record<string, any>;
    searchParams?: Record<string, any>;
  }
}
