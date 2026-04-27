import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"

// Header reads the current viewer per-request via Supabase auth cookies, so
// every (main) route is inherently dynamic and must skip static prerender.
export const dynamic = "force-dynamic"

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">{children}</main>
      <Footer />
    </div>
  )
}
