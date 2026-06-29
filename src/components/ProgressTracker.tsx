'use client';
import { useEffect, useState } from 'react';
import type { DownloadTask } from '@/lib/db';
import { useLanguage } from '@/components/LanguageContext';

export default function ProgressTracker() {
  const [tasks, setTasks] = useState<DownloadTask[]>([]);
  const { t } = useLanguage();

  useEffect(() => {
    const eventSource = new EventSource('/api/progress');
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setTasks(data);
      } catch (e) {
        console.error('Error parsing SSE data');
      }
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <div className="glass" style={{ padding: '2rem' }}>
      <h2 style={{ marginBottom: '1.5rem', fontWeight: 600 }}>{t('queueTitle')}</h2>
      
      {tasks.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)' }}>{t('noDownloads')}</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {tasks.map(task => (
            <div key={task.id} className="task-item glass" style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem' }}>
              <div className="task-header">
                <span className="task-title" title={task.url}>{task.title || task.url}</span>
                <span className={`status-badge status-${task.status}`}>
                  {task.status}
                </span>
              </div>
              
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                {t('format')}: {task.format.toUpperCase()}
              </div>

              {task.status === 'downloading' && (
                <>
                  <div className="progress-container">
                    <div className="progress-bar" style={{ width: `${task.progress}%` }} />
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '0.8rem', marginTop: '0.25rem', color: 'var(--text-secondary)' }}>
                    {task.progress.toFixed(1)}%
                  </div>
                </>
              )}
              
              {task.status === 'completed' && task.filePath && (
                <div style={{ marginTop: '1rem' }}>
                  <a 
                    href={task.filePath} 
                    download 
                    style={{ 
                      color: 'var(--accent-color)', 
                      textDecoration: 'none', 
                      fontWeight: 500,
                      display: 'inline-block',
                      background: 'rgba(99, 102, 241, 0.1)',
                      padding: '0.5rem 1rem',
                      borderRadius: '8px'
                    }}
                  >
                    {t('saveBtn')}
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
