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
      {/* Categories */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">分类管理</h2>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="新分类名称"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
            className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleAddCategory}
            className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
          >
            添加
          </button>
        </div>
        {categories.length === 0 ? (
          <p className="text-gray-400 text-sm">暂无分类</p>
        ) : (
          <div className="space-y-2">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                <span className="text-sm text-gray-700">{cat.name}</span>
                <button
                  onClick={() => deleteCategory(cat.id)}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  删除
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Tags */}
      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">标签管理</h2>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="新标签名称"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
            className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleAddTag}
            className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
          >
            添加
          </button>
        </div>
        {tags.length === 0 ? (
          <p className="text-gray-400 text-sm">暂无标签</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span key={tag.id} className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
                {tag.name}
                <button onClick={() => deleteTag(tag.id)} className="text-gray-400 hover:text-red-500 ml-1">&times;</button>
              </span>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
