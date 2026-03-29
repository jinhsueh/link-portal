import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'path'

const dbPath = path.join(process.cwd(), 'prisma/dev.db')
const adapter = new PrismaBetterSqlite3({ url: dbPath })
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  // Clean up
  await prisma.block.deleteMany()
  await prisma.socialLink.deleteMany()
  await prisma.page.deleteMany()
  await prisma.user.deleteMany()

  // Create user
  const user = await prisma.user.create({
    data: {
      username: 'demo',
      email: 'demo@linkportal.cc',
      name: 'Demo 創作者',
      bio: '歡迎來到我的傳送門 ✨ 這是一個範例頁面',
    },
  })

  // Create page
  const page = await prisma.page.create({
    data: { userId: user.id, name: '主頁', slug: 'home', isDefault: true, order: 0 },
  })

  // Create blocks
  const blockData = [
    { type: 'heading', title: '我的連結', content: { text: '👋 嗨，我是 Demo 創作者' }, order: 0, active: true, clicks: 0, views: 0 },
    { type: 'link', title: '我的部落格', content: { url: 'https://example.com/blog' }, order: 1, active: true, clicks: 42, views: 156 },
    { type: 'link', title: '最新課程 — Next.js 完整指南', content: { url: 'https://example.com/course' }, order: 2, active: true, clicks: 87, views: 230 },
    { type: 'product', title: 'UI 設計模板包', content: { price: 299, currency: 'NT$', description: '50+ 精選元件', checkoutUrl: 'https://example.com/buy' }, order: 3, active: true, clicks: 28, views: 94 },
    { type: 'email_form', title: '訂閱電子報', content: { placeholder: '輸入你的 Email', buttonText: '免費訂閱' }, order: 4, active: true, clicks: 0, views: 0 },
    { type: 'link', title: '合作洽詢', content: { url: 'mailto:demo@linkportal.cc' }, order: 5, active: false, clicks: 5, views: 12 },
  ]

  for (const b of blockData) {
    await prisma.block.create({
      data: { userId: user.id, pageId: page.id, type: b.type, title: b.title, content: JSON.stringify(b.content), order: b.order, active: b.active, clicks: b.clicks, views: b.views },
    })
  }

  // Create social links
  const socials = [
    { platform: 'instagram', url: 'https://instagram.com', order: 0 },
    { platform: 'youtube', url: 'https://youtube.com', order: 1 },
    { platform: 'threads', url: 'https://threads.net', order: 2 },
  ]
  for (const s of socials) {
    await prisma.socialLink.create({ data: { userId: user.id, ...s } })
  }

  console.log(`✅ Seeded demo user: ${user.username}`)
  console.log(`   → Visit http://localhost:3000/${user.username}`)
  console.log(`   → Login at http://localhost:3000/login with username: demo`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
