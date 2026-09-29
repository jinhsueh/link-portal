// Types for the vendored, unmodified inapp-escape.js (v1.2.4, source of truth: ~/inapp-escape).
// Update this file together with the .js whenever the module is re-vendored.

export const VERSION: string;
export const PRESERVE_PARAMS: string[];
export const DEFAULT_OFF: string[];

export type EscapeMethod = "xsafari" | "xsafari-window" | "ig" | "intent";
export type Confidence = "high" | "medium" | "low";
export type SheetLang = "zh" | "en" | "ja" | "th";

export type InAppInfo = {
  inApp: boolean;
  /** App key (e.g. "instagram", "line", "webview"); null outside an in-app browser. */
  app: string | null;
  name: string;
  os: "ios" | "android" | "other";
  /** true = Google blocks it, null = unknown (soft sheet), false = not blocked. */
  googleBlocked: boolean | null;
  escape: [EscapeMethod | string, Confidence | string] | null;
  liff: boolean;
  /** Generic webview guess without an app token: never server-guard on this alone. */
  heuristic: boolean;
};

export type EscapeEventName =
  | "inapp_detected"
  | "escape_sheet_shown"
  | "escape_attempted"
  | "escape_no_handoff"
  | "escape_copy_link"
  | "escape_landed"
  | "escape_failed"
  | "google_blocked_fallback"
  | "escape_continue_anyway"
  | "carry_truncated";

export type OnEscapeEvent = (name: EscapeEventName, props: Record<string, unknown>) => void;

export type EscapeUrlOpts = {
  /** Key order = priority; over the cap the last keys are dropped first. */
  carry?: Record<string, string | null | undefined> | (() => Record<string, string | null | undefined>);
  /** Carry keys kept off the copyable URL. */
  tapOnly?: string[];
  /** Extra query params set on the escape URL. */
  params?: Record<string, string | null | undefined> | (() => Record<string, string | null | undefined>);
  disabledMethods?: string[];
  enableMethods?: string[];
  experimental?: boolean;
  /** Required on the server when target is relative. */
  currentUrl?: string;
  onEvent?: OnEscapeEvent;
};

export type EscapeUrl = {
  https: string;
  href: string | null;
  method: string;
  confidence: string | null;
  windowOpen: boolean;
  safari: boolean;
  dropped: string[];
};

export type SheetOpts = EscapeUrlOpts & {
  info?: InAppInfo;
  lang?: SheetLang;
  strings?: Record<string, string>;
  steps?: Record<string, string>;
  provider?: string;
  target?: string;
  alternative?: { id?: string; label: string; onClick: () => void };
  onContinue?: () => void;
  onClose?: () => void;
  trigger?: string;
  /** "auto" follows the OS (default); "light" for light-only products. */
  theme?: "auto" | "light" | "dark";
};

export type InitOpts = SheetOpts & {
  googleSelector?: string;
  autoEscape?: "line"[];
};

export function detectInApp(ua?: string | null, win?: Window | null): InAppInfo;
export function encodeCarryDetailed(obj: Record<string, unknown> | null | undefined, max?: number): { s: string; dropped: string[] };
export function encodeCarry(obj: Record<string, unknown> | null | undefined, max?: number): string;
export function decodeCarry(s: string | null | undefined): Record<string, string>;
export function buildEscapeUrl(target: string | undefined, info: InAppInfo, opts?: EscapeUrlOpts): EscapeUrl;
export function lineExternalLink(url: string): string;
export function getCarried(): Record<string, string>;
export function getLanding(): { from: string; method: string } | null;
export function escapeToExternalBrowser(opts?: SheetOpts & { auto?: boolean; onNoHandoff?: () => void; autoEscape?: "line"[] }): EscapeUrl | boolean;
export function renderOpenInBrowserSheet(opts?: SheetOpts): { close: (silent?: boolean) => void; escape: EscapeUrl };
export function interceptGoogle(selector: string, opts?: SheetOpts): () => void;
export function initInAppEscape(opts?: InitOpts): InAppInfo & { destroy: () => void };
