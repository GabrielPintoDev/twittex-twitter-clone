import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PostCard from '../components/PostCard';
import api from '../utils/api';
import styles from './PostPage.module.css';

export default function PostPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/posts/${id}/`).then(res => {
      setPost(res.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',padding:80}}>
      <span className="spinner" style={{width:32,height:32}} />
    </div>
  );

  if (!post) return (
    <div style={{padding:40,textAlign:'center',color:'var(--text-2)'}}>
      <p>Post não encontrado.</p>
    </div>
  );

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12,19 5,12 12,5"/>
          </svg>
          <span>Post</span>
        </button>
      </div>
      <PostCard post={post} onDelete={() => navigate(-1)} showComments={true} />
    </div>
  );
}
