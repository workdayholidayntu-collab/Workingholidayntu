-- Initial schema for Borderless Habitat (社群平台 v2)
-- See docs/borderless-habitat-plan.md §3 for design rationale.

create extension if not exists pgcrypto;

-- countries -----------------------------------------------------------------
create table countries (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name_zh text not null,
  name_en text not null,
  flag_emoji text,
  visa_info jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- profiles ------------------------------------------------------------------
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

-- posts ---------------------------------------------------------------------
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

-- comments (with nesting via parent_id) -------------------------------------
create table comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  author_id uuid not null references profiles(id) on delete cascade,
  parent_id uuid references comments(id) on delete cascade,
  content text not null,
  status text not null default 'visible' check (status in ('visible', 'hidden')),
  created_at timestamptz not null default now()
);

-- reports -------------------------------------------------------------------
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

-- indexes -------------------------------------------------------------------
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
