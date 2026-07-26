/** @type {import('next').NextConfig} */
const nextConfig = {
  // 图片优化（Cloudflare 部署需要关闭默认图片优化）
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
