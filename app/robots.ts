import type { MetadataRoute } from "next"
import { buildUrl } from "@/lib/utils"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/auth/", "/admin", "/api/", "/profile", "/posts/new"],
      },
    ],
    sitemap: buildUrl("/sitemap.xml"),
  }
}
