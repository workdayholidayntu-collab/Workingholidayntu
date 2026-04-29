import { LoadingState } from "@/components/ui/spinner"

export default function Loading() {
  return (
    <main className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4">
      <LoadingState label="棲地無界正在整理頁面內容…" />
    </main>
  )
}
