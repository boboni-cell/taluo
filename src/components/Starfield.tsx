'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

/**
 * 全局星空背景：
 * - canvas 绘制的星星粒子（大小/明暗不一，部分闪烁，整体缓慢漂浮）
 * - CSS 径向渐变的星云/星雾色块（见 globals.css .nebula-*）
 * - 手机端星星数量减半；/admin 后台页面不渲染
 */

interface Star {
  x: number;
  y: number;
  r: number;          // 半径
  baseAlpha: number;  // 基础亮度
  twinkleAmp: number; // 闪烁幅度（0 = 不闪烁）
  twinkleSpeed: number;
  twinklePhase: number;
  vx: number;         // 漂浮速度
  vy: number;
  color: string;      // 星星颜色（暖白 / 星光蓝 / 淡金）
}

const STAR_COLORS = [
  '232, 224, 208',  // 暖白（绝大多数）
  '232, 224, 208',
  '232, 224, 208',
  '232, 224, 208',
  '160, 180, 220',  // 淡星光蓝（少量）
];

export default function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin') ?? false;

  useEffect(() => {
    if (isAdmin) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let w = 0;
    let h = 0;
    let stars: Star[] = [];
    let raf = 0;
    let t = Math.random() * 100;

    function buildStars() {
      // 按屏幕面积换算密度，手机端减半
      const base = isMobile ? 60 : 140;
      const count = Math.round((base * (w * h)) / (1440 * 900));
      const n = Math.max(isMobile ? 30 : 70, Math.min(count, isMobile ? 80 : 200));

      stars = Array.from({ length: n }, () => {
        const big = Math.random() < 0.08;
        const twinkles = Math.random() < 0.35;
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          r: big ? 1.1 + Math.random() * 1.0 : 0.3 + Math.random() * 0.8,
          baseAlpha: 0.15 + Math.random() * 0.4,
          twinkleAmp: twinkles ? 0.2 + Math.random() * 0.25 : 0.04,
          twinkleSpeed: 0.3 + Math.random() * 0.9,
          twinklePhase: Math.random() * Math.PI * 2,
          vx: (Math.random() - 0.5) * 0.02,
          vy: (Math.random() - 0.5) * 0.015,
          color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
        };
      });
    }

    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      canvas!.style.width = `${w}px`;
      canvas!.style.height = `${h}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildStars();
    }

    function frame() {
      t += 0.016;
      ctx!.clearRect(0, 0, w, h);

      for (const s of stars) {
        // 缓慢漂浮，出界后从另一侧回来
        s.x += s.vx;
        s.y += s.vy;
        if (s.x < -4) s.x = w + 4;
        else if (s.x > w + 4) s.x = -4;
        if (s.y < -4) s.y = h + 4;
        else if (s.y > h + 4) s.y = -4;

        const alpha = Math.max(0.05, Math.min(1,
          s.baseAlpha + Math.sin(t * s.twinkleSpeed + s.twinklePhase) * s.twinkleAmp
        ));

        // 大星星带一圈微弱光晕
        if (s.r > 1.4) {
          ctx!.beginPath();
          ctx!.arc(s.x, s.y, s.r * 3.2, 0, Math.PI * 2);
          ctx!.fillStyle = `rgba(${s.color}, ${alpha * 0.12})`;
          ctx!.fill();
        }

        ctx!.beginPath();
        ctx!.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${s.color}, ${alpha})`;
        ctx!.fill();
      }

      raf = requestAnimationFrame(frame);
    }

    resize();
    window.addEventListener('resize', resize);
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [isAdmin]);

  if (isAdmin) return null;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* 星云/星雾 */}
      <div className="nebula nebula-1" />
      <div className="nebula nebula-2" />
      <div className="nebula nebula-3" />
      {/* 星星粒子 */}
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
