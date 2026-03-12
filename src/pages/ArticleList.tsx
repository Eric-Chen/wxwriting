import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useArticleStore } from '../stores/articleStore'
import { useCategoryStore } from '../stores/categoryStore'

const statusLabels: Record<string, string> = {
  draft: '草稿',
  pending: '待发布',
  published: '已发布',
  failed: '发布失败',
}

const statusColors: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-600',
  pending: 'bg-amber-50 text-amber-700',
  published: 'bg-emerald-50 text-emerald-700',
  failed: 'bg-red-50 text-red-600',
}

export default function ArticleList() {
  const navigate = useNavigate()
  const { articles, loading, fetchArticles, setFilter, deleteArticle } = useArticleStore()
  const { categories, fetchCategories } = useCategoryStore()
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchArticles()
    fetchCategories()
  }, [])

  const handleCreate = async () => {
    navigate('/articles/new')
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('确定要删除这篇文章吗？')) {
      await deleteArticle(id)
    }
  }

  const handleSearch = (value: string) => {
    setSearch(value)
    setFilter('search', value || null)
  }

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">文章管理</h2>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-[var(--color-brand-600)] text-white rounded-lg text-[13px] font-medium hover:bg-[var(--color-brand-700)] active:scale-[0.98] transition-all"
        >
          + 新建文章
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="搜索文章..."
            className="w-full pl-9 pr-3 py-2 border border-[var(--color-border)] rounded-lg text-[13px] bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]/20 focus:border-[var(--color-brand-500)] placeholder:text-[var(--color-text-muted)]"
          />
        </div>
        <select
          onChange={(e) => setFilter('categoryId', e.target.value || null)}
          className="px-3 py-2 border border-[var(--color-border)] rounded-lg text-[13px] bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]/20"
        >
          <option value="">全部分类</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          onChange={(e) => setFilter('status', e.target.value || null)}
          className="px-3 py-2 border border-[var(--color-border)] rounded-lg text-[13px] bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]/20"
        >
          <option value="">全部状态</option>
          <option value="draft">草稿</option>
          <option value="pending">待发布</option>
          <option value="published">已发布</option>
        </select>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm">加载中...</span>
          </div>
        </div>
      ) : articles.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <svg className="w-16 h-16 text-[var(--color-border)] mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
          </svg>
          <p className="text-[var(--color-text-secondary)] text-sm mb-1">还没有文章</p>
          <p className="text-[var(--color-text-muted)] text-xs mb-4">点击上方按钮创建你的第一篇文章</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-1">
          {articles.map((article) => (
            <div
              key={article.id}
              className="flex items-center px-4 py-3 bg-[var(--color-surface)] rounded-lg border border-[var(--color-border-light)] hover:border-[var(--color-border)] hover:shadow-sm transition-all group"
            >
              <div
                className="flex-1 min-w-0 cursor-pointer"
                onClick={() => navigate(`/articles/${article.id}/edit`)}
              >
                <h3 className="text-[13px] font-medium text-[var(--color-text-primary)] truncate">
                  {article.title || '未命名文章'}
                </h3>
                <div className="flex items-center gap-2.5 mt-1.5">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${statusColors[article.status]}`}>
                    {statusLabels[article.status]}
                  </span>
                  <span className="text-[11px] text-[var(--color-text-muted)]">{article.updated_at}</span>
                </div>
              </div>
              <button
                onClick={() => handleDelete(article.id)}
                className="ml-4 text-[12px] text-[var(--color-text-muted)] hover:text-[var(--color-danger)] opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="删除文章"
              >
                删除
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}