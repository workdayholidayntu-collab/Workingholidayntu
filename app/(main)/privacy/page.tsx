import Link from "next/link"

export const metadata = {
  title: "隱私政策",
  description: "棲地無界 Borderless Habitat 個人資料處理政策。",
}

const EFFECTIVE_DATE = "2026-04-27"

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-[680px] space-y-8">
      <header className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-[0.32em] text-[var(--brand)]">
          隱私政策 · Privacy
        </p>
        <h1 className="heading-editorial text-[clamp(2rem,4vw,3rem)] text-[var(--ink)]">
          隱私政策
        </h1>
        <p className="text-sm text-[var(--muted-ink)]">
          版本 1.0 · 生效日 {EFFECTIVE_DATE}
        </p>
      </header>

      <section className="space-y-6 text-base leading-8 text-[var(--ink)]">
        <Block title="1. 我們收集什麼">
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong>帳號資訊：</strong>
              Email（自註冊或 Google OAuth）、自選暱稱、加密後的密碼雜湊（不存原始密碼）。
            </li>
            <li>
              <strong>個人檔案：</strong>
              你主動填寫的自我介紹、可幫忙領域、去過的國家清單、頭像連結。
            </li>
            <li>
              <strong>站內活動：</strong>
              你發表的文章、留言、檢舉內容，以及這些行為對應的時間戳記。
            </li>
            <li>
              <strong>技術資訊：</strong>
              IP 位址、User-Agent、請求路徑與時間 —— 僅用於偵測濫用、調整效能。
              我們不投放第三方廣告 cookie，亦不於本站嵌入跨站追蹤器。
            </li>
          </ul>
        </Block>

        <Block title="2. 我們怎麼使用">
          <ul className="list-disc space-y-1 pl-5">
            <li>提供註冊、登入、發文、留言、檢舉等核心功能。</li>
            <li>由編輯部進行內容審查，包括人工複核與自動標記。</li>
            <li>
              發送與帳號相關的系統通知（驗證信、密碼重設、條款變動）。
              我們不會未經同意將你的 Email 加入行銷信清單。
            </li>
            <li>製作匿名彙整統計（例如「本月新增文章 N 篇」），用於對外溝通與內部追蹤。</li>
          </ul>
        </Block>

        <Block title="3. 委外處理者">
          <p>本站使用以下第三方服務協助運作，請另參閱其各自的隱私政策：</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Supabase（PostgreSQL、Auth、Storage）</li>
            <li>Vercel（網站與 Edge 函式部署）</li>
            <li>Google OAuth（若你選擇 Google 登入）</li>
            <li>Cloudflare Turnstile（防止自動化註冊與投稿）</li>
          </ul>
          <p>我們僅在提供本站服務所必要範圍內，將個人資料交由上述服務處理。</p>
        </Block>

        <Block title="4. 保存期限">
          <ul className="list-disc space-y-1 pl-5">
            <li>帳號相關資料：自帳號刪除請求送達之次日起 30 天內完成清除。</li>
            <li>已刊出的文章與留言：依使用條款授權持續保留；本人得隨時編輯或刪除。</li>
            <li>系統存取紀錄：保留 30 日後自動覆寫。</li>
          </ul>
        </Block>

        <Block title="5. 你的權利">
          <p>依據個人資料保護法，你享有以下權利：</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>查詢、閱覽、複製本人個人資料。</li>
            <li>請求補充或更正錯誤資料。</li>
            <li>請求刪除帳號及其關聯資料（不影響已合法公開、且涉及他人權益的內容）。</li>
            <li>停止特定處理（例如系統通知）。</li>
          </ul>
          <p>請寄信至 hello@borderless-habitat.tw 行使上述權利，我們將於 30 天內處理。</p>
        </Block>

        <Block title="6. Cookie 與本機儲存">
          <p>
            本站僅使用必要型 cookie / localStorage：登入狀態、語言偏好、Turnstile 驗證憑證。
            未來若新增分析型 cookie，將先行於本頁告知並提供退出機制。
          </p>
        </Block>

        <Block title="7. 兒童">
          <p>
            本站定位為打工度假社群，主要使用者為 18 歲以上成年人；
            我們不主動向 13 歲以下兒童收集個人資料。
          </p>
        </Block>

        <Block title="8. 政策更新">
          <p>
            重大政策變動會於本頁公告，並以站內通知或註冊 Email 提前 14 日告知。
            繼續使用本站視為同意更新後的政策。
          </p>
        </Block>
      </section>

      <p className="border-t border-[var(--line)] pt-6 text-sm text-[var(--muted-ink)]">
        對資料處理有任何疑問，請至{" "}
        <Link href="/about" className="font-semibold text-[var(--brand)] underline-offset-4 hover:underline">
          關於我們
        </Link>{" "}
        頁面找到聯絡方式，或寄信至 hello@borderless-habitat.tw。
      </p>
    </article>
  )
}

interface BlockProps {
  title: string
  children: React.ReactNode
}

function Block({ title, children }: BlockProps) {
  return (
    <div className="space-y-3">
      <h2 className="heading-editorial text-xl text-[var(--ink)]">{title}</h2>
      <div className="space-y-3">{children}</div>
    </div>
  )
}
