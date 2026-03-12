import { create } from 'zustand'
import { invoke } from '@tauri-apps/api/core'
import type { Category, Tag } from '../types'

interface CategoryState {
  categories: Category[]
  tags: Tag[]
  fetchCategories: () => Promise<void>
  fetchTags: () => Promise<void>
  createCategory: (name: string) => Promise<void>
  deleteCategory: (id: string) => Promise<void>
  createTag: (name: string) => Promise<void>
  deleteTag: (id: string) => Promise<void>
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  tags: [],

  fetchCategories: async () => {
    const categories = await invoke<Category[]>('list_categories')
    set({ categories })
  },

  fetchTags: async () => {
    const tags = await invoke<Tag[]>('list_tags')
    set({ tags })
  },

  createCategory: async (name) => {
    await invoke('create_category', { name })
    get().fetchCategories()
  },

  deleteCategory: async (id) => {
    await invoke('delete_category', { id })
    get().fetchCategories()
  },

  createTag: async (name) => {
    await invoke('create_tag', { name })
    get().fetchTags()
  },

  deleteTag: async (id) => {
    await invoke('delete_tag', { id })
    get().fetchTags()
  },
}))
