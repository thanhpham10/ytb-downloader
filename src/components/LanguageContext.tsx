'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'vi';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  showPopup: boolean;
  setShowPopup: (show: boolean) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    title: 'YouTube Batch Downloader',
    subtitle: 'Premium downloads with AI assistance',
    startDownload: 'Start Download',
    placeholder: 'Paste YouTube URLs here (one per line for batch download)',
    mp4: 'MP4 (Video + Audio)',
    mp3: 'MP3 (Audio Only)',
    processing: 'Processing...',
    downloadBtn: 'Download',
    queueTitle: 'Download Queue',
    noDownloads: 'No downloads yet.',
    format: 'Format',
    saveBtn: '⬇️ Save to Device',
    aiTitle: 'AI Assistant',
    aiSubtitle: 'Powered by Cerebras gpt-oss-120b',
    aiTyping: 'Typing...',
    aiPlaceholder: 'Ask me anything about your data...',
    aiSend: 'Send',
    selectLanguage: 'Select Language',
    welcome: 'Welcome to YouTube Downloader'
  },
  vi: {
    title: 'Tải Video YouTube Hàng Loạt',
    subtitle: 'Trải nghiệm tải cao cấp cùng trợ lý AI',
    startDownload: 'Bắt Đầu Tải',
    placeholder: 'Dán link YouTube vào đây (mỗi link 1 dòng để tải nhiều video)',
    mp4: 'MP4 (Video + Âm thanh)',
    mp3: 'MP3 (Chỉ Âm thanh)',
    processing: 'Đang xử lý...',
    downloadBtn: 'Tải Xuống',
    queueTitle: 'Danh Sách Đang Tải',
    noDownloads: 'Chưa có video nào.',
    format: 'Định dạng',
    saveBtn: '⬇️ Lưu vào máy',
    aiTitle: 'Trợ Lý AI',
    aiSubtitle: 'Sử dụng Cerebras gpt-oss-120b',
    aiTyping: 'Đang gõ...',
    aiPlaceholder: 'Hỏi tôi bất cứ điều gì về dữ liệu tải...',
    aiSend: 'Gửi',
    selectLanguage: 'Chọn Ngôn Ngữ',
    welcome: 'Chào mừng đến với Trình Tải YouTube'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('vi');
  const [showPopup, setShowPopup] = useState(true);

  const t = (key: string) => {
    // @ts-ignore
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, showPopup, setShowPopup, t }}>
      {children}
      
      {showPopup && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div className="glass" style={{ padding: '3rem', textAlign: 'center', maxWidth: '400px' }}>
            <h2 style={{ marginBottom: '1rem', background: 'linear-gradient(to right, #6366f1, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{t('welcome')}</h2>
            <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}>{t('selectLanguage')} / Select Language</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button onClick={() => { setLanguage('vi'); setShowPopup(false); }}>Tiếng Việt</button>
              <button onClick={() => { setLanguage('en'); setShowPopup(false); }} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid var(--card-border)' }}>English</button>
            </div>
          </div>
        </div>
      )}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}
