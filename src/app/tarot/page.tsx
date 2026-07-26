'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SPREADS } from '@/data/tarot-spreads';
import { usePermission } from '@/hooks/usePermission';
import InviteCodeModal from '@/components/InviteCodeModal';

export default function TarotPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const { hasPermission, isLoading } = usePermission('tarot');

  // 权限检查完成后，无权限则弹窗
  useEffect(() => {
    if (!isLoading && !hasPermission) {
      setShowInviteModal(true);
    }
  }, [isLoading, hasPermission]);

  return (
    <main className="min-h-screen bg-dark px-4 py-10 sm:px-8 sm:py-16">
      <div className="mx-auto max-w-2xl">
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-[0.3em] text-accent sm:text-4xl">塔罗占卜</h1>
          <p className="mt-3 text-sm text-cream/50 tracking-wider">静心冥想，选择适合你的牌阵</p>
        </header>

        <section className="mb-8">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            {SPREADS.map(s => {
              const isSel = selected === s.id;
              return (
                <button key={s.id} onClick={() => setSelected(s.id)}
                  className={`relative flex flex-col items-center rounded-xl border-2 p-4 sm:p-5 text-left transition-all duration-300 ${
                    isSel ? 'border-accent bg-accent/10 scale-[1.03] shadow-[0_0_20px_rgba(196,153,76,0.25)]' : 'border-primary/50 bg-primary/40 hover:border-accent/60 hover:bg-primary/60'
                  }`}>
                  {s.id === 'celtic' && <span className="absolute -top-2 -right-2 text-[10px] bg-accent text-dark px-2 py-0.5 rounded-full font-bold">进阶</span>}
                  <span className="text-lg font-semibold text-accent tracking-wider">{s.nameZh}</span>
                  <span className="text-xs text-cream/40 mt-1">{s.cardCount}张牌</span>
                  <span className="text-[11px] text-cream/50 mt-1.5 leading-snug text-center">{s.description}</span>
                </button>
              );
            })}
          </div>
        </section>

        {selected && (
          <div className="flex justify-center animate-fadeInUp">
            <button onClick={() => router.push(`/tarot/draw?spread=${selected}`)}
              className="w-full rounded-full bg-gradient-to-r from-accent to-yellow-600 px-10 py-4 text-lg font-bold text-dark tracking-[0.2em] shadow-lg transition-transform duration-200 hover:scale-105 active:scale-95 sm:w-auto sm:px-16">开始占卜</button>
          </div>
        )}

        <footer className="mt-16 text-center">
          <a href="/" className="text-sm text-cream/30 tracking-wider transition-colors hover:text-cream/60">← 返回首页</a>
        </footer>

        {/* 邀请码弹窗 */}
        <InviteCodeModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          onSuccess={() => setShowInviteModal(false)}
          requiredModule="tarot"
        />
      </div>
    </main>
  );
}
