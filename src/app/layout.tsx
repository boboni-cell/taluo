import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "塔罗占卜屋 - 在线塔罗牌占卜",
  description: "选择你想问的问题，抽取属于你的牌。免费在线塔罗占卜，事业、财运、桃花一探究竟。",
};

/**
 * 根布局 - 全局字体、样式和元数据
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-dark text-cream antialiased">
        {children}
      </body>
    </html>
  );
}
