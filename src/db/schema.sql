-- ============================================
-- 塔罗占卜屋 · 数据库 Schema
-- 用于 Cloudflare D1（SQLite 兼容）
-- 导入方式：wrangler d1 execute taluo-db --file=src/db/schema.sql
-- ============================================

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,                    -- UUID，由服务端生成
  browser_fp TEXT NOT NULL,               -- 浏览器指纹（用于识别回访用户）
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_fp ON users(browser_fp);

-- 权限模块定义表
-- 预填所有可用的功能模块，邀请码可以关联多个模块
CREATE TABLE IF NOT EXISTS permission_modules (
  id TEXT PRIMARY KEY,                    -- 模块标识符（如 'tarot', 'personality'）
  name_zh TEXT NOT NULL,                  -- 中文名称
  description TEXT,                       -- 功能描述
  sort_order INTEGER DEFAULT 0            -- 排序权重
);

-- 预填权限模块数据（INSERT OR IGNORE 确保不重复插入）
INSERT OR IGNORE INTO permission_modules (id, name_zh, description, sort_order) VALUES
  ('tarot',         '塔罗占卜',     '单牌 + 三牌阵 + 五牌阵 + 月亮 + 马蹄形 + 凯尔特十字 + AI解读', 1),
  ('personality',   '人格类型测试', 'MBTI、内外向、决策方式、情绪敏感度', 2),
  ('emotion',       '情感模式测试', '依恋类型、恋爱模式、情感需求、分手模式', 3),
  ('relationship',  '人际关系测试', '社交人格、冲突处理、边界感、讨好倾向', 4),
  ('inner',         '内在探索测试', '自我价值感、情绪压抑、完美主义、内在需求', 5),
  ('deep_report',   '深度报告',     '解锁深度人格分析报告', 6),
  ('vip',           '全部权限',     'VIP全部解锁', 7);

-- 邀请码表
CREATE TABLE IF NOT EXISTS invite_codes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,              -- 邀请码字符串（如 TR-A8X2K9M1）
  status TEXT DEFAULT 'unused',           -- unused | activated | expired | revoked
  max_uses INTEGER DEFAULT 30,            -- 最大可使用次数（默认 30 次）
  used_count INTEGER DEFAULT 0,           -- 已被激活次数
  expires_at TEXT,                        -- 过期时间 ISO8601（null 表示永久有效）
  note TEXT,                              -- 备注（如 "小红书用户@xxx"）
  created_at TEXT DEFAULT (datetime('now')),
  activated_at TEXT                       -- 首次被激活的时间
);
CREATE INDEX IF NOT EXISTS idx_codes_status ON invite_codes(status);
CREATE INDEX IF NOT EXISTS idx_codes_code ON invite_codes(code);

-- 邀请码 ⇄ 权限 多对多关联表
CREATE TABLE IF NOT EXISTS code_permissions (
  code_id INTEGER NOT NULL,
  permission_id TEXT NOT NULL,
  PRIMARY KEY (code_id, permission_id),
  FOREIGN KEY (code_id) REFERENCES invite_codes(id) ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES permission_modules(id) ON DELETE CASCADE
);

-- 用户已激活的权限记录表
CREATE TABLE IF NOT EXISTS user_permissions (
  user_id TEXT NOT NULL,
  permission_id TEXT NOT NULL,
  code_id INTEGER NOT NULL,               -- 通过哪个邀请码获得
  activated_at TEXT DEFAULT (datetime('now')),
  expires_at TEXT,                        -- 权限过期时间（null 表示永久）
  PRIMARY KEY (user_id, permission_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES permission_modules(id) ON DELETE CASCADE,
  FOREIGN KEY (code_id) REFERENCES invite_codes(id) ON DELETE CASCADE
);

-- 管理员表
CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,            -- bcrypt 哈希
  created_at TEXT DEFAULT (datetime('now'))
);
