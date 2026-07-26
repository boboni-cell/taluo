'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePermission } from '@/hooks/usePermission';
import InviteCodeModal from '@/components/InviteCodeModal';

// -------------------- useInView Hook --------------------

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}

// -------------------- 数据 --------------------

const testimonials = [
  { text: '塔罗牌解读太准了，每次抽到的牌都让我深思。', author: '小红书用户 @星辰✨' },
  { text: '和朋友一起测的，结果居然完全不同，好神奇！', author: '小红书用户 @月亮与六便士' },
  { text: '界面好美，有种真的在占卜的仪式感。', author: '小红书用户 @慢慢来' },
  { text: '五牌阵的解读很详细，比很多App都好用。', author: '小红书用户 @塔罗新手' },
];

// -------------------- 子组件 --------------------

function FadeIn({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      } ${className}`}
    >
      {children}
    </div>
  );
}

// -------------------- 主页面 --------------------

export default function HomePage() {
  const router = useRouter();
  const [toastMsg, setToastMsg] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const { hasPermission } = usePermission('tarot');

  function showToast(msg: string) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2500);
  }

  function handleTarotClick() {
    if (hasPermission) {
      router.push('/tarot');
    } else {
      setShowInviteModal(true);
    }
  }

  return (
    <main className="bg-dark text-cream overflow-hidden">

      {/* ===== Toast ===== */}
      {toastMsg && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-40 bg-primary/95 border border-accent text-accent px-6 py-3 rounded-full text-sm tracking-wider animate-fadeInUp">
          {toastMsg}
        </div>
      )}

      {/* 邀请码弹窗 */}
      <InviteCodeModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onSuccess={() => router.push('/tarot')}
        requiredModule="tarot"
      />

      {/* ===== 1. Hero 区域 ===== */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 text-center">
        {/* 装饰星 */}
        <div className="mb-6 animate-[spin_8s_linear_infinite]">
          <span className="text-4xl md:text-5xl text-accent">✦</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold text-accent tracking-[0.15em]">
          人格探索站
        </h1>
        <p className="mt-4 text-base md:text-lg text-cream/60 tracking-wider">
          探索内心宇宙，遇见未知的自己
        </p>

        {/* 向下滚动箭头 */}
        <div className="absolute bottom-8 animate-bounce">
          <span className="text-2xl text-accent/40">↓</span>
        </div>
      </section>

      {/* ===== 2. 核心模块入口 ===== */}
      <FadeIn>
        <section className="py-16 md:py-24 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-center text-xl md:text-2xl text-cream/80 tracking-widest mb-10">
              选择你的探索方式
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 塔罗占卜卡片 */}
              <button onClick={handleTarotClick} className="group block w-full text-left">
                <div className="h-full rounded-2xl border-2 border-accent/40 bg-primary/60 p-6 md:p-8 transition-all duration-300 group-hover:border-accent group-hover:-translate-y-1 group-hover:shadow-[0_0_30px_rgba(196,153,76,0.2)]">
                  <span className="text-4xl">🔮</span>
                  <h3 className="mt-4 text-xl md:text-2xl font-bold text-accent tracking-wider">塔罗占卜</h3>
                  <p className="mt-3 text-sm text-cream/60 leading-relaxed">抽取属于你的塔罗牌，解读命运的指引</p>
                  <div className="mt-4 inline-block rounded-full border border-accent/30 px-3 py-1 text-xs text-accent/70">
                    事业 · 财运 · 桃花
                  </div>
                </div>
              </button>

              {/* 人格测试卡片（即将上线） */}
              <button
                onClick={() => showToast('人格测试模块即将上线，敬请期待')}
                className="group block text-left w-full opacity-70 cursor-default"
              >
                <div className="h-full rounded-2xl border-2 border-accent/20 bg-primary/40 p-6 md:p-8 relative">
                  {/* 锁标记 */}
                  <span className="absolute top-4 right-4 text-accent/40 text-lg">🔒</span>
                  <span className="absolute top-4 right-12 text-[10px] text-accent/40 border border-accent/20 rounded-full px-2 py-0.5">
                    即将上线
                  </span>
                  <span className="text-4xl grayscale">🧠</span>
                  <h3 className="mt-4 text-xl md:text-2xl font-bold text-cream/40 tracking-wider">人格测试</h3>
                  <p className="mt-3 text-sm text-cream/30 leading-relaxed">深入了解你的性格密码与行为模式</p>
                  <div className="mt-4 inline-block rounded-full border border-accent/15 px-3 py-1 text-xs text-cream/30">
                    MBTI · 依恋类型 · 情感模式
                  </div>
                </div>
              </button>
            </div>
          </div>
        </section>
      </FadeIn>

      {/* ===== 3. 热门推荐区 ===== */}
      <FadeIn>
        <section className="py-16 md:py-24 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-center text-xl md:text-2xl text-cream/80 tracking-widest mb-10">
              热门体验
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* 三牌阵 */}
              <Link href="/tarot?spread=3" className="group">
                <div className="rounded-xl bg-primary/40 border border-accent/20 p-5 text-center transition-all duration-300 group-hover:border-accent/60 group-hover:bg-primary/60">
                  <span className="text-2xl">🌟</span>
                  <h4 className="mt-2 text-accent font-semibold tracking-wider">三牌阵占卜</h4>
                  <p className="mt-1 text-xs text-cream/50">过去·现在·未来</p>
                </div>
              </Link>

              {/* 单牌 */}
              <Link href="/tarot?spread=1" className="group">
                <div className="rounded-xl bg-primary/40 border border-accent/20 p-5 text-center transition-all duration-300 group-hover:border-accent/60 group-hover:bg-primary/60">
                  <span className="text-2xl">🃏</span>
                  <h4 className="mt-2 text-accent font-semibold tracking-wider">单牌快速占卜</h4>
                  <p className="mt-1 text-xs text-cream/50">一张牌直指核心</p>
                </div>
              </Link>

              {/* 隐藏人格测试 */}
              <button onClick={() => showToast('隐藏人格测试即将上线')} className="group cursor-default">
                <div className="rounded-xl bg-primary/20 border border-accent/10 p-5 text-center opacity-60">
                  <span className="text-2xl grayscale">🧩</span>
                  <h4 className="mt-2 text-cream/40 font-semibold tracking-wider">隐藏人格测试</h4>
                  <p className="mt-1 text-xs text-cream/30">免费趣味测试 · 即将上线</p>
                </div>
              </button>
            </div>
          </div>
        </section>
      </FadeIn>

      {/* ===== 4. 用户评价区 ===== */}
      <FadeIn>
        <section className="py-16 md:py-24 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-center text-xl md:text-2xl text-cream/80 tracking-widest mb-10">
              他们说
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {testimonials.map((t, i) => (
                <div
                  key={i}
                  className="rounded-xl bg-primary/20 border border-accent/10 p-5 relative"
                >
                  {/* 引号装饰 */}
                  <span className="absolute -top-2 -left-1 text-3xl text-accent/15 select-none">&ldquo;</span>
                  <p className="text-sm text-cream/70 leading-relaxed pt-2">{t.text}</p>
                  <p className="mt-3 text-xs text-cream/40">— {t.author}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </FadeIn>

      {/* ===== 5. 底部引导区 ===== */}
      <FadeIn>
        <section className="py-16 md:py-20 px-4">
          <div className="max-w-3xl mx-auto text-center">
            {/* 金色分割线 */}
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-accent to-transparent mx-auto mb-8" />

            <p className="text-sm text-cream/50 tracking-wider">
              关注小红书获取邀请码，解锁更多功能
            </p>
            <p className="mt-2 text-accent/60 text-sm tracking-widest">
              @你的小红书账号
            </p>

            <p className="mt-12 text-xs text-cream/20">
              &copy; 2025 人格探索站 · 仅供娱乐参考
            </p>
          </div>
        </section>
      </FadeIn>

    </main>
  );
}
