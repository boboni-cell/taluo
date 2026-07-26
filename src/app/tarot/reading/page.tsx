'use client';
import { useEffect, useState, useRef, useMemo } from 'react';
import Link from 'next/link';
import { getCardById, type TarotCard } from '@/data/tarot-cards';
import { getSpreadById, type TarotSpread } from '@/data/tarot-spreads';
import { getCardRelation, getClassicCombination, analyzeSuitDensity } from '@/data/tarot-relations';
import { getKeywords, generatePositionInsight, generateComprehensiveGuidance, type ReadingContext } from '@/lib/reading-templates';

/* ---- 牌面小图 ---- */
function CardThumb({ src, alt, rev }: { src: string; alt: string; rev: boolean }) {
  const [s, setS] = useState<'loading' | 'loaded' | 'error'>('loading');
  const r = useRef<HTMLImageElement>(null);
  useEffect(() => { if (r.current?.complete) setS(r.current.naturalWidth > 0 ? 'loaded' : 'error'); }, [src]);
  if (s === 'error' || !src) {
    return <div className="w-full h-full flex items-center justify-center rounded bg-[#2C1810] border border-accent/30" style={{ transform: rev ? 'rotate(180deg)' : 'none' }}><span className="text-accent/50 text-sm">✦</span></div>;
  }
  return (
    <>
      {s === 'loading' && <span className="absolute inset-0 flex items-center justify-center text-accent/40 animate-pulse">🔮</span>}
      <img ref={r} src={src} alt={alt} className="w-full h-full object-contain" style={{ transform: rev ? 'rotate(180deg)' : 'none', display: s === 'loaded' ? 'block' : 'none' }} onLoad={() => setS('loaded')} onError={() => setS('error')} />
    </>
  );
}

/* ---- 关键词标签 ---- */
function KeywordTags({ keywords }: { keywords: string[] }) {
  if (!keywords.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5 mt-3">
      {keywords.map((k, i) => (
        <span key={i} className="inline-block px-2.5 py-0.5 text-[11px] text-accent border border-accent/40 rounded-full tracking-wider">{k}</span>
      ))}
    </div>
  );
}

/* ---- 单牌解读区块 ---- */
function CardReading({
  card, spread,
}: {
  card: TarotCard & { pos: number; rev: boolean; posName: string };
  spread: TarotSpread;
}) {
  const meaning = card.rev ? card.reversedMeaning : card.uprightMeaning;
  const insight = useMemo(() => generatePositionInsight(card, card.posName, card.rev), [card.id, card.rev, card.posName]);
  const keywords = useMemo(() => getKeywords(card, card.rev), [card.id, card.rev]);
  const posDesc = spread.positions[card.pos]?.description || '';

  return (
    <div className="bg-[#1A0F0A]/60 rounded-xl border border-accent/10 p-5 sm:p-6 space-y-4 animate-fadeInUp">
      {/* 区块头部 */}
      <div className="flex items-start gap-4">
        <div className="relative w-14 h-22 sm:w-16 sm:h-24 flex-shrink-0 rounded-lg overflow-hidden border border-accent/30 bg-[#F5F0E8]">
          <CardThumb src={card.image} alt={card.nameZh} rev={card.rev} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-block text-[11px] font-medium text-accent bg-accent/10 border border-accent/30 rounded-full px-3 py-0.5 tracking-wider">{card.posName}</span>
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${card.rev ? 'bg-red-400/15 text-red-300/80' : 'bg-green-400/15 text-green-300/80'}`}>{card.rev ? '逆位' : '正位'}</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-cream tracking-wide">{card.nameZh}<span className="ml-2 text-xs font-normal text-cream/40">{card.nameEn}</span></h3>
          {posDesc && <p className="text-xs text-cream/40 mt-0.5 italic">{posDesc}</p>}
        </div>
      </div>

      {/* 🔮 核心牌义 */}
      <div>
        <h4 className="text-sm font-semibold text-accent mb-2 tracking-wider">🔮 核心牌义</h4>
        <p className="text-sm sm:text-base text-cream/75 leading-relaxed">{meaning || '这张牌的能量正在向你传递信息。'}</p>
      </div>

      {/* 💡 位置化启示 */}
      <div>
        <h4 className="text-sm font-semibold text-accent mb-2 tracking-wider">💡 在这个位置的启示</h4>
        <p className="text-sm sm:text-base text-cream/75 leading-relaxed">{insight}</p>
      </div>

      {/* 🧠 心理原型（仅大阿卡纳） */}
      {card.arcana === 'major' && card.psychologicalArchetype && (
        <div className="bg-accent/5 border border-accent/15 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-accent mb-2 tracking-wider">🧠 心理原型</h4>
          <p className="text-xs sm:text-sm text-cream/60 italic leading-relaxed">{card.psychologicalArchetype}</p>
        </div>
      )}

      {/* 🌟 关键词 */}
      <div>
        <h4 className="text-sm font-semibold text-accent mb-1 tracking-wider">🌟 关键词提炼</h4>
        <KeywordTags keywords={keywords} />
      </div>
    </div>
  );
}

/* ---- 牌间关系区 ---- */
function CardRelations({
  cards, relations, combos, suitAnalysis,
}: {
  cards: (TarotCard & { pos: number; rev: boolean; posName: string })[];
  relations: string[];
  combos: string[];
  suitAnalysis: string | null;
}) {
  const hasAny = relations.length > 0 || combos.length > 0 || suitAnalysis;
  const fallbackAnalysis: string[] = [];
  if (!hasAny && cards.length >= 2) {
    const majorCount = cards.filter(c => c.arcana === 'major').length;
    if (majorCount > 0) {
      fallbackAnalysis.push(majorCount >= cards.length * 0.5
        ? `本次占卜中，大阿卡纳出现了${majorCount}张，说明当前处于人生重大转折期，命运的浪潮正在推动你的生命之舟。`
        : `大阿卡纳出现了${majorCount}张，为日常的课题注入了一丝神圣的底色，请留意那些看似偶然的瞬间。`
      );
    }
    const suitCounts: Record<string, number> = {};
    for (const c of cards) { if (c.suit) suitCounts[c.suit] = (suitCounts[c.suit] || 0) + 1; }
    const sorted = Object.entries(suitCounts).sort((a, b) => b[1] - a[1]);
    const suitNames: Record<string, string> = { wands: '权杖', cups: '圣杯', swords: '宝剑', pentacles: '星币' };
    const suitThemes: Record<string, string> = { wands: '行动和创造', cups: '情感和直觉', swords: '思维和沟通', pentacles: '物质和实际' };
    for (const [suit, count] of sorted) {
      if (count >= 2) fallbackAnalysis.push(`${suitNames[suit]}牌出现${count}张，${suitThemes[suit]}层面是当前的关键主题。`);
    }
    if (sorted.length === 0 && majorCount === 0) fallbackAnalysis.push('牌面以日常生活的细微能量为主，提醒你在平凡中见真知。');
  }

  return (
    <div className="mt-8 animate-fadeInUp">
      <div className="mb-8 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
      <h2 className="text-lg sm:text-xl font-bold text-accent mb-5 tracking-[0.15em]">✦ 牌面关系洞察</h2>
      <div className="space-y-3">
        {combos.map((c, i) => (
          <div key={`combo-${i}`} className="bg-accent/5 border border-accent/20 rounded-lg p-4">
            <span className="text-accent text-sm mr-2">💫</span>
            <span className="text-sm text-cream/70 leading-relaxed">{c}</span>
          </div>
        ))}
        {suitAnalysis && (
          <div className="bg-accent/5 border border-accent/20 rounded-lg p-4">
            <span className="text-accent text-sm mr-2">🎴</span>
            <span className="text-sm text-cream/70 leading-relaxed">{suitAnalysis}</span>
          </div>
        )}
        {relations.slice(0, 5).map((r, i) => (
          <div key={`rel-${i}`} className="bg-accent/5 border border-accent/20 rounded-lg p-4">
            <span className="text-accent text-sm mr-2">🔗</span>
            <span className="text-sm text-cream/70 leading-relaxed">{r}</span>
          </div>
        ))}
        {fallbackAnalysis.length > 0 && relations.length === 0 && combos.length === 0 && !suitAnalysis && (
          <div className="bg-accent/5 border border-accent/20 rounded-lg p-4">
            <span className="text-accent text-sm mr-2">🔍</span>
            <span className="text-sm text-cream/70 leading-relaxed">{fallbackAnalysis.join(' ')}</span>
          </div>
        )}
      </div>
      <div className="mt-8 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
    </div>
  );
}

/* ---- 主页面 ---- */
export default function ReadingPage() {
  const [data, setData] = useState<{ spread: string; cards: { id: number; position: number; isReversed: boolean }[]; timestamp: number } | null>(null);
  const [cards, setCards] = useState<(TarotCard & { pos: number; rev: boolean; posName: string })[]>([]);
  const [spread, setSpread] = useState<TarotSpread | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    try {
      const r = localStorage.getItem('tarotReading');
      if (r) {
        const p = JSON.parse(r);
        if (p.cards) { setData(p); setSpread(getSpreadById(p.spread) || null); }
      }
    } catch { }
  }, []);

  useEffect(() => {
    if (!data || !spread) return;
    const resolved = data.cards.map(c => {
      const card = getCardById(c.id);
      if (!card) return null;
      return { ...card, pos: c.position, rev: c.isReversed, posName: spread.positions[c.position]?.nameZh || '' };
    });
    setCards(resolved.filter(Boolean) as (TarotCard & { pos: number; rev: boolean; posName: string })[]);
  }, [data, spread]);

  useEffect(() => {
    if (cards.length) { const t = setTimeout(() => setShowAll(true), 800); return () => clearTimeout(t); }
  }, [cards]);

  const relations: string[] = [];
  const combos = cards.length >= 2 ? getClassicCombination(cards) : [];
  const suitAnalysis = cards.length >= 3 ? analyzeSuitDensity(cards) : null;
  for (let i = 0; i < cards.length - 1; i++) {
    for (let j = i + 1; j < cards.length; j++) {
      const rel = getCardRelation(cards[i], cards[j]);
      if (rel) relations.push(`${cards[i].nameZh} + ${cards[j].nameZh}：${rel}`);
    }
  }

  const ctx: ReadingContext | null = spread ? { spread, cards, relations, combos, suitAnalysis } : null;
  const guidance = useMemo(() => ctx ? generateComprehensiveGuidance(ctx) : null, [data?.timestamp, cards.map(c => c.id).join(',')]);
  const fullGuidanceText = useMemo(() => guidance ? `${guidance.intro}\n\n${guidance.trend}\n\n${guidance.outro}` : '', [guidance]);

  function showToast(m: string) {
    const e = document.createElement('div');
    e.className = 'fixed top-6 left-1/2 -translate-x-1/2 bg-primary/95 border border-accent text-accent px-6 py-3 rounded-full text-sm tracking-wider z-50 animate-fadeInUp';
    e.textContent = m; document.body.appendChild(e); setTimeout(() => e.remove(), 2500);
  }

  if (!data || !spread) {
    return (
      <main className="min-h-screen bg-dark flex flex-col items-center justify-center p-8">
        <span className="text-5xl mb-4">🔮</span>
        <p className="text-cream/60 mb-6">暂无占卜数据</p>
        <Link href="/tarot" className="rounded-full border border-accent text-accent px-8 py-3 tracking-wider hover:bg-accent/10">去占卜 →</Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-dark px-4 py-8 sm:px-8 sm:pb-16">
      <div className="mx-auto max-w-2xl">
        <Link href="/tarot" className="inline-block text-sm text-cream/40 hover:text-accent tracking-wider mb-4 transition-colors">← 重新占卜</Link>

        <header className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-accent tracking-[0.2em]">✦ 塔罗解读</h1>
          <p className="mt-2 text-sm text-cream/50">{spread.nameZh} · {spread.cardCount}张</p>
        </header>

        {/* 牌面总览 */}
        <section className="flex justify-center gap-2 sm:gap-4 mb-10 flex-wrap">
          {cards.map((c, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <div className="relative w-16 h-24 sm:w-20 sm:h-30 rounded-lg overflow-hidden border-2 border-accent/40 bg-[#F5F0E8] shadow-lg shadow-accent/5">
                <CardThumb src={c.image} alt={c.nameZh} rev={c.rev} />
              </div>
              <span className="text-[10px] font-medium text-cream/70">{c.nameZh}</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${c.rev ? 'bg-red-400/15 text-red-300/70' : 'bg-green-400/15 text-green-300/70'}`}>{c.rev ? '逆' : '正'}</span>
              <span className="text-[9px] text-accent/50 tracking-wide">{c.posName}</span>
            </div>
          ))}
        </section>

        {/* 逐牌解读 */}
        {showAll && (
          <section className="space-y-6">
            {cards.map((c, i) => (
              <div key={i}>
                {i > 0 && <div className="my-6 h-px bg-gradient-to-r from-transparent via-accent/15 to-transparent" />}
                <CardReading card={c} spread={spread} />
              </div>
            ))}
          </section>
        )}

        {!showAll && (
          <div className="flex flex-col items-center justify-center py-16 text-accent/40 space-y-4">
            <span className="text-3xl animate-breathe">✦</span>
            <p className="text-sm tracking-wider">正在连接牌面的能量…</p>
          </div>
        )}

        {/* 牌间关系 */}
        {showAll && cards.length >= 2 && <CardRelations cards={cards} relations={relations} combos={combos} suitAnalysis={suitAnalysis} />}

        {/* 综合指引 */}
        {showAll && guidance && (
          <div className="mt-8 animate-fadeInUp">
            <h2 className="text-lg sm:text-xl font-bold text-accent mb-4 tracking-[0.15em]">✦ 综合指引</h2>
            <div className="text-sm sm:text-base text-cream/70 leading-loose space-y-4 whitespace-pre-line">
              <p>{fullGuidanceText}</p>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-10">
          <Link href={`/tarot/draw?spread=${spread.id}`} className="text-center rounded-full border border-accent text-accent px-6 py-3 tracking-wider text-sm hover:bg-accent/10 transition-colors">再抽一次</Link>
          <Link href="/tarot" className="text-center rounded-full border border-accent/50 text-cream/70 px-6 py-3 tracking-wider text-sm hover:border-accent hover:text-accent transition-colors">换个牌阵</Link>
          <button onClick={() => showToast('分享功能即将上线')} className="rounded-full bg-accent text-dark font-bold px-8 py-3 tracking-wider text-sm hover:bg-yellow-500 transition-colors">分享结果</button>
        </div>
        <div className="h-12" />
      </div>
    </main>
  );
}
