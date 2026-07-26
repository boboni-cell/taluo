/**
 * 浏览器指纹工具
 * 使用 FingerprintJS 生成浏览器唯一标识，并缓存到 localStorage
 */

import FingerprintJS from '@fingerprintjs/fingerprintjs';

const STORAGE_KEY = 'taluo_fp';

let cachedFingerprint: string | null = null;

/**
 * 获取浏览器指纹（带缓存）
 * - 首次调用时通过 FingerprintJS 生成，结果缓存到 localStorage
 * - 后续调用直接返回缓存值
 */
export async function getFingerprint(): Promise<string> {
  // 1. 内存缓存
  if (cachedFingerprint) return cachedFingerprint;

  // 2. localStorage 缓存
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        cachedFingerprint = stored;
        return stored;
      }
    } catch { /* localStorage 不可用 */ }
  }

  // 3. 通过 FingerprintJS 生成
  try {
    const fp = await FingerprintJS.load();
    const result = await fp.get();
    const visitorId = result.visitorId;

    cachedFingerprint = visitorId;

    // 存入 localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, visitorId);
      } catch { /* ignore */ }
    }

    return visitorId;
  } catch (error) {
    // FingerprintJS 失败时使用简易 fallback
    console.warn('[Fingerprint] FingerprintJS failed, using fallback:', error);
    const fallback = generateFallback();
    cachedFingerprint = fallback;
    return fallback;
  }
}

/**
 * 简易 fallback 指纹（当 FingerprintJS 不可用时）
 */
function generateFallback(): string {
  const components = [
    navigator.userAgent || '',
    navigator.language || '',
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency || '',
  ];
  const raw = components.join('|');
  // 简单 hash
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const c = raw.charCodeAt(i);
    hash = ((hash << 5) - hash) + c;
    hash |= 0;
  }
  return 'fp_' + Math.abs(hash).toString(36);
}
