import { create } from 'zustand'
import { invoke } from '@tauri-apps/api/core'
import type { Image } from '../types'

interface ImageState {
  images: Image[]
  allImages: Image[]
  loading: boolean
  groupFilter: string | null
  fetchImages: () => Promise<void>
  setGroupFilter: (group: string | null) => void
  deleteImage: (id: string) => Promise<void>
}

export const useImageStore = create<ImageState>((set, get) => ({
  images: [],
  allImages: [],
  loading: false,
  groupFilter: null,

  fetchImages: async () => {
    set({ loading: true })
    try {
      const { groupFilter } = get()
      // Always fetch all images for group sidebar
      const allImages = await invoke<Image[]>('list_images', { groupName: null })
      // Fetch filtered images
      const images = groupFilter === null
        ? allImages
        : await invoke<Image[]>('list_images', { groupName: groupFilter })
      set({ images, allImages })
    } finally {
      set({ loading: false })
    }
  },

  setGroupFilter: (group) => {
    set({ groupFilter: group })
    get().fetchImages()
  },

  deleteImage: async (id) => {
    await invoke<string>('delete_image', { id })
    get().fetchImages()
  },
}))
