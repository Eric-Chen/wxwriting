import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useArticleStore } from '../stores/articleStore'
import { useCategoryStore } from '../stores/categoryStore'
import { markdownToWxHtml } from '../utils/markdownToWx'
import MarkdownToolbar from '../components/MarkdownToolbar'
import HtmlExport from '../components/HtmlExport'
import { invoke } from '@tauri-apps/api/core'

export default function ArticleEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { createArticle, updateArticle, getArticle } = useArticleStore()
  const { categories, fetchCategories } = useCategoryStore()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [author, setAuthor] = useState('')
  const [digest, setDigest] = useState('')
  const [previewHtml, setPreviewHtml] = useState('')
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [showPreview, setShowPreview] = useState(true)
  const [showHtmlExport, setShowHtmlExport] = useState(false)
  const editorRef = useRef<HTMLTextAreaElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const isNew = !id

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  useEffect(() => {
    if (id) {
      getArticle(id).then((article) => {
        setTitle(article.title)
        setContent(article.content)
        setCategoryId(article.category_id)
        setAuthor(article.author)
        setDigest(article.digest)
      })
    }
  }, [id, getArticle])

  // Debounced preview update
  useEffect(() => {
    const timer = setTimeout(() => {
      setPreviewHtml(markdownToWxHtml(content))
    }, 300)
    return () => clearTimeout(timer)
  }, [content])

  // Sync scroll between editor and preview
  const handleEditorScroll = useCallback(() => {
    if (!editorRef.current || !previewRef.current) return
    const editor = editorRef.current
    const ratio = editor.scrollTop / (editor.scrollHeight - editor.clientHeight || 1)
    const preview = previewRef.current
    preview.scrollTop = ratio * (preview.scrollHeight - preview.clientHeight)
  }, [])

  const handleSave = async (asDraft = true) => {
    if (!title.trim()) return
    setSaving(true)
    try {
      const htmlContent = markdownToWxHtml(content)
      const status = asDraft ? 'draft' : 'pending'
      if (isNew) {
        const article = await createArticle(title, content)
        await updateArticle({
          id: article.id, title, content, htmlContent,
          categoryId, status, coverImageId: null, author, digest,
        })
        navigate(`/articles/${article.id}/edit`, { replace: true })
      } else {
        await updateArticle({
          id: id!, title, content, htmlContent,
          categoryId, status, coverImageId: null, author, digest,
        })
      }
    } finally {
      setSaving(false)
    }
  }

  const handlePublish = async () => {
    if (!id || !title.trim()) return
    setPublishing(true)
    try {
      // Save first
      const htmlContent = markdownToWxHtml(content)
      await updateArticle({
        id, title, content, htmlContent,
        categoryId, status: 'pending', coverImageId: null, author, digest,
      })
      // Try auto-publish via WeChat API
      await invoke('publish_article_to_wx', {
        articleId: id,
        thumbMediaId: '', // TODO: use cover image media_id
      })
      alert('发布成功！草稿已创建到微信公众号。')
    } catch (e) {
      // API failed, offer manual fallback
      const useManual = window.confirm(`自动发布失败: ${e}\n\n是否导出 HTML 手动发布？`)
      if (useManual) {
        setShowHtmlExport(true)
      }
    } finally {
      setPublishing(false)
    }
  }

  // Keyboard shortcut: Ctrl/Cmd+S to save
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        handleSave(true)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [title, content, categoryId, author, digest])

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-white shrink-0">
        <button
          onClick={() => navigate('/articles')}
          className="text-gray-500 hover:text-gray-700 text-sm"
        >
          ← 返回
        </button>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="文章标题"
          className="flex-1 text-lg font-medium border-none outline-none bg-transparent"
        />
        <button
          onClick={() => setShowPreview(!showPreview)}
          className={`px-3 py-1.5 text-sm rounded ${showPreview ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}
        >
          {showPreview ? '隐藏预览' : '显示预览'}
        </button>
        <button
          onClick={() => handleSave(true)}
          disabled={saving || !title.trim()}
          className="px-4 py-1.5 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
        >
          {saving ? '保存中...' : '保存草稿'}
        </button>
        <button
          onClick={() => handleSave(false)}
          disabled={saving || !title.trim()}
          className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          待发布
        </button>
        {!isNew && (
          <>
            <button
              onClick={handlePublish}
              disabled={publishing || !title.trim()}
              className="px-4 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              {publishing ? '发布中...' : '发布到微信'}
            </button>
            <button
              onClick={() => setShowHtmlExport(true)}
              className="px-3 py-1.5 text-sm bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
            >
              导出HTML
            </button>
          </>
        )}
      </div>

      {/* Editor + Preview */}
      <div className="flex flex-1 min-h-0">
        {/* Editor panel */}
        <div className={`flex flex-col ${showPreview ? 'w-1/2' : 'w-full'} border-r border-gray-200`}>
          <MarkdownToolbar editorRef={editorRef} onContentChange={setContent} />
          <textarea
            ref={editorRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onScroll={handleEditorScroll}
            placeholder="在此输入 Markdown 内容..."
            className="flex-1 p-4 resize-none outline-none font-mono text-sm leading-relaxed bg-gray-50"
            spellCheck={false}
          />
        </div>

        {/* Preview panel */}
        {showPreview && (
          <div className="w-1/2 flex flex-col">
            <div className="px-4 py-2 text-xs text-gray-400 border-b border-gray-100 bg-white shrink-0">
              微信预览
            </div>
            <div
              ref={previewRef}
              className="flex-1 overflow-y-auto p-6 bg-white"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </div>
        )}
      </div>

      {/* Bottom metadata bar */}
      <div className="flex items-center gap-4 px-4 py-2.5 border-t border-gray-200 bg-gray-50 shrink-0 text-sm">
        <label className="flex items-center gap-1.5 text-gray-600">
          分类
          <select
            value={categoryId || ''}
            onChange={(e) => setCategoryId(e.target.value || null)}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          >
            <option value="">无分类</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-1.5 text-gray-600">
          作者
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="作者名"
            className="border border-gray-300 rounded px-2 py-1 w-28 text-sm"
          />
        </label>
        <label className="flex items-center gap-1.5 text-gray-600 flex-1">
          摘要
          <input
            type="text"
            value={digest}
            onChange={(e) => setDigest(e.target.value)}
            placeholder="文章摘要（可选）"
            className="border border-gray-300 rounded px-2 py-1 flex-1 text-sm"
          />
        </label>
      </div>

      {/* HTML Export Modal */}
      {showHtmlExport && (
        <HtmlExport
          html={markdownToWxHtml(content)}
          onClose={() => setShowHtmlExport(false)}
        />
      )}
    </div>
  )
}
