import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Avatar from '../components/Avatar';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import styles from './ExplorePage.module.css';

function UserCard({ user: u, onFollowChange }) {
  const { user: me } = useAuth();
  const [following, setFollowing] = useState(u.is_following);
  const [count, setCount] = useState(u.followers_count);
  const [loading, setLoading] = useState(false);

  if (u.id === me?.id) return null;

  const handleFollow = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post(`/users/${u.username}/follow/`);
      setFollowing(res.data.following);
      setCount(res.data.followers_count);
      onFollowChange?.();
    } catch {}
    setLoading(false);
  };

  return (
    <Link to={`/profile/${u.username}`} className={styles.userCard}>
      <Avatar user={u} size={48} />
      <div className={styles.userInfo}>
        <span className={styles.name}>{u.first_name || u.username} {u.last_name}</span>
        <span className={styles.handle}>@{u.username}</span>
        {u.bio && <span className={styles.bio}>{u.bio}</span>}
        <span className={styles.stats}>{count} seguidores · {u.posts_count} posts</span>
      </div>
      <button
        className={`btn btn-sm ${following ? 'btn-outline' : 'btn-white'}`}
        onClick={handleFollow}
        disabled={loading}
        style={{flexShrink:0}}
      >
        {loading ? <span className="spinner" style={{width:14,height:14}} /> : (following ? 'Seguindo' : 'Seguir')}
      </button>
    </Link>
  );
}

export default function ExplorePage() {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) { setQuery(q); doSearch(q); }
    else { loadAll(); }
  }, [searchParams]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users/search/?q=');
      setUsers(res.data);
    } catch {}
    setLoading(false);
  };

  const doSearch = async (q) => {
    setLoading(true);
    setSearched(true);
    try {
      const res = await api.get(`/users/search/?q=${encodeURIComponent(q)}`);
      setUsers(res.data);
    } catch {}
    setLoading(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    doSearch(query);
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2 className={styles.title}>Explorar</h2>
        <form className={styles.searchForm} onSubmit={handleSearch}>
          <div className={styles.searchBox}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              placeholder="Buscar usuários..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              autoFocus
            />
            {query && (
              <button type="button" className={styles.clearBtn} onClick={() => { setQuery(''); loadAll(); setSearched(false); }}>✕</button>
            )}
          </div>
          <button type="submit" className="btn btn-primary">Buscar</button>
        </form>
      </div>

      <div className={styles.results}>
        {loading ? (
          <div style={{padding:32,textAlign:'center'}}><span className="spinner" style={{width:28,height:28}} /></div>
        ) : users.length === 0 ? (
          <div className={styles.empty}>
            {searched ? (
              <><span style={{fontSize:40}}>🔍</span><p>Nenhum usuário encontrado para "{query}"</p></>
            ) : (
              <><span style={{fontSize:40}}>👥</span><p>Busque por usuários para conectar!</p></>
            )}
          </div>
        ) : (
          users.map(u => <UserCard key={u.id} user={u} onFollowChange={loadAll} />)
        )}
      </div>
    </div>
  );
}
