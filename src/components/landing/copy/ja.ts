import { PLAN_PRICING } from '@/lib/plan'
import { SITE_HOST } from '@/lib/site'
import type { LandingCopy } from './types'

export const ja: LandingCopy = {
  locale: 'ja',
  nav: { features: '機能', pricing: '料金', video: '動画', login: 'ログイン', start: '無料ではじめる' },
  hero: {
    chip: 'Linktree から移行？30 秒でインポート',
    h1a: 'ファンのクリックを、',
    h1b: '収益に変える。',
    sub: 'フォロワーで稼ぎたいクリエイターのための link-in-bio。商品販売、ブランド案件、自分のメールリスト。',
    claim: 'URL を取得する', claimShort: '取得', claimAria: 'ユーザー名を選ぶ',
    trust: ['永久無料', 'クレカ不要', '30 秒で公開'],
    watch: '45 秒の紹介動画',
  },
  floats: { sale: '新しい注文', saleItem: 'Notion バンドル', sub: '新しい登録者', subText: 'リストに登録されました' },
  strip: '各プラットフォームのクリエイターに',
  video: { eyebrow: '動画', title: '45 秒でわかる Beam。' },
  show: {
    eyebrow: '機能',
    title: 'フォロワーを収益に変える 3 つの方法。',
    rows: [
      { title: 'ワンタップで販売。', line: '全プランに Stripe 決済。Free でも販売できます。' },
      { title: 'リストは自分のもの。', line: '登録者はすべてあなたのもの。いつでも CSV 出力。' },
      { title: '何が稼ぐかが見える。', line: 'ブロックごとのクリックと注文。ブランド案件も実数で交渉。' },
      { title: '自分らしいデザインに。', line: '8 つのテーマ、または完全カスタム。' },
      { title: 'Linktree からお引っ越し。', line: '約 30 秒でインポート完了。', chips: ['Linktree', 'Portaly', 'OpenLink'] },
    ],
  },
  alt: [
    'デジタル商品ブロックと Stripe 決済の完了画面',
    'メールフォームから登録者リストが増えていく様子',
    '分析：クリック、閲覧数、登録者、ブロック別ランキング',
    '同じ Beam ページを 5 つのテーマで表示',
    'Linktree のページを Beam にインポート',
  ],
  blocks: {
    label: '12 種類のブロック、ドラッグで並べ替え',
    items: ['リンクボタン', 'バナー', '見出し', '動画埋め込み', '商品', 'メールフォーム', 'カウントダウン', 'FAQ', 'カルーセル', '地図埋め込み', 'HTML 埋め込み', 'カレンダー追加'],
  },
  steps: { eyebrow: '使い方', title: '3 ステップで公開。', demo: 'ライブデモを見る', items: ['ユーザー名を取得', 'ブロックを追加', '1 つのリンクをシェア'] },
  who: {
    eyebrow: 'こんな方に', title: '稼ぐクリエイターのために。', build: 'ページを作る',
    items: [
      { title: 'ライフスタイル・美容系クリエイター', line: 'アフィリエイト + ブランド案件。', sample: { name: 'Mia Chen', handle: '@miachen.style', blocks: ['愛用スキンケア', 'お仕事のご依頼', '最新の TikTok'] } },
      { title: '講師・コーチ', line: 'コース、テンプレート、コーチング。', sample: { name: 'Alex Wong', handle: '@alexcoaches', blocks: ['Notion テンプレート — $29', 'コーチング（60 分）', '無料ニュースレター'] } },
      { title: 'アーティスト・イラストレーター', line: 'デジタル商品 + ファンリスト。', sample: { name: 'Rae Lin', handle: '@rae.draws', blocks: ['Procreate ブラシ — $12', 'お絵描き配信 · 金曜', 'ニュースレター登録'] } },
    ],
  },
  compare: {
    eyebrow: '比較', title: 'Beam と他ツールの比較', head: ['機能', 'Beam', '他ツール'],
    rows: [
      { feature: '無料プラン', us: '永久', them: '制限あり' },
      { feature: 'デジタル商品の販売', us: '全プラン', them: '有料のみ' },
      { feature: 'メールリスト収集', us: '全プラン', them: '有料のみ' },
      { feature: 'カレンダー追加ブロック', us: true, them: false },
      { feature: 'Linktree / Portaly / OpenLink からインポート', us: true, them: false },
      { feature: 'マルチページ（タブ）', us: '最大無制限', them: 'なし' },
      { feature: '独自ドメイン', us: 'Premium', them: '最上位プランのみ' },
    ],
  },
  pricing: {
    eyebrow: '料金', title: 'どのプランでも販売できる。', sub: '成長するほど手数料が下がる：10% → 5% → 2%。',
    popular: '人気', noCard: 'クレカ不要', full: '全機能比較と手数料シミュレーター',
    annual: n => `年払いなら月 NT$${n}`,
    plans: [
      { name: 'Free', tagline: '稼ぎはじめる', per: '/ 永久', fee: '販売手数料 10%', items: ['1 ページ・12 ブロック', '商品販売・メール収集', '30 日分の分析'], cta: '無料ではじめる' },
      { name: 'Pro', tagline: '毎月収益がある方に', per: '/ 月', fee: '販売手数料 5%', items: ['10 ページ', '全 12 種のブロック', '90 日分の分析', 'ウォーターマーク除去'], cta: 'Pro にアップグレード' },
      { name: 'Premium', tagline: 'チームで運営する方に', per: '/ 月', fee: '販売手数料 2%', items: ['ページ無制限', 'チームメンバー無制限', '独自ドメイン', '優先サポート'], cta: 'Premium にアップグレード' },
    ],
  },
  faq: {
    eyebrow: 'FAQ', title: 'よくある質問。', contact: 'その他のご質問は', contactLink: 'お問い合わせ',
    items: [
      { q: 'Beam は本当に無料ですか？', a: 'はい。無料プランは永久無料で、商品販売（手数料 10%）とメール収集も使えます。Pro へのアップグレードは、ページ追加や手数料 5% への引き下げが必要になった時だけで構いません。' },
      { q: 'Linktree から移行できますか？', a: 'はい。linktr.ee、portaly.cc、openlink.co の URL を貼り付けるだけで、リンク、ソーシャル、名前、紹介、アイコンを 30 秒で取り込みます。' },
      { q: 'Linktree と比べて料金は？', a: `Pro は月 NT$${PLAN_PRICING.pro.monthly} で Linktree Starter とほぼ同じですが、商品販売（手数料 5%）、チームメンバー、カレンダー追加ブロックも使えます。` },
      { q: '商品販売はどう動きますか？', a: '設定で Stripe アカウントを接続。商品ブロックを追加して価格を設定すると、顧客がページから直接購入できます。Beam はプランに応じて少額の手数料を受け取ります。' },
      { q: 'メール登録者から手数料を取りますか？', a: '取りません。登録者はあなたのものです。いつでも CSV でエクスポートできます。' },
      { q: '独自ドメインは使えますか？', a: `Pro では ${SITE_HOST}/yourname の URL を使えます。Premium プランなら独自ドメインに対応し、SSL は当方で処理します。` },
    ],
  },
  cta: { title: '30 秒で、あなたのページを。', claim: '取得' },
  stats: [
    { value: '12', label: 'ブロック種類' },
    { value: '最低 2%', label: '販売手数料' },
    { value: '1 秒未満', label: 'ページ読込' },
    { value: 'NT$0', label: 'はじめる費用' },
  ],
  footer: { links: [['/pricing', '料金'], ['/about', '概要'], ['/contact', 'お問い合わせ'], ['/privacy', 'プライバシー'], ['/terms', '利用規約'], ['/login', 'ログイン']] },
}
