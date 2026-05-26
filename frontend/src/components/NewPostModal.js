import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';
import api from '../utils/api';
import styles from './NewPostModal.module.css';

export default function NewPostModal({ onClose, onPost }) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef();

  useEffect(() => { textareaRef.current?.focus(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || loading) return;
    setLoading(true);
    try {
      await api.post('/posts/', { content });
      onPost?.();
    } catch {}
    setLoading(false);
  };

  const remaining = 280 - content.length;
  const pct = (content.length / 280) * 100;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.topBar}>
          <button className={styles.closeBtn} onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <form className={styles.form} onSubmit={handleSubmit}>
          <Avatar user={user} size={44} />
          <div className={styles.right}>
            <textarea
              ref={textareaRef}
              className={styles.textarea}
              placeholder="O que está acontecendo?"
              value={content}
              onChange={e => setContent(e.target.value)}
              maxLength={280}
              rows={4}
            />
            <div className={styles.footer}>
              <div className={styles.counter}>
                <svg width="28" height="28" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="14" fill="none" stroke="var(--border)" strokeWidth="3"/>
                  <circle
                    cx="18" cy="18" r="14"
                    fill="none"
                    stroke={remaining < 20 ? (remaining < 0 ? 'var(--danger)' : '#ffd400') : 'var(--accent)'}
                    strokeWidth="3"
                    strokeDasharray={`${Math.min(pct, 100) * 0.88} 88`}
                    strokeDashoffset="22"
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dasharray 0.2s, stroke 0.2s' }}
                  />
                  {remaining <= 20 && (
                    <text x="18" y="23" textAnchor="middle" fontSize="10" fill={remaining < 0 ? 'var(--danger)' : 'var(--text-2)'}>
                      {remaining}
                    </text>
                  )}
                </svg>
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!content.trim() || content.length > 280 || loading}
              >
                {loading ? <span className="spinner" style={{width:18,height:18}} /> : 'Publicar'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
