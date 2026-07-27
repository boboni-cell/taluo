/**
 * D1 数据库工具函数
 *
 * Cloudflare Workers 环境中，D1 绑定通过 getRequestContext().env 或 process.env.DB 获取。
 * 本地开发时（`next dev`）使用模拟实现，避免报错。
 *
 * 使用方法：
 *   import { getDB } from '@/lib/db';
 *   const db = getDB();
 *   const result = await db.prepare('SELECT * FROM users').all();
 */

import { getRequestContext } from '@cloudflare/next-on-pages';

// D1 数据库接口（精简版，仅包含常用方法）
export interface D1Result<T = unknown> {
  results: T[];
  success: boolean;
  meta: { duration: number; rows_read: number; rows_written: number };
}

export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(colName?: string): Promise<T | null>;
  all<T = unknown>(): Promise<D1Result<T>>;
  run(): Promise<D1Result>;
  raw<T = unknown>(): Promise<T[]>;
}

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  exec(query: string): Promise<D1Result>;
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
  dump(): Promise<ArrayBuffer>;
}

/** 模拟 D1 数据库（本地开发用） */
class MockD1PreparedStatement implements D1PreparedStatement {
  constructor(private query: string, private values: unknown[] = []) {}
  bind(...values: unknown[]): D1PreparedStatement {
    return new MockD1PreparedStatement(this.query, values);
  }
  async first<T = unknown>(): Promise<T | null> {
    console.log('[D1 Mock] first:', this.query, this.values);
    return null;
  }
  async all<T = unknown>(): Promise<D1Result<T>> {
    console.log('[D1 Mock] all:', this.query, this.values);
    return { results: [], success: true, meta: { duration: 0, rows_read: 0, rows_written: 0 } };
  }
  async run(): Promise<D1Result> {
    console.log('[D1 Mock] run:', this.query, this.values);
    return { results: [], success: true, meta: { duration: 0, rows_read: 0, rows_written: 0 } };
  }
  async raw<T = unknown>(): Promise<T[]> {
    console.log('[D1 Mock] raw:', this.query, this.values);
    return [];
  }
}

class MockD1Database implements D1Database {
  prepare(query: string): D1PreparedStatement {
    return new MockD1PreparedStatement(query);
  }
  async exec(query: string): Promise<D1Result> {
    console.log('[D1 Mock] exec:', query);
    return { results: [], success: true, meta: { duration: 0, rows_read: 0, rows_written: 0 } };
  }
  async batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]> {
    console.log('[D1 Mock] batch:', statements.length, 'statements');
    return [];
  }
  async dump(): Promise<ArrayBuffer> {
    return new ArrayBuffer(0);
  }
}

/** 获取 D1 数据库实例 */
export function getDB(): D1Database {
  // 方式1：Cloudflare Workers/Pages 生产环境（通过 getRequestContext）
  try {
    const ctx = getRequestContext();
    const env = ctx.env as Record<string, unknown>;
    if (env && env.DB) return env.DB as unknown as D1Database;
  } catch { /* getRequestContext 在非 Cloudflare 环境会抛出异常 */ }

  // 方式2：Cloudflare Workers 环境（next-on-pages 注入 process.env）
  if (typeof process !== 'undefined' && process.env && process.env.DB) {
    return process.env.DB as unknown as D1Database;
  }

  // 本地开发环境：返回 mock
  if (process.env.NODE_ENV === 'development') {
    return new MockD1Database();
  }

  throw new Error(
    'D1 数据库未绑定。请在 wrangler.toml 中配置 [[d1_databases]] 并确保已创建数据库。\n' +
    '本地开发时，可以运行: npx wrangler pages dev .vercel/output/static --d1=DB'
  );
}

/** 获取请求上下文中的环境变量（Cloudflare Pages Functions） */
export function getCFEnv(): Record<string, unknown> {
  // 优先从 getRequestContext 获取（Dashboard 设置的自定义环境变量）
  try {
    const ctx = getRequestContext();
    if (ctx?.env) return ctx.env as Record<string, unknown>;
  } catch { /* ignore */ }

  if (typeof process !== 'undefined' && process.env) {
    return process.env as unknown as Record<string, unknown>;
  }
  return {};
}
