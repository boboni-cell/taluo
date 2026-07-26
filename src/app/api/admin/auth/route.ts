/**
 * POST /api/admin/auth
 * 管理员登录验证
 *
 * 请求体：{ username: string, password: string }
 * 响应：  { success: boolean, token?: string, message: string }
 */

import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ message: '管理员登录 API - 待实现' });
}
