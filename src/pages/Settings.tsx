import { useEffect, useState } from 'react'
import { invoke } from '@tauri-apps/api/core'
import type { WxAccount } from '../types'

export default function Settings() {
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
    }).catch(() => {
      // No account configured yet
    })
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

  return (
    <div className="p-6 max-w-2xl">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">设置</h2>

      <section className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">微信公众号配置</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">公众号名称</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：我的公众号"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">AppID</label>
            <input
              type="text"
              value={appId}
              onChange={(e) => setAppId(e.target.value)}
              placeholder="wx..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">AppSecret</label>
            <input
              type="password"
              value={appSecret}
              onChange={(e) => setAppSecret(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {message && (
            <div className={`p-3 rounded-lg text-sm ${
              message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {message.text}
            </div>
          )}
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? '保存中...' : '保存配置'}
            </button>
            <button
              onClick={handleTest}
              disabled={testing || !appId || !appSecret}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 disabled:opacity-50"
            >
              {testing ? '测试中...' : '测试连接'}
            </button>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-800 mb-2">关于</h3>
        <p className="text-sm text-gray-600">微信公众号工具 v0.1.0</p>
        <p className="text-sm text-gray-500 mt-2">一站式微信公众号文章编辑、管理和发布工具</p>
      </section>
    </div>
  )
}
