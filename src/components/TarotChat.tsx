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

const WELCOME_MSG = '我是星见。刚刚看完你的牌面，如果还有没说透的地方，可以继续问我。感情、事业，或任何正在困扰你的事都可以。';

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
    <section className="mt-16 border-t border-line pt-12 animate-fadeInUp">
      <p className="page-kicker">CONTINUE THE CONVERSATION</p>
      <div className="mt-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <h2 className="font-serif-cn text-3xl font-normal">继续问星见</h2>
        <p className="text-xs text-muted">针对这次牌面，你还可以问 {MAX_ROUNDS - userMsgCount} 个问题</p>
      </div>

      <div className="mt-8 overflow-hidden border border-line bg-[#100e0b]">
        <div className="chat-scroll max-h-[520px] space-y-5 overflow-x-hidden overflow-y-auto p-5 sm:p-7">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <span className="mr-3 mt-3 text-[9px] tracking-[.14em] text-accent">星见</span>
              )}
              <div
                className={`max-w-[85%] break-words px-4 py-3 text-sm leading-7 sm:max-w-[75%] ${
                  msg.role === 'user'
                    ? 'border border-[#5d4332] bg-[#1b1510] text-[#ddd5ca]'
                    : 'border-l border-[#5d4332] bg-[#15120e] text-[#bfb7ac]'
                }`}
              >
                {cleanMessage(msg.content)}
              </div>
            </div>
          ))}

          {/* 流式输出 */}
          {streaming && (
            <div className="flex justify-start">
              <span className="mr-3 mt-3 text-[9px] tracking-[.14em] text-accent">星见</span>
              <div className="max-w-[85%] break-words overflow-x-hidden border-l border-[#5d4332] bg-[#15120e] px-4 py-3 text-sm leading-7 text-[#bfb7ac] sm:max-w-[75%]">
                {streaming.replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1')}
                <span className="ml-1 inline-block h-3 w-px animate-pulse bg-accent align-middle" />
              </div>
            </div>
          )}

          {/* loading */}
          {loading && !streaming && (
            <div className="flex justify-start">
              <span className="mr-3 mt-3 text-[9px] tracking-[.14em] text-accent">星见</span>
              <div className="border-l border-[#5d4332] bg-[#15120e] px-4 py-3 text-sm text-muted animate-pulse">正在整理回答</div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* 快捷问题（首次对话） */}
        {userMsgCount === 0 && !loading && (
          <div className="border-t border-line px-5 py-4 sm:px-7">
            <div className="flex flex-wrap gap-2">
              {QUICK_QUESTIONS.map(q => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="border border-[#40372f] px-3 py-2 text-[11px] text-muted transition-colors hover:border-accent hover:text-cream"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 输入区 */}
        <div className="border-t border-line p-4 sm:p-5">
          {reachedLimit ? (
            <p className="py-2 text-center text-sm text-muted">
              本次对话已结束，再抽一次开启新的对话。
            </p>
          ) : (
            <>
              {userMsgCount >= MAX_ROUNDS - 2 && userMsgCount < MAX_ROUNDS && (
                <p className="mb-3 text-center text-[10px] tracking-wider text-muted">
                  还可以问 {MAX_ROUNDS - userMsgCount} 个问题
                </p>
              )}
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="问问星见..."
                  disabled={loading}
                  className="min-h-12 flex-1 border border-[#40372f] bg-[#0b0a08] px-4 text-sm text-cream outline-none transition-colors placeholder:text-[#5d554d] focus:border-accent disabled:opacity-50"
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={loading || !input.trim()}
                  className="button-primary min-w-24 disabled:cursor-not-allowed"
                >
                  发送
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
