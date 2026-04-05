import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"
import { PlatformBanner } from "@/components/layout/platform-banner"
import { Sidebar } from "@/components/layout/sidebar"
import { getCountries } from "@/lib/data"
import { getPlatformStatus } from "@/lib/platform-status"

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [countries, status] = await Promise.all([getCountries(), getPlatformStatus()])

  return (
    <div className="min-h-screen">
      <PlatformBanner status={status} />
      <Header />
      <div className="mx-auto flex max-w-7xl">
        <Sidebar countries={countries} />
        <div className="min-w-0 flex-1">
          <main className="px-4 py-8 sm:px-6 lg:px-8">{children}</main>
          <Footer />
        </div>
      </div>
    </div>
  )
}
