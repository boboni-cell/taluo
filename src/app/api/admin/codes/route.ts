/**
 * GET /api/admin/codes  — 查询邀请码列表
 * POST /api/admin/codes — 批量创建邀请码
 * PATCH /api/admin/codes — 修改邀请码状态
 */

// 部署到 Cloudflare 时取消注释：
// export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { verifyAdminToken } from '@/lib/admin-auth';

interface D1Result<T = unknown> { results: T[]; success: boolean; }
interface D1Stmt { bind(...v: unknown[]): D1Stmt; first<T = unknown>(): Promise<T | null>; all<T = unknown>(): Promise<D1Result<T>>; run(): Promise<D1Result>; }
interface D1DB { prepare(q: string): D1Stmt; batch<T>(s: D1Stmt[]): Promise<D1Result<T>[]>; }

function randStr(len: number): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

export async function GET(request: Request) {
  try {
    const auth = await verifyAdminToken(request);
    if (!auth.valid) return NextResponse.json({ error: '未授权' }, { status: 401 });

    const url = new URL(request.url);
    const status = url.searchParams.get('status') || '';
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = Math.min(parseInt(url.searchParams.get('pageSize') || '20'), 100);
    const offset = (page - 1) * pageSize;

    const db = getDB() as unknown as D1DB;

    const countSQL = status
      ? 'SELECT COUNT(*) as total FROM invite_codes WHERE status = ?'
      : 'SELECT COUNT(*) as total FROM invite_codes';
    const countStmt = status ? db.prepare(countSQL).bind(status) : db.prepare(countSQL);
    const countRow = await countStmt.first<{ total: number }>();
    const total = countRow?.total || 0;

    const listSQL = status
      ? `SELECT id, code, status, max_uses, used_count, expires_at, note, created_at, activated_at
         FROM invite_codes WHERE status = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`
      : `SELECT id, code, status, max_uses, used_count, expires_at, note, created_at, activated_at
         FROM invite_codes ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    const listStmt = status
      ? db.prepare(listSQL).bind(status, pageSize, offset)
      : db.prepare(listSQL).bind(pageSize, offset);
    const codes = await listStmt.all<{
      id: number; code: string; status: string; max_uses: number;
      used_count: number; expires_at: string | null; note: string | null;
      created_at: string; activated_at: string | null;
    }>();

    const codeIds = codes.results.map(c => c.id);
    const permissionsMap: Record<number, string[]> = {};
    if (codeIds.length > 0) {
      const ph = codeIds.map(() => '?').join(',');
      const perms = await db.prepare(
        `SELECT cp.code_id, pm.name_zh
         FROM code_permissions cp JOIN permission_modules pm ON cp.permission_id = pm.id
         WHERE cp.code_id IN (${ph})`
      ).bind(...codeIds).all<{ code_id: number; name_zh: string }>();
      for (const p of perms.results) {
        if (!permissionsMap[p.code_id]) permissionsMap[p.code_id] = [];
        permissionsMap[p.code_id].push(p.name_zh);
      }
    }

    const list = codes.results.map(c => ({
      id: c.id, code: c.code, status: c.status,
      maxUses: c.max_uses, usedCount: c.used_count,
      expiresAt: c.expires_at, note: c.note,
      createdAt: c.created_at, activatedAt: c.activated_at,
      permissions: permissionsMap[c.id] || [],
    }));

    return NextResponse.json({ total, page, pageSize, list });
  } catch (error) {
    console.error('[Admin Codes GET] Error:', error);
    return NextResponse.json({ error: '查询失败' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await verifyAdminToken(request);
    if (!auth.valid) return NextResponse.json({ error: '未授权' }, { status: 401 });

    const body = await request.json() as {
      permissions?: string[]; count?: number; maxUses?: number;
      expiresAt?: string | null; note?: string;
    };
    const permissions = body.permissions || ['tarot'];
    const count = Math.min(body.count || 10, 100);
    const maxUses = body.maxUses || 1;
    const expiresAt = body.expiresAt || null;
    const note = body.note || null;
    const db = getDB() as unknown as D1DB;
    const codes: string[] = [];
    const now = new Date().toISOString();

    for (let i = 0; i < count; i++) {
      let code: string; let exists = true;
      do {
        code = 'TR-' + randStr(8);
        const r = await db.prepare('SELECT id FROM invite_codes WHERE code = ?').bind(code).first<{ id: number }>();
        exists = !!r;
      } while (exists);

      await db.prepare(
        'INSERT INTO invite_codes (code, status, max_uses, used_count, expires_at, note, created_at) VALUES (?, ?, ?, 0, ?, ?, ?)'
      ).bind(code, 'unused', maxUses, expiresAt, note, now).run();

      const row = await db.prepare('SELECT id FROM invite_codes WHERE code = ?').bind(code).first<{ id: number }>();
      if (row) {
        const stmts = permissions.map(p =>
          db.prepare('INSERT OR IGNORE INTO code_permissions (code_id, permission_id) VALUES (?, ?)').bind(row.id, p)
        );
        await db.batch(stmts);
      }
      codes.push(code);
    }
    return NextResponse.json({ success: true, codes });
  } catch (error) {
    console.error('[Admin Codes POST] Error:', error);
    return NextResponse.json({ error: '创建失败' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await verifyAdminToken(request);
    if (!auth.valid) return NextResponse.json({ error: '未授权' }, { status: 401 });

    const body = await request.json() as { codeId?: number; action?: string; expiresAt?: string };
    if (!body.codeId) return NextResponse.json({ error: '缺少 codeId' }, { status: 400 });

    const db = getDB() as unknown as D1DB;
    if (body.action === 'revoke') {
      await db.prepare('UPDATE invite_codes SET status = ? WHERE id = ?').bind('revoked', body.codeId).run();
    } else if (body.action === 'extend') {
      if (!body.expiresAt) return NextResponse.json({ error: '缺少 expiresAt' }, { status: 400 });
      await db.prepare('UPDATE invite_codes SET expires_at = ? WHERE id = ?').bind(body.expiresAt, body.codeId).run();
    } else {
      return NextResponse.json({ error: '未知操作' }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Admin Codes PATCH] Error:', error);
    return NextResponse.json({ error: '操作失败' }, { status: 500 });
  }
}