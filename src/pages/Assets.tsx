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
          filename, filePath: path, fileSize: 0,
          mimeType: mimeMap[ext] || 'image/png',
          width: 0, height: 0, groupName: groupFilter || '',
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
      {/* Group sidebar */}
      <div className="w-44 border-r border-[var(--color-border)] bg-[var(--color-surface)] flex flex-col shrink-0">
        <div className="p-3 border-b border-[var(--color-border-light)]">
          <span className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider">分组</span>
        </div>
        <div className="flex-1 py-1 px-2 overflow-y-auto space-y-0.5">
          <button
            onClick={() => setGroupFilter(null)}
            className={`w-full text-left px-3 py-2 text-[13px] rounded-lg transition-colors ${
              groupFilter === null
                ? 'bg-[var(--color-brand-50)] text-[var(--color-brand-700)] font-medium'
                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]'
            }`}
          >
            全部素材
            <span className="ml-1 text-[11px] text-[var(--color-text-muted)]">({allImages.length})</span>
          </button>
          <button
            onClick={() => setGroupFilter('')}
            className={`w-full text-left px-3 py-2 text-[13px] rounded-lg transition-colors ${
              groupFilter === ''
                ? 'bg-[var(--color-brand-50)] text-[var(--color-brand-700)] font-medium'
                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]'
            }`}
          >
            未分组
          </button>
          {allGroups.map((g) => (
            <button
              key={g}
              onClick={() => setGroupFilter(g)}
              className={`w-full text-left px-3 py-2 text-[13px] rounded-lg transition-colors truncate ${
                groupFilter === g
                  ? 'bg-[var(--color-brand-50)] text-[var(--color-brand-700)] font-medium'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
        <div className="p-2 border-t border-[var(--color-border-light)]">
          {showNewGroup ? (
            <div className="flex gap-1">
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateGroup()}
                placeholder="分组名"
                autoFocus
                className="flex-1 min-w-0 px-2 py-1.5 border border-[var(--color-border)] rounded text-[12px] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-500)]"
              />
              <button onClick={handleCreateGroup} className="px-2 py-1.5 text-[12px] text-[var(--color-brand-600)] hover:bg-[var(--color-brand-50)] rounded">确定</button>
              <button onClick={() => setShowNewGroup(false)} className="px-1 py-1.5 text-[12px] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] rounded">&times;</button>
            </div>
          ) : (
            <button
              onClick={() => setShowNewGroup(true)}
              className="w-full px-3 py-1.5 text-[12px] text-[var(--color-text-muted)] hover:text-[var(--color-brand-600)] hover:bg-[var(--color-surface-hover)] rounded-lg transition-colors text-left"
            >
              + 新建分组
            </button>
          )}
        </div>
      </div>

      {/* Image grid */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
            {groupFilter === null ? '全部素材' : groupFilter || '未分组'}
          </h2>
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="px-4 py-2 bg-[var(--color-brand-600)] text-white rounded-lg text-[13px] font-medium hover:bg-[var(--color-brand-700)] disabled:opacity-40 active:scale-[0.98] transition-all"
          >
            {uploading ? '上传中...' : '+ 上传图片'}
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-[var(--color-brand-500)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : images.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <svg className="w-12 h-12 text-[var(--color-text-muted)] mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
            </svg>
            <p className="text-[13px] text-[var(--color-text-muted)]">暂无图片</p>
            <p className="text-[12px] text-[var(--color-text-muted)] mt-1 opacity-60">点击上方按钮上传图片素材</p>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-3">
            {images.map((img) => (
              <div
                key={img.id}
                onClick={() => setSelectedImage(img)}
                className={`group relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                  selectedImage?.id === img.id
                    ? 'border-[var(--color-brand-500)] shadow-sm'
                    : 'border-transparent hover:border-[var(--color-border)]'
                }`}
              >
                <img
                  src={`asset://localhost/${img.file_path}`}
                  alt={img.filename}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = '' }}
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-[11px] text-white truncate">{img.filename}</p>
                </div>
                {img.group_name && (
                  <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-black/40 backdrop-blur-sm text-[10px] text-white rounded">
                    {img.group_name}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail panel */}
      {selectedImage && (
        <div className="w-64 border-l border-[var(--color-border)] bg-[var(--color-surface)] p-5 overflow-y-auto shrink-0">
          <h3 className="text-[14px] font-medium text-[var(--color-text-primary)] mb-4 truncate">{selectedImage.filename}</h3>
          <div className="aspect-video rounded-lg overflow-hidden bg-[var(--color-surface-secondary)] mb-4">
            <img
              src={`asset://localhost/${selectedImage.file_path}`}
              alt={selectedImage.filename}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="space-y-3 text-[12px]">
            {selectedImage.group_name && (
              <div>
                <span className="text-[var(--color-text-muted)]">分组</span>
                <p className="text-[var(--color-text-primary)] mt-0.5">{selectedImage.group_name}</p>
              </div>
            )}
            <div>
              <span className="text-[var(--color-text-muted)]">尺寸</span>
              <p className="text-[var(--color-text-primary)] mt-0.5">{selectedImage.width} × {selectedImage.height}</p>
            </div>
            <div>
              <span className="text-[var(--color-text-muted)]">大小</span>
              <p className="text-[var(--color-text-primary)] mt-0.5">{(selectedImage.file_size / 1024).toFixed(1)} KB</p>
            </div>
            <div>
              <span className="text-[var(--color-text-muted)]">上传时间</span>
              <p className="text-[var(--color-text-primary)] mt-0.5">{selectedImage.created_at}</p>
            </div>
            {selectedImage.wx_media_id && (
              <div>
                <span className="text-[var(--color-text-muted)]">微信素材 ID</span>
                <p className="text-[var(--color-text-primary)] break-all text-[11px] mt-0.5">{selectedImage.wx_media_id}</p>
              </div>
            )}
          </div>
          <div className="mt-5 flex gap-2">
            <button
              onClick={() => handleDelete(selectedImage.id)}
              className="flex-1 px-3 py-2 bg-red-50 text-[var(--color-danger)] rounded-lg text-[12px] font-medium hover:bg-red-100 transition-colors"
            >
              删除
            </button>
            <button
              onClick={() => setSelectedImage(null)}
              className="flex-1 px-3 py-2 bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)] rounded-lg text-[12px] hover:bg-[var(--color-surface-hover)] transition-colors"
            >
              关闭
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
