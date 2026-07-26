/**
 * GET /api/admin/codes
 * 管理后台：获取所有邀请码
 *
 * POST /api/admin/codes
 * 管理后台：批量创建邀请码
 */

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: '后台邀请码CRUD API - 待实现' });
}

export async function POST() {
  return NextResponse.json({ message: '后台创建邀请码 API - 待实现' });
}
