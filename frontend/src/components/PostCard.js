import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';
import api from '../utils/api';
import styles from './PostCard.module.css';

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s`;
  if (diff < 3600) return `${Math.floor(diff/60)}m`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h`;
  if (diff < 604800) return `${Math.floor(diff/86400)}d`;
  return new Date(dateStr).toLocaleDateString('pt-BR');
}

export default function PostCard({ post, onDelete, showComments = false }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(post.is_liked);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState(post.comments || []);
  const [showCommentBox, setShowCommentBox] = useState(showComments);
  const [submitting, setSubmitting] = useState(false);
  const [likeAnim, setLikeAnim] = useState(false);

  const handleLike = async (e) => {
    e.stopPropagation();
    setLiked(l => !l);
    setLikesCount(c => liked ? c - 1 : c + 1);
    setLikeAnim(true);
    setTimeout(() => setLikeAnim(false), 400);
    try {
      const res = await api.post(`/posts/${post.id}/like/`);
      setLiked(res.data.liked);
      setLikesCount(res.data.likes_count);
    } catch {
      setLiked(l => !l);
      setLikesCount(c => liked ? c + 1 : c - 1);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/posts/${post.id}/comments/`, { content: comment });
      setComments(c => [...c, res.data]);
      setComment('');
    } catch {}
    setSubmitting(false);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm('Deletar este post?')) return;
    try {
      await api.delete(`/posts/${post.id}/`);
      onDelete?.(post.id);
    } catch {}
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await api.delete(`/posts/${post.id}/comments/${commentId}/`);
      setComments(c => c.filter(x => x.id !== commentId));
    } catch {}
  };

  return (
    <article className={styles.card} onClick={() => navigate(`/post/${post.id}`)}>
      <Link to={`/profile/${post.author.username}`} onClick={e => e.stopPropagation()}>
        <Avatar user={post.author} size={44} />
      </Link>
      <div className={styles.body}>
        <div className={styles.header}>
          <Link to={`/profile/${post.author.username}`} className={styles.authorName} onClick={e => e.stopPropagation()}>
            {post.author.first_name || post.author.username}
          </Link>
          <span className={styles.handle}>@{post.author.username}</span>
          <span className={styles.dot}>·</span>
          <span className={styles.time}>{timeAgo(post.created_at)}</span>
          {user?.id === post.author.id && (
            <button className={styles.deleteBtn} onClick={handleDelete} title="Deletar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3,6 5,6 21,6"/><path d="M19,6l-1,14H6L5,6"/><path d="M10,11v6"/><path d="M14,11v6"/>
                <path d="M9,6V4h6v2"/>
              </svg>
            </button>
          )}
        </div>
        <p className={styles.content}>{post.content}</p>
        <div className={styles.actions} onClick={e => e.stopPropagation()}>
          <button
            className={`${styles.action} ${styles.comment}`}
            onClick={e => { e.stopPropagation(); setShowCommentBox(x => !x); }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <span>{comments.length || post.comments_count}</span>
          </button>
          <button
            className={`${styles.action} ${styles.like} ${liked ? styles.liked : ''} ${likeAnim ? styles.likeAnim : ''}`}
            onClick={handleLike}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            <span>{likesCount}</span>
          </button>
        </div>

        {showCommentBox && (
          <div className={styles.commentsBox} onClick={e => e.stopPropagation()}>
            <form className={styles.commentForm} onSubmit={handleComment}>
              <Avatar user={user} size={32} />
              <input
                className={styles.commentInput}
                placeholder="Adicione um comentário..."
                value={comment}
                onChange={e => setComment(e.target.value)}
                maxLength={280}
                autoFocus
              />
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={!comment.trim() || submitting}
              >
                {submitting ? <span className="spinner" style={{width:14,height:14}} /> : 'Enviar'}
              </button>
            </form>
            {comments.map(c => (
              <div key={c.id} className={styles.comment}>
                <Link to={`/profile/${c.author.username}`} onClick={e => e.stopPropagation()}>
                  <Avatar user={c.author} size={28} />
                </Link>
                <div className={styles.commentContent}>
                  <span className={styles.commentAuthor}>{c.author.first_name || c.author.username}</span>
                  <span className={styles.commentText}>{c.content}</span>
                </div>
                {user?.id === c.author.id && (
                  <button className={styles.deleteCommentBtn} onClick={() => handleDeleteComment(c.id)}>✕</button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
