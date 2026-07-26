/**
 * POST /api/invite-code/verify
 * 验证邀请码是否有效
 *
 * 请求体：{ code: string }
 * 响应：  { valid: boolean, message: string }
 */

import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { code } = await request.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ valid: false, message: '请输入邀请码' }, { status: 400 });
    }

    const db = getDB();
    const result = await db.prepare(
      'SELECT id, code, remaining_uses, expires_at FROM invite_codes WHERE code = ? AND remaining_uses > 0 AND expires_at > datetime("now")'
    ).bind(code).first();

    if (!result) {
      return NextResponse.json({ valid: false, message: '邀请码无效或已过期' });
    }

    return NextResponse.json({ valid: true, message: '验证通过' });
  } catch (error) {
    console.error('[InviteCode Verify] Error:', error);
    return NextResponse.json({ valid: false, message: '验证失败，请稍后再试' }, { status: 500 });
  }
}
