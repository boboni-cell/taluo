'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCardImageUrl } from '@/data/tarot-images';

const readings = [
  { id: 'single', index: '01', title: '一张牌', subtitle: '当下指引', copy: '把复杂的问题收束成一个清晰的提醒。' },
  { id: 'three', index: '02', title: '三张牌', subtitle: '过去 · 现在 · 未来', copy: '沿着时间线，看清事情如何来到此刻。' },
  { id: 'five', index: '03', title: '五张牌', subtitle: '深入洞察', copy: '从现状、阻力到行动建议，完整梳理局面。' },
];

const principles = [
  ['01', '不是预言', '牌不会替你决定未来，它只把你忽略的感受带到眼前。'],
  ['02', '忠于此刻', '同一个问题在不同阶段，会照见完全不同的答案。'],
  ['03', '行动优先', '每次解读都落到一条你真正可以开始的行动。'],
];

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="min-h-screen overflow-hidden bg-dark text-cream">
      <header className="site-header">
        <Link href="/" className="brand-mark" aria-label="星见首页">
          <span className="brand-mark__cn">星见</span>
          <span className="brand-mark__en">XINGJIAN</span>
        </Link>
        <nav className="hidden items-center gap-9 md:flex" aria-label="主页导航">
          <a href="#readings" className="nav-link">选择牌阵</a>
          <a href="#philosophy" className="nav-link">关于塔罗</a>
          <button onClick={() => router.push('/tarot')} className="nav-cta">开始占卜</button>
        </nav>
        <button onClick={() => router.push('/tarot')} className="nav-cta md:hidden">开始</button>
      </header>

      <section className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow">A QUIET MIRROR FOR YOUR INNER WORLD</p>
          <h1 className="display-title mt-7">
            答案不在牌里，
            <span>在你心里。</span>
          </h1>
          <p className="hero-intro">
            让塔罗成为一面镜子，照见此刻真正重要的事。
            不替你预言，只陪你看清。
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-5">
            <button onClick={() => router.push('/tarot')} className="button-primary">开始一次占卜</button>
            <a href="#readings" className="text-link">了解牌阵 <span aria-hidden="true">—</span></a>
          </div>
          <div className="hero-note">
            <span>78</span>
            <p>张经典韦特塔罗<br />一场只属于你的对话</p>
          </div>
        </div>

        <div className="hero-art" aria-label="三张经典塔罗牌：女祭司、星星和月亮">
          <p className="hero-art__caption">THE CARDS REFLECT<br />WHAT YOU ALREADY KNOW</p>
          {[2, 17, 18].map((id, index) => (
            <div key={id} className={`hero-card hero-card--${index + 1}`}>
              <img src={getCardImageUrl(id) || ''} alt={['女祭司', '星星', '月亮'][index]} />
            </div>
          ))}
          <span className="hero-art__edition">VOL. 01 / 2026</span>
        </div>
      </section>

      <section id="readings" className="content-section border-t border-line">
        <div className="section-heading">
          <div>
            <p className="eyebrow">CHOOSE YOUR READING</p>
            <h2>选择你的方式</h2>
          </div>
          <p>无需懂牌。只要带着一个真实的问题，<br className="hidden sm:block" />剩下的交给直觉。</p>
        </div>

        <div className="reading-list">
          {readings.map((reading) => (
            <button
              key={reading.id}
              onClick={() => router.push(`/tarot?spread=${reading.id}`)}
              className="reading-row group"
            >
              <span className="reading-row__index">{reading.index}</span>
              <span className="reading-row__title">{reading.title}</span>
              <span className="reading-row__subtitle">{reading.subtitle}</span>
              <span className="reading-row__copy">{reading.copy}</span>
              <span className="reading-row__action">选择</span>
            </button>
          ))}
        </div>
      </section>

      <section id="philosophy" className="content-section border-t border-line">
        <div className="philosophy-grid">
          <div className="philosophy-intro">
            <p className="eyebrow">OUR PHILOSOPHY</p>
            <h2>看见，<br />然后选择。</h2>
            <p>塔罗最有价值的时刻，不是它说中了什么，而是你终于听见了自己。</p>
          </div>
          <div className="principle-list">
            {principles.map(([index, title, copy]) => (
              <div key={index} className="principle-row">
                <span>{index}</span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="quote-section">
        <p className="eyebrow">A NOTE FROM A READER</p>
        <blockquote>“它没有告诉我一个标准答案，<br />却让我第一次把问题问对了。”</blockquote>
        <cite>— 星见使用者，首尔</cite>
      </section>

      <footer className="site-footer">
        <Link href="/" className="brand-mark">
          <span className="brand-mark__cn">星见</span>
          <span className="brand-mark__en">XINGJIAN</span>
        </Link>
        <p>关注小红书获取邀请码 · @你的小红书账号</p>
        <p>© 2026 星见 · 仅供自我探索与娱乐参考</p>
      </footer>
    </main>
  );
}
