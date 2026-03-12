import { RefObject } from 'react'

interface Props {
  editorRef: RefObject<HTMLTextAreaElement | null>
  onContentChange: (value: string) => void
}

type Action = { label: string; icon: string; prefix: string; suffix: string; block?: boolean }

const actions: Action[] = [
  { label: '粗体', icon: 'B', prefix: '**', suffix: '**' },
  { label: '斜体', icon: 'I', prefix: '*', suffix: '*' },
  { label: '删除线', icon: 'S', prefix: '~~', suffix: '~~' },
  { label: '行内代码', icon: '<>', prefix: '`', suffix: '`' },
  { label: '链接', icon: '🔗', prefix: '[', suffix: '](url)' },
  { label: '图片', icon: '🖼', prefix: '![alt](', suffix: ')' },
  { label: '标题', icon: 'H', prefix: '## ', suffix: '', block: true },
  { label: '引用', icon: '❝', prefix: '> ', suffix: '', block: true },
  { label: '代码块', icon: '{}', prefix: '```\n', suffix: '\n```', block: true },
  { label: '无序列表', icon: '•', prefix: '- ', suffix: '', block: true },
  { label: '有序列表', icon: '1.', prefix: '1. ', suffix: '', block: true },
  { label: '分割线', icon: '—', prefix: '\n---\n', suffix: '', block: true },
]

export default function MarkdownToolbar({ editorRef, onContentChange }: Props) {
  const insertMarkdown = (action: Action) => {
    const el = editorRef.current
    if (!el) return
    const start = el.selectionStart
    const end = el.selectionEnd
    const text = el.value
    const selected = text.slice(start, end)

    let newText: string
    let cursorPos: number

    if (action.block && !selected) {
      // For block elements, ensure we're on a new line
      const before = text.slice(0, start)
      const needsNewline = before.length > 0 && !before.endsWith('\n')
      const prefix = (needsNewline ? '\n' : '') + action.prefix
      newText = before + prefix + action.suffix + text.slice(end)
      cursorPos = start + prefix.length
    } else {
      newText = text.slice(0, start) + action.prefix + selected + action.suffix + text.slice(end)
      cursorPos = selected ? start + action.prefix.length + selected.length + action.suffix.length : start + action.prefix.length
    }

    onContentChange(newText)
    // Restore focus and cursor
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(cursorPos, cursorPos)
    })
  }

  return (
    <div className="flex items-center gap-0.5 px-3 py-1.5 border-b border-gray-200 bg-white overflow-x-auto">
      {actions.map((action) => (
        <button
          key={action.label}
          onClick={() => insertMarkdown(action)}
          title={action.label}
          className="px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded shrink-0"
        >
          {action.icon}
        </button>
      ))}
    </div>
  )
}
