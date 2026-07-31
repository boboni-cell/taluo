/**
 * 客户端权限管理
 * 封装权限查询和邀请码激活的 API 调用，带内存缓存
 */

import { getFingerprint } from './fingerprint';

const CACHE_KEY = 'taluo_permissions_cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 分钟

interface PermissionDetail {
  id: string;
  nameZh: string;
  activatedAt: string | null;
  expiresAt: string | null;
}

interface PermissionsResponse {
  permissions: string[];
  details: PermissionDetail[];
}

interface CacheEntry {
  data: PermissionsResponse;
  timestamp: number;
}

let memoryCache: CacheEntry | null = null;

/**
 * 查询用户权限（带缓存）
 * 缓存策略：内存 > localStorage > API
 */
export async function fetchPermissions(): Promise<PermissionsResponse> {
  const now = Date.now();

  // 1. 内存缓存
  if (memoryCache && (now - memoryCache.timestamp) < CACHE_TTL) {
    return memoryCache.data;
  }

  // 2. localStorage 缓存
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(CACHE_KEY);
      if (stored) {
        const entry: CacheEntry = JSON.parse(stored);
        if (now - entry.timestamp < CACHE_TTL) {
          memoryCache = entry;
          return entry.data;
        }
      }
    } catch { /* ignore */ }
  }

  // 3. API 查询
  const fp = await getFingerprint();
  const res = await fetch(`/api/user/permissions?fp=${encodeURIComponent(fp)}`);
  const data: PermissionsResponse = await res.json();

  // 更新缓存
  const entry: CacheEntry = { data, timestamp: now };
  memoryCache = entry;

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
    } catch { /* ignore */ }
  }

  return data;
}

/**
 * 检查是否拥有指定权限
 */
export async function checkPermission(moduleId: string): Promise<boolean> {
  try {
    const accessResponse = await fetch('/api/access-mode', { cache: 'no-store' });
    if (accessResponse.ok) {
      const accessMode = (await accessResponse.json()) as { inviteRequired?: boolean };
      if (accessMode.inviteRequired === false) return true;
    }
  } catch {
    // 设置读取失败时保持安全默认值，继续检查邀请码权限
  }

  const data = await fetchPermissions();
  return data.permissions.includes(moduleId);
}

/**
 * 激活邀请码
 */
export async function activateCode(
  code: string
): Promise<{ success: boolean; message: string; newPermissions?: string[] }> {
  const fp = await getFingerprint();

  const res = await fetch('/api/invite-code/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: code.trim(), browserFingerprint: fp }),
  });

  const data = await res.json();

  // 激活成功后清除权限缓存，强制重新查询
  if (data.success) {
    clearPermissionCache();
  }

  return data;
}

/**
 * 清除权限缓存（例如激活新权限后调用）
 */
export function clearPermissionCache(): void {
  memoryCache = null;
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(CACHE_KEY);
    } catch { /* ignore */ }
  }
}
