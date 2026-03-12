import { create } from 'zustand'
import { invoke } from '@tauri-apps/api/core'
import type { Article } from '../types'

interface ArticleState {
  articles: Article[]
  loading: boolean
  filters: {
    categoryId: string | null
    status: string | null
    search: string | null
  }
  fetchArticles: () => Promise<void>
  getArticle: (id: string) => Promise<Article>
  setFilter: (key: string, value: string | null) => void
  createArticle: (title: string, content: string) => Promise<Article>
  updateArticle: (params: {
    id: string; title: string; content: string; htmlContent: string;
    categoryId: string | null; status: string; coverImageId: string | null;
    author: string; digest: string;
  }) => Promise<Article>
  deleteArticle: (id: string) => Promise<void>
}

export const useArticleStore = create<ArticleState>((set, get) => ({
  articles: [],
  loading: false,
  filters: { categoryId: null, status: null, search: null },

  fetchArticles: async () => {
    set({ loading: true })
    try {
      const { filters } = get()
      const articles = await invoke<Article[]>('list_articles', {
        categoryId: filters.categoryId,
        status: filters.status,
        search: filters.search,
      })
      set({ articles })
    } finally {
      set({ loading: false })
    }
  },

  getArticle: async (id) => {
    return await invoke<Article>('get_article', { id })
  },

  setFilter: (key, value) => {
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    }))
    get().fetchArticles()
  },

  createArticle: async (title, content) => {
    const article = await invoke<Article>('create_article', { title, content })
    get().fetchArticles()
    return article
  },

  updateArticle: async (params) => {
    const article = await invoke<Article>('update_article', {
      id: params.id,
      title: params.title,
      content: params.content,
      htmlContent: params.htmlContent,
      categoryId: params.categoryId,
      status: params.status,
      coverImageId: params.coverImageId,
      author: params.author,
      digest: params.digest,
    })
    get().fetchArticles()
    return article
  },

  deleteArticle: async (id) => {
    await invoke('delete_article', { id })
    get().fetchArticles()
  },
}))
