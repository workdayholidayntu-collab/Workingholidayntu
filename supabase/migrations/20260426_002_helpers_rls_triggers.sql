-- Helpers, RLS policies, and triggers
-- See docs/borderless-habitat-plan.md §4 for design rationale.

-- ============================================================================
-- 1. is_admin() helper (avoids RLS recursion via SECURITY DEFINER)
-- ============================================================================

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

-- ============================================================================
-- 2. Enable RLS on all tables
-- ============================================================================

alter table countries enable row level security;
alter table profiles enable row level security;
alter table posts enable row level security;
alter table comments enable row level security;
alter table reports enable row level security;

-- ============================================================================
-- 3. RLS policies
-- ============================================================================

-- countries: 所有人可讀；admin 可寫
create policy "countries_read_all" on countries
  for select using (true);

create policy "countries_admin_write" on countries
  for all using (is_admin()) with check (is_admin());

-- profiles: 所有人可讀；自己可改自己（trust_level 由 trigger 額外保護）
create policy "profiles_read_all" on profiles
  for select using (true);

create policy "profiles_insert_own" on profiles
  for insert with check (auth.uid() = id);

create policy "profiles_update_own" on profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "profiles_admin_update" on profiles
  for update using (is_admin()) with check (is_admin());

-- posts: approved 給所有人；作者讀自己全部；admin 全讀全寫
create policy "posts_read_visible" on posts
  for select using (
    status = 'approved'
    or auth.uid() = author_id
    or is_admin()
  );

create policy "posts_insert_authenticated" on posts
  for insert with check (auth.uid() = author_id);

create policy "posts_update_own" on posts
  for update using (auth.uid() = author_id) with check (auth.uid() = author_id);

create policy "posts_admin_update" on posts
  for update using (is_admin()) with check (is_admin());

create policy "posts_admin_delete" on posts
  for delete using (is_admin());

-- comments: visible 給所有人；作者讀自己；admin 全讀全寫
create policy "comments_read_visible" on comments
  for select using (
    status = 'visible'
    or auth.uid() = author_id
    or is_admin()
  );

create policy "comments_insert_authenticated" on comments
  for insert with check (auth.uid() = author_id);

create policy "comments_update_own" on comments
  for update using (auth.uid() = author_id) with check (auth.uid() = author_id);

create policy "comments_admin_update" on comments
  for update using (is_admin()) with check (is_admin());

create policy "comments_owner_delete" on comments
  for delete using (auth.uid() = author_id or is_admin());

-- reports: 登入者可建立；可讀自己提交的；admin 全讀全寫
create policy "reports_insert_authenticated" on reports
  for insert with check (auth.uid() = reporter_id);

create policy "reports_read_own" on reports
  for select using (auth.uid() = reporter_id or is_admin());

create policy "reports_admin_update" on reports
  for update using (is_admin()) with check (is_admin());

-- ============================================================================
-- 4. Triggers
-- ============================================================================

-- 4.1 註冊時自動建 profile
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
    coalesce(
      new.raw_user_meta_data ->> 'nickname',
      split_part(coalesce(new.email, ''), '@', 1),
      '匿名使用者'
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 4.2 updated_at 自動更新
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on profiles;
create trigger profiles_set_updated_at
  before update on profiles
  for each row execute function public.set_updated_at();

drop trigger if exists posts_set_updated_at on posts;
create trigger posts_set_updated_at
  before update on posts
  for each row execute function public.set_updated_at();

-- 4.3 新貼文依 trust_level 決定初始 status
create or replace function public.set_post_initial_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  user_trust int;
begin
  -- 站方共筆內容 (author_id is null)：保留呼叫端設定的 status (預設 draft)
  if new.author_id is null then
    return new;
  end if;

  select trust_level into user_trust from profiles where id = new.author_id;

  if user_trust is null then
    new.status := 'pending';
  elsif user_trust >= 1 then
    new.status := 'approved';
  else
    new.status := 'pending';
  end if;

  return new;
end;
$$;

drop trigger if exists before_post_insert on posts;
create trigger before_post_insert
  before insert on posts
  for each row execute function public.set_post_initial_status();

-- 4.4 防止作者偷改自己貼文的 status（關鍵防線）
-- service role / 無 auth context（Supabase Studio、後端 admin 任務）放行
create or replace function public.prevent_status_self_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    return new;
  end if;
  if old.status is distinct from new.status and not is_admin() then
    raise exception 'status can only be changed by admin';
  end if;
  return new;
end;
$$;

drop trigger if exists posts_status_guard on posts;
create trigger posts_status_guard
  before update on posts
  for each row execute function public.prevent_status_self_change();

-- 4.5 防止使用者偷改自己 profile 的 trust_level
-- service role / 無 auth context 放行（同 prevent_status_self_change）
create or replace function public.prevent_trust_level_self_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    return new;
  end if;
  if old.trust_level is distinct from new.trust_level and not is_admin() then
    raise exception 'trust_level can only be changed by admin';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_trust_guard on profiles;
create trigger profiles_trust_guard
  before update on profiles
  for each row execute function public.prevent_trust_level_self_change();

-- 4.6 reports 累積 ≥ 3 件 pending 自動隱藏 target
create or replace function public.auto_hide_on_threshold()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
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
      update posts
        set status = 'hidden'
        where id = new.target_id and status != 'hidden';
    elsif new.target_type = 'comment' then
      update comments
        set status = 'hidden'
        where id = new.target_id and status != 'hidden';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists reports_auto_hide on reports;
create trigger reports_auto_hide
  after insert on reports
  for each row execute function public.auto_hide_on_threshold();
