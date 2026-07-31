export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { verifyAdminToken } from '@/lib/admin-auth';

interface D1Stmt {
  bind(...values: unknown[]): D1Stmt;
  first<T = unknown>(): Promise<T | null>;
  run(): Promise<unknown>;
}

interface D1DB {
  prepare(query: string): D1Stmt;
}

const NO_STORE_HEADERS = { 'Cache-Control': 'no-store, max-age=0' };

export async function GET() {
  try {
    const db = getDB() as unknown as D1DB;
    const setting = await db
      .prepare("SELECT value FROM app_settings WHERE key = 'invite_required'")
      .first<{ value: string }>();

    return NextResponse.json(
      { inviteRequired: setting?.value !== 'false' },
      { headers: NO_STORE_HEADERS }
    );
  } catch (error) {
    console.error('[Access Mode GET] Error:', error);
    return NextResponse.json(
      { inviteRequired: true, error: '读取访问设置失败' },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await verifyAdminToken(request);
    if (!auth.valid) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const body = (await request.json()) as { inviteRequired?: unknown };
    if (typeof body.inviteRequired !== 'boolean') {
      return NextResponse.json({ error: '开关状态无效' }, { status: 400 });
    }

    const db = getDB() as unknown as D1DB;
    const now = new Date().toISOString();
    await db
      .prepare(
        `INSERT INTO app_settings (key, value, updated_at)
         VALUES ('invite_required', ?, ?)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`
      )
      .bind(String(body.inviteRequired), now)
      .run();

    return NextResponse.json({ success: true, inviteRequired: body.inviteRequired });
  } catch (error) {
    console.error('[Access Mode PATCH] Error:', error);
    return NextResponse.json({ error: '更新访问设置失败' }, { status: 500 });
  }
}
