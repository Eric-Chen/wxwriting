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
  draft: 'bg-gray-100 text-gray-600',
  pending: 'bg-yellow-100 text-yellow-700',
  published: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
}

export default function ArticleList() {
  const navigate = useNavigate()
  const { articles, loading, filters, fetchArticles, setFilter, createArticle, deleteArticle } = useArticleStore()
  const { categories, fetchCategories } = useCategoryStore()
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchArticles()
    fetchCategories()
  }, [])

  const handleCreate = async () => {
    const article = await createArticle('未命名文章', '')
    navigate(`/articles/${article.id}/edit`)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('确定要删除这篇文章吗？')) {
      await deleteArticle(id)
    }
  }

  const handleSearch = () => {
    setFilter('search', search || null)
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">文章管理</h2>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
        >
          + 新建文章
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="搜索文章..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button onClick={handleSearch} className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm hover:bg-gray-200">
            搜索
          </button>
        </div>
        <select
          value={filters.categoryId || ''}
          onChange={(e) => setFilter('categoryId', e.target.value || null)}
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">全部分类</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          value={filters.status || ''}
          onChange={(e) => setFilter('status', e.target.value || null)}
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">全部状态</option>
          <option value="draft">草稿</option>
          <option value="pending">待发布</option>
          <option value="published">已发布</option>
          <option value="failed">发布失败</option>
        </select>
      </div>

      {/* Article List */}
      {loading ? (
        <p className="text-gray-400 text-sm">加载中...</p>
      ) : articles.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg mb-2">暂无文章</p>
          <p className="text-sm">点击"新建文章"开始创作</p>
        </div>
      ) : (
        <div className="space-y-3">
          {articles.map((article) => (
            <div
              key={article.id}
              className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
            >
              <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate(`/articles/${article.id}/edit`)}>
                <h3 className="text-sm font-medium text-gray-800 truncate">
                  {article.title || '未命名文章'}
                </h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`px-2 py-0.5 rounded text-xs ${statusColors[article.status]}`}>
                    {statusLabels[article.status]}
                  </span>
                  <span className="text-xs text-gray-400">{article.updated_at}</span>
                </div>
              </div>
              <button
                onClick={() => handleDelete(article.id)}
                className="ml-4 text-sm text-red-500 hover:text-red-700"
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
