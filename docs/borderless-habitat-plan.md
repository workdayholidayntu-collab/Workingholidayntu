# 棲地無界 Borderless Habitat — 社群平台開發計畫 v2

> 本文件為「棲地無界」從內容網站轉型為使用者自由發文社群平台的開發藍圖。
> 採 Next.js + Supabase 架構，目標是用最低成本、最快速度上線 MVP。
>
> v2 變更摘要（相對於 v1）：
> - Supabase 專案重建，schema 整合現況命名（slug、nickname、html_content）並新增 trust_level、reports、巢狀 comments
> - `is_verified` boolean → `trust_level int` 信任等級制度
> - RLS 統一改用 `is_admin()` security definer function；補上「禁止作者改自己 status」防線
> - 編輯器確認使用 Tiptap（沿用現況）
> - 第 3-4 週重排：留言/檢舉/admin 為主軸；按讚/收藏/Email 通知延後到 MVP 後；SEO meta 提前到第 2 週
> - 新增章節：備份策略、防垃圾、現有種子內容遷移、法律條款
> - `lib/mock-data.ts` 改名為 `lib/seed-content.ts`（內容已是真實，作為一次性 seed 用途）；`content-mode.ts` 與 `platform-status.ts` 廢除

---

## 0. 文件使用說明（給 Claude Code）

1. **遵循開發順序**：第 5 章的週次任務是建議順序，依序執行
2. **資料結構為核心**：第 3 章定義的 schema 是所有功能的基礎，異動前先討論
3. **RLS 政策不可省略**：第 4 章的權限規則必須完整實作，這是資安關鍵
4. **保留現有真實內容**：`lib/mock-data.ts` 中的兩篇文章與兩位作者是真實內容，必須完整遷移
5. **每完成一個小功能就測試**：尤其是涉及權限的部分

開發語言與工具：
- TypeScript（避免 `any`，外部輸入用 `unknown`）
- Tailwind CSS（沿用）
- Supabase 官方 SDK（`@supabase/supabase-js` + `@supabase/ssr`）
- Tiptap 編輯器（`@tiptap/react` + `@tiptap/starter-kit`，已安裝）
- Server Components 優先；Client Components 只在需要互動時用
- Zod 做表單驗證（已安裝）

---

## 1. 專案目標與定位

### 1.1 現況
- 內容網站，由團隊整理「過來人故事」與國家知識庫
- 已有兩篇真實訪談：Sonya（美國阿拉斯加 J1）、長晉（法國巴黎交換）
- 部分 Supabase 結構已搭好（要整個重建）

### 1.2 轉型目標
從「團隊產製內容」轉為「社群共創內容」雙向平台：
- **欲分享經驗者**：自由發文分享打工度假經驗
- **想去國際打工者**：發文提問、獲得解答
- **團隊角色**：從內容製作者轉為內容審查管理者

### 1.3 不做的事（範圍控制）
- 不做即時聊天（IM）
- 不做付費機制
- 不做原生 App（先做 RWD）
- 不做使用者私訊（降低騷擾風險）
- **MVP 不做**：按讚、收藏、Email 通知、追蹤特定作者/國家

---

## 2. 技術架構

### 2.1 整體架構

```
使用者瀏覽器
    ↓
Vercel（Next.js 16 App Router，已部署）
    ↓
Supabase（PostgreSQL + Auth + Storage + RLS）
```

### 2.2 技術選型

| 層級 | 選擇 | 備註 |
|------|------|------|
| 前端框架 | Next.js 16（App Router） | 沿用，注意 v16 的 breaking changes（見 `node_modules/next/dist/docs/`） |
| 樣式 | Tailwind CSS v4 | 沿用 |
| 資料庫 | Supabase PostgreSQL | 含 RLS 權限控制 |
| 認證 | Supabase Auth | Email + Google OAuth |
| 檔案儲存 | Supabase Storage | 使用者頭像、貼文圖片 |
| 部署 | Vercel | 沿用 |
| 編輯器 | Tiptap（rich-text → HTML） | 已安裝；輸出存 `html_content`，搭配 sanitize |
| 表單驗證 | Zod | 已安裝 |
| 後台管理 | Supabase Studio + 自製 `/admin` 頁 | 雙軌並用 |
| 防垃圾 | Cloudflare Turnstile | 第 4 週加上 |

### 2.3 為什麼選這個組合
- Vercel + Supabase 在 5 萬月活內幾乎免費
- 無需自寫後端 API：前端透過 Supabase SDK 操作，權限由 RLS 在資料庫層保護
- Supabase Studio 提供現成資料管理介面，簡單操作不需要寫 admin
- PostgreSQL 標準 SQL，未來可遷移到 RDS 或自架

---

## 3. 資料結構（Database Schema）

### 3.1 命名與型別決策（鎖定）

整合現有命名與計畫的補強：

- 國家識別用 `country_slug`（不用 ISO code，SEO 與閱讀友善）
- 使用者顯示名稱用 `nickname`（不用 `display_name`）
- 文章內容欄位 `content`（純文字 / Markdown 來源）+ `html_content`（Tiptap 輸出，sanitize 後存）+ `excerpt`（摘要，可 nullable）
- 留言表叫 `comments`（**從原 discussions 改名**），支援 `parent_id` 巢狀
- `posts.status`：`draft` / `pending` / `approved` / `rejected` / `hidden`
- `profiles.trust_level int`：`0=新手` / `1=一般` / `2=資深` / `3=團隊（admin）`

### 3.2 核心資料表

#### `countries`
| 欄位 | 型別 | 說明 |
|------|------|------|
| id | uuid (PK) | |
| slug | text (unique) | URL slug，如 `usa`、`france` |
| name_zh | text | 中文名 |
| name_en | text | 英文名 |
| flag_emoji | text | 國旗 emoji |
| visa_info | jsonb | 簽證資訊（彈性結構） |
| created_at | timestamptz | |

#### `profiles`
| 欄位 | 型別 | 說明 |
|------|------|------|
| id | uuid (PK) | references `auth.users(id)` |
| nickname | text not null | 顯示名稱 |
| avatar_url | text | 頭像 URL |
| bio | text | 自我介紹 |
| can_help | text | 我可以幫忙的領域 |
| countries_visited | text[] | 去過的國家 slug |
| trust_level | int not null default 0 | `0/1/2/3` |
| created_at | timestamptz | |
| updated_at | timestamptz | |

#### `posts`
| 欄位 | 型別 | 說明 |
|------|------|------|
| id | uuid (PK) | |
| author_id | uuid | references `profiles(id)`，nullable（給站方共筆內容用） |
| author_display_name | text | 站方共筆內容的顯示名（搭配 author_id null 使用） |
| type | text | `'story'` / `'question'` |
| title | text not null | |
| slug | text (unique) not null | URL slug |
| content | text | 純文字 / Markdown 來源 |
| html_content | text | Tiptap 輸出（sanitize 後） |
| excerpt | text | 摘要 |
| country_slug | text | references `countries(slug)`，nullable |
| tags | text[] | |
| status | text | `'draft'/'pending'/'approved'/'rejected'/'hidden'` |
| views | int not null default 0 | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

#### `comments`（原 discussions，改名並加巢狀）
| 欄位 | 型別 | 說明 |
|------|------|------|
| id | uuid (PK) | |
| post_id | uuid | references `posts(id)` on delete cascade |
| author_id | uuid | references `profiles(id)` on delete cascade |
| parent_id | uuid | references `comments(id)`，nullable，巢狀回覆用 |
| content | text not null | Tiptap 輸出（已 sanitize） |
| status | text | `'visible'` / `'hidden'` |
| created_at | timestamptz | |

#### `reports`
| 欄位 | 型別 | 說明 |
|------|------|------|
| id | uuid (PK) | |
| reporter_id | uuid | references `profiles(id)` |
| target_type | text | `'post'` / `'comment'` |
| target_id | uuid | |
| reason | text not null | |
| status | text | `'pending'` / `'resolved'` / `'dismissed'` |
| created_at | timestamptz | |

### 3.3 完整 SQL（單一 migration）

```sql
-- supabase/migrations/00000000_001_initial_schema.sql

create extension if not exists pgcrypto;

-- countries
create table countries (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name_zh text not null,
  name_en text not null,
  flag_emoji text,
  visa_info jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- profiles
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null,
  avatar_url text,
  bio text,
  can_help text,
  countries_visited text[] not null default '{}',
  trust_level int not null default 0 check (trust_level between 0 and 3),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- posts
create table posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references profiles(id) on delete set null,
  author_display_name text,
  type text not null default 'story' check (type in ('story', 'question')),
  title text not null,
  slug text unique not null,
  content text,
  html_content text,
  excerpt text,
  country_slug text references countries(slug) on delete set null,
  tags text[] not null default '{}',
  status text not null default 'draft'
    check (status in ('draft', 'pending', 'approved', 'rejected', 'hidden')),
  views int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- comments
create table comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  author_id uuid not null references profiles(id) on delete cascade,
  parent_id uuid references comments(id) on delete cascade,
  content text not null,
  status text not null default 'visible' check (status in ('visible', 'hidden')),
  created_at timestamptz not null default now()
);

-- reports
create table reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references profiles(id) on delete cascade,
  target_type text not null check (target_type in ('post', 'comment')),
  target_id uuid not null,
  reason text not null,
  status text not null default 'pending'
    check (status in ('pending', 'resolved', 'dismissed')),
  created_at timestamptz not null default now()
);

-- indexes
create index posts_country_status_created_idx on posts (country_slug, status, created_at desc);
create index posts_author_created_idx on posts (author_id, created_at desc);
create index posts_status_idx on posts (status);
create index posts_tags_gin_idx on posts using gin (tags);
create index comments_post_created_idx on comments (post_id, created_at asc);
create index comments_parent_idx on comments (parent_id) where parent_id is not null;
create index reports_status_idx on reports (status);
create index reports_target_idx on reports (target_type, target_id);
create index profiles_trust_level_idx on profiles (trust_level);
create index profiles_countries_visited_gin_idx on profiles using gin (countries_visited);
```

---

## 4. 權限設計（Row Level Security）

### 4.1 admin 判斷統一封裝（避免 RLS 遞迴）

```sql
-- supabase/migrations/00000000_002_helpers_and_triggers.sql

-- 不走 profiles RLS 的 admin 判斷
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce(
    (select trust_level >= 3 from profiles where id = auth.uid()),
    false
  );
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;
```

### 4.2 啟用 RLS

```sql
alter table countries enable row level security;
alter table profiles enable row level security;
alter table posts enable row level security;
alter table comments enable row level security;
alter table reports enable row level security;
```

### 4.3 政策

```sql
-- countries：所有人可讀；只有 admin 可寫
create policy "countries_read_all" on countries for select using (true);
create policy "countries_admin_write" on countries
  for all using (is_admin()) with check (is_admin());

-- profiles：所有人可讀；只能改自己的（trust_level 由 admin 管理 → 見 trigger）
create policy "profiles_read_all" on profiles for select using (true);
create policy "profiles_insert_own" on profiles
  for insert with check (auth.uid() = id);
create policy "profiles_update_own" on profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "profiles_admin_update" on profiles
  for update using (is_admin()) with check (is_admin());

-- posts：approved 給所有人；作者讀自己全部；admin 全讀
create policy "posts_read_visible" on posts for select using (
  status = 'approved' or auth.uid() = author_id or is_admin()
);
create policy "posts_insert_authenticated" on posts
  for insert with check (auth.uid() = author_id);
create policy "posts_update_own" on posts
  for update using (auth.uid() = author_id) with check (auth.uid() = author_id);
create policy "posts_admin_update" on posts
  for update using (is_admin()) with check (is_admin());
create policy "posts_admin_delete" on posts for delete using (is_admin());

-- comments：visible 給所有人；作者讀自己；admin 全讀
create policy "comments_read_visible" on comments for select using (
  status = 'visible' or auth.uid() = author_id or is_admin()
);
create policy "comments_insert_authenticated" on comments
  for insert with check (auth.uid() = author_id);
create policy "comments_update_own" on comments
  for update using (auth.uid() = author_id) with check (auth.uid() = author_id);
create policy "comments_admin_update" on comments
  for update using (is_admin()) with check (is_admin());

-- reports：登入者可建立、可讀自己的；admin 全讀全寫
create policy "reports_insert_authenticated" on reports
  for insert with check (auth.uid() = reporter_id);
create policy "reports_read_own" on reports
  for select using (auth.uid() = reporter_id or is_admin());
create policy "reports_admin_update" on reports
  for update using (is_admin()) with check (is_admin());
```

### 4.4 防護 Trigger（重要）

```sql
-- 1. 註冊時自動建 profile
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into profiles (id, nickname)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nickname', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- 2. updated_at 自動更新
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger profiles_set_updated_at before update on profiles
  for each row execute function set_updated_at();
create trigger posts_set_updated_at before update on posts
  for each row execute function set_updated_at();

-- 3. 新貼文依 trust_level 決定初始 status
create or replace function public.set_post_initial_status()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  user_trust int;
begin
  if new.author_id is null then
    return new; -- 站方共筆內容由 admin 直接設 status
  end if;
  select trust_level into user_trust from profiles where id = new.author_id;
  if user_trust >= 1 then
    new.status := 'approved';
  else
    new.status := 'pending';
  end if;
  return new;
end;
$$;

create trigger before_post_insert before insert on posts
  for each row execute function set_post_initial_status();

-- 4. 防止作者偷改自己貼文的 status / trust_level（關鍵防線）
create or replace function public.prevent_status_self_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if old.status is distinct from new.status and not is_admin() then
    raise exception 'status can only be changed by admin';
  end if;
  return new;
end;
$$;

create trigger posts_status_guard before update on posts
  for each row execute function prevent_status_self_change();

create or replace function public.prevent_trust_level_self_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if old.trust_level is distinct from new.trust_level and not is_admin() then
    raise exception 'trust_level can only be changed by admin';
  end if;
  return new;
end;
$$;

create trigger profiles_trust_guard before update on profiles
  for each row execute function prevent_trust_level_self_change();

-- 5. reports 累積 ≥ 3 件 pending 自動隱藏 target
create or replace function public.auto_hide_on_threshold()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  pending_count int;
begin
  select count(*) into pending_count
    from reports
    where target_type = new.target_type
      and target_id = new.target_id
      and status = 'pending';

  if pending_count >= 3 then
    if new.target_type = 'post' then
      update posts set status = 'hidden' where id = new.target_id and status != 'hidden';
    elsif new.target_type = 'comment' then
      update comments set status = 'hidden' where id = new.target_id and status != 'hidden';
    end if;
  end if;
  return new;
end;
$$;

create trigger reports_auto_hide after insert on reports
  for each row execute function auto_hide_on_threshold();
```

### 4.5 RLS 驗證 Checklist（上線前必跑）

1. 用 anon 身份嘗試 update 別人的 post → 必須失敗
2. 用 trust_level=0 的帳號發文 → status 應為 `pending`，且自己改不了
3. 用 trust_level=1 的帳號發文 → status 應為 `approved`
4. 用 anon update 自己的 trust_level → 必須失敗
5. 同一個 target 累積 3 個 reports → status 應自動變 `hidden`
6. 找另一個人 review SQL

---

## 5. 開發順序（4 週時程）

### 第 1 週：基礎建設與 schema

- [ ] 重建 Supabase 專案，記下新的 URL 與 anon key
- [ ] 刪除 `supabase/migrations/` 既有三份檔案，寫入新的兩份（schema + helpers/triggers）
- [ ] 更新 `.env.local`（dev）與 Vercel 環境變數（prod）
- [ ] `lib/mock-data.ts` → 改名 `lib/seed-content.ts`，新增腳本 `scripts/generate-seed-sql.ts` 把內容轉成 `supabase/seed.sql`
- [ ] 移除 `lib/content-mode.ts`、`lib/platform-status.ts` 及 callers，改為直接走 Supabase
- [ ] 移除 `lib/data.ts` 中所有 fallback 到 mock 的分支
- [ ] 第 4.5 節 RLS Checklist 跑過一輪

### 第 2 週：發文、閱讀、SEO 基礎

- [ ] 登入頁、註冊頁（Email + Google OAuth）
- [ ] 登出、middleware session 處理
- [ ] 重新匯入種子內容（用第 1 週產出的 seed.sql）
- [ ] 首頁、單篇貼文頁、國家頁改連 Supabase
- [ ] 發文頁面（Tiptap 編輯器，支援 sanitize）
- [ ] **SEO 基礎**：
  - 動態 metadata（每篇 post 的 title / description / og）
  - `app/sitemap.ts` 動態產出
  - `public/robots.txt`
  - 文章頁 JSON-LD（Article schema）
  - 預設 OG image（先放靜態 `public/og.png`）
- [ ] 個人頁（顯示該使用者所有 approved 貼文）

### 第 3 週：留言、檢舉、審查後台

- [ ] 留言功能（巢狀 `parent_id`，UI 限定 1 層回覆避免無限縮排）
- [ ] 留言編輯 / 刪除（自己的）
- [ ] 檢舉按鈕（post + comment 共用）+ 表單
- [ ] `/admin` 頁面（限 trust_level=3）：
  - pending posts 列表 + 一鍵 approve / reject
  - pending reports 列表 + 一鍵 resolve / dismiss
  - 升級使用者 trust_level
- [ ] 寫常用 SQL snippets 給 Supabase Studio 用（備案）

### 第 4 週：上線前打磨

- [ ] 標籤搜尋
- [ ] Cloudflare Turnstile 接到註冊與發文
- [ ] 404 / 錯誤頁
- [ ] 使用條款、隱私政策（中文版）
- [ ] 內測 + bug fix
- [ ] 備份腳本（見第 8.4）
- [ ] **延後到 MVP 後**：按讚、收藏、Email 通知

---

## 6. 審查流程

### 6.1 信任等級制度

| 等級 | 名稱 | 取得條件 | 發文行為 |
|------|------|----------|----------|
| 0 | 新手 | 註冊即得 | 發文需審核 |
| 1 | 一般 | admin 手動升級（或日後改自動） | 發文直接 approved |
| 2 | 資深 | admin 手動指派 | 同 1（保留擴充） |
| 3 | 團隊 | admin 手動指派 | 全部審查權限 |

**MVP 階段全部走手動升級。** 自動升級邏輯（如「通過 3 篇 + 註冊滿 7 天」）可延到 MVP 後做 Edge Function。

### 6.2 團隊每日操作

1. 進 `/admin` 或 Supabase Studio
2. 處理 `posts.status = 'pending'`
3. 處理 `reports.status = 'pending'`
4. 早期目標：每天 30 分鐘以內

### 6.3 常用 SQL（給 Supabase Studio）

```sql
-- 待審貼文
select p.id, p.title, p.created_at, pr.nickname, pr.trust_level
from posts p
join profiles pr on p.author_id = pr.id
where p.status = 'pending'
order by p.created_at asc;

-- 待處理檢舉
select r.id, r.target_type, r.target_id, r.reason, r.created_at, pr.nickname as reporter
from reports r
join profiles pr on r.reporter_id = pr.id
where r.status = 'pending'
order by r.created_at asc;

-- 通過貼文
update posts set status = 'approved' where id = '<post_id>';

-- 退稿
update posts set status = 'rejected' where id = '<post_id>';

-- 升級信任等級
update profiles set trust_level = 1 where id = '<user_id>';
```

---

## 7. 環境變數與專案結構

### 7.1 `.env.local`

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...      # 只在 server 端用，不可外流
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_TURNSTILE_SITE_KEY=...        # 第 4 週加
TURNSTILE_SECRET_KEY=...                  # 第 4 週加
```

### 7.2 預期資料夾結構

```
app/
  (auth)/
    login/page.tsx
    register/page.tsx
  (main)/
    page.tsx
    posts/
      [slug]/page.tsx
      new/page.tsx
    countries/
      page.tsx
      [slug]/page.tsx
    users/
      [id]/page.tsx
    about/page.tsx
  admin/
    page.tsx                # 審查後台（trust_level=3）
  sitemap.ts                # 第 2 週新增
components/
  posts/
  comments/
  ui/
lib/
  supabase/
    client.ts
    server.ts
    middleware.ts
  seed-content.ts           # 從 mock-data.ts 改名
  utils.ts
  validations.ts
  db/                       # 第 2 週起新增
    posts.ts
    comments.ts
    profiles.ts
scripts/
  generate-seed-sql.ts      # 第 1 週新增
supabase/
  migrations/
    00000000_001_initial_schema.sql
    00000000_002_helpers_and_triggers.sql
  seed.sql                  # 自動產出
middleware.ts
public/
  robots.txt
  og.png
```

---

## 8. 上線後營運

### 8.1 冷啟動策略
- 上線當天 posts 表至少有 2 篇真實內容（Sonya、長晉）+ 5–10 篇種子問題
- 早期所有發問必須在 24 小時內有人回應
- 團隊用 trust_level=3 帳號發 5–10 個常見問題作種子

### 8.2 審查節奏
- 週一、三、五各 30 分鐘處理 pending 與 reports
- 不堆積到週末

### 8.3 預期成本（前 6 個月）
- Vercel Hobby：免費
- Supabase Free Tier：免費（5 萬月活）
- 流量起來後 Supabase Pro：US$25/月
- **MVP 階段每月 0 元**

### 8.4 備份策略（第 4 週設定，重要）
Supabase Free Tier 只有 7 天 daily backup 且**暫停資料庫後需要喚醒**。

```bash
# scripts/backup.sh（cron 跑或手動）
pg_dump "postgresql://..." > backups/$(date +%Y%m%d).sql
```

- 上線前：建立每週 dump 到本機 / Google Drive 的腳本
- 上線後一個月內：確認備份能還原

---

## 9. 風險與注意事項

### 9.1 RLS 風險
RLS 寫錯就是資安漏洞。第 4.5 節 Checklist 必跑。

### 9.2 種子內容遷移細節（採方案 A）
`lib/mock-data.ts` 中的兩篇真實文章對應的 author（`user-tingying`、`user-changjin`）**沒有對應的 auth.users 記錄**。

**已決定採方案 A**：聯絡 Sonya 與長晉本人徵求同意，於 Supabase 為兩位建立 trust_level=1 帳號，把文章歸到他們名下。

**執行流程**：
1. 第 1 週：seed.sql 先把兩篇文章設成 `author_id = null` + 暫時 `author_display_name = 'Sonya' / '長晉'`，先讓站站可運行
2. 取得受訪者同意 → 邀請註冊 → admin 把帳號 trust_level 升為 1
3. 跑 UPDATE：`update posts set author_id = '<uuid>', author_display_name = null where slug = '<slug>'`
4. 此時內容歸屬正式人化

**若聯絡不上**：保持 `author_id = null` + `author_display_name`（即 v1 的方案 B），等同站方共筆 + 原作署名，UI 顯示時加上「本文由〇〇受訪、棲地無界編輯整理」。

### 9.3 法律相關
- 個資法：使用條款明示禁止 `bio` 填寫個人聯絡方式（手機/email/IG）
- 內容著作權：使用條款明示「貼文著作權歸作者，授權平台展示」
- GDPR：用了 Google OAuth 就要面對；中文使用條款裡放一段「歐盟使用者請閱讀英文版」即可
- 申訴機制：被檢舉的人有 7 天申訴期（第 4 週做或 MVP 後）

### 9.4 將來遷移
- PostgreSQL 資料可完整匯出
- 寫程式時 Supabase SDK 包一層 `lib/db/*.ts`，未來換後端時改動範圍可控（已列入第 2 週）

---

## 10. 第 1 週執行順序（具體開工指令）

1. **重建 Supabase**
   - 至 supabase.com 建立新專案（region：Asia Pacific，建議 Tokyo / Singapore / Seoul）
   - 記下 URL + anon key + service role key
   - 開啟 Email Auth + Google OAuth provider

2. **migrations 重寫**
   - 刪除 `supabase/migrations/` 既有三份
   - 新增 `00000000_001_initial_schema.sql`（第 3.3 節）
   - 新增 `00000000_002_helpers_and_triggers.sql`（第 4.1 + 4.4 節）
   - 在 Supabase SQL Editor 執行

3. **`lib/mock-data.ts` 重整**
   - rename → `lib/seed-content.ts`
   - 全專案 import path 一併更新
   - 既有兩篇內容保留不動（內容已是真實）

4. **寫 seed 腳本**
   - 新增 `scripts/generate-seed-sql.ts`：讀 `seed-content.ts` → 產 `supabase/seed.sql`
   - 在 Supabase SQL Editor 跑 seed

5. **移除 mock 模式相關檔案**
   - 刪 `lib/content-mode.ts`
   - 刪 `lib/platform-status.ts`
   - 改寫 `lib/data.ts`：移除 fallback、全部走 Supabase
   - 刪 `NEXT_PUBLIC_CONTENT_MODE` 環境變數

6. **RLS 驗證**
   - 跑第 4.5 節 Checklist

7. **commit + push**

---

## 附錄 A：參考資源

- Supabase 官方文件：https://supabase.com/docs
- Next.js + Supabase（v16 注意 breaking changes）：見 `node_modules/next/dist/docs/`
- Supabase RLS 教學：https://supabase.com/docs/guides/auth/row-level-security
- Tiptap：https://tiptap.dev/

## 附錄 B：MVP 後可擴充

- 按讚、收藏（reactions 表後補）
- Email 通知（Edge Function）
- 追蹤特定國家或作者
- 站內通知中心
- 進階搜尋（pg_trgm / 全文檢索）
- 貼文系列（連載）
- 國家知識庫與貼文雙向連結
- 多語系（英文版）
- 數據統計頁
- 自動信任等級升級邏輯
