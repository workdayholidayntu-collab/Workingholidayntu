"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { plainTextFromHtml, sanitizeUserHtml } from "@/lib/sanitize"
import { checkNewUserRateLimit } from "@/lib/rate-limit"
import { verifyTurnstileToken } from "@/lib/turnstile"
import {
  adminPostStatusSchema,
  adminReportStatusSchema,
  adminTrustLevelSchema,
  commentSchema,
  loginSchema,
  postSchema,
  profileSchema,
  registerSchema,
  reportSchema,
} from "@/lib/validations"
import { markdownLikeParagraphs, slugify } from "@/lib/utils"

export async function loginAction(formData: FormData) {
  const payload = loginSchema.parse({
    email: formData.get("email"),
    password: formData.get("password"),
  })

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.signInWithPassword(payload)
  if (error) redirect(`/login?error=${encodeURIComponent(error.message)}`)

  redirect("/profile")
}

export async function registerAction(formData: FormData) {
  const payload = registerSchema.parse({
    email: formData.get("email"),
    password: formData.get("password"),
    nickname: formData.get("nickname"),
    acceptTerms: formData.get("acceptTerms"),
  })

  const turnstile = await verifyTurnstileToken(formData.get("cfTurnstileResponse"))
  if (!turnstile.success) {
    redirect(`/register?error=${encodeURIComponent(turnstile.reason ?? "人機驗證失敗")}`)
  }

  const supabase = await createSupabaseServerClient()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  const { data, error } = await supabase.auth.signUp({
    email: payload.email,
    password: payload.password,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback`,
      data: { nickname: payload.nickname },
    },
  })

  if (error) redirect(`/register?error=${encodeURIComponent(error.message)}`)

  if (data.user) {
    await supabase.from("profiles").upsert({
      id: data.user.id,
      nickname: payload.nickname,
      countries_visited: [],
    })
  }

  redirect("/profile?welcome=1")
}

export async function signInWithGoogleAction() {
  const supabase = await createSupabaseServerClient()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  const { data } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${siteUrl}/auth/callback` },
  })

  redirect(data.url ?? "/login?error=Google%20登入初始化失敗")
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()

  redirect("/")
}

export async function createPostAction(formData: FormData) {
  const payload = postSchema.parse({
    countrySlug: formData.get("countrySlug"),
    title: formData.get("title"),
    excerpt: formData.get("excerpt"),
    tags: formData.get("tags"),
    content: formData.get("content"),
    htmlContent: formData.get("htmlContent"),
  })

  const turnstile = await verifyTurnstileToken(formData.get("cfTurnstileResponse"))
  if (!turnstile.success) {
    redirect(`/posts/new?error=${encodeURIComponent(turnstile.reason ?? "人機驗證失敗")}`)
  }

  const sanitizedHtml = sanitizeUserHtml(payload.htmlContent)
  const sanitizedPlain = plainTextFromHtml(sanitizedHtml)

  if (sanitizedPlain.length < 30) {
    redirect("/posts/new?error=" + encodeURIComponent("文章內容過短或包含被過濾的元素，請重新輸入"))
  }

  const baseSlug = slugify(payload.title)
  const slug = baseSlug ? `${baseSlug}-${Date.now().toString(36)}` : `post-${Date.now()}`
  const tags = payload.tags?.split(",").map((item) => item.trim()).filter(Boolean)

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login?error=請先登入後再投稿")

  const limited = await checkNewUserRateLimit(supabase, user.id, "post")
  if (limited) {
    redirect(`/posts/new?error=${encodeURIComponent(limited)}`)
  }

  const { error } = await supabase.from("posts").insert({
    country_slug: payload.countrySlug,
    title: payload.title,
    slug,
    excerpt: payload.excerpt,
    content: sanitizedPlain,
    html_content: sanitizedHtml,
    tags,
    author_id: user.id,
  })

  if (error) redirect(`/posts/new?error=${encodeURIComponent(error.message)}`)

  redirect(`/posts/${slug}?created=1`)
}

export async function createCommentAction(formData: FormData) {
  const payload = commentSchema.parse({
    postId: formData.get("postId"),
    parentId: formData.get("parentId") || undefined,
    content: formData.get("content"),
  })

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login?error=" + encodeURIComponent("請先登入後再留言"))

  const limited = await checkNewUserRateLimit(supabase, user.id, "comment")

  // Look up the post slug for redirect + cascade-validate parent_id belongs to
  // the same post (defence in depth — RLS already requires the post be visible).
  const { data: post, error: postError } = await supabase
    .from("posts")
    .select("slug")
    .eq("id", payload.postId)
    .maybeSingle()

  if (postError || !post) {
    redirect("/?error=" + encodeURIComponent("找不到對應文章"))
  }

  if (limited) {
    redirect(`/posts/${post.slug}?error=${encodeURIComponent(limited)}#comments`)
  }

  const safeHtml = sanitizeUserHtml(markdownLikeParagraphs(payload.content))

  // Enforce 1-level nesting: if replying to a comment, force parent_id to that
  // comment's *root*, so reply-of-reply still attaches at depth=1.
  let parentId: string | null = null
  if (payload.parentId) {
    const { data: parent } = await supabase
      .from("comments")
      .select("id, parent_id, post_id")
      .eq("id", payload.parentId)
      .maybeSingle()

    if (parent && parent.post_id === payload.postId) {
      parentId = parent.parent_id ?? parent.id
    }
  }

  const { error } = await supabase.from("comments").insert({
    post_id: payload.postId,
    parent_id: parentId,
    author_id: user.id,
    content: safeHtml,
  })

  if (error) {
    redirect(`/posts/${post.slug}?error=${encodeURIComponent(error.message)}#comments`)
  }

  revalidatePath(`/posts/${post.slug}`)
  redirect(`/posts/${post.slug}#comments`)
}

export async function deleteCommentAction(formData: FormData) {
  const commentId = String(formData.get("commentId") ?? "")
  const slug = String(formData.get("slug") ?? "")
  if (!commentId || !slug) redirect("/")

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login?error=" + encodeURIComponent("請先登入"))

  // RLS comments_owner_delete restricts to author or admin.
  await supabase.from("comments").delete().eq("id", commentId)

  revalidatePath(`/posts/${slug}`)
  redirect(`/posts/${slug}#comments`)
}

export async function createReportAction(formData: FormData) {
  const payload = reportSchema.parse({
    targetType: formData.get("targetType"),
    targetId: formData.get("targetId"),
    reason: formData.get("reason"),
  })
  const returnTo = String(formData.get("returnTo") ?? "/")

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login?error=" + encodeURIComponent("請先登入後再檢舉"))

  const { error } = await supabase.from("reports").insert({
    reporter_id: user.id,
    target_type: payload.targetType,
    target_id: payload.targetId,
    reason: payload.reason,
  })

  if (error) {
    redirect(`${returnTo}?error=${encodeURIComponent(error.message)}`)
  }

  redirect(`${returnTo}?reported=1`)
}

async function requireAdmin() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login?error=" + encodeURIComponent("請先登入"))

  const { data: profile } = await supabase
    .from("profiles")
    .select("trust_level")
    .eq("id", user.id)
    .maybeSingle()

  if (!profile || profile.trust_level < 3) {
    redirect("/?error=" + encodeURIComponent("沒有權限"))
  }

  return supabase
}

export async function setPostStatusAction(formData: FormData) {
  const payload = adminPostStatusSchema.parse({
    postId: formData.get("postId"),
    status: formData.get("status"),
  })

  const supabase = await requireAdmin()
  await supabase.from("posts").update({ status: payload.status }).eq("id", payload.postId)

  revalidatePath("/admin")
  revalidatePath("/")
  redirect("/admin")
}

export async function setReportStatusAction(formData: FormData) {
  const payload = adminReportStatusSchema.parse({
    reportId: formData.get("reportId"),
    status: formData.get("status"),
  })

  const supabase = await requireAdmin()
  await supabase
    .from("reports")
    .update({ status: payload.status })
    .eq("id", payload.reportId)

  revalidatePath("/admin")
  redirect("/admin")
}

export async function setTrustLevelAction(formData: FormData) {
  const payload = adminTrustLevelSchema.parse({
    userId: formData.get("userId"),
    trustLevel: formData.get("trustLevel"),
  })

  const supabase = await requireAdmin()
  await supabase
    .from("profiles")
    .update({ trust_level: payload.trustLevel })
    .eq("id", payload.userId)

  revalidatePath("/admin")
  redirect("/admin")
}

export async function updateProfileAction(formData: FormData) {
  const payload = profileSchema.parse({
    nickname: formData.get("nickname"),
    bio: formData.get("bio"),
    canHelp: formData.get("canHelp"),
    countriesVisited: formData.get("countriesVisited"),
  })

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login?error=請先登入後再更新個人檔案")

  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    nickname: payload.nickname,
    bio: payload.bio,
    can_help: payload.canHelp,
    countries_visited: payload.countriesVisited?.split(",").map((item) => item.trim()).filter(Boolean),
  })

  if (error) redirect(`/profile?error=${encodeURIComponent(error.message)}`)

  redirect("/profile?saved=1")
}
