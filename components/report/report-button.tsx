import { createReportAction } from "@/app/actions"
import { SubmitButton } from "@/components/ui/submit-button"

interface ReportButtonProps {
  targetType: "post" | "comment"
  targetId: string
  returnTo: string
}

export function ReportButton({ targetType, targetId, returnTo }: ReportButtonProps) {
  return (
    <details className="inline-block">
      <summary className="cursor-pointer text-[var(--muted-ink)] hover:text-red-600">
        檢舉
      </summary>
      <form
        action={createReportAction}
        className="mt-2 w-72 space-y-2 rounded-2xl border border-[var(--line)] bg-white p-3"
      >
        <input type="hidden" name="targetType" value={targetType} />
        <input type="hidden" name="targetId" value={targetId} />
        <input type="hidden" name="returnTo" value={returnTo} />
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted-ink)]">
          檢舉原因
        </p>
        <textarea
          name="reason"
          required
          minLength={5}
          maxLength={500}
          rows={3}
          placeholder="請描述為何此內容違規（≥ 5 字）"
          className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-xs text-[var(--ink)] outline-none focus:border-[var(--brand)]"
        />
        <SubmitButton
          className="!bg-red-600 hover:!bg-red-700 !text-white !shadow-none !px-3 !py-1.5 !text-[11px]"
          pendingLabel="送出中…"
        >
          送出檢舉
        </SubmitButton>
        <p className="text-[10px] text-[var(--muted-ink)]">
          累積三件未處理檢舉時，內容會自動隱藏待棲地無界編輯部審核。
        </p>
      </form>
    </details>
  )
}
