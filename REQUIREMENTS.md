# 微信公众号一站式发布工具 - 需求文档

## 1. 项目概述

### 1.1 目标
构建一个跨平台桌面应用，用于微信公众号文章的编辑、管理和发布，支持图片素材管理和文章分类。

### 1.2 目标用户
个人或小团队内容创作者，无需复杂的多人协作和权限管理。

### 1.3 核心价值
- Markdown 编辑体验，对开发者友好
- 本地数据存储，数据完全掌控
- 自动化发布流程，提升效率
- 跨平台支持（Windows/macOS/Linux）

---

## 2. 技术架构

### 2.1 技术栈选型
- **前端**: React 18+ + Vite + TypeScript
- **后端**: Tauri 2.x (Rust)
- **数据库**: SQLite (本地存储)
- **Markdown 编辑器**: Milkdown 或 ByteMD
- **样式**: Tailwind CSS

### 2.2 架构设计

```
┌─────────────────────────────────────────────┐
│              Tauri 桌面应用                    │
│  ┌────────────────────────────────────────┐  │
│  │         React 前端 (WebView)            │  │
│  │  ┌──────────┐ ┌──────────┐ ┌────────┐ │  │
│  │  │ Markdown  │ │ 素材管理  │ │ 文章管理│ │  │
│  │  │ 编辑器    │ │ (图片)    │ │ & 分类  │ │  │
│  │  └──────────┘ └──────────┘ └────────┘ │  │
│  └──────────┬─────────────────────────────┘  │
│             │ Tauri IPC (invoke)              │
│  ┌──────────▼─────────────────────────────┐  │
│  │         Rust 后端                       │  │
│  │  ┌──────────┐ ┌──────────┐ ┌────────┐ │  │
│  │  │ 微信 API  │ │ 文件存储  │ │ SQLite │ │  │
│  │  │ 客户端    │ │ 管理      │ │ 数据库  │ │  │
│  │  └──────────┘ └──────────┘ └────────┘ │  │
│  └────────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

### 2.3 核心模块

| 模块 | 职责 | 层级 |
|------|------|------|
| Markdown 编辑器 | 文章编写、实时预览、Markdown→微信富文本转换 | 前端 |
| 文章管理 | 文章 CRUD、分类、标签、状态管理 | 前端 + 后端 |
| 素材管理 | 图片上传、浏览、分类、微信素材同步 | 前端 + 后端 |
| 微信 API 客户端 | access_token 管理、素材上传、草稿/发布 | 后端 |
| 本地存储 | SQLite 数据库操作、文件系统管理 | 后端 |

---

## 3. 功能需求

### 3.1 文章编辑

#### 3.1.1 Markdown 编辑器
- 支持标准 Markdown 语法（标题、列表、代码块、引用、表格等）
- 实时预览，左右分栏或切换模式
- 支持图片插入（从素材库选择或本地上传）
- 支持代码高亮
- 自动保存草稿（每 30 秒或内容变更时）

#### 3.1.2 Markdown → 微信富文本转换
- 将 Markdown 转换为微信公众号兼容的 HTML
- 内联样式（微信不支持外部 CSS）
- 支持自定义样式主题（字体、颜色、间距等）
- 代码块渲染为微信兼容格式
- 图片自动替换为微信素材 URL

#### 3.1.3 预览
- 模拟微信公众号文章的实际显示效果
- 支持手机端预览尺寸

### 3.2 文章管理

#### 3.2.1 文章状态
- 草稿：编辑中，未发布
- 待发布：已完成编辑，等待发布
- 已发布：已成功发布到公众号
- 发布失败：发布过程中出错

#### 3.2.2 分类管理
- 支持创建、编辑、删除分类
- 文章可归属一个分类
- 支持标签（多标签）
- 分类和标签的筛选、搜索

#### 3.2.3 文章列表
- 按分类、标签、状态筛选
- 按创建时间、修改时间排序
- 关键词搜索（标题 + 内容）

### 3.3 素材管理（图片）

#### 3.3.1 本地素材库
- 图片上传（支持拖拽、粘贴）
- 图片分组/文件夹管理
- 图片预览、重命名、删除
- 支持格式：JPG、PNG、GIF、WebP

#### 3.3.2 微信素材同步
- 上传图片到微信公众号素材库（永久素材）
- 记录本地图片与微信素材的映射关系
- 发布文章时自动将本地图片上传并替换 URL

### 3.4 微信公众号发布

#### 3.4.1 账号配置
- 配置公众号 AppID 和 AppSecret
- access_token 自动获取和刷新（有效期 2 小时）
- 连接状态检测和提示

#### 3.4.2 自动发布流程
1. Markdown → 微信兼容 HTML 转换
2. 文章中的本地图片自动上传到微信素材库
3. 替换图片 URL 为微信素材 URL
4. 上传封面图（thumb_media_id）
5. 创建草稿（调用 `draft/add` 接口）
6. 可选：直接群发（调用 `freepublish/submit` 接口）

#### 3.4.3 手动回退
- 当无 API 权限或 API 调用失败时
- 生成格式化好的 HTML，用户可复制到公众号后台
- 提供一键复制功能

### 3.5 设置

- 公众号账号配置（AppID / AppSecret）
- Markdown 样式主题选择/自定义
- 自动保存间隔设置
- 数据存储路径配置
- 数据导出/备份

---

## 4. 数据模型

### 4.1 文章表 (articles)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT (UUID) | 主键 |
| title | TEXT | 文章标题 |
| content | TEXT | Markdown 原文 |
| html_content | TEXT | 转换后的 HTML（缓存） |
| category_id | TEXT | 所属分类 |
| status | TEXT | draft / pending / published / failed |
| cover_image_id | TEXT | 封面图素材 ID |
| wx_media_id | TEXT | 微信素材 ID（发布后） |
| author | TEXT | 作者 |
| digest | TEXT | 摘要 |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |
| published_at | DATETIME | 发布时间 |

### 4.2 分类表 (categories)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT (UUID) | 主键 |
| name | TEXT | 分类名称 |
| sort_order | INTEGER | 排序权重 |
| created_at | DATETIME | 创建时间 |

### 4.3 标签表 (tags)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT (UUID) | 主键 |
| name | TEXT | 标签名称 |

### 4.4 文章-标签关联表 (article_tags)
| 字段 | 类型 | 说明 |
|------|------|------|
| article_id | TEXT | 文章 ID |
| tag_id | TEXT | 标签 ID |

### 4.5 图片素材表 (images)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT (UUID) | 主键 |
| filename | TEXT | 文件名 |
| file_path | TEXT | 本地存储路径 |
| file_size | INTEGER | 文件大小（字节） |
| mime_type | TEXT | MIME 类型 |
| width | INTEGER | 图片宽度 |
| height | INTEGER | 图片高度 |
| group_name | TEXT | 分组名称 |
| wx_media_id | TEXT | 微信素材 ID（上传后） |
| wx_url | TEXT | 微信素材 URL（上传后） |
| created_at | DATETIME | 创建时间 |

### 4.6 公众号配置表 (wx_accounts)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT (UUID) | 主键 |
| name | TEXT | 账号名称 |
| app_id | TEXT | 微信 AppID |
| app_secret | TEXT | 微信 AppSecret（加密存储） |
| access_token | TEXT | 当前 token（加密存储） |
| token_expires_at | DATETIME | token 过期时间 |

---

## 5. 微信公众号 API 集成

### 5.1 使用的 API 接口

| 接口 | 用途 |
|------|------|
| `GET /cgi-bin/token` | 获取 access_token |
| `POST /cgi-bin/material/add_material` | 上传永久素材（图片） |
| `POST /cgi-bin/media/uploadimg` | 上传文章内图片 |
| `POST /cgi-bin/draft/add` | 新建草稿 |
| `POST /cgi-bin/draft/update` | 修改草稿 |
| `POST /cgi-bin/freepublish/submit` | 发布文章 |
| `POST /cgi-bin/material/batchget_material` | 获取素材列表 |

### 5.2 注意事项
- access_token 有效期 2 小时，需自动刷新
- AppSecret 本地加密存储（使用系统 keychain 或 AES 加密）
- API 调用频率限制：注意微信的调用频次上限
- 图片大小限制：永久素材图片 ≤ 10MB
- 文章内图片需使用 `uploadimg` 接口上传，返回的 URL 才能在文章中使用

---

## 6. 前端页面结构

### 6.1 页面列表

| 页面 | 路由 | 说明 |
|------|------|------|
| 文章列表 | `/articles` | 文章管理主页，筛选/搜索/操作 |
| 文章编辑 | `/articles/:id/edit` | Markdown 编辑器 + 预览 |
| 新建文章 | `/articles/new` | 新建文章（同编辑页） |
| 素材库 | `/assets` | 图片素材浏览和管理 |
| 分类管理 | `/categories` | 分类和标签的 CRUD |
| 设置 | `/settings` | 公众号配置、主题、偏好 |

### 6.2 布局
- 左侧导航栏：页面切换
- 顶部工具栏：当前页面操作
- 主内容区：页面内容

---

## 7. 非功能需求

### 7.1 性能
- 应用启动时间 < 3 秒
- 编辑器输入响应 < 50ms
- 图片上传支持并发（最多 5 张同时上传）

### 7.2 安全
- AppSecret 加密存储，不以明文保存
- access_token 内存中管理，持久化时加密
- 本地数据库不加密（用户自行保管）

### 7.3 可靠性
- 文章自动保存，防止数据丢失
- API 调用失败时保留完整错误信息，支持重试
- 发布失败不影响本地数据

### 7.4 跨平台
- 支持 macOS、Windows、Linux
- 使用系统原生文件对话框
- 适配不同 DPI 显示

---

## 8. 项目结构（预期）

```
wx-tools/
├── src/                    # React 前端
│   ├── components/         # 通用组件
│   ├── pages/              # 页面组件
│   ├── hooks/              # 自定义 hooks
│   ├── stores/             # 状态管理
│   ├── utils/              # 工具函数（Markdown 转换等）
│   ├── styles/             # 样式和主题
│   ├── App.tsx
│   └── main.tsx
├── src-tauri/              # Rust 后端
│   ├── src/
│   │   ├── commands/       # Tauri IPC 命令
│   │   ├── db/             # 数据库操作
│   │   ├── wx_api/         # 微信 API 客户端
│   │   ├── storage/        # 文件存储管理
│   │   └── main.rs
│   ├── Cargo.toml
│   └── tauri.conf.json
├── package.json
├── vite.config.ts
└── REQUIREMENTS.md
```

