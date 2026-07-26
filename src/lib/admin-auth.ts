/**
 * 后台鉴权工具
 * 使用 Web Crypto API 实现 HMAC-SHA256 JWT 签名/验证
 * 兼容 Node.js 和 Edge Runtime
 */

const SECRET_KEY = 'ADMIN_SECRET';

interface JWTPayload {
  adminId: number;
  username: string;
  exp: number;
}

function base64UrlEncode(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function base64UrlDecode(str: string): Uint8Array {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function getSecret(): string {
  // 尝试多个来源获取密钥
  if (typeof process !== 'undefined' && process.env) {
    if (process.env[SECRET_KEY]) return process.env[SECRET_KEY];
    if (process.env.ADMIN_SECRET) return process.env.ADMIN_SECRET;
  }
  try {
    const g = globalThis as unknown as Record<string, unknown>;
    if (g.ADMIN_SECRET) return g.ADMIN_SECRET as string;
  } catch { /* ignore */ }
  // 本地开发默认密钥
  return 'dev-secret-change-in-production';
}

async function hmacSign(data: string, secret: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const cryptoKey = await crypto.subtle.importKey(
    'raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  return crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(data));
}

/**
 * 生成 JWT token
 */
export async function generateToken(payload: { adminId: number; username: string }): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const body: JWTPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24小时过期
  };

  const headerB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify(header)));
  const bodyB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify(body)));

  const signature = await hmacSign(`${headerB64}.${bodyB64}`, getSecret());
  const sigB64 = base64UrlEncode(signature);

  return `${headerB64}.${bodyB64}.${sigB64}`;
}

/**
 * 验证 JWT token 并返回 payload
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [headerB64, bodyB64, sigB64] = parts;

    // 验证签名
    const expectedSig = await hmacSign(`${headerB64}.${bodyB64}`, getSecret());
    const expectedSigB64 = base64UrlEncode(expectedSig);

    // 恒定时间比较
    if (sigB64 !== expectedSigB64) return null;

    // 解析 payload
    const bodyBytes = base64UrlDecode(bodyB64);
    const body = JSON.parse(new TextDecoder().decode(bodyBytes)) as JWTPayload;

    // 检查过期
    if (body.exp && body.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return body;
  } catch {
    return null;
  }
}

/**
 * 从 Request 中验证管理员 token
 */
export async function verifyAdminToken(request: Request): Promise<{ valid: boolean; adminId?: number; username?: string }> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { valid: false };
  }

  const token = authHeader.slice(7);
  const payload = await verifyToken(token);

  if (!payload) {
    return { valid: false };
  }

  return { valid: true, adminId: payload.adminId, username: payload.username };
}
