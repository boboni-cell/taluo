'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SPREADS } from '@/data/tarot-spreads';
import { usePermission } from '@/hooks/usePermission';
import InviteCodeModal from '@/components/InviteCodeModal';

export default function TarotPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string>('three');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const { hasPermission, isLoading } = usePermission('tarot');

  useEffect(() => {
    if (!isLoading && !hasPermission) setShowInviteModal(true);
  }, [isLoading, hasPermission]);

  const selectedSpread = SPREADS.find((spread) => spread.id === selected);

  return (
    <main className="min-h-screen bg-dark text-cream">
      <div className="editorial-shell">
        <div className="editorial-topbar">
          <Link href="/" className="brand-mark">
            <span className="brand-mark__cn">星见</span>
            <span className="brand-mark__en">XINGJIAN</span>
          </Link>
          <Link href="/" className="nav-link">返回首页</Link>
        </div>

        <header className="grid gap-8 border-b border-line py-14 md:grid-cols-[1.25fr_.75fr] md:items-end md:py-20">
          <div>
            <p className="page-kicker">SELECT A SPREAD</p>
            <h1 className="page-title">先选择一个<br />看问题的角度。</h1>
          </div>
          <p className="page-subtitle md:max-w-sm md:justify-self-end">
            不确定该选哪个？三牌阵适合大多数问题。问题越具体，牌面给你的镜像就越清晰。
          </p>
        </header>

        <section className="grid border-b border-line md:grid-cols-2">
          {SPREADS.map((spread, index) => {
            const isSelected = spread.id === selected;
            return (
              <button
                key={spread.id}
                onClick={() => setSelected(spread.id)}
                aria-pressed={isSelected}
                className={`relative min-h-[210px] border-b border-line p-7 text-left transition-colors md:p-9 ${index % 2 === 0 ? 'md:border-r' : ''} ${isSelected ? 'bg-[#18140f]' : 'hover:bg-[#12100d]'}`}
              >
                <div className="flex items-start justify-between gap-6">
                  <span className="font-serif text-xs text-muted">{String(index + 1).padStart(2, '0')}</span>
                  <span className={`h-3 w-3 rounded-full border ${isSelected ? 'border-accent bg-accent' : 'border-[#51483f]'}`} />
                </div>
                <div className="mt-10 flex items-baseline justify-between gap-4">
                  <h2 className="font-serif-cn text-2xl font-normal tracking-wide sm:text-3xl">{spread.nameZh}</h2>
                  <span className="text-[10px] tracking-[.18em] text-accent">{spread.cardCount} CARDS</span>
                </div>
                <p className="mt-4 max-w-md text-xs leading-7 text-muted">{spread.description}</p>
                {spread.id === 'celtic' && <span className="absolute bottom-7 right-7 text-[9px] tracking-[.16em] text-[#7e7368]">ADVANCED</span>}
              </button>
            );
          })}
        </section>

        <div className="sticky bottom-0 z-10 -mx-4 flex flex-col gap-4 border-t border-line bg-[#0b0a08f2] px-4 py-5 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between md:static md:mx-0 md:border-t-0 md:bg-transparent md:px-0 md:py-9 md:backdrop-blur-none">
          <p className="text-xs text-muted">
            已选择 <span className="ml-2 text-cream">{selectedSpread?.nameZh}</span>
          </p>
          <button
            onClick={() => router.push(`/tarot/draw?spread=${selected}`)}
            className="button-primary w-full sm:w-auto"
          >
            带着问题，开始洗牌
          </button>
        </div>
      </div>

      <InviteCodeModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onSuccess={() => setShowInviteModal(false)}
        requiredModule="tarot"
      />
    </main>
  );
}
