'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getAllCards, type TarotCard } from '@/data/tarot-cards';
import { getSpreadById } from '@/data/tarot-spreads';

function CardImg({ src, alt, reversed }: { src: string; alt: string; reversed: boolean }) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imageRef.current?.complete) setStatus(imageRef.current.naturalWidth > 0 ? 'loaded' : 'error');
  }, [src]);

  if (status === 'error' || !src) {
    return <div className="flex h-full w-full items-center justify-center bg-[#d8cfbf] px-2 text-center text-[9px] text-[#302820]">{alt}</div>;
  }

  return (
    <>
      {status === 'loading' && <span className="absolute inset-0 flex items-center justify-center text-[9px] tracking-widest text-muted">LOADING</span>}
      <img
        ref={imageRef}
        src={src}
        alt={alt}
        className="h-full w-full object-contain"
        style={{ transform: reversed ? 'rotate(180deg)' : 'none', display: status === 'loaded' ? 'block' : 'none' }}
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('error')}
      />
    </>
  );
}

type LayoutPos = { left: number; top: number; rotate?: number; scale?: number };
const SPREAD_LAYOUTS: Record<string, LayoutPos[]> = {
  single: [{ left: 50, top: 50, scale: 1.45 }],
  three: [{ left: 20, top: 45 }, { left: 50, top: 45 }, { left: 80, top: 45 }],
  five: [{ left: 20, top: 48 }, { left: 50, top: 48 }, { left: 50, top: 12 }, { left: 80, top: 48 }, { left: 50, top: 82 }],
  moon: [{ left: 20, top: 22 }, { left: 42, top: 10 }, { left: 65, top: 22 }, { left: 80, top: 60 }, { left: 52, top: 78 }, { left: 25, top: 65 }],
  horseshoe: [{ left: 15, top: 12 }, { left: 10, top: 42 }, { left: 20, top: 70 }, { left: 50, top: 82 }, { left: 80, top: 70 }, { left: 90, top: 42 }, { left: 85, top: 12 }],
  celtic: [
    { left: 30, top: 45 }, { left: 30, top: 45, rotate: 90 }, { left: 30, top: 75 }, { left: 12, top: 45 },
    { left: 30, top: 15 }, { left: 48, top: 45 }, { left: 75, top: 78 }, { left: 75, top: 58 }, { left: 75, top: 38 }, { left: 75, top: 15 },
  ],
};

function DrawContent() {
  const searchParams = useSearchParams();
  const spreadId = searchParams.get('spread') || 'three';
  const spread = getSpreadById(spreadId);
  const cardCount = spread?.cardCount || 3;
  const [phase, setPhase] = useState<'focus' | 'shuffle' | 'draw'>('focus');
  const [focusStep, setFocusStep] = useState(0);
  const [pool, setPool] = useState<{ card: TarotCard; isReversed: boolean }[]>([]);
  const [picked, setPicked] = useState<number[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!spread) return;
    const shuffled = [...getAllCards()].sort(() => Math.random() - .5);
    setPool(shuffled.map((card) => ({ card, isReversed: Math.random() < .5 })));
  }, [spread, cardCount]);

  useEffect(() => {
    if (phase !== 'focus') return;
    const first = setTimeout(() => setFocusStep(1), 2200);
    const second = setTimeout(() => setFocusStep(2), 4400);
    return () => { clearTimeout(first); clearTimeout(second); };
  }, [phase]);

  useEffect(() => {
    if (phase !== 'shuffle') return;
    const timer = setTimeout(() => setPhase('draw'), 2800);
    return () => clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (phase === 'draw' && picked.length >= cardCount && !done) {
      const timer = setTimeout(() => setDone(true), 500);
      return () => clearTimeout(timer);
    }
  }, [picked, cardCount, phase, done]);

  function pickCard(index: number) {
    if (phase !== 'draw' || flipped.includes(index) || picked.length >= cardCount) return;
    setFlipped((current) => [...current, index]);
    setTimeout(() => setPicked((current) => [...current, index]), 550);
  }

  function goReading() {
    localStorage.setItem('tarotReading', JSON.stringify({
      spread: spreadId,
      cards: picked.slice(0, cardCount).map((poolIndex, position) => ({
        id: pool[poolIndex].card.id,
        position,
        isReversed: pool[poolIndex].isReversed,
      })),
      timestamp: Date.now(),
    }));
    window.location.href = '/tarot/reading';
  }

  if (!spread) {
    return <main className="flex min-h-screen items-center justify-center bg-dark text-muted">牌阵不存在</main>;
  }

  return (
    <main className="min-h-screen overflow-hidden bg-dark text-cream">
      <div className="fixed left-0 right-0 top-0 z-20 border-b border-line bg-[#0b0a08eb] backdrop-blur-md">
        <div className="mx-auto flex h-16 w-[calc(100%-2rem)] max-w-[1180px] items-center justify-between">
          <Link href="/tarot" className="nav-link">返回牌阵</Link>
          <span className="brand-mark__cn text-xl">星见</span>
          <span className="text-[10px] tracking-[.16em] text-muted">{spread.nameZh}</span>
        </div>
      </div>

      {phase === 'focus' && (
        <section className="flex min-h-screen flex-col items-center justify-center px-6 pt-16 text-center">
          <p className="page-kicker">BEFORE THE CARDS</p>
          <span className="mt-9 font-serif text-7xl font-light text-[#3f372f]">01</span>
          <div className="relative mt-9 h-24 w-full max-w-xl">
            {[
              '把注意力带回呼吸。',
              '在心里，用一句话说出你的问题。',
              '准备好后，让直觉替你选牌。',
            ].map((text, index) => (
              <p key={text} className={`absolute inset-0 flex items-center justify-center font-serif-cn text-2xl font-normal tracking-wide transition-opacity duration-700 sm:text-3xl ${focusStep === index ? 'opacity-100' : 'opacity-0'}`}>{text}</p>
            ))}
          </div>
          <p className="mt-7 max-w-sm text-xs leading-7 text-muted">不必追求绝对安静。只要诚实地停留在此刻。</p>
          {focusStep >= 2 && <button onClick={() => setPhase('shuffle')} className="button-primary mt-10 animate-fadeInUp">开始洗牌</button>}
        </section>
      )}

      {phase === 'shuffle' && (
        <section className="flex min-h-screen flex-col items-center justify-center px-6 pt-16">
          <p className="page-kicker">SHUFFLING</p>
          <div className="relative mt-12 h-72 w-56 sm:h-80 sm:w-64">
            {Array.from({ length: 7 }).map((_, index) => (
              <div
                key={index}
                className="absolute inset-0 flex items-center justify-center"
                style={{ transform: `rotate(${(index - 3) * 6}deg)`, animation: `shuffleScatter .8s ease-in-out ${index * .08}s forwards, shuffleSwap .6s ease-in-out 1.1s, shuffleToPosition .6s ease-out 2.05s forwards`, '--sx': `${(Math.random() - .5) * 180}px`, '--sy': `${(Math.random() - .5) * 160}px`, '--sr': `${(Math.random() - .5) * 35}deg`, '--fx': '0px', '--fy': '0px' } as React.CSSProperties}
              >
                <div className="flex h-48 w-32 items-center justify-center border border-[#765139] bg-[#17120e] p-2 shadow-2xl shadow-black/50">
                  <div className="flex h-full w-full items-center justify-center border border-[#3f3127] text-[10px] tracking-[.35em] text-[#8d674d] [writing-mode:vertical-rl]">星见</div>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-12 text-xs tracking-[.2em] text-muted">正在打乱既定的顺序</p>
        </section>
      )}

      {phase === 'draw' && (
        <section className="mx-auto flex min-h-screen w-[calc(100%-1.5rem)] max-w-[1180px] flex-col items-center pb-20 pt-24">
          <header className="w-full border-b border-line pb-6 text-center">
            <p className="page-kicker">FOLLOW YOUR INSTINCT</p>
            <h1 className="mt-4 font-serif-cn text-3xl font-normal tracking-wide">选择 {cardCount} 张牌</h1>
            <p className="mt-3 text-xs tracking-[.12em] text-muted">已选择 {picked.length} / {cardCount}</p>
          </header>

          {picked.length > 0 && (
            <div className="relative mt-7 w-full max-w-[620px] border border-line bg-[#100e0b]" style={{ aspectRatio: spreadId === 'celtic' ? '3 / 2' : '4 / 3', padding: '8%' }}>
              <div className="relative h-full w-full">
                {picked.map((poolIndex, positionIndex) => {
                  const item = pool[poolIndex];
                  const layout = SPREAD_LAYOUTS[spreadId]?.[positionIndex];
                  if (!item || !layout) return null;
                  return (
                    <div key={poolIndex} className="absolute flex flex-col items-center" style={{ left: `${layout.left}%`, top: `${layout.top}%`, transform: `translate(-50%, -50%)${layout.rotate ? ` rotate(${layout.rotate}deg)` : ''}${layout.scale ? ` scale(${layout.scale})` : ''}` }}>
                      <div className="relative h-24 w-16 overflow-hidden border border-[#6d4a35] bg-[#d8cfbf]">
                        <CardImg src={item.card.image} alt={item.card.nameZh} reversed={item.isReversed} />
                      </div>
                      <span className="mt-2 whitespace-nowrap text-[9px] tracking-wider text-accent">{spread.positions[positionIndex]?.nameZh}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="my-8 grid max-w-5xl grid-cols-8 gap-1 sm:grid-cols-10 md:grid-cols-13">
            {pool.map((item, index) => {
              const isFlipped = flipped.includes(index);
              const isPicked = picked.includes(index);
              const canPick = !isFlipped && picked.length < cardCount;
              return (
                <button key={index} onClick={() => pickCard(index)} disabled={!canPick} className={`group flex flex-col items-center ${isPicked ? '' : canPick ? '' : 'opacity-20'}`}>
                  <div className={`relative h-[66px] w-[43px] overflow-hidden border transition-all duration-500 sm:h-[78px] sm:w-[50px] ${isFlipped ? 'border-accent bg-[#d8cfbf]' : 'border-[#493528] bg-[#17120e] group-enabled:hover:-translate-y-1 group-enabled:hover:border-accent'}`} style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
                    <div className="absolute inset-1 flex items-center justify-center border border-[#34271f] text-[6px] tracking-[.22em] text-[#79533b] [backface-visibility:hidden] [writing-mode:vertical-rl]">星见</div>
                    <div className="absolute inset-0 bg-[#d8cfbf] [backface-visibility:hidden] [transform:rotateY(180deg)]">
                      <CardImg src={item.card.image} alt={item.card.nameZh} reversed={item.isReversed} />
                    </div>
                  </div>
                  {isPicked && <span className="mt-1 text-[7px] text-accent">{spread.positions[picked.indexOf(index)]?.nameZh}</span>}
                </button>
              );
            })}
          </div>

          {done && (
            <div className="sticky bottom-5 z-20 flex w-full max-w-md flex-col items-center border border-[#4a3a2d] bg-[#12100df2] p-5 shadow-2xl shadow-black/60 backdrop-blur-md animate-fadeInUp sm:flex-row sm:justify-between">
              <p className="mb-4 text-xs text-muted sm:mb-0">牌已到齐，可以开始解读。</p>
              <button onClick={goReading} className="button-primary w-full sm:w-auto">查看解读</button>
            </div>
          )}
        </section>
      )}
    </main>
  );
}

export default function DrawPage() {
  return (
    <Suspense fallback={<main className="flex min-h-screen items-center justify-center bg-dark text-xs tracking-[.2em] text-muted">正在准备牌面</main>}>
      <DrawContent />
    </Suspense>
  );
}
