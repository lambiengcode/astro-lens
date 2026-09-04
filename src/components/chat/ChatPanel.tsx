'use client';

import { useState, useRef, useEffect } from 'react';
import type { ChartData } from '@/types';
import { useI18n } from '@/lib/i18n/context';

interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
  /** Cung + sao behind the answer — D1. The route peels it off the reply's
   *  trailing `>` line; absent when the model did not cite. */
  cite?: string;
}

interface ChatPanelProps {
  chart: ChartData;
  name?: string;
  /** `inline` sits in the vận hạn column; `floating` is the FAB panel. */
  variant?: 'inline' | 'floating';
  onClose?: () => void;
}


function renderMarkdownInline(text: string): string {
  return text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br/>');
}

export default function ChatPanel({ chart, name, variant = 'floating', onClose }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { locale, t } = useI18n();

  useEffect(() => {
    if (variant === 'floating') inputRef.current?.focus();
  }, [variant]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    setMessages((prev) => [...prev, { role: 'user', content: text.trim() }]);
    setInput('');
    if (inputRef.current) inputRef.current.style.height = '40px';
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text.trim(), chart, name, history: messages.slice(-6), locale }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, {
        role: 'ai',
        content: data.success ? data.reply : `${t.chat.errPrefix} ${data.error}`,
        cite: data.success ? data.cite : undefined,
      }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'ai', content: t.chat.errNetwork }]);
    }
    setLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const panel = (
    <div className="chat" style={variant === 'floating' ? { maxWidth: '100%', height: '100%' } : undefined}>
      <div className="chat-h">
        <span className="mk" aria-hidden="true">✦</span>
        <span>
          <span className="t">{t.chat.title}</span><br />
          <span className="s">{t.chat.subPre} {chart.palaces.length} {t.chat.subPost}</span>
        </span>
        {onClose && (
          <button type="button" className="x" onClick={onClose} aria-label={t.chat.close}>✕</button>
        )}
      </div>

      <div className="chat-b">
        {messages.length === 0 && (
          <div className="msg a">
            {t.chat.emptyPre}{name ? ` ${t.chat.emptyOf} ${name}` : ''} {t.chat.emptyPost}
          </div>
        )}

        {messages.map((m, i) => (
          m.role === 'user' ? (
            <div className="msg u" key={i}>{m.content}</div>
          ) : (
            <div className="msg a" key={i}>
              <span dangerouslySetInnerHTML={{ __html: renderMarkdownInline(m.content) }} />
              {m.cite && <span className="cite">↳ {m.cite}</span>}
            </div>
          )
        ))}

        {loading && (
          <div className="typing" aria-label={t.chat.typing}>
            <i /><i /><i />
          </div>
        )}
        <div ref={endRef} />
      </div>

      {messages.length === 0 && (
        <div className="sugg">
          {t.chat.suggestions.map((q) => (
            <button type="button" key={q} onClick={() => sendMessage(q)}>{q}</button>
          ))}
        </div>
      )}

      <form className="chat-f" onSubmit={handleSubmit}>
        <textarea
          ref={inputRef}
          rows={1}
          className="inp"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            e.target.style.height = 'auto';
            e.target.style.height = `${Math.min(e.target.scrollHeight, 80)}px`;
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e as unknown as React.FormEvent);
            }
          }}
          placeholder={t.chat.placeholder}
          disabled={loading}
          style={{ minHeight: 40, maxHeight: 80 }}
          aria-label={t.chat.inputAria}
        />
        <button type="submit" className="btn pri" disabled={loading || !input.trim()} aria-label={t.chat.sendAria}>↑</button>
      </form>
      <div className="chat-note">{t.chat.note}</div>
    </div>
  );

  if (variant === 'inline') return panel;

  return (
    <div
      className="fixed z-50 flex flex-col"
      style={{ bottom: 0, right: 0, width: 'min(100%, 440px)', height: 'min(100dvh, 620px)', padding: 16 }}
    >
      {panel}
    </div>
  );
}
