import { useEffect, useState, useCallback } from 'react'
import { useImageStore } from '../stores/imageStore'
import { invoke } from '@tauri-apps/api/core'
import { open } from '@tauri-apps/plugin-dialog'
import type { Image } from '../types'

export default function Assets() {
  const { images, loading, fetchImages, deleteImage } = useImageStore()
  const [selectedImage, setSelectedImage] = useState<Image | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchImages()
  }, [fetchImages])

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
          groupName: '',
        })
      }
      fetchImages()
    } catch (e) {
      console.error('Upload failed:', e)
    } finally {
      setUploading(false)
    }
  }, [fetchImages])

  const handleDelete = async (id: string) => {
    if (window.confirm('确定要删除这张图片吗？')) {
      await deleteImage(id)
      if (selectedImage?.id === id) setSelectedImage(null)
    }
  }

  return (
    <div className="flex h-full">
      {/* Image grid */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">素材库</h2>
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
              <span className="text-gray-500">尺寸</span>
              <p className="text-gray-800">{selectedImage.width} × {selectedImage.height}</p>
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
