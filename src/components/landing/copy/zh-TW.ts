import { PLAN_PRICING } from '@/lib/plan'
import { SITE_HOST } from '@/lib/site'
import type { LandingCopy } from './types'

export const zhTW: LandingCopy = {
  locale: 'zh-TW',
  nav: { features: '功能', pricing: '方案', video: '影片', login: '登入', start: '免費開始' },
  hero: {
    chip: '從 Linktree 搬家？30 秒匯入',
    h1a: '把你的受眾',
    h1b: '變成收入。',
    sub: '給想靠追蹤者賺錢的創作者與 KOL：賣商品、接業配、擁有自己的名單。',
    claim: '認領我的頁面', claimShort: '認領', claimAria: '選擇你的使用者名稱',
    trust: ['永久免費', '不需信用卡', '30 秒上線'],
    watch: '看 45 秒介紹影片',
  },
  floats: { sale: '新訂單', saleItem: 'Notion 模板包', sub: '新訂閱', subText: '加入了你的名單' },
  strip: '為這些平台的創作者打造',
  video: { eyebrow: '影片', title: '45 秒看懂 Beam。' },
  show: {
    eyebrow: '功能',
    title: '讓追蹤者為你帶來收入的三種方式。',
    rows: [
      { title: '一鍵開賣。', line: '每個方案都有 Stripe 結帳，免費方案也可以。' },
      { title: '名單是你的。', line: '每個訂閱者都屬於你，隨時匯出。' },
      { title: '看清什麼在賺錢。', line: '每個區塊的點擊與訂單，談業配有真數字。' },
      { title: '做成你的樣子。', line: '8 套主題，或完全自訂。' },
      { title: '把 Linktree 搬過來。', line: '大約 30 秒完成匯入。', chips: ['Linktree', 'Portaly', 'OpenLink'] },
    ],
  },
  alt: [
    '數位商品區塊與 Stripe 結帳完成畫面',
    'Email 表單收到新訂閱，訂閱者名單即時更新',
    '數據：點擊、瀏覽、訂閱數與區塊排行',
    '同一個 Beam 頁面的五種主題',
    '把 Linktree 頁面匯入 Beam',
  ],
  blocks: {
    label: '12 種區塊，拖拉排序',
    items: ['連結按鈕', '橫幅', '標題', '影片嵌入', '商品', 'Email 表單', '倒數計時', 'FAQ', '輪播', '地圖嵌入', 'HTML 嵌入', '加入行事曆'],
  },
  steps: { eyebrow: '如何開始', title: '三步上線。', demo: '打開即時 Demo', items: ['認領你的網址', '加入區塊', '分享一個連結'] },
  who: {
    eyebrow: '適合誰', title: '為靠內容賺錢的創作者而做。', build: '建立你的頁面',
    items: [
      { title: '生活與美妝創作者', line: '分潤推薦 + 品牌業配。', sample: { name: 'Mia Chen', handle: '@miachen.style', blocks: ['我的保養品推薦', '合作邀約', '最新 TikTok'] } },
      { title: '講師與教練', line: '課程、模板、諮詢。', sample: { name: 'Alex Wong', handle: '@alexcoaches', blocks: ['Notion 模板包 — $29', '1 對 1 諮詢（60 分鐘）', '免費電子報'] } },
      { title: '藝術家與插畫家', line: '數位商品 + 粉絲名單。', sample: { name: 'Rae Lin', handle: '@rae.draws', blocks: ['Procreate 筆刷包 — $12', '直播畫畫 · 週五', '訂閱我的電子報'] } },
    ],
  },
  compare: {
    eyebrow: '比較', title: 'Beam 與其他工具', head: ['功能', 'Beam', '其他工具'],
    rows: [
      { feature: '免費方案', us: '永久', them: '有限制' },
      { feature: '販售數位商品', us: '所有方案', them: '付費限定' },
      { feature: 'Email 名單蒐集', us: '所有方案', them: '付費限定' },
      { feature: '加入行事曆區塊', us: true, them: false },
      { feature: 'Linktree / Portaly / OpenLink 匯入', us: true, them: false },
      { feature: '多頁面（分頁）', us: '最多無限', them: '無' },
      { feature: '自訂網域', us: 'Premium', them: '最高方案限定' },
    ],
  },
  pricing: {
    eyebrow: '方案', title: '每個方案都能賣。', sub: '越成長，抽成越低：10% → 5% → 2%。',
    popular: '最受歡迎', noCard: '不需信用卡', full: '完整功能比較與抽成試算',
    annual: n => `年繳每月 NT$${n}`,
    plans: [
      { name: 'Free', tagline: '開始賺錢', per: '/ 永久', fee: '銷售抽成 10%', items: ['1 個頁面、12 個區塊', '販售商品與蒐集 Email', '30 天數據'], cta: '免費開始' },
      { name: 'Pro', tagline: '每月穩定有收入', per: '/ 月', fee: '銷售抽成 5%', items: ['10 個頁面', '全部 12 種區塊', '90 天數據', '移除 Beam 標示'], cta: '升級 Pro' },
      { name: 'Premium', tagline: '有團隊的創作者', per: '/ 月', fee: '銷售抽成 2%', items: ['無限頁面', '無限團隊成員', '自訂網域', '優先支援'], cta: '升級 Premium' },
    ],
  },
  faq: {
    eyebrow: '常見問題', title: '你可能想問。', contact: '還有其他問題？', contactLink: '聯絡我們',
    items: [
      { q: '真的有永久免費方案嗎？', a: '是的，免費方案永久可用。1 個頁面、12 個區塊、8 種核心區塊類型（含商品販售與 Email 蒐集），商品販售 10% 平台抽成。不需要信用卡。' },
      { q: '可以從 Linktree 匯入嗎？', a: '可以。貼上你的 linktr.ee、portaly.cc 或 openlink.co 網址，Beam 會自動把你的連結、社群圖標、名稱、簡介、頭像全部抓過來，整個過程約 30 秒。' },
      { q: 'Beam 跟 Linktree 比起來價格如何？', a: `Beam Pro 月費 NT$${PLAN_PRICING.pro.monthly}，跟 Linktree Starter 差不多 — 但你還能販售商品（5% 抽成）、3 位團隊成員、加入行事曆區塊。` },
      { q: '可以販售數位商品嗎？', a: '可以，所有方案皆可。免費方案 10% 抽成、Pro 5%、Premium 2%。Stripe 處理金流，款項直接進你的帳戶。' },
      { q: '需要懂程式嗎？', a: '完全不用。所有設定都是拖放 + 即時預覽。如果你想要自訂 CSS 或 iframe，Premium 方案的 HTML 嵌入區塊都支援。' },
      { q: '可以用自己的網域嗎？', a: `Pro 方案會給你乾淨的 ${SITE_HOST}/yourname 網址。Premium 方案支援自訂網域，把你自己的域名指向你的頁面。` },
    ],
  },
  cta: { title: '30 秒，擁有你的頁面。', claim: '認領' },
  stats: [
    { value: '12', label: '種區塊' },
    { value: '最低 2%', label: '平台抽成' },
    { value: '< 1 秒', label: '頁面載入' },
    { value: 'NT$0', label: '開始使用' },
  ],
  footer: { links: [['/pricing', '方案'], ['/about', '關於'], ['/contact', '聯絡'], ['/privacy', '隱私'], ['/terms', '條款'], ['/login', '登入']] },
}
