import { useEffect, useState, useCallback } from 'react'
import { useImageStore } from '../stores/imageStore'
import { invoke } from '@tauri-apps/api/core'
import { open } from '@tauri-apps/plugin-dialog'
import type { Image } from '../types'

export default function Assets() {
  const { images, allImages, loading, groupFilter, fetchImages, setGroupFilter, deleteImage } = useImageStore()
  const [selectedImage, setSelectedImage] = useState<Image | null>(null)
  const [uploading, setUploading] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [showNewGroup, setShowNewGroup] = useState(false)

  useEffect(() => {
    fetchImages()
  }, [fetchImages])

  // Derive unique group names from ALL images (not just filtered)
  const allGroups = [...new Set(allImages.filter(i => i.group_name).map(i => i.group_name))]

  const handleUpload = useCallback(async () => {
    try {
      const files = await open({
        multiple: true,
        filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'gif', 'webp'] }],
      })
      if (!files) return
      setUploading(true)
      const paths = Array.isArray(files) ? files : [files]
      for (const filePath of paths) {
        const path = typeof filePath === 'string' ? filePath : (filePath as any).path || String(filePath)
        const filename = path.split('/').pop() || path.split('\\').pop() || 'image'
        const ext = filename.split('.').pop()?.toLowerCase() || ''
        const mimeMap: Record<string, string> = {
          png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg',
          gif: 'image/gif', webp: 'image/webp',
        }
        await invoke('create_image', {
          filename,
          filePath: path,
          fileSize: 0,
          mimeType: mimeMap[ext] || 'image/png',
          width: 0,
          height: 0,
          groupName: groupFilter || '',
        })
      }
      fetchImages()
    } catch (e) {
      console.error('Upload failed:', e)
    } finally {
      setUploading(false)
    }
  }, [fetchImages, groupFilter])

  const handleDelete = async (id: string) => {
    if (window.confirm('确定要删除这张图片吗？')) {
      await deleteImage(id)
      if (selectedImage?.id === id) setSelectedImage(null)
    }
  }

  const handleCreateGroup = () => {
    if (newGroupName.trim()) {
      setGroupFilter(newGroupName.trim())
      setNewGroupName('')
      setShowNewGroup(false)
    }
  }

  return (
    <div className="flex h-full">
      {/* Left sidebar: groups */}
      <div className="w-48 border-r border-gray-200 bg-white flex flex-col shrink-0">
        <div className="p-3 border-b border-gray-100">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">分组</span>
        </div>
        <div className="flex-1 overflow-y-auto py-1">
          <button
            onClick={() => setGroupFilter(null)}
            className={`w-full text-left px-3 py-2 text-sm transition-colors ${
              groupFilter === null ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            全部素材
          </button>
          <button
            onClick={() => setGroupFilter('')}
            className={`w-full text-left px-3 py-2 text-sm transition-colors ${
              groupFilter === '' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            未分组
          </button>
          {allGroups.map((g) => (
            <button
              key={g}
              onClick={() => setGroupFilter(g)}
              className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                groupFilter === g ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
        <div className="p-2 border-t border-gray-100">
          {showNewGroup ? (
            <div className="flex gap-1">
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateGroup()}
                placeholder="分组名"
                className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                autoFocus
              />
              <button onClick={handleCreateGroup} className="px-2 py-1 bg-blue-600 text-white rounded text-xs">+</button>
              <button onClick={() => setShowNewGroup(false)} className="px-2 py-1 bg-gray-100 rounded text-xs">x</button>
            </div>
          ) : (
            <button
              onClick={() => setShowNewGroup(true)}
              className="w-full text-center py-1.5 text-xs text-gray-500 hover:text-blue-600 hover:bg-gray-50 rounded"
            >
              + 新建分组
            </button>
          )}
        </div>
      </div>

      {/* Image grid */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            素材库{groupFilter ? ` - ${groupFilter}` : groupFilter === '' ? ' - 未分组' : ''}
          </h2>
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {uploading ? '上传中...' : '+ 上传图片'}
          </button>
        </div>

        {loading ? (
          <p className="text-gray-400 text-sm">加载中...</p>
        ) : images.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg mb-2">暂无图片</p>
            <p className="text-sm">点击"上传图片"添加素材</p>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-4">
            {images.map((img) => (
              <div
                key={img.id}
                onClick={() => setSelectedImage(img)}
                className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                  selectedImage?.id === img.id ? 'border-blue-500 shadow-lg' : 'border-transparent hover:border-gray-300'
                }`}
              >
                <img
                  src={`file://${img.file_path}`}
                  alt={img.filename}
                  className="w-full h-full object-cover"
                />
                {img.group_name && (
                  <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/50 text-white text-xs rounded">
                    {img.group_name}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image detail sidebar */}
      {selectedImage && (
        <div className="w-80 border-l border-gray-200 bg-white p-4 overflow-y-auto shrink-0">
          <div className="mb-4">
            <img
              src={`file://${selectedImage.file_path}`}
              alt={selectedImage.filename}
              className="w-full rounded-lg"
            />
          </div>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-gray-500">文件名</span>
              <p className="text-gray-800 break-all">{selectedImage.filename}</p>
            </div>
            <div>
              <span className="text-gray-500">分组</span>
              <p className="text-gray-800">{selectedImage.group_name || '未分组'}</p>
            </div>
            <div>
              <span className="text-gray-500">尺寸</span>
              <p className="text-gray-800">{selectedImage.width} x {selectedImage.height}</p>
            </div>
            <div>
              <span className="text-gray-500">大小</span>
              <p className="text-gray-800">{(selectedImage.file_size / 1024).toFixed(1)} KB</p>
            </div>
            <div>
              <span className="text-gray-500">上传时间</span>
              <p className="text-gray-800">{selectedImage.created_at}</p>
            </div>
            {selectedImage.wx_media_id && (
              <div>
                <span className="text-gray-500">微信素材 ID</span>
                <p className="text-gray-800 break-all text-xs">{selectedImage.wx_media_id}</p>
              </div>
            )}
          </div>
          <div className="mt-6 flex gap-2">
            <button
              onClick={() => handleDelete(selectedImage.id)}
              className="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"
            >
              删除
            </button>
            <button
              onClick={() => setSelectedImage(null)}
              className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200"
            >
              关闭
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
