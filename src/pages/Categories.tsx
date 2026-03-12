import { useEffect, useState } from 'react'
import { useCategoryStore } from '../stores/categoryStore'

export default function Categories() {
  const { categories, tags, fetchCategories, fetchTags, createCategory, deleteCategory, createTag, deleteTag } = useCategoryStore()
  const [newCatName, setNewCatName] = useState('')
  const [newTagName, setNewTagName] = useState('')

  useEffect(() => {
    fetchCategories()
    fetchTags()
  }, [])

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return
    await createCategory(newCatName.trim())
    setNewCatName('')
  }

  const handleAddTag = async () => {
    if (!newTagName.trim()) return
    await createTag(newTagName.trim())
    setNewTagName('')
  }

  return (
    <div className="p-6 max-w-2xl">
      <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-6">分类与标签</h2>

      <section className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-5 mb-5">
        <h3 className="text-[14px] font-medium text-[var(--color-text-primary)] mb-4">分类</h3>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
            placeholder="输入分类名称"
            className="flex-1 px-3 py-2 border border-[var(--color-border)] rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]/30 focus:border-[var(--color-brand-500)] bg-[var(--color-surface)]"
          />
          <button
            onClick={handleAddCategory}
            disabled={!newCatName.trim()}
            className="px-4 py-2 bg-[var(--color-brand-600)] text-white rounded-lg text-[13px] font-medium hover:bg-[var(--color-brand-700)] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            添加
          </button>
        </div>
        {categories.length === 0 ? (
          <p className="text-[13px] text-[var(--color-text-muted)] py-3">暂无分类，添加一个开始整理文章</p>
        ) : (
          <div className="space-y-1">
            {categories.map((cat) => (
              <div key={cat.id} className="group flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors">
                <span className="text-[13px] text-[var(--color-text-primary)]">{cat.name}</span>
                <button
                  onClick={() => deleteCategory(cat.id)}
                  className="text-[12px] text-[var(--color-text-muted)] hover:text-[var(--color-danger)] opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label={`删除分类 ${cat.name}`}
                >
                  删除
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-5">
        <h3 className="text-[14px] font-medium text-[var(--color-text-primary)] mb-4">标签</h3>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
            placeholder="输入标签名称"
            className="flex-1 px-3 py-2 border border-[var(--color-border)] rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]/30 focus:border-[var(--color-brand-500)] bg-[var(--color-surface)]"
          />
          <button
            onClick={handleAddTag}
            disabled={!newTagName.trim()}
            className="px-4 py-2 bg-[var(--color-brand-600)] text-white rounded-lg text-[13px] font-medium hover:bg-[var(--color-brand-700)] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            添加
          </button>
        </div>
        {tags.length === 0 ? (
          <p className="text-[13px] text-[var(--color-text-muted)] py-3">暂无标签</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span key={tag.id} className="group inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)] rounded-full text-[12px] text-[var(--color-text-secondary)]">
                {tag.name}
                <button
                  onClick={() => deleteTag(tag.id)}
                  className="text-[var(--color-text-muted)] hover:text-[var(--color-danger)] transition-colors"
                  aria-label={`删除标签 ${tag.name}`}
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
