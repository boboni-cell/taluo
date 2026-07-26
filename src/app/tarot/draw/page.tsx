'use client';
import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getAllCards, type TarotCard } from '@/data/tarot-cards';
import { getSpreadById } from '@/data/tarot-spreads';

/* ---- 子组件: 牌面图片 ---- */
function CardImg({ src, alt, rev }: { src: string; alt: string; rev: boolean }) {
  const [s, setS] = useState<'loading'|'loaded'|'error'>('loading');
  const r = useRef<HTMLImageElement>(null);
  useEffect(() => { if (r.current?.complete) setS(r.current.naturalWidth>0?'loaded':'error'); }, [src]);
  if (s==='error'||!src) return <div className="w-full h-full flex flex-col items-center justify-center rounded bg-[#2C1810] border border-accent/30" style={{transform:rev?'rotate(180deg)':'none'}}><span className="text-accent/50 text-lg">✦</span><span className="text-[9px] text-accent/50 mt-1">{alt}</span></div>;
  return <>{s==='loading'&&<span className="absolute text-lg animate-pulse text-accent/40">🔮</span>}<img ref={r} src={src} alt={alt} className="w-full h-full object-contain" style={{transform:rev?'rotate(180deg)':'none',display:s==='loaded'?'block':'none'}} onLoad={()=>setS('loaded')} onError={()=>setS('error')} /></>;
}

/* ---- 牌阵布局配置 ---- */
type LayoutPos = { left: number; top: number; rotate?: number; scale?: number };
const SPREAD_LAYOUTS: Record<string, LayoutPos[]> = {
  single:  [{ left: 50, top: 50, scale: 1.5 }],
  three:   [{ left: 20, top: 40 }, { left: 50, top: 40 }, { left: 80, top: 40 }],
  five:    [{ left: 20, top: 45 }, { left: 50, top: 45 }, { left: 50, top: 10 }, { left: 80, top: 45 }, { left: 50, top: 80 }],
  moon:    [{ left: 25, top: 20 }, { left: 50, top: 10 }, { left: 75, top: 20 }, { left: 33, top: 55 }, { left: 67, top: 55 }, { left: 50, top: 80 }],
  horseshoe: [{ left: 15, top: 10 }, { left: 10, top: 40 }, { left: 20, top: 68 }, { left: 50, top: 82 }, { left: 80, top: 68 }, { left: 90, top: 40 }, { left: 85, top: 10 }],
  celtic:  [
    { left: 30, top: 45 }, { left: 30, top: 45, rotate: 90 }, { left: 30, top: 75 }, { left: 12, top: 45 },
    { left: 30, top: 15 }, { left: 48, top: 45 },
    { left: 75, top: 78 }, { left: 75, top: 58 }, { left: 75, top: 38 }, { left: 75, top: 15 },
  ],
};

/* ---- 主组件 ---- */
function DrawContent() {
  const sp = useSearchParams();
  const spreadId = sp.get('spread') || 'three';
  const spread = getSpreadById(spreadId);
  const need = spread?.cardCount || 3;

  const [phase, setPhase] = useState<'focus'|'shuffle'|'draw'>('focus');
  const [focusStep, setFocusStep] = useState(0);
  const [pool, setPool] = useState<{ card: TarotCard; isReversed: boolean }[]>([]);
  const [picked, setPicked] = useState<number[]>([]);    // 已选中的 pool 索引
  const [flipped, setFlipped] = useState<number[]>([]);  // 已翻开的 pool 索引
  const [done, setDone] = useState(false);

  // 生成牌池：全部78张，随机洗牌 + 随机正逆位
  useEffect(() => {
    if (!spread) return;
    const all = getAllCards();
    const shuffled = all.sort(() => Math.random() - 0.5);
    const p = shuffled.map(c => ({ card: c, isReversed: Math.random() < 0.5 }));
    setPool(p);
  }, [spread, need]);

  // 冥想文字渐变
  useEffect(() => {
    if (phase !== 'focus') return;
    const t1 = setTimeout(() => setFocusStep(1), 2500);
    const t2 = setTimeout(() => setFocusStep(2), 5000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [phase]);

  // 洗牌→翻牌
  useEffect(() => {
    if (phase === 'shuffle') { const t = setTimeout(() => setPhase('draw'), 3000); return () => clearTimeout(t); }
  }, [phase]);

  // 选中 N 张后标记完成
  useEffect(() => {
    if (phase === 'draw' && picked.length >= need && !done) {
      setTimeout(() => setDone(true), 600);
    }
  }, [picked, need, phase, done]);

  // 点击牌：先翻牌，再选中
  function clickCard(i: number) {
    if (phase !== 'draw') return;
    if (flipped.includes(i)) return;          // 已翻开不可再点
    if (picked.length >= need) return;         // 已选满
    setFlipped(prev => [...prev, i]);
    setTimeout(() => setPicked(prev => [...prev, i]), 600); // 翻牌动画结束再标记选中
  }

  function goReading() {
    const selected = picked.slice(0, need);
    const data = {
      spread: spreadId,
      cards: selected.map((poolIdx, pos) => ({
        id: pool[poolIdx].card.id,
        position: pos,
        isReversed: pool[poolIdx].isReversed,
      })),
      timestamp: Date.now(),
    };
    localStorage.setItem('tarotReading', JSON.stringify(data));
    window.location.href = '/tarot/reading';
  }

  if (!spread) return <main className="min-h-screen bg-dark flex items-center justify-center"><span className="text-accent">牌阵不存在</span></main>;

  return (
    <main className="min-h-screen bg-dark overflow-hidden relative">
      <div className="absolute top-4 left-4 z-10">
        <Link href="/tarot" className="text-sm text-cream/30 hover:text-accent tracking-wider">←</Link>
      </div>

      {/* ====== 阶段一：冥想 ====== */}
      {phase === 'focus' && (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
          <div className="text-6xl sm:text-7xl text-accent animate-breathe mb-12">✦</div>
          <div className="h-20 relative">
            <p className={`absolute inset-0 flex items-center justify-center text-lg sm:text-xl text-cream/70 tracking-widest transition-opacity duration-700 ${focusStep===0?'opacity-100':'opacity-0'}`}>闭上眼睛，深呼吸</p>
            <p className={`absolute inset-0 flex items-center justify-center text-lg sm:text-xl text-cream/70 tracking-widest transition-opacity duration-700 ${focusStep===1?'opacity-100':'opacity-0'}`}>在心中默念你想问的问题...</p>
            <p className={`absolute inset-0 flex items-center justify-center text-lg sm:text-xl text-cream/70 tracking-widest transition-opacity duration-700 ${focusStep===2?'opacity-100':'opacity-0'}`}>准备好了吗？</p>
          </div>
          {focusStep >= 2 && (
            <button onClick={() => setPhase('shuffle')} className="mt-8 rounded-full bg-accent text-dark font-bold px-10 py-3 tracking-[0.2em] text-sm animate-fadeInUp hover:bg-yellow-500 transition-colors">开始洗牌</button>
          )}
        </div>
      )}

      {/* ====== 阶段二：洗牌 ====== */}
      {phase === 'shuffle' && (
        <div className="min-h-screen flex flex-col items-center justify-center">
          <div className="relative w-64 h-80 sm:w-80 sm:h-96">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="absolute inset-0 flex items-center justify-center"
                style={{ transform: `rotate(${(i-3)*8}deg)`, animation: `shuffleScatter 0.8s ease-in-out ${i*0.1}s forwards, shuffleSwap 0.6s ease-in-out 1.2s, shuffleToPosition 0.6s ease-out 2.2s forwards`, '--sx': `${(Math.random()-0.5)*200}px`, '--sy': `${(Math.random()-0.5)*200}px`, '--sr': `${(Math.random()-0.5)*40}deg`, '--fx': '0px', '--fy': '0px' } as React.CSSProperties}>
                <div className="w-20 h-32 sm:w-28 sm:h-44 rounded-lg border-2 border-accent/50 bg-[#2C1810] flex items-center justify-center"><div className="absolute inset-1.5 border border-accent/30 rounded" /><span className="text-xl sm:text-3xl text-accent/50">✦</span></div>
              </div>
            ))}
          </div>
          <p className="mt-8 text-accent/70 tracking-widest text-sm">正在为你洗牌<span className="inline-block animate-pulse">.</span><span className="inline-block animate-pulse" style={{animationDelay:'0.3s'}}>.</span><span className="inline-block animate-pulse" style={{animationDelay:'0.6s'}}>.</span></p>
        </div>
      )}

      {/* ====== 阶段三：选牌 ====== */}
      {phase === 'draw' && (
        <div className="min-h-screen px-2 sm:px-4 py-6 sm:py-8 flex flex-col items-center">
          <div className="text-center mb-4">
            <h2 className="text-xl font-bold text-accent tracking-wider">{spread.nameZh}</h2>
            <p className="text-sm text-cream/50 mt-1">跟随直觉，选择 {need} 张牌 · 已选 {picked.length}/{need}</p>
          </div>

          {/* ===== 牌阵布局区域 ===== */}
          {picked.length > 0 && (
            <div
              className="relative w-full max-w-[600px] mb-6 rounded-xl border border-accent/20 bg-dark/50"
              style={{ aspectRatio: spreadId === 'celtic' ? '3/2' : '4/3', margin: '0 auto', padding: '8%' }}
            >
              <div className="relative w-full h-full">
              {picked.map((poolIdx, posIdx) => {
                const item = pool[poolIdx];
                if (!item) return null;
                const layout = SPREAD_LAYOUTS[spreadId]?.[posIdx];
                if (!layout) return null;
                return (
                  <div key={poolIdx} className="absolute flex flex-col items-center"
                    style={{
                      left: `${layout.left}%`, top: `${layout.top}%`,
                      transform: `translate(-50%, -50%)${layout.rotate ? ` rotate(${layout.rotate}deg)` : ''}${layout.scale ? ` scale(${layout.scale})` : ''}`,
                    }}>
                    <div className="w-12 h-18 sm:w-16 sm:h-24 rounded-sm border border-accent overflow-hidden flex flex-col items-center justify-between p-0.5 bg-[#F5F0E8]"
                      style={{ transform: item.isReversed ? 'rotate(180deg)' : 'none' }}>
                      <div className="w-full flex-1 rounded-sm flex items-center justify-center bg-[rgba(44,24,16,0.06)] relative overflow-hidden">
                        {item.card.image ? (
                          <img src={item.card.image} alt={item.card.nameZh}
                            className="w-full h-full object-contain"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        ) : (
                          <span className="text-lg text-accent/40">✦</span>
                        )}
                      </div>
                      <span className="text-[7px] sm:text-[8px] font-bold text-[#2C1810] leading-tight text-center px-0.5">{item.card.nameZh}</span>
                      <span className={`text-[6px] sm:text-[7px] px-1 rounded-full mb-0.5 ${item.isReversed?'bg-red-100 text-red-600':'bg-green-100 text-green-600'}`}>
                        {item.isReversed?'逆位':'正位'}
                      </span>
                    </div>
                    <span className="text-[9px] sm:text-xs text-accent mt-1 tracking-widest whitespace-nowrap">
                      {spread?.positions[posIdx]?.nameZh || ''}
                    </span>
                  </div>
                );
              })}
              </div>
            </div>
          )}

          {/* ===== 牌池网格 — 全部78张 ===== */}
          <div className="grid grid-cols-6 sm:grid-cols-8 lg:grid-cols-10 gap-0.5 sm:gap-1 mb-8 max-w-5xl mx-auto">
            {pool.map((item, i) => {
              const isFlipped = flipped.includes(i);
              const isPicked = picked.includes(i);
              const canClick = !isFlipped && picked.length < need;

              return (
                <div key={i} className={`flex flex-col items-center ${isPicked ? '' : canClick ? 'cursor-pointer' : 'opacity-20 pointer-events-none'}`}
                  onClick={() => canClick && clickCard(i)}>
                  <div className={`relative w-10 h-14 sm:w-12 sm:h-16 rounded-sm border overflow-hidden transition-all duration-[0.6s] ${isFlipped ? 'border-accent' : 'border-accent/30 bg-[#2C1810] hover:border-accent hover:shadow-[0_0_8px_rgba(196,153,76,0.3)]'}`}
                    style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
                    <div className="absolute inset-0 flex items-center justify-center" style={{backfaceVisibility:'hidden'}}>
                      <span className="text-xs text-accent/30">✦</span>
                    </div>
                    <div className="absolute inset-0 flex flex-col items-center justify-between p-0.5 bg-[#F5F0E8]" style={{backfaceVisibility:'hidden',transform:'rotateY(180deg)'}}>
                      <div className="w-full flex-1 rounded-sm flex items-center justify-center bg-[rgba(44,24,16,0.06)] relative overflow-hidden">
                        <CardImg src={item.card.image} alt={item.card.nameZh} rev={item.isReversed} />
                      </div>
                      <span className="text-[6px] font-bold text-[#2C1810] leading-tight text-center">{item.card.nameZh}</span>
                      <span className={`text-[5px] px-0.5 rounded-full mb-0.5 ${item.isReversed?'bg-red-100 text-red-600':'bg-green-100 text-green-600'}`}>{item.isReversed?'逆':'正'}</span>
                    </div>
                  </div>
                  {isPicked && (
                    <span className="text-[8px] text-accent mt-0.5 font-bold">
                      {spread?.positions[picked.indexOf(i)]?.nameZh || picked.indexOf(i) + 1}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {done && (
            <div className="animate-fadeInUp text-center">
              <p className="text-sm text-cream/50 mb-4">已选择 {need} 张牌</p>
              <button onClick={goReading} className="rounded-full bg-gradient-to-r from-accent to-yellow-600 px-12 py-4 text-lg font-bold text-dark tracking-[0.2em] shadow-lg transition-transform hover:scale-105">查看解读 →</button>
            </div>
          )}
        </div>
      )}
    </main>
  );
}

export default function DrawPage() {
  return <Suspense fallback={<main className="min-h-screen bg-dark flex items-center justify-center"><span className="text-2xl animate-pulse text-accent">🔮</span></main>}><DrawContent /></Suspense>;
}
