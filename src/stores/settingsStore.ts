import { create } from 'zustand'
import { themes, defaultTheme, type WxTheme } from '../styles/themes'

interface SettingsState {
  currentTheme: WxTheme
  setTheme: (name: string) => void
}

export const useSettingsStore = create<SettingsState>((set) => ({
  currentTheme: defaultTheme,

  setTheme: (name) => {
    const theme = themes.find((t) => t.name === name) || defaultTheme
    set({ currentTheme: theme })
  },
}))
