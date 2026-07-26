/**
 * POST /api/admin/auth
 * 管理员登录
 */

// 部署到 Cloudflare 时取消注释：
export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { generateToken } from '@/lib/admin-auth';
import bcrypt from 'bcryptjs';

// D1 类型
interface D1DB { prepare(query: string): { bind(...v: unknown[]): { first<T>(): Promise<T | null>; run(): Promise<unknown> } } }

export async function POST(request: Request) {
  try {
    const { username, password } = (await request.json()) as {
      username?: string;
      password?: string;
    };

    if (!username || !password) {
      return NextResponse.json({ success: false, message: '请输入用户名和密码' }, { status: 400 });
    }

    const db = getDB() as unknown as D1DB;

    // 查询管理员
    const admin = await db
      .prepare('SELECT id, username, password_hash FROM admins WHERE username = ?')
      .bind(username.trim())
      .first<{ id: number; username: string; password_hash: string }>();

    if (!admin) {
      return NextResponse.json({ success: false, message: '用户名或密码错误' });
    }

    // bcrypt 验证密码
    const valid = bcrypt.compareSync(password, admin.password_hash);
    if (!valid) {
      return NextResponse.json({ success: false, message: '用户名或密码错误' });
    }

    // 生成 JWT
    const token = await generateToken({ adminId: admin.id, username: admin.username });

    return NextResponse.json({ success: true, token });
  } catch (error) {
    console.error('[Admin Auth] Error:', error);
    return NextResponse.json({ success: false, message: '登录失败，请稍后再试' }, { status: 500 });
  }
}
