import { z } from "zod"

export const loginSchema = z.object({
  email: z.email("請輸入有效的 Email"),
  password: z.string().min(8, "密碼至少需要 8 個字元"),
})

export const registerSchema = loginSchema.extend({
  password: z
    .string()
    .min(8, "密碼至少需要 8 個字元")
    .regex(/[A-Za-z]/, "密碼需包含至少一個英文字母")
    .regex(/[0-9]/, "密碼需包含至少一個數字"),
  nickname: z.string().min(2, "暱稱至少需要 2 個字元").max(30, "暱稱最多 30 個字元"),
  acceptTerms: z
    .union([z.literal("on"), z.literal("true"), z.literal(true), z.boolean()])
    .refine((value) => value === "on" || value === "true" || value === true, {
      message: "請勾選同意使用條款與隱私政策",
    }),
})

export const postSchema = z.object({
  countrySlug: z.string().min(1, "請選擇目的地"),
  title: z.string().min(6, "標題至少需要 6 個字元").max(120, "標題最多 120 個字元"),
  excerpt: z.string().min(20, "摘要至少需要 20 個字元").max(220, "摘要最多 220 個字元"),
  tags: z.string().optional(),
  content: z.string().min(30, "文章內容至少需要 30 個字元"),
  htmlContent: z.string().min(1, "請先輸入文章內容"),
})

export const profileSchema = z.object({
  nickname: z.string().min(2, "暱稱至少需要 2 個字元").max(30, "暱稱最多 30 個字元"),
  bio: z.string().max(240, "自我介紹最多 240 個字元").optional(),
  canHelp: z.string().max(240, "可協助項目最多 240 個字元").optional(),
  countriesVisited: z.string().optional(),
})

export const commentSchema = z.object({
  postId: z.string().uuid("無效的文章 ID"),
  parentId: z.string().uuid().optional().or(z.literal("").transform(() => undefined)),
  content: z
    .string()
    .min(2, "留言至少需要 2 個字元")
    .max(2000, "留言最多 2000 個字元"),
})

export const reportSchema = z.object({
  targetType: z.enum(["post", "comment"]),
  targetId: z.string().uuid("無效的檢舉目標"),
  reason: z
    .string()
    .min(5, "請至少描述 5 個字元的檢舉原因")
    .max(500, "原因最多 500 個字元"),
})

export const adminPostStatusSchema = z.object({
  postId: z.string().uuid(),
  status: z.enum(["approved", "rejected", "hidden", "pending"]),
})

export const adminReportStatusSchema = z.object({
  reportId: z.string().uuid(),
  status: z.enum(["resolved", "dismissed"]),
})

export const adminTrustLevelSchema = z.object({
  userId: z.string().uuid(),
  trustLevel: z.coerce.number().int().min(0).max(3),
})
