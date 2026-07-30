'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { getCardById, type TarotCard } from '@/data/tarot-cards';
import { getSpreadById, type TarotSpread } from '@/data/tarot-spreads';
import { getCardRelation, getClassicCombination, analyzeSuitDensity } from '@/data/tarot-relations';
import { getCardMeaning, getKeywords, generateCoreMeaning, generateDeepPositionInsight, generateComprehensiveGuidance, type ReadingContext } from '@/lib/reading-templates';
import TarotChat from '@/components/TarotChat';

type ResolvedCard = TarotCard & { pos: number; rev: boolean; posName: string };

function CardThumb({ src, alt, reversed }: { src: string; alt: string; reversed: boolean }) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imageRef.current?.complete) setStatus(imageRef.current.naturalWidth > 0 ? 'loaded' : 'error');
  }, [src]);

  if (status === 'error' || !src) return <div className="flex h-full w-full items-center justify-center bg-[#d8cfbf] px-2 text-center text-[9px] text-[#302820]">{alt}</div>;

  return (
    <>
      {status === 'loading' && <span className="absolute inset-0 flex items-center justify-center text-[8px] tracking-[.14em] text-[#675d53]">LOADING</span>}
      <img ref={imageRef} src={src} alt={alt} className="h-full w-full object-contain" style={{ transform: reversed ? 'rotate(180deg)' : 'none', display: status === 'loaded' ? 'block' : 'none' }} onLoad={() => setStatus('loaded')} onError={() => setStatus('error')} />
    </>
  );
}

function CardReading({ card, spread, index }: { card: ResolvedCard; spread: TarotSpread; index: number }) {
  const positionDescription = spread.positions[card.pos]?.description || '';
  const meaning = generateCoreMeaning(card, card.rev);
  const insight = generateDeepPositionInsight(card, card.posName, card.rev, positionDescription);

  return (
    <article className="grid gap-7 border-t border-line py-10 animate-fadeInUp sm:grid-cols-[150px_1fr] sm:py-14">
      <div>
        <span className="font-serif text-xs text-muted">{String(index + 1).padStart(2, '0')}</span>
        <div className="relative mt-5 h-[198px] w-[128px] overflow-hidden border border-[#5c4636] bg-[#d8cfbf] p-1 shadow-xl shadow-black/30">
          <CardThumb src={card.image} alt={card.nameZh} reversed={card.rev} />
        </div>
      </div>
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="pill-label">{card.posName}</span>
          <span className={`text-[10px] tracking-[.12em] ${card.rev ? 'text-[#c77d6a]' : 'text-[#8fa07a]'}`}>{card.rev ? '逆位' : '正位'}</span>
        </div>
        <h3 className="mt-5 font-serif-cn text-3xl font-normal tracking-wide sm:text-4xl">{card.nameZh}</h3>
        <p className="mt-2 text-[10px] tracking-[.18em] text-muted">{card.nameEn.toUpperCase()}</p>
        {positionDescription && <p className="mt-5 text-xs leading-6 text-[#777066]">{positionDescription}</p>}
        <div className="mt-8 grid gap-8 md:grid-cols-2">
          <div>
            <h4 className="text-[10px] font-semibold tracking-[.17em] text-accent">牌面讯息</h4>
            <p className="mt-4 whitespace-pre-line text-sm leading-8 text-[#c1b9ae]">{meaning}</p>
          </div>
          <div>
            <h4 className="text-[10px] font-semibold tracking-[.17em] text-accent">放在「{card.posName}」</h4>
            <p className="mt-4 whitespace-pre-line text-sm leading-8 text-[#c1b9ae]">{insight}</p>
          </div>
        </div>
      </div>
    </article>
  );
}

function CardRelations({ relations, combinations }: { relations: string[]; combinations: string[] }) {
  if (!relations.length && !combinations.length) return null;
  return (
    <section className="mt-16 border-t border-line pt-12 animate-fadeInUp">
      <p className="page-kicker">CONNECTIONS</p>
      <h2 className="mt-4 font-serif-cn text-3xl font-normal">这些牌如何彼此回应</h2>
      <div className="mt-8 divide-y divide-line border-y border-line">
        {[...combinations, ...relations.slice(0, 5)].map((text, index) => (
          <div key={`${index}-${text}`} className="grid gap-3 py-6 sm:grid-cols-[45px_1fr]">
            <span className="font-serif text-xs text-accent">{String(index + 1).padStart(2, '0')}</span>
            <p className="text-sm leading-8 text-[#bcb4a9]">{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function ReadingPage() {
  const [data, setData] = useState<{ spread: string; cards: { id: number; position: number; isReversed: boolean }[]; timestamp: number } | null>(null);
  const [cards, setCards] = useState<ResolvedCard[]>([]);
  const [spread, setSpread] = useState<TarotSpread | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('tarotReading');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.cards) { setData(parsed); setSpread(getSpreadById(parsed.spread) || null); }
      }
    } catch { }
  }, []);

  useEffect(() => {
    if (!data || !spread) return;
    const resolved = data.cards.map((item) => {
      const card = getCardById(item.id);
      if (!card) return null;
      return { ...card, pos: item.position, rev: item.isReversed, posName: spread.positions[item.position]?.nameZh || '' };
    });
    setCards(resolved.filter(Boolean) as ResolvedCard[]);
  }, [data, spread]);

  useEffect(() => {
    if (!cards.length) return;
    const timer = setTimeout(() => setShowAll(true), 650);
    return () => clearTimeout(timer);
  }, [cards]);

  const combinations = cards.length >= 2 ? getClassicCombination(cards) : [];
  const suitAnalysis = cards.length >= 3 ? analyzeSuitDensity(cards) : null;
  const relationGroups = new Map<string, string[]>();
  for (let i = 0; i < cards.length - 1; i++) {
    for (let j = i + 1; j < cards.length; j++) {
      const relation = getCardRelation(cards[i], cards[j]);
      if (relation) relationGroups.set(relation, [...(relationGroups.get(relation) || []), `${cards[i].nameZh} + ${cards[j].nameZh}`]);
    }
  }
  const relations = Array.from(relationGroups, ([relation, pairs]) => `${pairs.join('、')}：${relation}`);
  const context: ReadingContext | null = spread ? { spread, cards, relations, combos: combinations, suitAnalysis } : null;
  const guidance = context ? generateComprehensiveGuidance(context) : null;
  const guidanceText = guidance ? `${guidance.intro}\n\n${guidance.trend}\n\n${guidance.outro}` : '';

  function showToast(message: string) {
    const toast = document.createElement('div');
    toast.className = 'fixed left-1/2 top-6 z-50 -translate-x-1/2 border border-[#4a3a2d] bg-[#12100d] px-6 py-3 text-xs tracking-wider text-accent shadow-xl animate-fadeInUp';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
  }

  if (!data || !spread) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-dark p-8 text-center">
        <p className="page-kicker">NO READING YET</p>
        <h1 className="mt-6 font-serif-cn text-4xl font-normal">这里还没有牌。</h1>
        <p className="mt-4 text-sm text-muted">先选择一个牌阵，再让直觉为你翻牌。</p>
        <Link href="/tarot" className="button-primary mt-8">去选择牌阵</Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-dark text-cream">
      <div className="editorial-shell max-w-[920px]">
        <div className="editorial-topbar">
          <Link href="/tarot" className="nav-link">重新占卜</Link>
          <span className="brand-mark__cn text-xl">星见</span>
          <span className="text-[9px] tracking-[.16em] text-muted">READING No. {String(data.timestamp).slice(-6)}</span>
        </div>

        <header className="border-b border-line py-14 text-center sm:py-20">
          <p className="page-kicker">YOUR READING</p>
          <h1 className="mt-5 font-serif-cn text-5xl font-normal tracking-wide sm:text-6xl">{spread.nameZh}</h1>
          <p className="mt-4 text-xs tracking-[.16em] text-muted">{spread.nameEn.toUpperCase()} · {spread.cardCount} CARDS</p>
        </header>

        <section className="flex flex-wrap justify-center gap-5 border-b border-line py-9 sm:gap-8 sm:py-12">
          {cards.map((card) => (
            <div key={`${card.id}-${card.pos}`} className="flex flex-col items-center">
              <div className="relative h-[150px] w-[96px] overflow-hidden border border-[#5c4636] bg-[#d8cfbf] p-1 shadow-xl shadow-black/30">
                <CardThumb src={card.image} alt={card.nameZh} reversed={card.rev} />
              </div>
              <span className="mt-3 text-[10px] tracking-wider text-cream">{card.nameZh}</span>
              <span className="mt-1 text-[9px] tracking-wider text-accent">{card.posName} · {card.rev ? '逆位' : '正位'}</span>
            </div>
          ))}
        </section>

        {!showAll && <div className="py-24 text-center text-xs tracking-[.2em] text-muted animate-pulse">正在整理牌面的线索</div>}

        {showAll && guidance && (
          <section className="border-b border-line py-14 animate-fadeInUp sm:py-20">
            <p className="page-kicker">THE OVERVIEW</p>
            <div className="mt-7 grid gap-8 sm:grid-cols-[180px_1fr]">
              <h2 className="font-serif-cn text-3xl font-normal leading-snug">先看见<br />完整的图景</h2>
              <p className="whitespace-pre-line text-[15px] leading-9 text-[#c9c1b6]">{guidanceText}</p>
            </div>
          </section>
        )}

        {showAll && (
          <section className="pt-16">
            <p className="page-kicker">CARD BY CARD</p>
            <h2 className="mt-4 mb-10 font-serif-cn text-3xl font-normal">再一张张看</h2>
            {cards.map((card, index) => <CardReading key={`${card.id}-${index}`} card={card} spread={spread} index={index} />)}
          </section>
        )}

        {showAll && cards.length >= 2 && <CardRelations relations={relations} combinations={combinations} />}

        {showAll && (
          <TarotChat
            spreadName={spread.nameZh}
            cards={cards.map((card) => ({
              name: card.nameZh,
              position: card.posName,
              isReversed: card.rev,
              keywords: getKeywords(card, card.rev).join('、'),
              meaning: getCardMeaning(card, card.rev),
            }))}
          />
        )}

        <div className="mt-16 flex flex-col gap-3 border-t border-line pt-8 sm:flex-row sm:justify-end">
          <Link href={`/tarot/draw?spread=${spread.id}`} className="button-secondary">再抽一次</Link>
          <Link href="/tarot" className="button-secondary">换个牌阵</Link>
          <button onClick={() => showToast('分享功能即将上线')} className="button-primary">分享结果</button>
        </div>
      </div>
    </main>
  );
}
