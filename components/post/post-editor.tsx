"use client"

import { useEffect, useState } from "react"
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { Bold, Heading2, Italic, List } from "lucide-react"
import { cn } from "@/lib/utils"

interface PostEditorProps {
  contentName?: string
  htmlName?: string
  initialHtml?: string
}

export function PostEditor({
  contentName = "content",
  htmlName = "htmlContent",
  initialHtml = "",
}: PostEditorProps) {
  const [html, setHtml] = useState(initialHtml)
  const [plain, setPlain] = useState("")

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
    ],
    content: initialHtml || "",
    editorProps: {
      attributes: {
        class:
          "prose-whv min-h-[320px] rounded-2xl border border-[var(--line)] bg-white px-5 py-4 text-base outline-none focus:border-[var(--brand)]",
      },
    },
    onUpdate: ({ editor }) => {
      setHtml(editor.getHTML())
      setPlain(editor.getText())
    },
    immediatelyRender: false,
  })

  useEffect(() => {
    if (editor && initialHtml && !editor.getText()) {
      editor.commands.setContent(initialHtml)
    }
  }, [editor, initialHtml])

  if (!editor) {
    return (
      <div className="min-h-[320px] rounded-2xl border border-dashed border-[var(--line)] bg-white/40 p-5 text-sm text-[var(--muted-ink)]">
        編輯器載入中⋯
      </div>
    )
  }

  const toolbarBtn = (active: boolean) =>
    cn(
      "inline-flex h-9 w-9 items-center justify-center rounded-xl border border-transparent text-[var(--muted-ink)] transition hover:bg-white",
      active && "border-[var(--line)] bg-white text-[var(--ink)]",
    )

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-1 rounded-2xl bg-[var(--sand)] p-1">
        <button
          type="button"
          aria-label="Heading 2"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={toolbarBtn(editor.isActive("heading", { level: 2 }))}
        >
          <Heading2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="粗體"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={toolbarBtn(editor.isActive("bold"))}
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="斜體"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={toolbarBtn(editor.isActive("italic"))}
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="清單"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={toolbarBtn(editor.isActive("bulletList"))}
        >
          <List className="h-4 w-4" />
        </button>
        <span className="ml-auto px-3 text-xs text-[var(--muted-ink)]">
          {plain.length} 字
        </span>
      </div>

      <EditorContent editor={editor} />

      {/* Hidden fields so the form action receives the editor output. */}
      <input type="hidden" name={contentName} value={plain} />
      <input type="hidden" name={htmlName} value={html} />
    </div>
  )
}
