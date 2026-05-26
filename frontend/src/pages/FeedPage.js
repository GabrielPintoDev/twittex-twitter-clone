import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';
import Avatar from '../components/Avatar';
import api from '../utils/api';
import styles from './FeedPage.module.css';

export default function FeedPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [tab, setTab] = useState('feed'); // 'feed' | 'explore'

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint = tab === 'feed' ? '/feed/' : '/explore/';
      const res = await api.get(endpoint);
      setPosts(res.data);
    } catch {}
    setLoading(false);
  }, [tab]);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!content.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await api.post('/posts/', { content });
      setPosts(p => [res.data, ...p]);
      setContent('');
    } catch {}
    setSubmitting(false);
  };

  const handleDelete = (id) => setPosts(p => p.filter(x => x.id !== id));

  const remaining = 280 - content.length;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${tab === 'feed' ? styles.active : ''}`}
            onClick={() => setTab('feed')}
          >Para você</button>
          <button
            className={`${styles.tab} ${tab === 'explore' ? styles.active : ''}`}
            onClick={() => setTab('explore')}
          >Explorar</button>
        </div>
      </div>

      <div className={styles.compose}>
        <Avatar user={user} size={44} />
        <form className={styles.composeForm} onSubmit={handlePost}>
          <textarea
            className={styles.textarea}
            placeholder="O que está acontecendo?"
            value={content}
            onChange={e => setContent(e.target.value)}
            maxLength={280}
            rows={2}
          />
          <div className={styles.composeFooter}>
            <span className={styles.remaining} style={{ color: remaining < 20 ? (remaining < 0 ? 'var(--danger)' : '#ffd400') : 'var(--text-3)' }}>
              {content.length > 0 && `${remaining}`}
            </span>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!content.trim() || content.length > 280 || submitting}
            >
              {submitting ? <span className="spinner" style={{width:18,height:18}} /> : 'Publicar'}
            </button>
          </div>
        </form>
      </div>

      <div className="divider" />

      {loading ? (
        <div className={styles.loading}>
          {[1,2,3].map(i => (
            <div key={i} className={styles.skeleton}>
              <div className="skeleton" style={{width:44,height:44,borderRadius:'50%',flexShrink:0}} />
              <div style={{flex:1,display:'flex',flexDirection:'column',gap:8}}>
                <div className="skeleton" style={{height:14,width:'40%'}} />
                <div className="skeleton" style={{height:14,width:'80%'}} />
                <div className="skeleton" style={{height:14,width:'60%'}} />
              </div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className={styles.empty}>
          {tab === 'feed' ? (
            <>
              <span style={{fontSize:48}}>🌱</span>
              <h3>Seu feed está vazio</h3>
              <p>Siga algumas pessoas para ver posts aqui!</p>
            </>
          ) : (
            <>
              <span style={{fontSize:48}}>🔍</span>
              <h3>Nenhum post ainda</h3>
              <p>Seja o primeiro a publicar algo!</p>
            </>
          )}
        </div>
      ) : (
        posts.map(p => <PostCard key={p.id} post={p} onDelete={handleDelete} />)
      )}
    </div>
  );
}
