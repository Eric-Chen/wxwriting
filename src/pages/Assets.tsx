import { useEffect, useState, useCallback, useRef } from 'react'
import { useImageStore } from '../stores/imageStore'
import { invoke } from '@tauri-apps/api/core'
import { open } from '@tauri-apps/plugin-dialog'
import type { Image } from '../types'

export default function Assets() {
  const {
    images, allImages, loading, groupFilter,
    fetchImages, setGroupFilter, deleteImage,
    renameGroup, deleteGroup, updateImageGroup,
  } = useImageStore()
  const [selectedImage, setSelectedImage] = useState<Image | null>(null)
  const [uploading, setUploading] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [showNewGroup, setShowNewGroup] = useState(false)
  const [editingGroup, setEditingGroup] = useState<string | null>(null)
  const [editGroupName, setEditGroupName] = useState('')
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; group: string } | null>(null)
  const newGroupRef = useRef<HTMLInputElement>(null)
  const editGroupRef = useRef<HTMLInputElement>(null)

  useEffect(() => { fetchImages() }, [fetchImages])
  useEffect(() => { if (showNewGroup) newGroupRef.current?.focus() }, [showNewGroup])
  useEffect(() => { if (editingGroup) editGroupRef.current?.focus() }, [editingGroup])

  // Close context menu on click outside
  useEffect(() => {
    if (!contextMenu) return
    const handler = () => setContextMenu(null)
    window.addEventListener('click', handler)
    return () => window.removeEventListener('click', handler)
  }, [contextMenu])

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
    const name = newGroupName.trim()
    if (name) {
      setGroupFilter(name)
      setNewGroupName('')
      setShowNewGroup(false)
    }
  }

  const handleRenameGroup = async (oldName: string) => {
    const name = editGroupName.trim()
    if (name && name !== oldName) {
      await renameGroup(oldName, name)
    }
    setEditingGroup(null)
    setEditGroupName('')
  }

  const handleDeleteGroup = async (groupName: string) => {
    const count = allImages.filter(i => i.group_name === groupName).length
    if (window.confirm(`删除分组「${groupName}」？其中 ${count} 张图片将移至未分组。`)) {
      await deleteGroup(groupName)
    }
  }

  const handleContextMenu = (e: React.MouseEvent, group: string) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, group })
  }

  const handleMoveImage = async (imageId: string, targetGroup: string) => {
    await updateImageGroup(imageId, targetGroup)
    if (selectedImage?.id === imageId) {
      setSelectedImage({ ...selectedImage, group_name: targetGroup })
    }
  }

  return (
    <div className="flex h-full">
      {/* Group sidebar */}
      <div className="w-44 border-r border-[var(--color-border)] bg-[var(--color-surface)] flex flex-col shrink-0">
        <div className="p-3 border-b border-[var(--color-border-light)] flex items-center justify-between">
          <span className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase tracking-wide">分组</span>
          <button
            onClick={() => setShowNewGroup(true)}
            className="text-[var(--color-brand-600)] hover:text-[var(--color-brand-700)] text-[16px] leading-none"
            aria-label="新建分组"
            title="新建分组"
          >+</button>
        </div>

        <div className="flex-1 overflow-y-auto py-1">
          {/* All */}
          <button
            onClick={() => setGroupFilter(null)}
            className={`w-full text-left px-3 py-2 text-[12px] transition-colors ${
              groupFilter === null
                ? 'bg-[var(--color-brand-50)] text-[var(--color-brand-700)] font-medium'
                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]'
            }`}
          >
            全部素材
            <span className="ml-1 text-[11px] text-[var(--color-text-muted)]">({allImages.length})</span>
          </button>

          {/* Ungrouped */}
          <button
            onClick={() => setGroupFilter('')}
            className={`w-full text-left px-3 py-2 text-[12px] transition-colors ${
              groupFilter === ''
                ? 'bg-[var(--color-brand-50)] text-[var(--color-brand-700)] font-medium'
                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]'
            }`}
          >
            未分组
            <span className="ml-1 text-[11px] text-[var(--color-text-muted)]">
              ({allImages.filter(i => !i.group_name).length})
            </span>
          </button>

          {/* Groups */}
          {allGroups.map((g) => (
            editingGroup === g ? (
              <div key={g} className="px-2 py-1">
                <input
                  ref={editGroupRef}
                  value={editGroupName}
                  onChange={(e) => setEditGroupName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRenameGroup(g)
                    if (e.key === 'Escape') { setEditingGroup(null); setEditGroupName('') }
                  }}
                  onBlur={() => handleRenameGroup(g)}
                  className="w-full px-2 py-1.5 text-[12px] border border-[var(--color-brand-500)] rounded bg-[var(--color-surface)] focus:outline-none"
                />
              </div>
            ) : (
              <button
                key={g}
                onClick={() => setGroupFilter(g)}
                onContextMenu={(e) => handleContextMenu(e, g)}
                className={`group w-full text-left px-3 py-2 text-[12px] transition-colors ${
                  groupFilter === g
                    ? 'bg-[var(--color-brand-50)] text-[var(--color-brand-700)] font-medium'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]'
                }`}
              >
                {g}
                <span className="ml-1 text-[11px] text-[var(--color-text-muted)]">
                  ({allImages.filter(i => i.group_name === g).length})
                </span>
              </button>
            )
          ))}

          {/* New group input */}
          {showNewGroup && (
            <div className="px-2 py-1">
              <input
                ref={newGroupRef}
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateGroup()
                  if (e.key === 'Escape') { setShowNewGroup(false); setNewGroupName('') }
                }}
                onBlur={() => { if (!newGroupName.trim()) setShowNewGroup(false) }}
                placeholder="分组名称"
                className="w-full px-2 py-1.5 text-[12px] border border-[var(--color-brand-500)] rounded bg-[var(--color-surface)] focus:outline-none placeholder:text-[var(--color-text-muted)]"
              />
            </div>
          )}
        </div>
      </div>

      {/* Context menu */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-lg py-1 min-w-[120px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onMouseDown={(e) => {
              e.stopPropagation()
              setEditingGroup(contextMenu.group)
              setEditGroupName(contextMenu.group)
              setContextMenu(null)
            }}
            className="w-full text-left px-3 py-1.5 text-[12px] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]"
          >
            重命名
          </button>
          <button
            onMouseDown={(e) => {
              e.stopPropagation()
              setContextMenu(null)
              handleDeleteGroup(contextMenu.group)
            }}
            className="w-full text-left px-3 py-1.5 text-[12px] text-[var(--color-danger)] hover:bg-red-50"
          >
            删除分组
          </button>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--color-border-light)] bg-[var(--color-surface)] shrink-0">
          <h2 className="text-[14px] font-medium text-[var(--color-text-primary)]">
            {groupFilter === null ? '全部素材' : groupFilter === '' ? '未分组' : groupFilter}
          </h2>
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="px-3 py-1.5 bg-[var(--color-brand-600)] text-white rounded-lg text-[12px] font-medium hover:bg-[var(--color-brand-700)] disabled:opacity-50"
          >
            {uploading ? '上传中...' : '上传图片'}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="grid grid-cols-4 gap-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-square rounded-lg bg-[var(--color-surface-hover)] animate-pulse" />
              ))}
            </div>
          ) : images.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <svg className="w-16 h-16 text-[var(--color-border)] mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
              </svg>
              <p className="text-[13px] text-[var(--color-text-muted)]">暂无图片，点击上传开始</p>
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
                  <div className="w-full h-full bg-[var(--color-surface-hover)] flex items-center justify-center">
                    <span className="text-[11px] text-[var(--color-text-muted)] px-2 text-center truncate">{img.filename}</span>
                  </div>
                  {img.group_name && groupFilter === null && (
                    <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/50 text-white text-[10px] rounded">
                      {img.group_name}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail panel */}
      {selectedImage && (
        <div className="w-64 border-l border-[var(--color-border)] bg-[var(--color-surface)] p-4 shrink-0 overflow-y-auto">
          <h3 className="text-[13px] font-medium text-[var(--color-text-primary)] truncate mb-4">{selectedImage.filename}</h3>
          <div className="space-y-3 text-[12px]">
            <div>
              <span className="text-[var(--color-text-muted)]">大小</span>
              <p className="text-[var(--color-text-primary)] mt-0.5">{(selectedImage.file_size / 1024).toFixed(1)} KB</p>
            </div>
            <div>
              <span className="text-[var(--color-text-muted)]">上传时间</span>
              <p className="text-[var(--color-text-primary)] mt-0.5">{selectedImage.created_at}</p>
            </div>
            <div>
              <span className="text-[var(--color-text-muted)]">所属分组</span>
              <select
                value={selectedImage.group_name || ''}
                onChange={(e) => handleMoveImage(selectedImage.id, e.target.value)}
                className="mt-1 w-full px-2 py-1.5 text-[12px] border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-500)]"
              >
                <option value="">未分组</option>
                {allGroups.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
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
