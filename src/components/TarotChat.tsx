'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface CardInfo {
  name: string;
  position: string;
  isReversed: boolean;
  keywords: string;
  meaning: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Props {
  spreadName: string;
  cards: CardInfo[];
}

const MAX_ROUNDS = 10;

const QUICK_QUESTIONS = [
  '我的事业接下来会怎样？',
  '我的感情有什么需要注意的？',
  '最近压力很大，牌面怎么看？',
  '给我一个近期的行动建议',
];

const WELCOME_MSG = '你好呀 ✨ 我是星见，刚刚看了你的牌面。有什么想问的吗？可以问我关于感情、事业、或者任何困惑的事情~';

/** 清理 AI 返回文本：移除 Markdown 格式，分段渲染 */
function cleanMessage(text: string): React.ReactNode[] {
  if (!text) return [text];
  // 移除 Markdown 加粗、斜体
  const cleaned = text.replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1');
  // 按双换行分段
  return cleaned.split('\n\n').map((para, i) => (
    <p key={i} className={i > 0 ? 'mt-2' : ''}>
      {para.split('\n').map((line, j) => (
        <span key={j}>{j > 0 && <br />}{line}</span>
      ))}
    </p>
  ));
}

export default function TarotChat({ spreadName, cards }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: WELCOME_MSG },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasInteracted = useRef(false);

  const userMsgCount = messages.filter(m => m.role === 'user').length;
  const reachedLimit = userMsgCount >= MAX_ROUNDS;

  // 只在用户有过交互后才自动滚动到底部
  useEffect(() => {
    if (hasInteracted.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, streaming]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || loading || reachedLimit) return;

      const userMsg: Message = { role: 'user', content: text.trim() };
      const updatedMessages = [...messages, userMsg];
      setMessages(updatedMessages);
      setInput('');
      setLoading(true);
      setStreaming('');
      hasInteracted.current = true;

      try {
        const context = {
          spreadName,
          cards: cards.map(c => ({
            name: c.name,
            position: c.position,
            isReversed: c.isReversed,
            keywords: c.keywords,
            meaning: c.meaning,
          })),
        };

        const res = await fetch('/api/tarot-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: updatedMessages.map(m => ({
              role: m.role,
              content: m.content,
            })),
            context,
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          setMessages(prev => [...prev, { role: 'assistant', content: err.error || '抱歉，我现在无法回应，请稍后再试。' }]);
          return;
        }

        // 流式读取
        const reader = res.body?.getReader();
        if (!reader) {
          setMessages(prev => [...prev, { role: 'assistant', content: '抱歉，响应格式异常。' }]);
          return;
        }

        const decoder = new TextDecoder();
        let fullContent = '';
        let pending = '';

        const processLine = (line: string) => {
          if (!line.startsWith('data:')) return;

          const data = line.slice(5).trim();
          if (!data || data === '[DONE]') return;

          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content || '';
            fullContent += delta;
            setStreaming(fullContent);
          } catch { /* ignore malformed complete lines */ }
        };

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          pending += decoder.decode(value, { stream: true });
          const lines = pending.split('\n');
          pending = lines.pop() || '';
          lines.forEach(processLine);
        }

        pending += decoder.decode();
        if (pending) processLine(pending);

        setMessages(prev => [...prev, { role: 'assistant', content: fullContent }]);
      } catch {
        setMessages(prev => [...prev, { role: 'assistant', content: '网络错误，请稍后再试。' }]);
      } finally {
        setLoading(false);
        setStreaming('');
      }
    },
    [messages, loading, reachedLimit, spreadName, cards]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="mt-12 animate-fadeInUp">
      <div className="mb-8 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />

      {/* 标题 */}
      <h2 className="text-lg sm:text-xl font-bold text-accent mb-1 tracking-[0.15em]">✦ 星见 · AI 塔罗师</h2>
      <p className="text-sm text-cream/50 mb-4">针对你的牌面，问我任何问题</p>

      {/* 对话区 */}
      <div className="bg-[#1A0F0A]/60 border border-accent/10 rounded-xl overflow-hidden">
        <div className="max-h-[500px] overflow-y-auto overflow-x-hidden p-4 sm:p-5 space-y-4 chat-scroll">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center flex-shrink-0 mr-2 mt-1">
                  <span className="text-accent text-xs">✦</span>
                </div>
              )}
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-xl px-4 py-3 text-sm leading-relaxed break-words overflow-wrap-anywhere ${
                  msg.role === 'user'
                    ? 'bg-accent/15 text-cream/80 border border-accent/20'
                    : 'bg-[#2C1810] text-cream/75 border-l-2 border-accent/40'
                }`}
              >
                {cleanMessage(msg.content)}
              </div>
            </div>
          ))}

          {/* 流式输出 */}
          {streaming && (
            <div className="flex justify-start">
              <div className="w-7 h-7 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center flex-shrink-0 mr-2 mt-1">
                <span className="text-accent text-xs">✦</span>
              </div>
              <div className="max-w-[85%] sm:max-w-[75%] rounded-xl px-4 py-3 text-sm leading-relaxed bg-[#2C1810] text-cream/75 border-l-2 border-accent/40 whitespace-pre-wrap break-words overflow-x-hidden">
                {streaming.replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1')}
                <span className="inline-block w-0.5 h-4 bg-accent ml-0.5 animate-pulse align-middle" />
              </div>
            </div>
          )}

          {/* loading */}
          {loading && !streaming && (
            <div className="flex justify-start">
              <div className="w-7 h-7 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center flex-shrink-0 mr-2 mt-1">
                <span className="text-accent text-xs">✦</span>
              </div>
              <div className="rounded-xl px-4 py-3 bg-[#2C1810] border-l-2 border-accent/40">
                <span className="text-accent/50 text-sm">星见正在解读</span>
                <span className="inline-block animate-pulse text-accent/50">.</span>
                <span className="inline-block animate-pulse text-accent/50" style={{ animationDelay: '0.3s' }}>.</span>
                <span className="inline-block animate-pulse text-accent/50" style={{ animationDelay: '0.6s' }}>.</span>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* 快捷问题（首次对话） */}
        {userMsgCount === 0 && !loading && (
          <div className="px-4 sm:px-5 pb-3">
            <div className="flex flex-wrap gap-2">
              {QUICK_QUESTIONS.map(q => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-xs text-accent/70 border border-accent/30 rounded-full px-3 py-1.5 hover:bg-accent/10 hover:text-accent transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 输入区 */}
        <div className="border-t border-accent/10 p-3 sm:p-4">
          {reachedLimit ? (
            <p className="text-center text-sm text-cream/40 py-2">
              本次解读的对话已结束，再抽一次开启新的对话~
            </p>
          ) : (
            <>
              {userMsgCount >= MAX_ROUNDS - 2 && userMsgCount < MAX_ROUNDS && (
                <p className="text-center text-xs text-accent/50 mb-2">
                  还可以问 {MAX_ROUNDS - userMsgCount} 个问题哦
                </p>
              )}
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="问问星见..."
                  disabled={loading}
                  className="flex-1 bg-[#2C1810] text-cream rounded-xl border border-accent/30 px-4 py-2.5 text-sm outline-none focus:border-accent transition-colors disabled:opacity-50 placeholder:text-cream/20"
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={loading || !input.trim()}
                  className="rounded-xl bg-gradient-to-r from-accent to-yellow-600 text-dark font-bold px-5 py-2.5 text-sm tracking-wider disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                >
                  发送
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
