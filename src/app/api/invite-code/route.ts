/**
 * GET /api/invite-code
 * 获取邀请码列表（需管理权限）
 *
 * POST /api/invite-code
 * 创建新的邀请码（需管理权限）
 *
 * DELETE /api/invite-code
 * 删除邀请码（需管理权限）
 */

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: '邀请码管理 API - 待实现' });
}

export async function POST() {
  return NextResponse.json({ message: '创建邀请码 API - 待实现' });
}

export async function DELETE() {
  return NextResponse.json({ message: '删除邀请码 API - 待实现' });
}
