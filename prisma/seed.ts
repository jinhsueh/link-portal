import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'path'

const dbPath = path.join(process.cwd(), 'dev.db')
const adapter = new PrismaBetterSqlite3({ url: dbPath })
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  // Clean up
  await prisma.block.deleteMany()
  await prisma.socialLink.deleteMany()
  await prisma.page.deleteMany()
  await prisma.user.deleteMany()

  // Theme is account-level (User.theme) — same JSON shared by every page,
  // so switching tabs swaps blocks but never the visual identity.
  const DEMO_THEME = JSON.stringify({
    primaryColor: '#E84393',
    bgType: 'gradient',
    bgColor: '#FFF5F7',
    bgGradient: 'linear-gradient(135deg, #FFF5F7 0%, #FFECD2 50%, #FCB69F 100%)',
    buttonStyle: 'rounded',
    fontStyle: 'modern',
  })

  // ─── Create user: 一個有真實感的台灣創作者 ───
  const user = await prisma.user.create({
    data: {
      username: 'demo',
      email: 'mia@example.com',
      name: 'Mia 米亞',
      bio: '生活美學 × 穿搭靈感 🌸 IG 12 萬追蹤 ✦ YouTube 週更 ✦ 合作邀約歡迎私訊 💌',
      avatarUrl: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=200&h=200&fit=crop&crop=face',
      theme: DEMO_THEME,
    },
  })

  // ─── Page 1: 主頁 ───
  const mainPage = await prisma.page.create({
    data: {
      userId: user.id,
      name: '主頁',
      slug: 'home',
      isDefault: true,
      order: 0,
    },
  })

  // ─── Page 2: 合作 ───
  const collabPage = await prisma.page.create({
    data: {
      userId: user.id,
      name: '合作邀約',
      slug: 'collab',
      isDefault: false,
      order: 1,
    },
  })

  // ─── Main page blocks ───
  const mainBlocks = [
    {
      type: 'heading',
      title: '嗨，我是米亞 💕',
      content: { text: '穿搭 × 美妝 × 生活美學，陪你變成更好的自己' },
      order: 0,
      active: true,
      clicks: 0,
      views: 0,
    },
    {
      type: 'link',
      title: '🎬 YouTube — 米亞的穿搭日記',
      content: { url: 'https://youtube.com/@mia-style' },
      order: 1,
      active: true,
      clicks: 2847,
      views: 8920,
    },
    {
      type: 'link',
      title: '🎧 Podcast — 女生聊心事',
      content: { url: 'https://open.spotify.com' },
      order: 2,
      active: true,
      clicks: 1356,
      views: 4210,
    },
    {
      type: 'banner',
      title: '🌸 春夏穿搭企劃 — 10 套一週 Look',
      content: {
        url: 'https://example.com/spring-lookbook',
        imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&h=400&fit=crop',
        description: '平價混搭高質感，每套不超過 NT$3,000',
      },
      order: 3,
      active: true,
      clicks: 1534,
      views: 5890,
    },
    {
      type: 'product',
      title: '米亞的穿搭公式電子書',
      content: {
        price: 299,
        currency: 'NT$',
        description: '30 頁穿搭邏輯 + 配色指南 + 膠囊衣櫥清單。已賣出 1,200+ 份！',
        checkoutUrl: 'https://example.com/buy/style-ebook',
      },
      order: 4,
      active: true,
      clicks: 876,
      views: 3456,
    },
    {
      type: 'product',
      title: 'Lightroom 濾鏡預設包 — 奶茶色系',
      content: {
        price: 199,
        currency: 'NT$',
        description: '12 款 IG 風格濾鏡，一鍵套用，讓你的照片質感 UP ✨',
        checkoutUrl: 'https://example.com/buy/presets',
      },
      order: 5,
      active: true,
      clicks: 643,
      views: 2178,
    },
    {
      type: 'video',
      title: '最新影片：韓國首爾 3 天穿搭 Vlog',
      content: {
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      },
      order: 6,
      active: true,
      clicks: 1267,
      views: 4890,
    },
    {
      type: 'link',
      title: '👗 蝦皮精選好物清單',
      content: { url: 'https://shopee.tw' },
      order: 7,
      active: true,
      clicks: 2145,
      views: 6320,
    },
    {
      type: 'link',
      title: '💄 小紅書 — 美妝真實評測',
      content: { url: 'https://xiaohongshu.com' },
      order: 8,
      active: true,
      clicks: 945,
      views: 2920,
    },
    {
      type: 'email_form',
      title: '💌 訂閱米亞週報',
      content: {
        placeholder: '輸入你的 Email',
        buttonText: '免費訂閱',
        description: '每週分享私藏好物、穿搭靈感、限時折扣碼。已有 5,600+ 訂閱者！',
      },
      order: 9,
      active: true,
      clicks: 0,
      views: 0,
    },
    {
      type: 'link',
      title: '☕ Buy Me a Coffee',
      content: { url: 'https://buymeacoffee.com' },
      order: 10,
      active: true,
      clicks: 312,
      views: 1890,
    },
  ]

  for (const b of mainBlocks) {
    await prisma.block.create({
      data: {
        userId: user.id,
        pageId: mainPage.id,
        type: b.type,
        title: b.title,
        content: JSON.stringify(b.content),
        order: b.order,
        active: b.active,
        clicks: b.clicks,
        views: b.views,
      },
    })
  }

  // ─── Collab page blocks ───
  const collabBlocks = [
    {
      type: 'heading',
      title: '品牌合作',
      content: { text: '💼 歡迎美妝、服飾、生活品牌合作洽詢' },
      order: 0,
      active: true,
      clicks: 0,
      views: 0,
    },
    {
      type: 'link',
      title: '📊 合作數據 — IG 12 萬 / YT 8 萬 / Podcast 2 萬',
      content: { url: 'https://example.com/media-kit' },
      order: 1,
      active: true,
      clicks: 534,
      views: 1270,
    },
    {
      type: 'link',
      title: '📄 下載媒體資料包 (Media Kit)',
      content: { url: 'https://example.com/media-kit.pdf' },
      order: 2,
      active: true,
      clicks: 267,
      views: 810,
    },
    {
      type: 'link',
      title: '📸 過往合作案例集',
      content: { url: 'https://example.com/portfolio' },
      order: 3,
      active: true,
      clicks: 189,
      views: 560,
    },
    {
      type: 'link',
      title: '📧 合作信箱 — mia@example.com',
      content: { url: 'mailto:mia@example.com' },
      order: 4,
      active: true,
      clicks: 145,
      views: 445,
    },
  ]

  for (const b of collabBlocks) {
    await prisma.block.create({
      data: {
        userId: user.id,
        pageId: collabPage.id,
        type: b.type,
        title: b.title,
        content: JSON.stringify(b.content),
        order: b.order,
        active: b.active,
        clicks: b.clicks,
        views: b.views,
      },
    })
  }

  // ─── Social links ───
  const socials = [
    { platform: 'instagram', url: 'https://instagram.com/mia.style.tw', order: 0 },
    { platform: 'youtube', url: 'https://youtube.com/@mia-style', order: 1 },
    { platform: 'tiktok', url: 'https://tiktok.com/@mia.style', order: 2 },
    { platform: 'threads', url: 'https://threads.net/@mia.style.tw', order: 3 },
    { platform: 'spotify', url: 'https://open.spotify.com', order: 4 },
  ]

  for (const s of socials) {
    await prisma.socialLink.create({ data: { userId: user.id, ...s } })
  }

  console.log(`✅ Seeded demo user: ${user.username}`)
  console.log(`   → Name: ${user.name}`)
  console.log(`   → Pages: 主頁, 合作邀約`)
  console.log(`   → Blocks: ${mainBlocks.length} (main) + ${collabBlocks.length} (collab)`)
  console.log(`   → Visit http://localhost:3000/${user.username}`)
  console.log(`   → Login at http://localhost:3000/login with username: demo`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
