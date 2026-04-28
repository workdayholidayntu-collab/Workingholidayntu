import Image from "next/image"

export const metadata = {
  title: "關於我們 — 棲地無界 Borderless Habitat",
  description: "讓每個回來的人，成為下一個出發者的底氣。",
}

export default function AboutPage() {
  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <div className="flex items-center gap-4">
          <Image src="/logo.png" alt="棲地無界" width={48} height={48} />
          <h1 className="text-3xl font-bold tracking-tight text-[var(--ink)] sm:text-4xl">
            關於棲地無界
          </h1>
        </div>
        <p className="max-w-2xl text-base leading-8 text-[var(--muted-ink)]">
          讓每個回來的人，成為下一個出發者的底氣。
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-[var(--ink)]">為什麼做這件事</h2>
        <div className="space-y-3 text-base leading-8 text-[var(--muted-ink)]">
          <p>
            打工度假的資訊散落在各個社群、論壇與個人部落格，查找起來費時費力，而且很多經驗隨著時間消失在網路深處。
          </p>
          <p>
            我們希望把這些寶貴的第一手經驗整理在一起，讓準備出發的人可以更快找到真實、可信的參考，也讓走過這段路的人知道自己的故事有人在乎。
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-[var(--ink)]">我們在做什麼</h2>
        <ul className="space-y-3 text-base leading-8 text-[var(--muted-ink)]">
          <li className="flex gap-3">
            <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--sand)] text-xs font-bold text-[var(--brand)]">1</span>
            <span><strong className="text-[var(--ink)]">過來人故事</strong> — 採訪真實走過打工度假的人，整理成可被搜尋、可被傳閱的經驗文章。</span>
          </li>
          <li className="flex gap-3">
            <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--sand)] text-xs font-bold text-[var(--brand)]">2</span>
            <span><strong className="text-[var(--ink)]">國家知識庫</strong> — 彙整各國簽證條件、申請流程與行前準備，一站查閱。</span>
          </li>
          <li className="flex gap-3">
            <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--sand)] text-xs font-bold text-[var(--brand)]">3</span>
            <span><strong className="text-[var(--ink)]">持續更新</strong> — 隨著更多人的參與，資料庫會持續擴充，讓資訊不斷線。</span>
          </li>
        </ul>
      </section>

      <section className="rounded-2xl border border-[var(--line)] bg-[var(--card)] p-6 sm:p-8">
        <h2 className="text-xl font-bold text-[var(--ink)]">想分享你的故事？</h2>
        <p className="mt-3 text-base leading-8 text-[var(--muted-ink)]">
          如果你曾經或正在打工度假，歡迎與我們聯繫。不論是一段完整的經歷，或是一個你覺得很重要的提醒，我們都想聽。
        </p>
        <p className="mt-4 text-sm font-medium text-[var(--brand)]">
          來信請寄：workdayholiday.ntu@gmail.com
        </p>
      </section>
    </div>
  )
}
