import { useEffect, useState } from 'react'
import { invoke } from '@tauri-apps/api/core'
import type { WxAccount } from '../types'
import { useSettingsStore } from '../stores/settingsStore'
import { themes } from '../styles/themes'

export default function Settings() {
  const { currentTheme, setTheme } = useSettingsStore()
  const [name, setName] = useState('')
  const [appId, setAppId] = useState('')
  const [appSecret, setAppSecret] = useState('')
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    invoke<WxAccount>('get_wx_account').then((account) => {
      setName(account.name)
      setAppId(account.app_id)
      setAppSecret(account.app_secret)
    }).catch(() => {})
  }, [])

  const handleSave = async () => {
    if (!appId.trim() || !appSecret.trim()) {
      setMessage({ type: 'error', text: '请填写 AppID 和 AppSecret' })
      return
    }
    setSaving(true)
    setMessage(null)
    try {
      await invoke('save_wx_account', {
        name: name || '默认公众号',
        appId: appId.trim(),
        appSecret: appSecret.trim(),
      })
      setMessage({ type: 'success', text: '保存成功' })
    } catch (e) {
      setMessage({ type: 'error', text: `保存失败: ${e}` })
    } finally {
      setSaving(false)
    }
  }

  const handleTest = async () => {
    setTesting(true)
    setMessage(null)
    try {
      await invoke('test_wx_connection')
      setMessage({ type: 'success', text: '连接成功，API 凭证有效' })
    } catch (e) {
      setMessage({ type: 'error', text: `连接失败: ${e}` })
    } finally {
      setTesting(false)
    }
  }

  const inputClass = "w-full px-3 py-2.5 border border-[var(--color-border)] rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]/30 focus:border-[var(--color-brand-500)] bg-[var(--color-surface)] placeholder:text-[var(--color-text-muted)]"

  return (
    <div className="p-6 max-w-2xl">
      <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-6">设置</h2>

      <section className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-5 mb-5">
        <h3 className="text-[14px] font-medium text-[var(--color-text-primary)] mb-4">微信公众号配置</h3>
        <div className="space-y-3.5">
          <div>
            <label className="block text-[12px] text-[var(--color-text-secondary)] mb-1.5">公众号名称</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="例如：我的公众号" className={inputClass} />
          </div>
          <div>
            <label className="block text-[12px] text-[var(--color-text-secondary)] mb-1.5">AppID</label>
            <input type="text" value={appId} onChange={(e) => setAppId(e.target.value)} placeholder="wx..." className={`${inputClass} font-mono`} />
          </div>
          <div>
            <label className="block text-[12px] text-[var(--color-text-secondary)] mb-1.5">AppSecret</label>
            <input type="password" value={appSecret} onChange={(e) => setAppSecret(e.target.value)} placeholder="••••••••" className={`${inputClass} font-mono`} />
          </div>
          {message && (
            <div className={`px-3 py-2.5 rounded-lg text-[13px] ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-red-50 text-red-600 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}
          <div className="flex gap-2.5 pt-1">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2.5 bg-[var(--color-brand-600)] text-white rounded-lg text-[13px] font-medium hover:bg-[var(--color-brand-700)] disabled:opacity-40"
            >
              {saving ? '保存中...' : '保存配置'}
            </button>
            <button
              onClick={handleTest}
              disabled={testing || !appId || !appSecret}
              className="px-4 py-2.5 bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)] border border-[var(--color-border)] rounded-lg text-[13px] hover:bg-[var(--color-surface-hover)] disabled:opacity-40"
            >
              {testing ? '测试中...' : '测试连接'}
            </button>
          </div>
        </div>
      </section>

      <section className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-5 mb-5">
        <h3 className="text-[14px] font-medium text-[var(--color-text-primary)] mb-3">文章样式主题</h3>
        <div className="flex gap-2.5">
          {themes.map((theme) => (
            <button
              key={theme.name}
              onClick={() => setTheme(theme.name)}
              className={`px-4 py-2.5 rounded-lg text-[13px] border-2 transition-all ${
                currentTheme.name === theme.name
                  ? 'border-[var(--color-brand-500)] bg-[var(--color-brand-50)] text-[var(--color-brand-700)] font-medium'
                  : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-text-muted)]'
              }`}
            >
              {theme.name}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-[var(--color-text-muted)] mt-3">主题会影响文章预览和导出的 HTML 样式</p>
      </section>

      <section className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-5">
        <h3 className="text-[14px] font-medium text-[var(--color-text-primary)] mb-1.5">关于</h3>
        <p className="text-[13px] text-[var(--color-text-secondary)]">微信公众号工具 v0.1.0</p>
        <p className="text-[12px] text-[var(--color-text-muted)] mt-1">一站式微信公众号文章编辑、管理和发布工具</p>
      </section>
    </div>
  )
}
