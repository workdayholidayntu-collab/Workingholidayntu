// Server-side HTML sanitization for user-submitted post / comment content.
// Per SECURITY.md §5.2.3: sanitize before storing AND before rendering.
//
// Uses sanitize-html (pure JS, no jsdom) instead of isomorphic-dompurify so
// the bundle works inside Vercel's Node serverless runtime — jsdom transitively
// pulls @exodus/bytes which is ESM-only and breaks `require()` there.

import sanitizeHtml from "sanitize-html"

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

export function sanitizeUserHtml(html: string | null | undefined): string {
  if (!html) return ""

  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    disallowedTagsMode: "discard",
    transformTags: {
      a: (tagName, attribs) => ({
        tagName: "a",
        attribs: {
          ...attribs,
          target: "_blank",
          rel: "noopener noreferrer nofollow",
        },
      }),
    },
  })
}

export function plainTextFromHtml(html: string | null | undefined): string {
  if (!html) return ""
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}
