'use client';
import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/components/LanguageContext';

export default function AIChat() {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<{role: 'user' | 'ai', content: string}[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize first message on client-side to avoid hydration mismatch if language isn't matched initially
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{ role: 'ai', content: t('welcome') }]);
    }
  }, [t, messages.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });
      const data = await res.json();
      
      if (data.reply) {
        setMessages(prev => [...prev, { role: 'ai', content: data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: 'ai', content: 'Sorry, I encountered an error.' }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', content: 'Connection error.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass chat-widget" style={{ height: '100%' }}>
      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--card-border)' }}>
        <h2 style={{ fontWeight: 600 }}>{t('aiTitle')}</h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{t('aiSubtitle')}</p>
      </div>
      
      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.role}`}>
            {msg.content}
          </div>
        ))}
        {loading && (
          <div className="message ai" style={{ opacity: 0.7 }}>
            {t('aiTyping')}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('aiPlaceholder')}
          style={{ flex: 1 }}
          disabled={loading}
        />
        <button type="submit" disabled={loading || !input.trim()}>
          {t('aiSend')}
        </button>
      </form>
    </div>
  );
}
