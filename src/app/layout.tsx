import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '星见｜在线塔罗与自我探索',
  description: '让塔罗成为一面镜子，照见此刻真正重要的事。',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-dark text-cream antialiased">{children}</body>
    </html>
  );
}
