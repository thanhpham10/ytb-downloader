'use client';
import { useState } from 'react';
import { useLanguage } from '@/components/LanguageContext';

export default function DownloadForm() {
  const [url, setUrl] = useState('');
  const [format, setFormat] = useState('mp4');
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    try {
      const urls = url.split('\n').filter(u => u.trim() !== '');
      
      for (const singleUrl of urls) {
        await fetch('/api/download', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: singleUrl.trim(), format }),
        });
      }
      setUrl('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass" style={{ padding: '2rem', marginBottom: '2rem' }}>
      <h2 style={{ marginBottom: '1.5rem', fontWeight: 600 }}>{t('startDownload')}</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <textarea 
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={t('placeholder')}
            style={{ 
              width: '100%', 
              padding: '1rem', 
              borderRadius: '12px',
              background: 'rgba(0,0,0,0.2)',
              border: '1px solid var(--card-border)',
              color: 'white',
              fontFamily: 'inherit',
              minHeight: '120px',
              resize: 'vertical'
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <select value={format} onChange={(e) => setFormat(e.target.value)} style={{ flex: 1 }}>
            <option value="mp4">{t('mp4')}</option>
            <option value="mp3">{t('mp3')}</option>
          </select>
          <button type="submit" disabled={loading || !url} style={{ flex: 1 }}>
            {loading ? t('processing') : t('downloadBtn')}
          </button>
        </div>
      </form>
    </div>
  );
}
