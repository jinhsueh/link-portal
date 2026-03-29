# Link Portal

> 專屬創作者的 Link-in-Bio 平台，仿 Portaly 設計，採用 Cresclab 設計系統。

## 功能

- **個人公開頁面** `/{username}` — 連結按鈕、橫幅、商品、Email 表單、標題區塊
- **拖曳區塊編輯器** — dnd-kit 排序、即時切換顯示/隱藏、手機預覽
- **社群連結管理** — Instagram、YouTube、TikTok、Threads、Facebook、Spotify
- **個人資料設定** — 名稱、簡介、大頭照
- **數據分析** — 點擊數、曝光數、CTR、區塊排行
- **設計系統** — Cresclab 品牌設計（`#5090FF` 主色、Inter/Outfit 字型、膠囊按鈕）

## 快速開始

```bash
# 安裝依賴
npm install

# 初始化資料庫
npm run db:migrate

# 填入範例資料
npm run db:seed

# 啟動開發伺服器
npm run dev
```

開啟 http://localhost:3000

## 頁面結構

| 路徑 | 說明 |
|---|---|
| `/` | Landing page |
| `/login` | 登入 / 註冊 |
| `/admin` | 後台 — 區塊編輯器 |
| `/admin/analytics` | 數據分析 |
| `/admin/settings` | 個人資料 + 社群連結 |
| `/{username}` | 公開個人頁面 |

## API Routes

| Method | Path | 說明 |
|---|---|---|
| GET | `/api/me` | 取得目前登入用戶 |
| PATCH | `/api/me` | 更新個人資料 |
| POST | `/api/auth` | 登入 / 註冊 |
| DELETE | `/api/auth` | 登出 |
| GET/POST | `/api/blocks` | 區塊列表 / 新增 |
| PATCH/DELETE | `/api/blocks/[id]` | 更新 / 刪除 |
| POST | `/api/blocks/reorder` | 重新排序 |
| GET/POST/DELETE | `/api/social` | 社群連結管理 |

## 技術棧

- **前端**: Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- **資料庫**: SQLite + Prisma 7 (better-sqlite3 adapter)
- **拖曳**: @dnd-kit/core + @dnd-kit/sortable
- **設計**: Cresclab Design System (`#5090FF` blue, Inter/Outfit fonts, pill buttons)

## 下一步

- [ ] 認證升級（NextAuth + OAuth）
- [ ] 遷移至 PostgreSQL（Neon）+ 部署 Vercel
- [ ] 點擊追蹤 API
- [ ] 數位商品金流（Stripe）
- [ ] 自訂主題色
