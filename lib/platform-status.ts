import { getContentMode, shouldUseLiveData } from "@/lib/content-mode"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { hasSupabaseEnv } from "@/lib/supabase"

export type PlatformStatus =
  | { mode: "demo"; message: string }
  | { mode: "live"; message: string }

export async function getPlatformStatus(): Promise<PlatformStatus> {
  const mode = getContentMode()

  if (mode === "mock") {
    return {
      mode: "demo",
      message: "網站內容持續更新中，部分國家資訊仍在整理。",
    }
  }

  if (!hasSupabaseEnv) {
    return {
      mode: "demo",
      message: "網站內容持續更新中，部分功能尚在建置。",
    }
  }

  try {
    if (!shouldUseLiveData()) {
      return {
        mode: "demo",
        message: "網站內容持續更新中，部分國家資訊仍在整理。",
      }
    }

    const supabase = await createSupabaseServerClient()
    const { error } = await supabase.from("countries").select("slug").limit(1)

    if (error) {
      return {
        mode: "demo",
        message: "資料庫連線設定中，目前顯示預設內容。",
      }
    }

    return {
      mode: "live",
      message: "已連線資料庫，顯示最新內容。",
    }
  } catch {
    return {
      mode: "demo",
      message: "暫時無法連線資料庫，目前顯示預設內容。",
    }
  }
}
