# 微信公众号工具 - 实现计划

## 项目概述

构建一个基于 Tauri + React 的跨平台桌面应用，用于微信公众号文章的编辑、管理和发布。

**技术栈**: Tauri 2.x (Rust) + React 18 + TypeScript + Vite + SQLite

**参考文档**: `/Users/eric/Documents/runtimes/test_ai/support_tools/wx-tools/REQUIREMENTS.md`

---

## 实现阶段

### 阶段 1: 项目脚手架搭建

**目标**: 初始化 Tauri + React 项目，配置开发环境

**任务**:
1. 使用 `create-tauri-app` 初始化项目（React + TypeScript 模板）
2. 配置 Vite、TypeScript、Tailwind CSS
3. 配置 Tauri 基本设置（窗口大小、标题、图标等）
4. 创建基础目录结构（src/components, src/pages, src-tauri/src/commands 等）
5. 验证开发环境：运行 `npm run tauri dev` 确保应用启动

**验收标准**:
- 应用能正常启动并显示默认页面
- 热重载工作正常
- 前后端 IPC 通信测试通过（创建一个简单的 hello 命令）

---

### 阶段 2: 数据库层实现

**目标**: 实现 SQLite 数据库初始化和基础 CRUD 操作

**任务**:
1. 添加 Rust 依赖：`rusqlite`, `serde`, `uuid`
2. 创建数据库模块 `src-tauri/src/db/mod.rs`
3. 实现数据库初始化和表结构创建（6 张表）
4. 实现各表的基础 CRUD 操作：
   - articles: create, read, update, delete, list
   - categories: create, read, update, delete, list
   - tags: create, read, update, delete, list
   - article_tags: add, remove, get_by_article
   - images: create, read, update, delete, list
   - wx_accounts: create, read, update
5. 创建数据库连接管理（使用 Tauri 的 State 管理）

**验收标准**:
- 应用启动时自动创建数据库文件和表结构
- 所有 CRUD 操作通过单元测试
- 数据库文件位置：`~/.wx-tools/data.db`（或用户指定路径）

---

### 阶段 3: Tauri Commands 层

**目标**: 实现前后端通信的 IPC 命令

**任务**:
1. 创建 commands 模块 `src-tauri/src/commands/mod.rs`
2. 实现文章相关命令：
   - `create_article`, `get_article`, `update_article`, `delete_article`, `list_articles`
3. 实现分类和标签命令：
   - `create_category`, `list_categories`, `delete_category`
   - `create_tag`, `list_tags`, `delete_tag`
   - `add_article_tag`, `remove_article_tag`, `get_article_tags`
4. 实现图片素材命令：
   - `upload_image`, `list_images`, `delete_image`, `get_image`
5. 实现公众号配置命令：
   - `save_wx_account`, `get_wx_account`
6. 在 `main.rs` 中注册所有命令

**验收标准**:
- 所有命令能从前端成功调用
- 错误处理正确（返回有意义的错误信息）
- 使用 Postman 或前端测试页面验证所有命令

---

### 阶段 4: 前端基础框架

**目标**: 搭建前端路由、布局和状态管理

**任务**:
1. 安装依赖：`react-router-dom`, `zustand`（状态管理）, `@tauri-apps/api`
2. 创建应用布局组件 `src/components/Layout.tsx`：
   - 左侧导航栏（文章、素材库、分类、设置）
   - 顶部工具栏
   - 主内容区
3. 配置路由 `src/App.tsx`：
   - `/articles` → 文章列表页
   - `/articles/new` → 新建文章页
   - `/articles/:id/edit` → 编辑文章页
   - `/assets` → 素材库页
   - `/categories` → 分类管理页
   - `/settings` → 设置页
4. 创建 Tauri IPC 调用封装 `src/utils/tauri.ts`
5. 创建各页面的空壳组件

**验收标准**:
- 导航栏点击能正确切换页面
- 布局在不同窗口大小下正常显示
- IPC 封装能正确调用后端命令

---

### 阶段 5: 文章管理功能

**目标**: 实现文章列表、创建、编辑、删除的完整流程

**任务**:
1. 创建文章状态管理 `src/stores/articleStore.ts`
2. 实现文章列表页 `src/pages/ArticleList.tsx`：
   - 文章卡片/列表展示（标题、状态、分类、时间）
   - 按分类、标签、状态筛选
   - 关键词搜索
   - 排序（创建时间、修改时间）
   - 新建文章按钮
   - 删除文章（带确认对话框）
3. 实现分类管理页 `src/pages/Categories.tsx`：
   - 分类 CRUD
   - 标签 CRUD
   - 拖拽排序分类
4. 创建分类/标签状态管理 `src/stores/categoryStore.ts`

**验收标准**:
- 文章列表正确显示所有文章
- 筛选和搜索功能正常
- 分类和标签的增删改查正常
- 删除操作有确认提示

---

### 阶段 6: Markdown 编辑器

**目标**: 集成 Markdown 编辑器，实现文章编辑和预览

**任务**:
1. 安装 Markdown 编辑器依赖（Milkdown 或 ByteMD）
2. 创建编辑器组件 `src/components/MarkdownEditor.tsx`：
   - 标准 Markdown 语法支持
   - 代码高亮（使用 highlight.js 或 prism）
   - 工具栏（标题、加粗、列表、代码块、图片插入等）
3. 创建预览组件 `src/components/ArticlePreview.tsx`：
   - 实时预览渲染
   - 模拟微信公众号样式
   - 手机端预览尺寸切换
4. 实现文章编辑页 `src/pages/ArticleEdit.tsx`：
   - 左右分栏布局（编辑器 + 预览）
   - 文章元数据编辑（标题、分类、标签、摘要、封面图）
   - 自动保存（30 秒间隔或内容变更时 debounce）
   - 手动保存按钮
   - 发布按钮
5. 实现 Markdown → 微信 HTML 转换 `src/utils/markdownToWx.ts`：
   - 将 Markdown 转为内联样式 HTML
   - 处理标题、段落、列表、代码块、引用、表格
   - 代码块特殊渲染（微信兼容）
   - 图片 URL 替换逻辑

**验收标准**:
- 编辑器支持所有标准 Markdown 语法
- 预览效果接近微信公众号实际显示
- 自动保存正常工作
- Markdown → HTML 转换结果在微信中正确显示

---

### 阶段 7: 图片素材管理

**目标**: 实现本地图片素材的上传、管理和在编辑器中使用

**任务**:
1. 实现 Rust 端文件存储管理 `src-tauri/src/storage/mod.rs`：
   - 图片保存到本地目录 `~/.wx-tools/images/`
   - 图片元数据提取（宽高、大小、格式）
   - 图片删除
2. 创建素材状态管理 `src/stores/imageStore.ts`
3. 实现素材库页面 `src/pages/Assets.tsx`：
   - 图片网格展示（缩略图）
   - 图片上传（点击上传、拖拽上传）
   - 图片分组管理
   - 图片预览（点击放大）
   - 图片重命名、删除
   - 图片信息展示（大小、尺寸、上传时间）
4. 创建图片选择器组件 `src/components/ImagePicker.tsx`：
   - 在编辑器中插入图片时弹出
   - 支持从素材库选择或直接上传新图片
   - 返回图片的本地路径或微信 URL
5. 实现编辑器中的图片粘贴支持

**验收标准**:
- 图片上传、预览、删除正常
- 分组管理正常
- 编辑器中能插入素材库图片
- 拖拽和粘贴上传正常

---

### 阶段 8: 微信 API 集成

**目标**: 实现微信公众号 API 调用，完成自动发布流程

**任务**:
1. 实现微信 API 客户端 `src-tauri/src/wx_api/mod.rs`：
   - access_token 获取和自动刷新
   - token 缓存（内存 + 加密持久化）
   - HTTP 请求封装（使用 `reqwest`）
   - 错误处理和重试逻辑
2. 实现素材上传接口：
   - `upload_permanent_material` — 上传永久素材（封面图）
   - `upload_article_image` — 上传文章内图片
3. 实现草稿和发布接口：
   - `create_draft` — 创建草稿
   - `update_draft` — 更新草稿
   - `submit_publish` — 提交发布
   - `get_material_list` — 获取素材列表
4. 实现发布流程编排 `src-tauri/src/commands/publish.rs`：
   - 步骤 1: 上传文章内所有本地图片
   - 步骤 2: 替换 HTML 中的图片 URL
   - 步骤 3: 上传封面图
   - 步骤 4: 创建草稿
   - 步骤 5: 可选群发
   - 每步骤状态回报给前端
5. 实现 AppSecret 加密存储（使用 `keyring` crate 或 AES 加密）

**验收标准**:
- access_token 能正确获取和自动刷新
- 图片上传到微信素材库成功
- 草稿创建成功
- 发布流程完整执行
- AppSecret 不以明文存储

---

### 阶段 9: 手动发布回退

**目标**: 当 API 不可用时，提供手动发布方式

**任务**:
1. 创建 HTML 导出组件 `src/components/HtmlExport.tsx`：
   - 显示格式化好的微信兼容 HTML
   - 一键复制到剪贴板
   - 预览效果
2. 在发布流程中添加回退逻辑：
   - API 调用失败时自动切换到手动模式
   - 未配置公众号时直接进入手动模式
3. 在文章编辑页添加"导出 HTML"按钮

**验收标准**:
- 复制的 HTML 粘贴到公众号后台能正确显示
- API 失败时自动提示手动模式
- 一键复制功能正常

---

### 阶段 10: 设置页面

**目标**: 实现应用设置功能

**任务**:
1. 实现设置页面 `src/pages/Settings.tsx`：
   - 公众号账号配置（AppID / AppSecret 输入和保存）
   - 连接测试按钮（验证 API 凭证是否有效）
   - Markdown 样式主题选择
   - 自动保存间隔设置
   - 数据存储路径配置
2. 创建设置状态管理 `src/stores/settingsStore.ts`
3. 实现数据导出/备份功能：
   - 导出所有文章为 Markdown 文件
   - 导出数据库备份
   - 导入备份

**验收标准**:
- 公众号配置保存和读取正常
- 连接测试能正确反馈结果
- 设置变更即时生效
- 数据导出/导入正常

---

### 阶段 11: 样式主题系统

**目标**: 实现 Markdown → 微信 HTML 的可自定义样式主题

**任务**:
1. 创建默认样式主题 `src/styles/themes/default.ts`：
   - 定义各 Markdown 元素的内联样式映射
   - 标题、段落、列表、代码块、引用、表格等
2. 创建 2-3 个预设主题（简约、技术、优雅等）
3. 实现主题切换逻辑
4. 在预览组件中应用选中的主题

**验收标准**:
- 切换主题后预览效果即时更新
- 导出的 HTML 使用选中主题的样式
- 各主题在微信中显示正常

---

### 阶段 12: 打磨和打包

**目标**: 完善细节，构建可分发的安装包

**任务**:
1. 应用图标设计和配置
2. 配置 Tauri 打包设置：
   - macOS: .dmg
   - Windows: .msi / .exe
   - Linux: .deb / .AppImage
3. 优化应用启动速度
4. 添加应用内错误提示和 loading 状态
5. 键盘快捷键支持（Ctrl+S 保存、Ctrl+N 新建等）
6. 窗口状态记忆（大小、位置）

**验收标准**:
- 三个平台的安装包能正常构建
- 安装后应用正常运行
- 用户体验流畅，无明显卡顿

---

## 依赖关系

```
阶段 1 (脚手架)
  ├── 阶段 2 (数据库)
  │     └── 阶段 3 (Commands)
  │           ├── 阶段 5 (文章管理)
  │           ├── 阶段 7 (素材管理)
  │           └── 阶段 8 (微信 API)
  │                 └── 阶段 9 (手动回退)
  └── 阶段 4 (前端框架)
        ├── 阶段 5 (文章管理)
        ├── 阶段 6 (Markdown 编辑器)
        │     └── 阶段 11 (样式主题)
        ├── 阶段 7 (素材管理)
        └── 阶段 10 (设置)

阶段 12 (打磨打包) — 所有阶段完成后
```

## 建议的开发顺序

1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11 → 12

其中阶段 3 和 4 可以并行开发（后端 Commands 和前端框架互不依赖）。

