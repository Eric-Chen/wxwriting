import { create } from 'zustand'
import { invoke } from '@tauri-apps/api/core'
import type { Image } from '../types'

interface ImageState {
  images: Image[]
  loading: boolean
  groupFilter: string | null
  fetchImages: () => Promise<void>
  setGroupFilter: (group: string | null) => void
  deleteImage: (id: string) => Promise<void>
}

export const useImageStore = create<ImageState>((set, get) => ({
  images: [],
  loading: false,
  groupFilter: null,

  fetchImages: async () => {
    set({ loading: true })
    try {
      const { groupFilter } = get()
      const images = await invoke<Image[]>('list_images', {
        groupName: groupFilter,
      })
      set({ images })
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
