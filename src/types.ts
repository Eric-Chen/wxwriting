export interface Article {
  id: string
  title: string
  content: string
  html_content: string
  category_id: string | null
  status: 'draft' | 'pending' | 'published' | 'failed'
  cover_image_id: string | null
  wx_media_id: string | null
  author: string
  digest: string
  created_at: string
  updated_at: string
  published_at: string | null
}

export interface Category {
  id: string
  name: string
  sort_order: number
  created_at: string
}

export interface Tag {
  id: string
  name: string
}

export interface Image {
  id: string
  filename: string
  file_path: string
  file_size: number
  mime_type: string
  width: number
  height: number
  group_name: string
  wx_media_id: string | null
  wx_url: string | null
  created_at: string
}

export interface WxAccount {
  id: string
  name: string
  app_id: string
  app_secret: string
  access_token: string
  token_expires_at: string | null
}
