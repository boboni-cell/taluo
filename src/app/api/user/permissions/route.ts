/**
 * GET /api/user/permissions?fp=浏览器指纹
 * 查询用户的已激活权限
 *
 * 响应：{ permissions: string[], details: { id, nameZh, activatedAt, expiresAt }[] }
 */

// 部署到 Cloudflare 时取消注释：
export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

// D1 类型
interface D1Result<T = unknown> { results: T[]; success: boolean; }
interface D1Stmt { bind(...values: unknown[]): D1Stmt; first<T = unknown>(): Promise<T | null>; all<T = unknown>(): Promise<D1Result<T>>; run(): Promise<D1Result>; }
interface D1DB { prepare(query: string): D1Stmt; }

interface PermissionDetail {
  id: string;
  nameZh: string;
  activatedAt: string | null;
  expiresAt: string | null;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fp = searchParams.get('fp');

    if (!fp || !fp.trim()) {
      return NextResponse.json(
        { permissions: [], details: [] },
        { status: 200 }
      );
    }

    const db = getDB() as unknown as D1DB;

    // ---- 1. 查找用户 ----
    const user = await db
      .prepare('SELECT id FROM users WHERE browser_fp = ?')
      .bind(fp.trim())
      .first<{ id: string }>();

    if (!user) {
      return NextResponse.json({ permissions: [], details: [] });
    }

    // ---- 2. 查询用户有效权限 ----
    const permissions = await db
      .prepare(
        `SELECT pm.id, pm.name_zh, up.activated_at, up.expires_at
         FROM user_permissions up
         JOIN permission_modules pm ON up.permission_id = pm.id
         WHERE up.user_id = ?
           AND (up.expires_at IS NULL OR up.expires_at > datetime('now'))
         ORDER BY pm.sort_order`
      )
      .bind(user.id)
      .all<{
        id: string;
        name_zh: string;
        activated_at: string | null;
        expires_at: string | null;
      }>();

    const details: PermissionDetail[] = permissions.results.map((p) => ({
      id: p.id,
      nameZh: p.name_zh,
      activatedAt: p.activated_at,
      expiresAt: p.expires_at,
    }));

    return NextResponse.json({
      permissions: details.map((d) => d.id),
      details,
    });
  } catch (error) {
    console.error('[User Permissions] Error:', error);
    return NextResponse.json(
      { permissions: [], details: [] },
      { status: 500 }
    );
  }
}
