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
  updateImageGroup: (id: string, groupName: string) => Promise<void>
  renameGroup: (oldName: string, newName: string) => Promise<void>
  deleteGroup: (groupName: string) => Promise<void>
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
      const allImages = await invoke<Image[]>('list_images', { groupName: null })
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

  updateImageGroup: async (id, groupName) => {
    await invoke('update_image_group', { id, groupName })
    get().fetchImages()
  },

  renameGroup: async (oldName, newName) => {
    await invoke<number>('rename_image_group', { oldName, newName })
    const { groupFilter } = get()
    if (groupFilter === oldName) set({ groupFilter: newName })
    get().fetchImages()
  },

  deleteGroup: async (groupName) => {
    await invoke<number>('delete_image_group', { groupName })
    const { groupFilter } = get()
    if (groupFilter === groupName) set({ groupFilter: null })
    get().fetchImages()
  },
}))
