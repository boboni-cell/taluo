-- ============================================
-- 塔罗占卜屋 · 种子数据
-- 导入方式：wrangler d1 execute taluo-db --file=src/db/seed.sql
-- ============================================

-- 默认管理员账号
-- 用户名：admin
-- 密码：  admin123（首次登录后请立即修改）
-- hash 由 bcryptjs 生成，salt rounds = 10
INSERT OR IGNORE INTO admins (username, password_hash) VALUES
  ('admin', '$2b$10$gKlB2OHgzKcs7U0KLpgetejDk0zDOW2WoWgaDo61JspZQYkJfcuju');
