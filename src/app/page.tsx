'use client';
import DownloadForm from '@/components/DownloadForm';
import ProgressTracker from '@/components/ProgressTracker';
import AIChat from '@/components/AIChat';
import { useLanguage } from '@/components/LanguageContext';

export default function Home() {
  const { t, language, setLanguage } = useLanguage();

  return (
    <main className="container">
      <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
        <button 
          onClick={() => setLanguage(language === 'en' ? 'vi' : 'en')}
          style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
        >
          {language === 'en' ? '🇻🇳 Tiếng Việt' : '🇬🇧 English'}
        </button>
      </div>
      
      <div className="header">
        <h1>{t('title')}</h1>
        <p>{t('subtitle')}</p>
      </div>
      
      <div className="main-grid">
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <DownloadForm />
          <ProgressTracker />
        </div>
        
        <div>
          <AIChat />
        </div>
      </div>
    </main>
  );
}
