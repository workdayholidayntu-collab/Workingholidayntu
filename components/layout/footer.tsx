import Image from "next/image"

export function Footer() {
  return (
    <footer className="border-t border-[var(--line)] px-4 py-8 text-sm text-[var(--muted-ink)] sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="棲地無界" width={28} height={28} className="opacity-60" />
          <p>棲地無界 WHV 以台灣視角整理打工度假資訊，讓經驗被保存、被接住，也被傳下去。</p>
        </div>
        <p className="text-xs text-[var(--muted-ink)]/70">© 棲地無界 WHV</p>
      </div>
    </footer>
  )
}
