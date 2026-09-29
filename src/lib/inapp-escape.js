// inapp-escape.js v1.2.4 - detect in-app browsers where Google sign-in is blocked (403 disallowed_useragent) and
// help the user reopen the page in a real browser BEFORE OAuth starts. Dependency-free; detectInApp/buildEscapeUrl/
// encodeCarry/decodeCarry are server-safe (buildEscapeUrl needs an absolute target or opts.currentUrl there).
// Never spoofs the UA. One-tap schemes only where evidence is high/medium (research 2026-09-29); the rest gets
// manual steps + copy link. Auto-redirect: opt-in, LINE only, one attempt per tab.

export const VERSION = '1.2.4';
// Query keys copied onto a custom escape target so attribution / return-to survive the browser switch.
export const PRESERVE_PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid',
  'gbraid', 'wbraid', 'fbclid', 'ref', 'partner', 'src', 'sk', 'sid', 'next', 'return_to', 'lang', 'feed', 'stay'];
// Methods whose latest evidence is "unreliable": off unless a product opts in with enableMethods after a device pass.
export const DEFAULT_OFF = ['xsafari-window'];
const MARK = 'ia_esc', METHOD = 'ia_m', CTX = 'ia_ctx', HASH = 'ia_h', GUARD = 'ia_google', LINE_EXT = 'openExternalBrowser';
const STRIP = [MARK, METHOD, CTX, HASH, GUARD, LINE_EXT], HAS_WIN = typeof window !== 'undefined' && typeof document !== 'undefined';
// Auth material / PII never rides an escape URL (query or #hash).
const DROP = ['email', 'mail', 'phone', 'tel', 'token', 'id_token', 'access_token', 'refresh_token', 'code', 'state',
  'pre_auth', 'jwt', 'otp', 'password', 'pass'];
const SECRET_HASH = /(^|[#&])(jwt|token|id_token|access_token|pre_auth|code|otp)=/i;
const CARRY_MAX = 1800;
const noop = () => {}, esc = (t) => String(t).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const ss = (k, v) => { try { if (v === undefined) return sessionStorage.getItem(k); if (v === null) sessionStorage.removeItem(k); else sessionStorage.setItem(k, v); return v; } catch { return null; } };
// Analytics sinks must never break the guard (gtag undefined, ad blockers, typos).
const safe = (fn) => (n, p) => { try { (fn || noop)(n, p); } catch { /* ignore sink errors */ } };
const BOT = /[a-z]bot\/|\bbot\b|crawler|spider|facebookexternalhit|meta-externalagent|line-poker|lighthouse/i;

// [key, display name, UA test, per-OS escape [method, confidence], soft]; missing OS = manual steps only.
// soft = Google's behaviour there is unverified: gentler copy + "try anyway", never server-guarded.
const APPS = [
  ['line', 'LINE', / Line\/\d/, { ios: ['xsafari', 'medium'], android: ['intent', 'medium'] }],
  ['threads', 'Threads', /\bBarcelona [\d.]+|\bMetaIAB Threads\b/, { ios: ['xsafari-window', 'medium'], android: ['intent', 'medium'] }],
  ['instagram', 'Instagram', /\bInstagram [\d.]+|\bMetaIAB Instagram\b/, { ios: ['ig', 'medium'], android: ['ig', 'medium'] }],
  ['messenger', 'Messenger', /MessengerForiOS|FB_IAB\/(MESSENGER|Orca-Android)|FBAN\/FBIOS(?!.*IABMV).*FBOP\/80\b|\bMetaIAB Messenger\b/, { ios: ['xsafari', 'medium'], android: ['intent', 'medium'] }],
  ['facebook', 'Facebook', /FBAN\/|FBAV\/|FB_IAB\/|\bMetaIAB\b/, { ios: ['xsafari-window', 'medium'], android: ['intent', 'medium'] }],
  ['tiktok', 'TikTok', /\b(musical_ly|trill)_|BytedanceWebview|AppName\/(musical_ly|trill)/i, {}],
  ['wechat', 'WeChat', /\bMicroMessenger\//i, {}],
  ['kakaotalk', 'KakaoTalk', /\bKAKAOTALK\b/i, {}],
  ['x', 'X', /\bTwitterAndroid\b|\bTwitter for iP(hone|ad)\b/, {}],
  ['linkedin', 'LinkedIn', /\[LinkedInApp\]/i, { ios: ['xsafari', 'medium'] }],
  ['snapchat', 'Snapchat', /\bSnapchat\/\d/i, {}],
  ['pinterest', 'Pinterest', /\[Pinterest\/(iOS|Android)\]/i, {}],
  ['zalo', 'Zalo', /\bZalo(App)?\/\d/i, {}],
  ['whatsapp', 'WhatsApp', /\bWA4A\/|\bWAiOS\/|\bWhatsApp\//, {}, true],
  ['naver', 'NAVER', /\bNAVER\(inapp;/, {}, true],
  ['yahoojp', 'Yahoo! JAPAN', /\bYJApp-(IOS|ANDROID)\b/i, {}, true],
];

// -> { inApp, app, name, os, googleBlocked: true | false | null (unknown), escape: [method, conf] | null, liff, heuristic }
// heuristic = generic webview guess (no app token): never demote Google / server-guard on this alone.
export function detectInApp(ua, win) {
  const w = win !== undefined ? win : HAS_WIN ? window : null, nav = w && w.navigator;
  ua = ua == null ? (nav && nav.userAgent) || '' : String(ua);
  const touchMac = !!nav && /Macintosh/.test(ua) && nav.maxTouchPoints > 1; // iPadOS desktop-mode UA
  const os = /Android/.test(ua) ? 'android' : /\b(iPhone|iPad|iPod)\b/.test(ua) || touchMac ? 'ios' : 'other';
  const res = (app, name, googleBlocked, e, heuristic = false) => {
    if (e && os === 'ios' && /OS 16_/.test(ua) && e[0].startsWith('xsafari')) e = null; // x-safari-https fails on iOS 16
    return { inApp: !!app, app, name, os, googleBlocked, escape: e || null, liff: / LIFF\b/.test(ua), heuristic };
  };
  if (!ua || BOT.test(ua) || os === 'other') return res(null, '', false); // desktop apps open links in the real browser
  let standalone = false;
  try { standalone = !!w && (nav.standalone === true || (!!w.matchMedia && w.matchMedia('(display-mode: standalone)').matches)); } catch { /* ignore */ }
  if (standalone) return res(null, '', false); // home-screen web app: not the embedded class Google blocks
  for (const [app, name, re, e, soft] of APPS) if (re.test(ua)) return res(app, name, soft ? null : true, e[os]);
  if (w && ['TelegramWebviewProxy', 'TelegramWebviewProxyProto', 'TelegramWebview'].some((k) => k in w))
    return res('telegram', 'Telegram', null, { ios: ['xsafari', 'medium'], android: ['intent', 'medium'] }[os]);
  let wvBrand = false;
  try { wvBrand = !!(nav && nav.userAgentData && (nav.userAgentData.brands || []).some((b) => /Android WebView/i.test(b.brand))); } catch { /* ignore */ }
  if (os === 'android' && (/; ?wv\)/.test(ua) || wvBrand)) return res('webview', '', true, ['intent', 'low'], true);
  if (os === 'ios' && !/Safari\/\d/.test(ua)) return res('webview', '', true, ['xsafari', 'low'], true);
  return res(null, '', false); // real browsers, SFSafariViewController, Custom Tabs: leave alone
}

const b64 = (s) => btoa(Array.from(new TextEncoder().encode(s), (b) => String.fromCharCode(b)).join(''))
  .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
// Key order = priority. Over the cap, the LAST keys are dropped one by one (never the whole blob).
export function encodeCarryDetailed(obj, max = CARRY_MAX) {
  const e = Object.entries(obj || {}).filter(([, v]) => v != null && v !== '').map(([k, v]) => [k, String(v)]);
  const dropped = [];
  while (e.length) {
    const s = b64(JSON.stringify(Object.fromEntries(e)));
    if (s.length <= max) return { s, dropped };
    dropped.unshift(e.pop()[0]);
  }
  return { s: '', dropped };
}
export const encodeCarry = (obj, max) => encodeCarryDetailed(obj, max).s;
export function decodeCarry(s) {
  const out = {};
  try {
    const bin = atob(String(s || '').replace(/-/g, '+').replace(/_/g, '/'));
    const o = JSON.parse(new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0))));
    for (const [k, v] of Object.entries(o && typeof o === 'object' ? o : {})) if (typeof v === 'string') out[k] = v;
  } catch { /* empty or tampered: ignore */ }
  return out; // client-controlled data: validate every field before use
}

// -> { https (copy-link URL), href (one-tap scheme URL or null), method, confidence, windowOpen, safari, dropped }
// opts: carry (obj|fn, key order = priority), tapOnly (carry keys kept OFF the copyable URL, e.g. bearer-ish ids),
// params (obj|fn: extra query params, e.g. partner/gclid: URL-borne so gtag sees them), disabledMethods, enableMethods,
// experimental (allow low-confidence methods), currentUrl (server use), onEvent.
export function buildEscapeUrl(target, info, opts = {}) {
  const here = opts.currentUrl || (HAS_WIN ? location.href : undefined), emit = safe(opts.onEvent);
  if (!here && !/^https?:\/\//i.test(target || '')) throw new Error('buildEscapeUrl: pass an absolute target or opts.currentUrl on the server');
  const u = new URL(target || here, here), cur = here && u.href !== here ? new URL(here).searchParams : null;
  if (cur) for (const k of PRESERVE_PARAMS) if (cur.has(k) && !u.searchParams.has(k)) u.searchParams.set(k, cur.get(k));
  const params = (typeof opts.params === 'function' ? opts.params() : opts.params) || {}; // fn = read at tap time
  for (const [k, v] of Object.entries(params)) if (v != null && v !== '' && !DROP.includes(k)) u.searchParams.set(k, String(v));
  STRIP.concat(DROP).forEach((k) => u.searchParams.delete(k)); u.searchParams.set(MARK, info.app || 'webview');
  if (u.hash.length > 1 && !SECRET_HASH.test(u.hash)) u.searchParams.set(HASH, u.hash.slice(1)); // intent:// has no #fragment
  u.hash = '';
  const carry = (typeof opts.carry === 'function' ? opts.carry() : opts.carry) || {};
  const tapOnly = opts.tapOnly || [], copyCarry = Object.fromEntries(Object.entries(carry).filter(([k]) => !tapOnly.includes(k)));
  const full = encodeCarryDetailed(carry), copy = encodeCarryDetailed(copyCarry);
  if (full.dropped.length) emit('carry_truncated', { app: info.app, dropped: full.dropped.join(',') });
  const withM = (m, ctx) => { const t = new URL(u.href); t.searchParams.set(METHOD, m); if (ctx) t.searchParams.set(CTX, ctx); return t; };
  const https = withM('copy', copy.s).href;
  const off = DEFAULT_OFF.filter((m) => !(opts.enableMethods || []).includes(m)).concat(opts.disabledMethods || []);
  let e = info.escape;
  if (e && ((e[1] === 'low' && !opts.experimental) || off.includes(e[0]))) e = null;
  const base = { https, dropped: full.dropped };
  if (!e) return { ...base, href: null, method: 'manual', confidence: null, windowOpen: false, safari: false };
  const [method, confidence] = e, t = withM('tap', full.s), rest = t.host + t.pathname + t.search;
  const href = method === 'intent' ? `intent://${rest}#Intent;scheme=${t.protocol.slice(0, -1)};end`
    : method === 'ig' ? `instagram://extbrowser/?url=${encodeURIComponent(t.href)}`
    : `x-safari-${t.protocol}//${rest}`;
  return { ...base, href, method, confidence, windowOpen: method === 'xsafari-window', safari: method.startsWith('xsafari') };
}

// Links WE author inside LINE (OA messages, rich menus, share buttons): the one high-confidence LINE escape.
export function lineExternalLink(url) { const u = new URL(url); u.searchParams.set(LINE_EXT, '1'); return u.href; }

// pendingGuard: ?ia_google=1 arrived (server guard) and the user hasn't closed that sheet yet — survives destroy()/re-init
// (SPA remounts, StrictMode) even though handleLanding already stripped the param from the URL.
let carried = null, landing = null, failed = false, intercept = null, sheet = null, pendingGuard = false;
export const getCarried = () => {
  if (carried && Object.keys(carried).length) return carried; // never cache an empty read: a later URL may carry ia_ctx
  const c = HAS_WIN ? decodeCarry(new URL(location.href).searchParams.get(CTX)) : {};
  if (Object.keys(c).length) carried = c;
  return c;
};
export const getLanding = () => landing || (ss('ia_landed') ? { from: ss('ia_landed'), method: 'earlier' } : null);

function handleLanding(info, emit) {
  const u = new URL(location.href), q = u.searchParams;
  if (!STRIP.some((k) => q.has(k))) return false; // ordinary load: touch nothing
  const from = q.get(MARK), method = from ? q.get(METHOD) || 'unknown' : 'line-link', h = q.get(HASH);
  const guard = q.get(GUARD) === '1', src = from || (q.has(LINE_EXT) ? 'line' : null);
  const c = decodeCarry(q.get(CTX)); if (Object.keys(c).length) carried = c;
  if (guard) pendingGuard = true;
  STRIP.forEach((k) => q.delete(k));
  if (h && !u.hash) u.hash = h;
  // Next.js App Router patches replaceState and skips its router sync when the state carries Next's own `__NA` marker, so
  // the router kept the ia_* URL and re-pushed it on the next Server Action / refresh. Drop the marker: Next re-adds its
  // internals and syncs canonicalUrl to the stripped URL. Non-Next hosts keep their state untouched.
  const st = history.state && typeof history.state === 'object' && history.state.__NA ? { ...history.state } : history.state;
  if (st && st !== history.state) delete st.__NA;
  try { history.replaceState(st, '', u.pathname + u.search + u.hash); } catch { /* ignore */ }
  if (src && !info.inApp) {
    const first = !ss('ia_landed'); landing = { from: src, method }; ss('ia_landed', src);
    if (first) emit('escape_landed', { from: src, method, os: info.os }); // once per tab: reloads don't double-count
  }
  else if (src && (from || info.app === 'line')) { failed = !!from; ss('ia_tried', '1'); emit('escape_failed', { from: src, method, still: info.app, os: info.os }); }
  return guard;
}

function tryAutoEscape(info, opts, emit) {
  const u = new URL(location.href);
  if (info.app !== 'line' || !(opts.autoEscape || []).includes('line') || info.liff || failed) return false;
  if (['code', 'state', MARK].some((k) => u.searchParams.has(k)) || /^\/api\/|callback/i.test(u.pathname)) return false;
  if (ss('ia_tried') || ss('ia_tried', '1') === null) return false; // one attempt per tab; no storage = no auto
  const t = new URL(buildEscapeUrl(u.href, info, opts).https);
  t.searchParams.set(METHOD, 'auto'); t.searchParams.set(LINE_EXT, '1');
  emit('escape_attempted', { app: 'line', os: info.os, method: 'line-auto', confidence: 'low' });
  location.replace(t.href);
  return true;
}

// Still visible after 2.5s = SUSPECTED no handoff (IG may show its own prompt first). The attempt is also stamped in
// sessionStorage: if a host WebView navigated to an error page and the user came back, initInAppEscape reports it.
function watchHandoff(method, cb) {
  let left = false; const off = () => { left = true; };
  ss('ia_att', JSON.stringify({ m: method, t: Date.now() }));
  document.addEventListener('visibilitychange', off, { once: true }); window.addEventListener('pagehide', off, { once: true });
  setTimeout(() => { if (!left && document.visibilityState === 'visible') cb(); }, 2500);
}
function checkReturned(info, emit) {
  let a = null; try { a = JSON.parse(ss('ia_att') || 'null'); } catch { /* ignore */ }
  if (!a) return; ss('ia_att', null);
  if (info.inApp && Date.now() - a.t < 20000) emit('escape_no_handoff', { app: info.app, os: info.os, method: a.m, reason: 'returned' });
}

// Lower evidence than the sheet's tapped <a href>: call ONLY synchronously inside a click handler. Refuses 'ig'
// (only tapped anchors are evidenced) - render the sheet for that. opts.auto = the opt-in LINE self-redirect instead.
export function escapeToExternalBrowser(opts = {}) {
  const info = opts.info || detectInApp(), emit = safe(opts.onEvent);
  if (opts.auto) return tryAutoEscape(info, opts, emit);
  const e = buildEscapeUrl(opts.target, info, opts); if (!e.href || e.method === 'ig') return e;
  emit('escape_attempted', { app: info.app, os: info.os, method: e.method, confidence: e.confidence });
  if (e.windowOpen) window.open(e.href, '_blank'); else location.href = e.href;
  watchHandoff(e.method, () => { emit('escape_no_handoff', { app: info.app, os: info.os, method: e.method }); (opts.onNoHandoff || noop)(); });
  return e;
}

const STR = {
  zh: { title: '用瀏覽器開啟，繼續 {provider} 登入', body: '{app} 內建的瀏覽器不支援 {provider} 登入。請改用 Safari 或 Chrome 開啟這一頁，就能繼續。',
    bodyMaybe: '在 {app} 裡，{provider} 登入可能無法完成。建議改用 Safari 或 Chrome 開啟這一頁。', openSafari: '用 Safari 開啟',
    openBrowser: '用瀏覽器開啟', copy: '複製連結', copied: '已複製，請貼到 Safari 或 Chrome 的網址列', copyManual: '請長按下方網址來複製',
    noHandoff: '如果畫面沒有切換，可以用「複製連結」或下面的方法。', failed: '剛才沒有切換到瀏覽器，可以改用下面的方法。',
    manual: '也可以自己開啟：', cont: '仍在這裡用 {provider} 登入', close: '關閉', vary: '選單名稱可能因 App 版本略有不同。', thisApp: '這個 App' },
  en: { title: 'Open in your browser to continue with {provider}', body: "{app}'s built-in browser doesn't support {provider} sign-in. Open this page in Safari or Chrome to continue.",
    bodyMaybe: '{provider} sign-in may not finish inside {app}. Opening this page in Safari or Chrome works best.', openSafari: 'Open in Safari',
    openBrowser: 'Open in browser', copy: 'Copy link', copied: 'Copied. Paste it into Safari or Chrome.', copyManual: 'Press and hold the link below to copy it',
    noHandoff: 'If nothing changed, copy the link or follow the steps below.', failed: "That didn't open your browser. You can use the steps below.",
    manual: 'Or open it yourself:', cont: 'Try {provider} here anyway', close: 'Close', vary: 'Menu names can vary by app version.', thisApp: 'this app' },
  ja: { title: '{provider} でログインするにはブラウザで開いてください', body: '{app} の内蔵ブラウザでは {provider} ログインを使えません。Safari または Chrome でこのページを開くと続けられます。',
    bodyMaybe: '{app} の中では {provider} ログインが完了しない場合があります。Safari または Chrome で開くのがおすすめです。', openSafari: 'Safari で開く',
    openBrowser: 'ブラウザで開く', copy: 'リンクをコピー', copied: 'コピーしました。Safari または Chrome のアドレスバーに貼り付けてください。', copyManual: '下のリンクを長押ししてコピーしてください',
    noHandoff: '画面が切り替わらない場合は、リンクをコピーするか下の方法をお試しください。', failed: 'ブラウザに切り替わりませんでした。下の方法をお試しください。',
    manual: 'ご自身で開く場合：', cont: 'このまま {provider} でログインする', close: '閉じる', vary: 'メニュー名はアプリのバージョンによって異なる場合があります。', thisApp: 'このアプリ' },
  th: { title: 'เปิดในเบราว์เซอร์เพื่อเข้าสู่ระบบด้วย {provider}', body: 'เบราว์เซอร์ในแอป {app} ไม่รองรับการเข้าสู่ระบบด้วย {provider} กรุณาเปิดหน้านี้ใน Safari หรือ Chrome เพื่อดำเนินการต่อ',
    bodyMaybe: 'การเข้าสู่ระบบด้วย {provider} ในแอป {app} อาจไม่สำเร็จ แนะนำให้เปิดหน้านี้ใน Safari หรือ Chrome', openSafari: 'เปิดใน Safari',
    openBrowser: 'เปิดในเบราว์เซอร์', copy: 'คัดลอกลิงก์', copied: 'คัดลอกแล้ว วางในแถบที่อยู่ของ Safari หรือ Chrome', copyManual: 'กดค้างที่ลิงก์ด้านล่างเพื่อคัดลอก',
    noHandoff: 'หากหน้าจอไม่เปลี่ยน ให้คัดลอกลิงก์หรือทำตามขั้นตอนด้านล่าง', failed: 'ยังไม่ได้เปิดในเบราว์เซอร์ ลองทำตามขั้นตอนด้านล่าง',
    manual: 'หรือเปิดเอง:', cont: 'ลองเข้าสู่ระบบด้วย {provider} ที่นี่ต่อ', close: 'ปิด', vary: 'ชื่อเมนูอาจแตกต่างกันตามเวอร์ชันของแอป', thisApp: 'แอปนี้' },
};
// Menu paths: labels are unverified on current builds (quoted only where a zh-TW source exists) - keep generic.
const STEPS = {
  zh: { default: '點右上角的「⋯」或分享圖示，選擇用瀏覽器開啟。', instagram: '點右上角的「⋯」，選擇用外部瀏覽器開啟。',
    facebook_ios: '點右上角的「⋯」，選擇「以瀏覽器開啟」。', facebook_android: '點右上角的「⋯」，選擇「以系統瀏覽器開啟」。',
    kakaotalk_ios: '點畫面上方的網址，選擇用其他瀏覽器開啟。', kakaotalk_android: '點右下角的選單，選擇用其他瀏覽器開啟。' },
  en: { default: 'Tap ⋯ (top right) or the share icon, then choose to open in your browser.',
    instagram: 'Tap ⋯ (top right), then "Open in external browser".', kakaotalk_ios: 'Tap the address at the top, then open it in another browser.',
    kakaotalk_android: 'Tap the menu at the bottom right, then open it in another browser.' },
  ja: { default: '右上の「⋯」または共有アイコンをタップして、ブラウザで開くを選んでください。', instagram: '右上の「⋯」をタップして、外部ブラウザで開くを選んでください。' },
  th: { default: 'แตะ ⋯ (มุมขวาบน) หรือไอคอนแชร์ แล้วเลือกเปิดในเบราว์เซอร์', instagram: 'แตะ ⋯ (มุมขวาบน) แล้วเลือก "เปิดในเบราว์เซอร์ภายนอก"' },
};
const CSS = `.iae{position:fixed;inset:0;z-index:2147483000;text-align:left;font:15px/1.5 system-ui,-apple-system,"PingFang TC","Noto Sans TC",sans-serif}
.iae [hidden]{display:none!important}.iae-bg{position:absolute;inset:0;background:rgba(0,0,0,.45)}.iae-sh{position:absolute;left:0;right:0;bottom:0;margin:0 auto;max-width:520px;
max-height:90vh;overflow:auto;box-sizing:border-box;background:#fff;color:#1a1a1a;border-radius:16px 16px 0 0;padding:20px 16px calc(20px + env(safe-area-inset-bottom))}
.iae h2{font-size:18px;margin:0 36px 8px 0}.iae p{margin:0 0 12px}.iae-h{font-weight:600}.iae-n{color:#8a5300}.iae-f{font-size:13px;color:#666}
.iae-b{display:block;width:100%;box-sizing:border-box;padding:12px;margin:0 0 10px;border:1px solid #d0d0d0;border-radius:10px;background:#fff;
color:inherit;font:inherit;text-align:center;text-decoration:none;cursor:pointer}.iae-p{background:var(--iae-accent,#1a73e8);border-color:var(--iae-accent,#1a73e8);color:#fff;font-weight:600}
.iae-x{position:absolute;top:8px;right:8px;border:0;background:none;color:inherit;font-size:26px;line-height:1;padding:8px;cursor:pointer}
.iae-l{border:0;background:none;color:#666;font:inherit;font-size:13px;text-decoration:underline;padding:4px 0 12px;cursor:pointer}
.iae-u{display:block;width:100%;box-sizing:border-box;margin:0 0 10px;padding:8px;font:inherit;font-size:16px;border:1px solid #d0d0d0;border-radius:8px}
`;
const DARK = '.iae-sh{background:#1f1f1f;color:#eee}.iae-b:not(.iae-p){background:#2a2a2a;border-color:#444}.iae-f,.iae-l{color:#aaa}.iae-n{color:#f0b35a}.iae-u{background:#2a2a2a;color:#eee;border-color:#444}';
// theme: 'auto' (follow the OS, default) | 'light' (light-only products) | 'dark'
const cssFor = (theme) => CSS + (theme === 'light' ? '' : theme === 'dark' ? DARK : `@media (prefers-color-scheme:dark){${DARK}}`);

async function copyText(t) {
  try { await navigator.clipboard.writeText(t); return true; } catch { /* fall back to execCommand */ }
  const ta = Object.assign(document.createElement('textarea'), { value: t });
  ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;font-size:16px'; document.body.appendChild(ta);
  try { ta.focus(); ta.setSelectionRange(0, t.length); return document.execCommand('copy'); } catch { return false; } finally { ta.remove(); }
}

// Bottom sheet: (a) one-tap open (only high/medium methods) (b) copy link (c) menu steps (d) product's in-webview
// alternative (e) "try anyway" only for unknown/heuristic detections. opts: info, lang, strings, steps, provider, target,
// carry, tapOnly, params, experimental, disabledMethods, enableMethods, alternative {id, label, onClick}, onContinue,
// onClose, onEvent, trigger, theme ('auto' | 'light' | 'dark'). Only one sheet exists at a time.
export function renderOpenInBrowserSheet(opts = {}) {
  const d = document, info = opts.info || detectInApp(), emit = safe(opts.onEvent);
  const hl = (d.documentElement.lang || navigator.language || '').toLowerCase();
  const lang = opts.lang || (/^zh/.test(hl) ? 'zh' : /^ja/.test(hl) ? 'ja' : /^th/.test(hl) ? 'th' : 'en'); // zh | en | ja | th
  const s = { ...(STR[lang] || STR.en), ...(opts.strings || {}) }, steps = { ...(STEPS[lang] || STEPS.en), ...(opts.steps || {}) };
  const fill = (t) => esc(t).replace(/\{app\}/g, esc(info.name || s.thisApp)).replace(/\{provider\}/g, esc(opts.provider || 'Google'));
  const e = buildEscapeUrl(opts.target, info, { ...opts, onEvent: emit }), ev = { app: info.app, os: info.os, method: e.method };
  const step = steps[`${info.app}_${info.os}`] || steps[info.app] || steps.default;
  const soft = info.googleBlocked === null || info.heuristic; // unknown app, or heuristic-only detection
  if (sheet) sheet.close(true);
  const theme = opts.theme || 'auto'; let st = d.getElementById('iae-css');
  if (!st) st = d.head.appendChild(Object.assign(d.createElement('style'), { id: 'iae-css' }));
  if (st.dataset.theme !== theme) { st.textContent = cssFor(theme); st.dataset.theme = theme; }
  const root = Object.assign(d.createElement('div'), { className: 'iae' }), prev = d.activeElement, overflow = d.body.style.overflow;
  root.innerHTML = `<div class="iae-bg" data-a="x"></div><div class="iae-sh" role="dialog" aria-modal="true" aria-labelledby="iae-t">
<button type="button" class="iae-x" data-a="x" aria-label="${esc(s.close)}">×</button><h2 id="iae-t">${fill(s.title)}</h2>
<p>${fill(soft ? s.bodyMaybe : s.body)}</p>${failed ? `<p class="iae-n">${fill(s.failed)}</p>` : ''}
${e.href ? `<a class="iae-b iae-p" data-a="open" href="${esc(e.href)}">${fill(e.safari ? s.openSafari : s.openBrowser)}</a>` : ''}
<button type="button" class="iae-b${e.href ? '' : ' iae-p'}" data-a="copy">${fill(s.copy)}</button><input class="iae-u" readonly hidden value="${esc(e.https)}">
<p class="iae-n" data-r="nh" hidden>${fill(s.noHandoff)}</p><p class="iae-h">${fill(s.manual)}</p><p>${fill(step)}</p>
${opts.alternative ? `<button type="button" class="iae-b" data-a="alt">${esc(opts.alternative.label)}</button>` : ''}
${soft && opts.onContinue ? `<button type="button" class="iae-l" data-a="go">${fill(s.cont)}</button>` : ''}
<p class="iae-f">${fill(s.vary)}</p></div>`;
  const onKey = (k) => { if (k.key === 'Escape') close(); };
  const close = (silent) => {
    root.remove(); d.removeEventListener('keydown', onKey); d.body.style.overflow = overflow;
    if (sheet && sheet.root === root) sheet = null;
    if (silent !== true) { if (prev && prev.focus) prev.focus(); (opts.onClose || noop)(); }
  };
  root.addEventListener('click', (k) => {
    const a = k.target.closest('[data-a]'), act = a && a.dataset.a;
    if (!a) return;
    if (act === 'open') {
      if (e.windowOpen) { k.preventDefault(); window.open(e.href, '_blank'); }
      emit('escape_attempted', { ...ev, confidence: e.confidence });
      watchHandoff(e.method, () => { root.querySelector('[data-r="nh"]').hidden = false; emit('escape_no_handoff', ev); });
    } else if (act === 'copy') {
      emit('escape_copy_link', ev);
      copyText(e.https).then((ok) => {
        a.textContent = ok ? s.copied : s.copyManual;
        const i = root.querySelector('.iae-u'); // iOS may report success without copying: always show the URL there
        if (!ok || info.os === 'ios') { i.hidden = false; try { i.focus(); i.setSelectionRange(0, i.value.length); } catch { /* ignore */ } }
      });
    } else if (act === 'alt') { emit('google_blocked_fallback', { ...ev, alt: opts.alternative.id || 'other' }); close(); opts.alternative.onClick(); }
    else if (act === 'go') { emit('escape_continue_anyway', ev); close(); opts.onContinue(); }
    else close();
  });
  d.addEventListener('keydown', onKey); d.body.appendChild(root); d.body.style.overflow = 'hidden';
  sheet = { root, close };
  (root.querySelector('.iae-p') || root.querySelector('[data-a="copy"]')).focus();
  emit('escape_sheet_shown', { ...ev, trigger: opts.trigger || 'tap' });
  return { close, escape: e };
}

// Capture-phase guard for Google links/buttons: opens the sheet instead of starting OAuth. One guard at a time (a new
// call replaces the old one, so SPA remounts / StrictMode don't stack listeners). Returns an unsubscribe fn.
export function interceptGoogle(selector, opts = {}) {
  const info = opts.info || detectInApp();
  if (intercept) intercept();
  if (!HAS_WIN || !info.inApp || info.googleBlocked === false) return noop;
  const h = (ev) => {
    const el = ev.target.closest && ev.target.closest(selector);
    if (!el || el.dataset.iaPass) return; ev.preventDefault(); ev.stopImmediatePropagation();
    const go = opts.onContinue || (() => { el.dataset.iaPass = '1'; el.click(); delete el.dataset.iaPass; });
    renderOpenInBrowserSheet({ ...opts, info, trigger: 'tap', onContinue: go });
  };
  document.addEventListener('click', h, true);
  const off = () => { document.removeEventListener('click', h, true); if (intercept === off) intercept = null; };
  intercept = off;
  return off;
}

// Call once, early, on login/signup (and landing) pages. opts: onEvent, googleSelector, autoEscape: ['line']
// (experimental, default off), plus any renderOpenInBrowserSheet opts. Opens the sheet when ?ia_google=1 (server guard).
// Returns the detection info plus destroy() (React: return it from useEffect).
export function initInAppEscape(opts = {}) {
  if (!HAS_WIN) return { ...detectInApp('', null), destroy: noop };
  const info = detectInApp(), emit = safe(opts.onEvent);
  const off = opts.googleSelector ? interceptGoogle(opts.googleSelector, { ...opts, info, onEvent: emit }) : noop; // guard first
  const guard = handleLanding(info, emit);
  checkReturned(info, emit);
  if (info.inApp && !ss('ia_seen')) { ss('ia_seen', '1'); emit('inapp_detected', { app: info.app, os: info.os, googleBlocked: info.googleBlocked }); }
  if (info.inApp && tryAutoEscape(info, opts, emit)) return { ...info, destroy: off };
  if ((guard || pendingGuard) && info.inApp && info.googleBlocked !== false) {
    renderOpenInBrowserSheet({ ...opts, info, onEvent: emit, trigger: 'server_guard',
      onClose: () => { pendingGuard = false; (opts.onClose || noop)(); } });
  }
  return { ...info, destroy: () => { off(); if (sheet) sheet.close(true); } };
}
