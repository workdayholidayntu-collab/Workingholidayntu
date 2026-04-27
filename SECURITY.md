# 棲地無界 Borderless Habitat — 資安規範文件

> 本文件涵蓋帳號資安、資料保護、攻擊防範與法遵要求的完整規範。
> 配合 `borderless-habitat-plan.md` 使用，是專案上線前必須完成的檢核項目。

---

## 0. 文件使用說明（給 Claude Code）

本文件是專案資安標準，請依照以下原則：

1. **第 9 章是 MVP 上線前的最低門檻**，全部完成才能上線
2. **RLS 政策變動後一律重跑第 2 章的驗證流程**
3. **環境變數命名嚴格遵守第 1.2 章規則**，`NEXT_PUBLIC_` 前綴不可亂用
4. **使用者輸入一律視為不可信**，所有渲染、儲存、查詢前都要處理
5. **遇到資安相關決策時主動提醒使用者**，不要自行假設
6. **發現潛在漏洞立即停止並告知**，不要繼續寫看起來會動但有風險的程式碼

---

## 1. Supabase Key 管理

### 1.1 兩支 Key 的差別

| Key 類型 | 用途 | 可否曝光 | 權限 |
|---------|------|---------|------|
| `anon key` | 前端使用，配合 RLS | 可公開 | 受 RLS 限制 |
| `service_role key` | 後端管理操作 | **絕對機密** | 繞過所有 RLS |

**最常見的災難**：把 `service_role key` 寫進前端程式碼或 commit 到 GitHub。一旦外流，攻擊者擁有整個資料庫的讀寫刪權限。

### 1.2 環境變數命名規則

```bash
# .env.local
# 公開的 anon key（會被打包進前端）
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...

# 機密的 service_role key（只能在 Server 端使用）
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
```

**重要規則：**
- `NEXT_PUBLIC_` 前綴會被 Next.js 打包進前端 bundle
- `service_role key` 絕對不能用 `NEXT_PUBLIC_` 前綴
- 只能在 Server Component、Server Action、API Route、middleware 中讀取 `SUPABASE_SERVICE_ROLE_KEY`

### 1.3 防止外流的措施

```bash
# .gitignore 必須包含
.env.local
.env*.local
.env.production
```

**檢查清單：**
- [ ] `.env.local` 已加入 `.gitignore`
- [ ] GitHub repo 開啟 secret scanning（Settings → Code security）
- [ ] 不在 README 或文件中貼出真實 key
- [ ] 不在 console.log 印出 key
- [ ] 部署平台（Vercel）的環境變數設定正確分離 public 與 secret

### 1.4 Key 外流應變

如果懷疑 `service_role key` 外流：
1. 立刻到 Supabase Dashboard → Settings → API → 重新生成 service_role key
2. 更新所有使用該 key 的環境（Vercel、本地、CI/CD）
3. 檢查 Supabase logs 看有沒有異常存取
4. 必要時通知使用者重設密碼

---

## 2. Row Level Security（RLS）

### 2.1 RLS 是資料庫主防線

**沒有 RLS = 資料庫裸奔。** 即使前端寫得再嚴謹，攻擊者可以直接呼叫 Supabase API 繞過所有前端邏輯。

### 2.2 三大常見錯誤

**錯誤一：忘記啟用 RLS**

建表後沒跑 `alter table xxx enable row level security`，整張表所有人都能讀寫。

```sql
-- 每張新表建立後立即啟用
alter table posts enable row level security;
alter table comments enable row level security;
-- 以此類推
```

Supabase Dashboard 對未啟用 RLS 的表會有警告標示，**不要忽略**。

**錯誤二：政策寫成永遠成立**

```sql
-- 危險示範
create policy "bad" on posts for select using (true);
```

`using (true)` 等於沒擋。為了「先讓功能動起來」這樣寫的程式碼，常常忘記改回去。

**錯誤三：只寫 SELECT，忘記擋 INSERT/UPDATE/DELETE**

每張表的每種操作都要明確政策：
- SELECT（讀取）
- INSERT（建立）
- UPDATE（修改）
- DELETE（刪除）

預設行為：沒政策就拒絕。但如果有人寫了 `for all using (true)` 圖方便就完蛋。

### 2.3 RLS 驗證流程

每次改動 RLS 政策後，用以下身份逐一測試：

```sql
-- 測試身份切換（在 SQL Editor 中）
-- 1. 未登入身份
set request.jwt.claim.sub to null;
select * from posts where status = 'pending';  -- 應該看不到

-- 2. 一般使用者 A
set request.jwt.claim.sub to '<user_a_id>';
update posts set title = 'hacked' where author_id = '<user_b_id>';  -- 應該失敗

-- 3. 團隊成員
set request.jwt.claim.sub to '<admin_id>';
select * from posts where status = 'pending';  -- 應該全部看得到
```

### 2.4 自動化測試（建議）

寫一支測試腳本，包含以下情境：

```typescript
// __tests__/rls.test.ts 範例骨架
describe('RLS 政策驗證', () => {
  test('未登入者不能看 pending 貼文', async () => { /* ... */ });
  test('使用者 A 不能修改使用者 B 的貼文', async () => { /* ... */ });
  test('使用者只能看自己的檢舉紀錄', async () => { /* ... */ });
  test('團隊成員可以修改任何貼文狀態', async () => { /* ... */ });
  test('未登入者不能發文', async () => { /* ... */ });
});
```

每次 RLS 改動後執行，避免手動驗證遺漏。

---

## 3. 認證與密碼安全

### 3.1 Supabase Auth 已處理的部分

不需要自己重做：
- 密碼用 bcrypt 雜湊，不存明文
- 登入失敗 rate limit
- Session token 用 JWT，自動輪替
- 支援 MFA（多因素驗證）
- Email 驗證流程

### 3.2 你需要設定的部分

**Supabase Dashboard → Authentication → Policies**

- [ ] 密碼最少 8 碼，要求大小寫 + 數字
- [ ] 啟用 Email confirmation（避免有人用別人信箱註冊）
- [ ] 設定 Session 有效期限（建議 1 週）
- [ ] 設定 Refresh token 輪替

**OAuth 設定（建議主推 Google 登入）**

- 把密碼安全外包給 Google，比自己存密碼安全
- 在 Supabase Dashboard → Authentication → Providers 啟用 Google
- 設定授權回呼網址：`https://你的網域/auth/callback`

### 3.3 進階：登入頁 Rate Limit

Supabase Auth 內建有 rate limit，但可以再加一層 IP 級別限制：

```typescript
// middleware.ts 範例
import { Ratelimit } from '@upstash/ratelimit';
// 對 /login 路徑限制每 IP 每分鐘 5 次嘗試
```

---

## 4. Session 與 Cookie 安全

### 4.1 用 @supabase/ssr 處理 Session

```bash
npm install @supabase/ssr
```

預設使用 httpOnly cookie 存 token，比 localStorage 安全（localStorage 會被 XSS 偷走）。

### 4.2 Cookie 安全屬性

確認 cookie 有以下屬性（@supabase/ssr 預設會設定）：
- `HttpOnly`：JavaScript 無法讀取
- `Secure`：只透過 HTTPS 傳輸
- `SameSite=Lax`：防止 CSRF

### 4.3 Middleware 處理範例

```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 重要：refresh session token
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

**注意**：`getUser()` 會驗證 token；不要用 `getSession()` 因為它不驗證。

### 4.4 登出處理

```typescript
// 確實清除 cookie，不只是清前端狀態
await supabase.auth.signOut();
```

---

## 5. 防止常見攻擊

### 5.1 SQL Injection

**好消息**：Supabase SDK 用 prepared statement，預設安全。

**風險點**：自訂 PostgreSQL function 中用字串拼接 SQL：

```sql
-- 危險：字串拼接
create function unsafe_search(keyword text)
returns table(...) as $$
begin
  return query execute 'select * from posts where title like ''%' || keyword || '%''';
end; $$ language plpgsql;

-- 安全：參數化查詢
create function safe_search(keyword text)
returns table(...) as $$
begin
  return query
    select * from posts where title ilike '%' || keyword || '%';
end; $$ language plpgsql;
```

### 5.2 XSS（跨站腳本攻擊）— 支援 HTML 的特別處理

**重要**：本專案需要支援使用者輸入 HTML（透過 Markdown 或富文本編輯器），這是 XSS 的高風險區。**必須做完整的內容淨化**。

#### 5.2.1 渲染策略

**絕對禁止：**
```tsx
// 危險！攻擊者可以塞 <script> 偷 cookie
<div dangerouslySetInnerHTML={{ __html: userContent }} />
```

**必須做法：**

```bash
npm install isomorphic-dompurify rehype-sanitize react-markdown remark-gfm rehype-raw
```

#### 5.2.2 Markdown + HTML 安全渲染

```tsx
// components/SafeMarkdown.tsx
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';

// 自訂允許的 HTML 標籤與屬性
const sanitizeSchema = {
  ...defaultSchema,
  tagNames: [
    ...(defaultSchema.tagNames || []),
    // 允許的標籤
    'p', 'br', 'strong', 'em', 'u', 's', 'code', 'pre',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li',
    'blockquote', 'hr',
    'a', 'img',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
  ],
  attributes: {
    ...defaultSchema.attributes,
    a: ['href', 'title', 'target', 'rel'],
    img: ['src', 'alt', 'title', 'width', 'height'],
    code: ['className'],
    '*': ['className'],
  },
  // 禁止 javascript: 與 data: URI（除了圖片）
  protocols: {
    ...defaultSchema.protocols,
    href: ['http', 'https', 'mailto'],
    src: ['http', 'https'],
  },
};

export function SafeMarkdown({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[
        rehypeRaw,
        [rehypeSanitize, sanitizeSchema],
      ]}
      components={{
        // 外部連結強制 noopener noreferrer
        a: ({ href, children, ...props }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer nofollow"
            {...props}
          >
            {children}
          </a>
        ),
        // 圖片限制來源、加 lazy load
        img: ({ src, alt, ...props }) => {
          if (!src || !isAllowedImageSource(src)) return null;
          return (
            <img
              src={src}
              alt={alt || ''}
              loading="lazy"
              {...props}
            />
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

function isAllowedImageSource(src: string): boolean {
  // 只允許自家 Supabase Storage 與特定可信來源
  const allowedHosts = [
    'xxx.supabase.co',
    'images.unsplash.com',
  ];
  try {
    const url = new URL(src);
    return allowedHosts.includes(url.hostname);
  } catch {
    return false;
  }
}
```

#### 5.2.3 儲存前淨化（雙重保險）

不要只在渲染時淨化，**儲存前也要再過濾一次**：

```typescript
// lib/sanitize.ts
import DOMPurify from 'isomorphic-dompurify';

const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'em', 'u', 's', 'code', 'pre',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li',
  'blockquote', 'hr',
  'a', 'img',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
];

const ALLOWED_ATTR = [
  'href', 'title', 'target', 'rel',
  'src', 'alt', 'width', 'height',
  'class', 'className',
];

export function sanitizeUserContent(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOWED_URI_REGEXP: /^(?:https?|mailto):/i,
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'style'],
  });
}

// Server Action 範例
'use server';
export async function createPost(formData: FormData) {
  const rawContent = formData.get('content') as string;
  const sanitizedContent = sanitizeUserContent(rawContent);

  // 儲存淨化後的內容
  const { error } = await supabase
    .from('posts')
    .insert({ content: sanitizedContent, /* ... */ });
}
```

#### 5.2.4 為什麼要雙重淨化

- **儲存前淨化**：防止資料庫被污染，避免每次讀取都要淨化
- **渲染時淨化**：作為最後防線，萬一儲存時漏了或舊資料有問題

兩層都做才安全。

#### 5.2.5 Content Security Policy（CSP）

設定 HTTP header 限制可載入的資源來源，作為最外層防線：

```typescript
// next.config.js
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https://*.supabase.co https://images.unsplash.com;
  font-src 'self' data:;
  connect-src 'self' https://*.supabase.co https://challenges.cloudflare.com;
  frame-src https://challenges.cloudflare.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`;

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader.replace(/\s{2,}/g, ' ').trim(),
          },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};
```

**注意**：`unsafe-inline` 和 `unsafe-eval` 是 Next.js 開發環境必要的，正式環境可考慮用 nonce 進階強化。

### 5.3 CSRF（跨站請求偽造）

**Server Actions（Next.js 14+）內建 CSRF 防護**，優先使用。

如果自己寫 API Route，必須驗證：

```typescript
// app/api/posts/route.ts
export async function POST(request: Request) {
  // 驗證 Origin
  const origin = request.headers.get('origin');
  const allowedOrigins = ['https://你的網域'];
  if (!origin || !allowedOrigins.includes(origin)) {
    return new Response('Forbidden', { status: 403 });
  }
  // ...
}
```

### 5.4 檔案上傳攻擊

**風險**：攻擊者上傳 `.php` 偽裝成 `.jpg`、上傳含惡意 metadata 的圖片、上傳超大檔案塞爆儲存空間。

#### 5.4.1 上傳前驗證

```typescript
// lib/upload.ts
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

export function validateImageUpload(file: File): { ok: boolean; error?: string } {
  if (file.size > MAX_SIZE) {
    return { ok: false, error: '檔案超過 5MB' };
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { ok: false, error: '只接受 JPG / PNG / WebP' };
  }
  const ext = file.name.toLowerCase().match(/\.[^.]+$/)?.[0];
  if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
    return { ok: false, error: '副檔名不符' };
  }
  return { ok: true };
}
```

#### 5.4.2 Server 端再次驗證 + 重新編碼

```typescript
// 用 sharp 重新編碼，剝掉惡意 metadata
import sharp from 'sharp';

export async function processImage(buffer: Buffer): Promise<Buffer> {
  return await sharp(buffer)
    .rotate()                    // 自動處理 EXIF 旋轉
    .resize(1920, 1920, {        // 限制最大尺寸
      fit: 'inside',
      withoutEnlargement: true,
    })
    .toFormat('webp', { quality: 85 })  // 統一轉成 webp
    .toBuffer();
}
```

#### 5.4.3 Supabase Storage RLS

```sql
-- Storage 也要設 RLS
-- 使用者只能上傳到自己的資料夾
create policy "users_upload_own_folder"
on storage.objects for insert
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- 使用者只能修改 / 刪除自己的檔案
create policy "users_modify_own_files"
on storage.objects for update
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);
```

---

## 6. 社群行為防範

### 6.1 Spam 防範

**新使用者限制**

新註冊 24 小時內：
- 每日發文上限 3 篇
- 每日留言上限 10 則
- 不能上傳圖片（避免廣告圖洗版）

可在 Server Action 中檢查：

```typescript
async function checkRateLimit(userId: string, action: 'post' | 'comment') {
  const { data: profile } = await supabase
    .from('profiles')
    .select('created_at')
    .eq('id', userId)
    .single();

  const hoursOld = (Date.now() - new Date(profile.created_at).getTime()) / 3600000;
  if (hoursOld < 24) {
    const limit = action === 'post' ? 3 : 10;
    const { count } = await supabase
      .from(action === 'post' ? 'posts' : 'comments')
      .select('*', { count: 'exact', head: true })
      .eq('author_id', userId)
      .gte('created_at', new Date(Date.now() - 86400000).toISOString());

    if ((count ?? 0) >= limit) {
      throw new Error('新註冊使用者每日上限');
    }
  }
}
```

**Honeypot Field**

表單加一個隱藏欄位，真人不會填，機器人會填：

```tsx
<form>
  {/* 真實欄位 */}
  <input name="title" />
  <textarea name="content" />

  {/* honeypot：用 CSS 藏起來 */}
  <input
    name="website"
    tabIndex={-1}
    autoComplete="off"
    style={{ position: 'absolute', left: '-9999px' }}
  />
</form>
```

Server 端檢查 `website` 欄位有值就是機器人，直接退回。

**Cloudflare Turnstile（建議）**

免費、隱私友善（不像 reCAPTCHA 會追蹤）、體驗好（多數使用者不需點擊）。

```bash
npm install @marsidev/react-turnstile
```

```tsx
import { Turnstile } from '@marsidev/react-turnstile';

<Turnstile
  siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
  onSuccess={(token) => setToken(token)}
/>
```

Server 端驗證 token：

```typescript
async function verifyTurnstile(token: string): Promise<boolean> {
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: new URLSearchParams({
      secret: process.env.TURNSTILE_SECRET_KEY!,
      response: token,
    }),
  });
  const data = await res.json();
  return data.success === true;
}
```

### 6.2 惡意檢舉防範

```sql
-- reports 表加 unique constraint，同人對同目標只能檢舉一次
alter table reports add constraint unique_report
  unique (reporter_id, target_type, target_id);
```

統計檢舉駁回率，過高的人未來檢舉降權：

```sql
-- 查詢檢舉駁回率高的使用者
select reporter_id,
  count(*) filter (where status = 'dismissed')::float / count(*) as dismiss_rate,
  count(*) as total
from reports
group by reporter_id
having count(*) >= 5 and
  count(*) filter (where status = 'dismissed')::float / count(*) > 0.7;
```

**重要**：被檢舉不應自動隱藏，必須團隊審核。除非檢舉次數超過閾值（例如 10 次以上）才暫時隱藏待審。

### 6.3 騷擾防範

**封鎖功能**

```sql
create table user_blocks (
  blocker_id uuid not null references profiles(id) on delete cascade,
  blocked_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id)
);

alter table user_blocks enable row level security;

create policy "users_manage_own_blocks" on user_blocks
  for all using (auth.uid() = blocker_id);
```

查詢留言時排除被封鎖者：

```typescript
const { data: blocks } = await supabase
  .from('user_blocks')
  .select('blocked_id')
  .eq('blocker_id', userId);

const blockedIds = blocks?.map(b => b.blocked_id) ?? [];

const { data: comments } = await supabase
  .from('comments')
  .select('*')
  .not('author_id', 'in', `(${blockedIds.join(',')})`);
```

**關閉留言選項**

posts 表加欄位：

```sql
alter table posts add column comments_locked boolean not null default false;
```

作者可以鎖定自己貼文的留言區。

---

## 7. 個資保護與法遵

### 7.1 法規概覽

打工度假平台會收集個資（email、可能的真實姓名、頭像、發文內容），必須遵守：
- **台灣個資法**：適用於台灣使用者
- **GDPR**：適用於歐盟使用者（如果你有歐洲流量）

### 7.2 必做項目

**隱私政策頁面（`/privacy`）**

必須明列：
- 收集哪些資料（email、display_name、avatar、IP、cookies）
- 用途（提供服務、防止濫用、寄送通知）
- 保存期限
- 第三方分享狀況（Supabase、Vercel、Google OAuth）
- 使用者權利（查詢、修改、刪除）
- 聯絡方式

**使用條款頁面（`/terms`）**

註冊時要勾選同意，內容包含：
- 使用者責任（不發違法、騷擾、侵權內容）
- 內容授權（使用者授權平台展示其內容）
- 平台權利（審查、刪除、停權）
- 免責聲明
- 爭議解決方式

**Cookie 同意提示**

如果有歐盟流量，必須顯示。可以用 `cookieconsent` 之類的套件。

**資料刪除權**

提供「刪除帳號」功能，必須真的刪除個資。

本專案 `posts.author_id` 已是 nullable，並有 `author_display_name` 欄位，所以**不需要建立匿名使用者**。直接把 author_id 設為 null + 留下原本的 `author_display_name` 即可保留貼文歷史。

`comments.author_id` 不可為 null（FK on delete cascade），所以刪除使用者時留言會被 PostgreSQL 自動 cascade 刪除；如果要保留留言內容，需另外處理（見備註）。

```typescript
async function deleteAccount(userId: string) {
  // 1. 把該使用者所有貼文「去個資化」：移除 author_id，保留 author_display_name
  //    用 service_role 執行（後端 admin 任務），auth.uid() 為 null 時 trigger 放行
  const { data: userPosts } = await supabaseAdmin
    .from('posts')
    .select('id, author_display_name')
    .eq('author_id', userId);

  for (const post of userPosts ?? []) {
    await supabaseAdmin
      .from('posts')
      .update({
        author_id: null,
        // 若原本沒設 display name，補上一個保留名
        author_display_name: post.author_display_name ?? '[使用者已刪除]',
      })
      .eq('id', post.id);
  }

  // 2. 刪除頭像等檔案
  await supabaseAdmin.storage.from('avatars').remove([`${userId}/`]);

  // 3. 刪除 auth.users → 透過 ON DELETE CASCADE 連動：
  //    profiles → comments（cascade）會被一併刪除
  await supabaseAdmin.auth.admin.deleteUser(userId);
}
```

**備註：**
- 留言預設會被 cascade 刪除。如果要改成「保留留言、僅匿名化」，請在 schema 中將 `comments.author_id` 改為 `on delete set null` 並加上 `author_display_name` 欄位（仿 posts 設計）。MVP 階段先採 cascade 刪除即可。
- 此函式必須在 server side 用 service_role key 執行（前端無此權限）。
- trust_level / status guard trigger 在 `auth.uid() is null` 時放行，所以 service_role 可以正常執行此流程。

### 7.3 不蒐集敏感個資

**絕對不要存：**
- 身分證字號
- 護照號碼
- 信用卡 / 銀行帳號
- 精確地址（縣市可以，街號不要）
- 健康狀況

如果需要，找專業金流 / 認證服務商處理，不要自己存。

### 7.4 資料中心區域

- **亞洲區（Tokyo / Singapore）**：台灣使用者體驗最好
- **歐洲區（Frankfurt）**：GDPR 合規最方便

建議優先選亞洲區，如果歐洲流量大再評估遷移。

---

## 8. 監控與事件應變

### 8.1 監控設定

**Supabase Dashboard**
- 開啟 email 警報（Settings → Notifications）
- 設定資料庫使用量警報
- 監控 auth 異常活動

**Vercel**
- 開啟異常流量通知
- 設定 deployment 失敗通知

**錯誤監控（建議）**

接 Sentry 做錯誤追蹤：

```bash
npm install @sentry/nextjs
```

注意：Sentry 設定不要記錄個資（email、IP）。

### 8.2 異常徵兆

定期檢查：
- `auth.users` 表有沒有異常的批量註冊（同一 IP 短時間註冊大量帳號）
- 資料庫流量突然暴增
- Storage 空間異常增加
- 同一帳號短時間發文異常多

### 8.3 事件應變 Checklist

事故發生時依序執行：

1. **立刻 rotate `service_role key`**
2. **暫停可疑帳號**：`update profiles set trust_level = -1 where id = ...`（自訂等級表示停權）
3. **看 Supabase logs 確認影響範圍**：哪些資料被讀寫、哪些 IP
4. **必要時把網站切到維護頁面**：Vercel 可暫停 deployment
5. **保留證據**：截圖、log 匯出
6. **通知受影響使用者**：個資法要求 72 小時內通報主管機關
7. **事後檢討**：寫 post-mortem，修補漏洞

### 8.4 備份策略

**Supabase Pro 方案**：自動每日備份，可保留 7 天。

**Free Tier 沒有自動備份**，建議寫腳本定期 `pg_dump`：

```bash
# 每日備份腳本（cron 排程）
pg_dump "postgresql://postgres:[password]@[host]:5432/postgres" \
  --no-owner \
  --no-acl \
  -f "backup-$(date +%Y%m%d).sql"

# 上傳到自己的 S3 或其他儲存
```

定期測試備份能否還原（光備份不夠，要驗證）。

---

## 9. MVP 上線前最低標準（必須全部完成）

### 9.1 Key 與環境變數
- [ ] `.env.local` 已加入 `.gitignore`
- [ ] `service_role key` 沒有 `NEXT_PUBLIC_` 前綴
- [ ] `service_role key` 只在 server 端程式碼中使用
- [ ] Vercel 環境變數設定正確
- [ ] GitHub 開啟 secret scanning

### 9.2 RLS
- [ ] 所有資料表都啟用 RLS
- [ ] 每張表的 SELECT / INSERT / UPDATE / DELETE 都有明確政策
- [ ] 用三種身份（未登入、一般使用者、團隊）逐一測試過權限
- [ ] 嘗試直接從前端發送惡意請求確認被擋

### 9.3 認證
- [ ] 密碼最少 8 碼，啟用 email 驗證
- [ ] OAuth 設定正確（如有使用）
- [ ] Session middleware 正確運作

### 9.4 內容處理
- [ ] Markdown 渲染使用 `react-markdown` + `rehype-sanitize`
- [ ] **不使用** `dangerouslySetInnerHTML` 處理使用者內容
- [ ] HTML 內容儲存前用 `DOMPurify` 淨化
- [ ] 連結強制加 `rel="noopener noreferrer nofollow"`
- [ ] 圖片來源限制白名單

### 9.5 檔案上傳
- [ ] 大小限制（5MB 內）
- [ ] 類型驗證（MIME + 副檔名雙重檢查）
- [ ] Server 端用 `sharp` 重新編碼
- [ ] Storage RLS 政策設定正確

### 9.6 防護機制
- [ ] HTTP security headers 設定（CSP、X-Frame-Options 等）
- [ ] 新使用者前 24 小時發文頻率限制
- [ ] Honeypot 或 Turnstile 至少擇一
- [ ] 檢舉去重機制
- [ ] 封鎖使用者功能

### 9.7 法遵
- [ ] 隱私政策頁面
- [ ] 使用條款頁面
- [ ] 註冊時勾選同意條款
- [ ] 提供刪除帳號功能
- [ ] 不蒐集敏感個資

### 9.8 監控
- [ ] Supabase 警報通知開啟
- [ ] Vercel 警報通知開啟
- [ ] 備份策略（手動 pg_dump 或升級 Pro）

---

## 10. 進階強化（流量起來後再做）

- [ ] 升級 Supabase Pro 取得自動備份
- [ ] 整合 Cloudflare Turnstile 取代 Honeypot
- [ ] 接 Sentry 做錯誤監控
- [ ] 啟用 Supabase MFA（多因素驗證）
- [ ] CSP 改用 nonce-based（移除 unsafe-inline）
- [ ] 寫自動化 RLS 測試腳本，加入 CI/CD
- [ ] 滲透測試（請朋友或外部公司驗證）
- [ ] 設定 WAF（Web Application Firewall）
- [ ] 個資加密（PII 欄位用 pgcrypto 加密儲存）
- [ ] 建立 bug bounty 計畫

---

## 11. 給 Claude Code 的具體指令範本

開發時可以用類似這樣的提示：

> 「請依照 SECURITY.md 第 5.2 章，建立 `components/SafeMarkdown.tsx`，支援 Markdown + HTML 安全渲染。記得用 `rehype-sanitize` 設定白名單，連結強制加 `rel="noopener noreferrer nofollow"`。」

> 「請依照 SECURITY.md 第 5.4 章，建立檔案上傳處理流程。前端 `lib/upload.ts` 做大小與類型驗證，Server Action 用 `sharp` 重新編碼後上傳到 Supabase Storage。」

> 「請依照 SECURITY.md 第 9 章的清單，幫我檢視目前的程式碼有哪些項目還沒做，列出來逐一處理。」

> 「請依照 SECURITY.md 第 7.2 章，建立 `app/(legal)/privacy/page.tsx` 和 `app/(legal)/terms/page.tsx`，內容用繁體中文撰寫。」

---

## 附錄 A：常用套件清單

```json
{
  "dependencies": {
    "@supabase/supabase-js": "latest",
    "@supabase/ssr": "latest",
    "react-markdown": "latest",
    "remark-gfm": "latest",
    "rehype-raw": "latest",
    "rehype-sanitize": "latest",
    "isomorphic-dompurify": "latest",
    "sharp": "latest",
    "@marsidev/react-turnstile": "latest",
    "@sentry/nextjs": "latest"
  }
}
```

## 附錄 B：參考資源

- OWASP Top 10：https://owasp.org/www-project-top-ten/
- Supabase Security Best Practices：https://supabase.com/docs/guides/platform/going-into-prod
- Next.js Security Headers：https://nextjs.org/docs/app/api-reference/next-config-js/headers
- DOMPurify 文件：https://github.com/cure53/DOMPurify
- Content Security Policy 參考：https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
- 台灣個資法：https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=I0050021
- GDPR 摘要：https://gdpr.eu/

## 附錄 C：資安檢查週期

| 頻率 | 項目 |
|------|------|
| 每次部署 | RLS 測試、環境變數檢查 |
| 每週 | 異常帳號活動掃描、檢舉處理 |
| 每月 | 套件安全更新（`npm audit`）、備份還原測試 |
| 每季 | 完整資安清單複查、權限審查 |
| 每年 | 滲透測試、法遵檢視 |
