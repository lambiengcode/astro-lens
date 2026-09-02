'use client';

import { useState, useRef, useEffect } from 'react';
import type { ChartData } from '@/types';

interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
}

interface ChatPanelProps {
  chart: ChartData;
  name?: string;
  isOpen: boolean;
}

const SUGGESTIONS = [
  'Tình duyên năm nay thế nào?',
  'Tôi nên làm nghề gì phù hợp?',
  'Sức khỏe cần lưu ý điều gì?',
  'Tài chính giai đoạn này ra sao?',
  'Phân tích mệnh cung chi tiết hơn',
  'Đại hạn hiện tại ảnh hưởng thế nào?',
];

function renderMarkdownInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br/>');
}

export default function ChatPanel({ chart, name, isOpen }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = { role: 'user', content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    if (inputRef.current) inputRef.current.style.height = '40px';
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          chart,
          name,
          history: messages.slice(-6),
        }),
      });

      const data = await res.json();

      if (data.success) {
        setMessages((prev) => [...prev, { role: 'ai', content: data.reply }]);
      } else {
        setMessages((prev) => [...prev, { role: 'ai', content: `Xin lỗi, có lỗi xảy ra: ${data.error}` }]);
      }
    } catch {
      setMessages((prev) => [...prev, { role: 'ai', content: 'Không thể kết nối. Vui lòng thử lại.' }]);
    }

    setLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  if (!isOpen) return null;

  return (
    <div className="w-full h-[620px] lg:h-[calc(100vh-7rem)] lg:max-h-[760px] lg:sticky lg:top-24 flex flex-col animate-slide-up-fade">
      <div className="glass-strong flex-1 flex flex-col rounded-none sm:rounded-3xl overflow-hidden">
        {/* Header */}
        <div className="glass-1 flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#3b5bdb] to-[#9775cd] flex items-center justify-center">
              <span className="text-white text-sm">✦</span>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#e2e8f0]">Hỏi Chuyên Gia Tử Vi</h3>
              <p className="text-[10px] text-[#5fe0a8] flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#5fe0a8] animate-pulse" /> Trực tuyến · AI phân tích lá số</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {/* Welcome */}
          {messages.length === 0 && (
            <div className="animate-fade-in">
              <div className="chat-bubble-ai rounded-2xl rounded-tl-md px-4 py-3 mb-4">
                <p className="text-sm text-[#c9d1d9] leading-relaxed">
                  Xin chào! Tôi là chuyên gia Tử Vi AI. Bạn có thể hỏi tôi bất kỳ điều gì về lá số
                  {name ? ` của ${name}` : ''} — tình duyên, sự nghiệp, sức khỏe, tài chính...
                </p>
              </div>

              {/* Suggestion chips */}
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(s)}
                    className="chip-glass press-spring px-3 py-1.5 text-xs text-[#7c8ba5] hover:text-[#5b8af5]"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message bubbles */}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up-fade`}
            >
              <div className={`
                max-w-[85%] rounded-2xl px-4 py-3
                ${msg.role === 'user'
                  ? 'chat-bubble-user rounded-br-md'
                  : 'chat-bubble-ai rounded-bl-md'
                }
              `}>
                {msg.role === 'ai' ? (
                  <div
                    className="text-sm text-[#c9d1d9] leading-relaxed [&_strong]:text-[#e8b339] [&_em]:text-[#9775cd]"
                    dangerouslySetInnerHTML={{ __html: renderMarkdownInline(msg.content) }}
                  />
                ) : (
                  <p className="text-sm text-[#e2e8f0]">{msg.content}</p>
                )}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="flex justify-start animate-fade-in">
              <div className="chat-bubble-ai rounded-2xl rounded-bl-md px-4 py-3">
                <div className="typing-indicator flex gap-1.5">
                  <span /><span /><span />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="glass-1 px-4 py-3">
          <div className="flex gap-2 items-end">
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                // Auto-grow up to 3 lines
                e.target.style.height = 'auto';
                const lineHeight = 20;
                const maxHeight = lineHeight * 3 + 20; // 3 lines + padding
                e.target.style.height = Math.min(e.target.scrollHeight, maxHeight) + 'px';
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e as unknown as React.FormEvent);
                }
              }}
              placeholder="Hỏi về lá số của bạn... (Shift+Enter để xuống dòng)"
              disabled={loading}
              className="glass-1 flex-1 px-4 py-2.5 rounded-2xl text-sm text-[#e2e8f0] placeholder:text-[#3d4a5c] focus:outline-none focus:border-[#3b5bdb]/50 focus:ring-1 focus:ring-[#3b5bdb]/20 transition-all disabled:opacity-50 resize-none overflow-y-auto leading-5"
              style={{ minHeight: '40px', maxHeight: '80px' }}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="press-spring pill px-5 py-2.5 bg-gradient-to-r from-[#3b5bdb] to-[#5b8af5] text-white text-sm font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              Gửi
            </button>
          </div>
          <p className="text-[10px] text-[#3d4a5c] mt-1.5 pl-1">Enter gửi · Shift+Enter xuống dòng</p>
        </form>
      </div>
    </div>
  );
}
