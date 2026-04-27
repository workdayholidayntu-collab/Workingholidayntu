export type VisaInfo = {
  overview: string
  ageRange: string
  quota: string
  stayDuration: string
  estimatedBudget: string
  processingTime: string
  steps: string[]
  checklist: string[]
}

export type Country = {
  id: string
  slug: string
  name_zh: string
  name_en: string
  flag_emoji: string | null
  visa_info: VisaInfo
  created_at: string
}

export type PostStatus = "draft" | "pending" | "approved" | "rejected" | "hidden"

export type PostType = "story" | "question"

export type Post = {
  id: string
  country_slug: string | null
  title: string
  slug: string
  content: string | null
  html_content: string | null
  excerpt: string | null
  author_id: string | null
  author_display_name: string | null
  type: PostType
  status: PostStatus
  tags: string[]
  views: number
  created_at: string
  updated_at: string
}

export type TrustLevel = 0 | 1 | 2 | 3

export type Profile = {
  id: string
  nickname: string
  avatar_url: string | null
  countries_visited: string[]
  bio: string | null
  can_help: string | null
  trust_level: TrustLevel
  created_at: string
  updated_at: string
}

export type CommentStatus = "visible" | "hidden"

export type Comment = {
  id: string
  post_id: string
  author_id: string
  parent_id: string | null
  content: string
  status: CommentStatus
  created_at: string
  profile?: Pick<Profile, "nickname" | "avatar_url" | "trust_level">
}

export type Viewer = {
  userId: string | null
  email: string | null
  profile: Profile | null
}
