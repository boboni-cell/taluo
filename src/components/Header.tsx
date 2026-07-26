/**
 * 页头导航组件（占位骨架）
 */
export default function Header() {
  return (
    <header className="w-full p-4 bg-primary/80 backdrop-blur-sm border-b border-accent/20">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <span className="text-accent font-bold tracking-widest">塔罗占卜屋</span>
        {/* TODO: 导航链接 */}
      </div>
    </header>
  );
}
