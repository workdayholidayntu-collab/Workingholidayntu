// Server-side HTML sanitization for user-submitted post / comment content.
// Per SECURITY.md §5.2.3: sanitize before storing AND before rendering.

import DOMPurify from "isomorphic-dompurify"

const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "em",
  "u",
  "s",
  "code",
  "pre",
  "h2",
  "h3",
  "h4",
  "ul",
  "ol",
  "li",
  "blockquote",
  "hr",
  "a",
]

const ALLOWED_ATTR = ["href", "title", "target", "rel"]

export function sanitizeUserHtml(html: string | null | undefined): string {
  if (!html) return ""

  const cleaned = DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOWED_URI_REGEXP: /^(?:https?|mailto):/i,
    FORBID_TAGS: ["script", "style", "iframe", "object", "embed", "form", "img"],
    FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover", "style"],
  })

  // Force external links to open safely.
  return cleaned.replace(
    /<a\s+([^>]*?)href="(https?:\/\/[^"]+)"([^>]*)>/gi,
    (_match, before: string, href: string, after: string) => {
      const attrs = `${before}${after}`.replace(/\s+(target|rel)="[^"]*"/gi, "")
      return `<a ${attrs.trim()} href="${href}" target="_blank" rel="noopener noreferrer nofollow">`
    },
  )
}

export function plainTextFromHtml(html: string | null | undefined): string {
  if (!html) return ""
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}
