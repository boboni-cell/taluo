/** @type {import('next').NextConfig} */
const nextConfig = {
  // 图片优化（Cloudflare 部署需要关闭默认图片优化）
  images: {
    unoptimized: true,
  },
};

// Cloudflare 本地开发：注入 D1 等 bindings 到 process.env
// 仅在 `npm run preview` (wrangler pages dev) 或 `next dev` 时生效
if (process.env.NODE_ENV === 'development') {
  try {
    const { setupDevPlatform } = await import('@cloudflare/next-on-pages/next-dev');
    if (setupDevPlatform) {
      await setupDevPlatform({ persist: true });
    }
  } catch {
    // 本地未安装或不在 Cloudflare 环境中，忽略
  }
}

export default nextConfig;
