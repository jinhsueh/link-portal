// node --test src/lib/inapp.test.mjs   (Node >= 22.18 / 23.6: .ts imports are type-stripped natively)
import test from 'node:test'
import assert from 'node:assert/strict'
import { googleStartGuard, parseDisabledMethods, toSheetLang, sanitizeInAppEvent } from './inapp.ts'
import { detectInApp, buildEscapeUrl, VERSION } from './inapp-escape.js'

const UA = {
  igIos: 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/23E254 Instagram 424.1.0.31.54 (iPhone18,4; iOS 26_4_1; IABMV/1) NW/3 Safari/604.1',
  fbAndroid: 'Mozilla/5.0 (Linux; Android 14; Pixel 8 Build/AP2A.240805.005; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/129.0.6668.100 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/484.0.0.47.109;]',
  lineIos: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Safari Line/15.10.0',
  tiktokIos: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 musical_ly_39.5.0 JsSdk/2.0 NetType/WIFI Channel/App Store ByteLocale/en Region/US',
  whatsappAndroid: 'Mozilla/5.0 (Linux; Android 14; Pixel 8 Build/AP2A; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/129.0.0.0 Mobile Safari/537.36 WhatsApp/2.24.20.89',
  genericAndroidWv: 'Mozilla/5.0 (Linux; Android 14; Pixel 8 Build/AP2A; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/129.0.0.0 Mobile Safari/537.36',
  safariIos: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1',
  chromeAndroid: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Mobile Safari/537.36',
  desktopChrome: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
  googlebot: 'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
}

test('vendored module is v1.2.3', () => assert.equal(VERSION, '1.2.3'))

test('IG iOS: named app, Google blocked, not heuristic', () => {
  const i = detectInApp(UA.igIos, null)
  assert.equal(i.app, 'instagram'); assert.equal(i.os, 'ios')
  assert.equal(i.googleBlocked, true); assert.equal(i.heuristic, false)
})

test('guard bounces named blocked apps to /login?ia_google=1 (+ validated lang)', () => {
  assert.equal(googleStartGuard(UA.igIos, { lang: 'zh-TW' })?.location, '/login?ia_google=1&lang=zh-TW')
  assert.equal(googleStartGuard(UA.igIos)?.location, '/login?ia_google=1')
  for (const [k, app] of [['fbAndroid', 'facebook'], ['lineIos', 'line'], ['tiktokIos', 'tiktok']]) {
    const g = googleStartGuard(UA[k])
    assert.ok(g, `${k} should be guarded`); assert.equal(g.info.app, app)
  }
})

test('guard never fires for real browsers, bots, heuristic webviews, soft apps, or when off', () => {
  for (const k of ['safariIos', 'chromeAndroid', 'desktopChrome', 'googlebot', 'genericAndroidWv', 'whatsappAndroid'])
    assert.equal(googleStartGuard(UA[k]), null, k)
  assert.equal(googleStartGuard(null), null)
  assert.equal(googleStartGuard(UA.igIos, { off: true }), null)
})

test('INAPP_DISABLED_METHODS parsing keeps only known methods', () => {
  assert.deepEqual(parseDisabledMethods(' ig, bogus ,intent,'), ['ig', 'intent'])
  assert.deepEqual(parseDisabledMethods(undefined), [])
})

test('locale -> sheet lang', () => {
  assert.deepEqual(['zh-TW', 'ja', 'th', 'en', 'fr', null].map(toSheetLang), ['zh', 'ja', 'th', 'en', 'en', 'en'])
})

test('escape URL for the Beam sheet options: /login target, lang + attribution kept, auth params dropped', () => {
  const info = detectInApp(UA.igIos, null)
  const currentUrl = 'https://beam.test/login?oauth_error=bad_state&utm_source=beam_watermark&ref=alice&email=a%40b.c'
  const e = buildEscapeUrl('/login', info, { currentUrl, params: { lang: 'zh-TW' } })
  const u = new URL(e.https)
  assert.equal(u.pathname, '/login')
  assert.equal(u.searchParams.get('lang'), 'zh-TW')
  assert.equal(u.searchParams.get('ref'), 'alice')
  assert.equal(u.searchParams.get('utm_source'), 'beam_watermark')
  assert.equal(u.searchParams.get('ia_esc'), 'instagram')
  assert.equal(u.searchParams.has('oauth_error'), false) // target is bare /login, not the current URL
  assert.equal(u.searchParams.has('email'), false)
  assert.equal(e.method, 'ig'); assert.match(e.href, /^instagram:\/\/extbrowser\/\?url=/)
  const off = buildEscapeUrl('/login', info, { currentUrl, disabledMethods: ['ig'] })
  assert.equal(off.href, null); assert.equal(off.method, 'manual')
})

test('beacon body sanitizer', () => {
  const ok = sanitizeInAppEvent(JSON.stringify({ e: 'escape_attempted', path: '/login', p: { app: 'instagram', os: 'ios', method: 'ig', confidence: 'medium', email: 'x@y.z', googleBlocked: null } }))
  assert.deepEqual(ok, { event: 'escape_attempted', path: '/login', props: { app: 'instagram', os: 'ios', method: 'ig', confidence: 'medium', googleBlocked: null } })
  assert.equal(sanitizeInAppEvent(JSON.stringify({ e: 'not_an_event' })), null)
  assert.equal(sanitizeInAppEvent('{bad json'), null)
  assert.equal(sanitizeInAppEvent('x'.repeat(5000)), null)
  assert.equal(sanitizeInAppEvent(JSON.stringify({ e: 'inapp_detected', path: 'https://evil/x', p: { app: 'a'.repeat(200) } }))?.path, null)
  assert.equal(sanitizeInAppEvent(JSON.stringify({ e: 'inapp_detected', p: { app: 'a'.repeat(200) } }))?.props.app.length, 64)
})
