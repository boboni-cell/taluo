/**
 * POST /api/invite-code/verify
 * 验证邀请码并激活权限
 *
 * 请求体：{ code: string, browserFingerprint: string }
 * 响应：  { success: boolean, message: string, newPermissions?: string[], allPermissions?: string[] }
 */

// 部署到 Cloudflare 时取消注释：
export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

// D1 数据库类型（简化版）
interface D1Result<T = unknown> { results: T[]; success: boolean; }
interface D1Stmt { bind(...values: unknown[]): D1Stmt; first<T = unknown>(): Promise<T | null>; all<T = unknown>(): Promise<D1Result<T>>; run(): Promise<D1Result>; }
interface D1DB { prepare(query: string): D1Stmt; batch<T = unknown>(statements: D1Stmt[]): Promise<D1Result<T>[]>; }
interface PermissionRow { id: string; name_zh: string; }
interface CodeRow { id: number; code: string; status: string; max_uses: number; used_count: number; expires_at: string | null; activated_at: string | null; }

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      code?: string;
      browserFingerprint?: string;
    };
    const { code, browserFingerprint } = body;

    // ---- 参数校验 ----
    if (!code || typeof code !== 'string' || !code.trim()) {
      return NextResponse.json({ success: false, message: '请输入邀请码' }, { status: 400 });
    }
    if (!browserFingerprint || typeof browserFingerprint !== 'string') {
      return NextResponse.json({ success: false, message: '缺少浏览器标识' }, { status: 400 });
    }

    const trimmedCode = code.trim().toUpperCase();

    // ---- 获取 D1 数据库 ----
    const db = getDB() as unknown as D1DB;

    // ---- 1. 查询邀请码 ----
    const codeRow = await db
      .prepare('SELECT id, code, status, max_uses, used_count, expires_at, activated_at FROM invite_codes WHERE code = ?')
      .bind(trimmedCode)
      .first<CodeRow>();

    if (!codeRow) {
      return NextResponse.json({ success: false, message: '邀请码无效' });
    }

    // ---- 2. 校验邀请码状态 ----
    if (codeRow.status === 'revoked') {
      return NextResponse.json({ success: false, message: '邀请码已作废' });
    }

    if (
      codeRow.status === 'expired' ||
      (codeRow.expires_at && new Date(codeRow.expires_at) < new Date())
    ) {
      if (codeRow.status !== 'expired') {
        await db.prepare('UPDATE invite_codes SET status = ? WHERE id = ?').bind('expired', codeRow.id).run();
      }
      return NextResponse.json({ success: false, message: '邀请码已过期' });
    }

    if (codeRow.used_count >= codeRow.max_uses) {
      return NextResponse.json({ success: false, message: '邀请码已被使用' });
    }

    // ---- 3. 查找或创建用户 ----
    const existingUser = await db
      .prepare('SELECT id FROM users WHERE browser_fp = ?')
      .bind(browserFingerprint)
      .first<{ id: string }>();

    let userId: string;
    if (existingUser) {
      userId = existingUser.id;
    } else {
      userId = crypto.randomUUID();
      await db
        .prepare('INSERT INTO users (id, browser_fp) VALUES (?, ?)')
        .bind(userId, browserFingerprint)
        .run();
    }

    // ---- 4. 查询邀请码关联的权限 ----
    const codePermissions = await db
      .prepare(
        `SELECT pm.id, pm.name_zh
         FROM code_permissions cp
         JOIN permission_modules pm ON cp.permission_id = pm.id
         WHERE cp.code_id = ?
         ORDER BY pm.sort_order`
      )
      .bind(codeRow.id)
      .all<{ id: string; name_zh: string }>();

    if (!codePermissions.results.length) {
      return NextResponse.json({ success: false, message: '该邀请码未关联任何权限' });
    }

    // ---- 5. 处理 VIP 权限 ----
    let grantPermissions: PermissionRow[] = codePermissions.results;
    if (grantPermissions.some((p: PermissionRow) => p.id === 'vip')) {
      const allModules = await db
        .prepare('SELECT id, name_zh FROM permission_modules ORDER BY sort_order')
        .all<PermissionRow>();
      grantPermissions = allModules.results;
    }

    // ---- 6. 检查用户已有权限 ----
    const existingPermissions = await db
      .prepare('SELECT permission_id FROM user_permissions WHERE user_id = ?')
      .bind(userId)
      .all<{ permission_id: string }>();

    const existingIds = new Set(existingPermissions.results.map((r: { permission_id: string }) => r.permission_id));
    const newPermissions = grantPermissions.filter((p: PermissionRow) => !existingIds.has(p.id));

    if (newPermissions.length === 0) {
      return NextResponse.json({
        success: false,
        message: '您已拥有该邀请码包含的所有权限',
      });
    }

    // ---- 7. 写入新权限 + 更新邀请码 ----
    const now = new Date().toISOString();

    const insertStmts = newPermissions.map((p: PermissionRow) =>
      db
        .prepare(
          'INSERT OR IGNORE INTO user_permissions (user_id, permission_id, code_id, activated_at) VALUES (?, ?, ?, ?)'
        )
        .bind(userId, p.id, codeRow.id, now)
    );
    await db.batch(insertStmts);

    const newUsedCount = codeRow.used_count + 1;
    const newStatus = newUsedCount >= codeRow.max_uses ? 'activated' : codeRow.status;
    const activatedAt = codeRow.activated_at || now;

    await db
      .prepare(
        'UPDATE invite_codes SET used_count = ?, status = ?, activated_at = ? WHERE id = ?'
      )
      .bind(newUsedCount, newStatus, activatedAt, codeRow.id)
      .run();

    // ---- 8. 查询用户当前所有权限 ----
    const allUserPermissions = await db
      .prepare(
        `SELECT pm.id, pm.name_zh
         FROM user_permissions up
         JOIN permission_modules pm ON up.permission_id = pm.id
         WHERE up.user_id = ?
         ORDER BY pm.sort_order`
      )
      .bind(userId)
      .all<{ id: string; name_zh: string }>();

    return NextResponse.json({
      success: true,
      message: '激活成功',
      newPermissions: newPermissions.map((p: PermissionRow) => p.name_zh),
      allPermissions: allUserPermissions.results.map((p: PermissionRow) => p.name_zh),
    });
  } catch (error) {
    console.error('[InviteCode Verify] Error:', error);
    return NextResponse.json(
      { success: false, message: '验证失败，请稍后再试' },
      { status: 500 }
    );
  }
}
