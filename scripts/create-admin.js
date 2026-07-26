const bcrypt = require('bcryptjs');
const { execSync } = require('child_process');

const username = 'admin';
const password = 'admin123';  // 默认密码，部署后务必修改

const hash = bcrypt.hashSync(password, 10);

const sql = `INSERT OR REPLACE INTO admins (id, username, password_hash) VALUES (1, '${username}', '${hash}')`;

console.log('生成的 hash:', hash);
console.log('正在写入数据库...');

try {
  execSync(`npx wrangler d1 execute taluo-db --remote --command "${sql}"`, { stdio: 'inherit' });
  console.log('\n✅ 管理员创建成功！');
  console.log('   用户名:', username);
  console.log('   密码:', password);
  console.log('   ⚠️  部署后请立即修改密码');
} catch (e) {
  console.error('\n❌ 写入失败，请手动执行以下 SQL：');
  console.log(sql);
}
