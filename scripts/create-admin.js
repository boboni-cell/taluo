const bcrypt = require('bcryptjs');
const { execFileSync } = require('child_process');

const username = process.env.ADMIN_USERNAME;
const password = process.env.ADMIN_PASSWORD;

if (!username || !password) {
  console.error('请设置 ADMIN_USERNAME 和 ADMIN_PASSWORD 环境变量');
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 10);

const escapedUsername = username.replaceAll("'", "''");
const sql = `INSERT OR REPLACE INTO admins (id, username, password_hash) VALUES (1, '${escapedUsername}', '${hash}')`;

console.log('正在写入数据库...');

try {
  execFileSync(
    'npx',
    ['wrangler', 'd1', 'execute', 'taluo-db', '--remote', '--command', sql],
    { stdio: 'inherit' }
  );
  console.log('\n✅ 管理员创建成功！');
  console.log('   用户名:', username);
} catch (e) {
  console.error('\n❌ 写入失败，请手动执行以下 SQL：');
  console.log(sql);
}
