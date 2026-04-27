import Link from "next/link"

export const metadata = {
  title: "使用條款",
  description: "棲地無界 Borderless Habitat 使用條款。",
}

const EFFECTIVE_DATE = "2026-04-27"

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-[680px] space-y-8">
      <header className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-[0.32em] text-[var(--brand)]">
          使用條款 · Terms of Service
        </p>
        <h1 className="heading-editorial text-[clamp(2rem,4vw,3rem)] text-[var(--ink)]">
          使用條款
        </h1>
        <p className="text-sm text-[var(--muted-ink)]">
          版本 1.0 · 生效日 {EFFECTIVE_DATE}
        </p>
      </header>

      <section className="space-y-6 text-base leading-8 text-[var(--ink)]">
        <Block title="1. 服務範圍">
          <p>
            棲地無界（Borderless Habitat，以下簡稱「本站」）是由華語社群維運的打工度假經驗交流平台，
            內容涵蓋過來人故事、各國 WHV 規則整理、使用者問答與留言互動。
            註冊或使用本站即表示你已詳閱並同意本條款。
          </p>
        </Block>

        <Block title="2. 帳號與身分">
          <p>
            註冊時請填寫真實可聯繫的 Email，並維持一個帳號對應一個自然人。
            禁止使用他人身分、刻意混淆暱稱或建立多重分身帳號規避內容審查。
          </p>
          <p>
            你應自行妥善保管登入密碼。若帳號被盜用，請立即透過下方聯絡管道通知本站。
          </p>
        </Block>

        <Block title="3. 內容著作權與授權">
          <p>
            使用者於本站發表的文章、留言、上傳的圖像（合稱「使用者內容」），其著作權歸作者所有。
            投稿即代表你以非專屬、可全球使用、可轉授權的方式，授權本站於下列範圍內利用該內容：
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>於本站及子網域、行動版面展示、節錄、翻譯。</li>
            <li>用於本站官方推廣（電子報、社群媒體、合作媒體露出），需保留作者標示。</li>
            <li>因法令、災難或備份需要進行重製、儲存。</li>
          </ul>
          <p>你保證所投稿之內容未侵害任何第三人之著作權、肖像權、隱私權或其他權利。</p>
        </Block>

        <Block title="4. 內容守則">
          <p>下列內容禁止張貼，違反者得不經事先通知逕行下架，必要時將停權帳號：</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>違反我國或當事人所在國之法令。</li>
            <li>仇恨言論、人身攻擊、性別／國籍／族群歧視。</li>
            <li>商業招攬、未揭露的業配、引人付費的個人聯絡方式。</li>
            <li>大量重複內容、與打工度假主題明顯無關的灌水。</li>
            <li>未經當事人同意之個人聯絡方式、地址、可被識別的私人照片。</li>
          </ul>
        </Block>

        <Block title="5. 內容審查機制">
          <p>
            為維護內容品質，本站採取分級信任制度：
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>新註冊使用者投稿的文章，會進入「待審」狀態，由編輯部審核後刊出。</li>
            <li>累積三件未處理檢舉的內容，將自動隱藏並進入待審。</li>
            <li>提升信任等級後，文章可直接刊出；嚴重違規仍可被退稿或下架。</li>
          </ul>
          <p>對審查結果有疑義者，得透過下方聯絡方式申訴，本站將於十個工作日內回覆。</p>
        </Block>

        <Block title="6. 服務變更與終止">
          <p>
            本站得依營運需要調整、暫停或終止部分功能，並儘可能於本頁公告。
            重大條款變動會以站內通知或註冊 Email 提前 14 日告知。
          </p>
        </Block>

        <Block title="7. 免責聲明">
          <p>
            本站內容多由使用者投稿，僅供參考，不構成法律、簽證、稅務或就業之專業意見。
            讀者依本站資訊所做的決定，應自負風險。
          </p>
        </Block>

        <Block title="8. 法律準據">
          <p>
            本條款以中華民國法律為準據法。因本條款所生爭議，雙方合意以臺灣臺北地方法院為第一審管轄法院。
          </p>
        </Block>
      </section>

      <p className="border-t border-[var(--line)] pt-6 text-sm text-[var(--muted-ink)]">
        若你有任何問題，請至{" "}
        <Link href="/about" className="font-semibold text-[var(--brand)] underline-offset-4 hover:underline">
          關於我們
        </Link>{" "}
        頁面找到聯絡方式，或寄信至 workdayholiday.ntu@gmail.com。
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
