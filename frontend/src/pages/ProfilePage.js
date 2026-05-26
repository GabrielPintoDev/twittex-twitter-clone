import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';
import PostCard from '../components/PostCard';
import api from '../utils/api';
import styles from './ProfilePage.module.css';

export default function ProfilePage() {
  const { username } = useParams();
  const { user: me } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [tab, setTab] = useState('posts'); // posts | followers | following
  const [followers, setFollowers] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    setTab('posts');
    Promise.all([
      api.get(`/users/${username}/`),
      api.get(`/users/${username}/posts/`),
    ]).then(([profileRes, postsRes]) => {
      setProfile(profileRes.data);
      setFollowing(profileRes.data.is_following);
      setFollowersCount(profileRes.data.followers_count);
      setPosts(postsRes.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [username]);

  const handleFollow = async () => {
    setFollowLoading(true);
    try {
      const res = await api.post(`/users/${username}/follow/`);
      setFollowing(res.data.following);
      setFollowersCount(res.data.followers_count);
    } catch {}
    setFollowLoading(false);
  };

  const loadFollowers = async () => {
    if (followers.length) return;
    const res = await api.get(`/users/${username}/followers/`);
    setFollowers(res.data);
  };

  const loadFollowing = async () => {
    if (followingList.length) return;
    const res = await api.get(`/users/${username}/following/`);
    setFollowingList(res.data);
  };

  const handleTabChange = (t) => {
    setTab(t);
    if (t === 'followers') loadFollowers();
    if (t === 'following') loadFollowing();
  };

  const handleDeletePost = (id) => setPosts(p => p.filter(x => x.id !== id));

  if (loading) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',padding:80}}>
      <span className="spinner" style={{width:32,height:32}} />
    </div>
  );

  if (!profile) return (
    <div style={{padding:40,textAlign:'center',color:'var(--text-2)'}}>
      <p>Usuário não encontrado.</p>
    </div>
  );

  const isMe = me?.id === profile.id;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.cover} />
        <div className={styles.profileRow}>
          <Avatar user={profile} size={80} style={{ border: '4px solid var(--bg)', marginTop: -40 }} />
          {isMe ? (
            <Link to="/settings" className="btn btn-outline btn-sm">Editar perfil</Link>
          ) : (
            <button
              className={`btn btn-sm ${following ? 'btn-outline' : 'btn-white'}`}
              onClick={handleFollow}
              disabled={followLoading}
            >
              {followLoading ? <span className="spinner" style={{width:14,height:14}} /> : (following ? 'Seguindo' : 'Seguir')}
            </button>
          )}
        </div>

        <div className={styles.info}>
          <h2 className={styles.name}>{profile.first_name} {profile.last_name}</h2>
          <span className={styles.handle}>@{profile.username}</span>
          {profile.bio && <p className={styles.bio}>{profile.bio}</p>}
          <div className={styles.stats}>
            <button className={styles.stat} onClick={() => handleTabChange('following')}>
              <strong>{profile.following_count}</strong> seguindo
            </button>
            <button className={styles.stat} onClick={() => handleTabChange('followers')}>
              <strong>{followersCount}</strong> seguidores
            </button>
            <span className={styles.stat}>
              <strong>{posts.length}</strong> posts
            </span>
          </div>
        </div>

        <div className={styles.tabs}>
          {['posts','followers','following'].map(t => (
            <button
              key={t}
              className={`${styles.tab} ${tab === t ? styles.active : ''}`}
              onClick={() => handleTabChange(t)}
            >
              {t === 'posts' ? 'Posts' : t === 'followers' ? 'Seguidores' : 'Seguindo'}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.content}>
        {tab === 'posts' && (
          posts.length === 0 ? (
            <div className={styles.empty}>
              <span style={{fontSize:40}}>✍️</span>
              <p>{isMe ? 'Você ainda não publicou nada.' : 'Este usuário ainda não publicou.'}</p>
            </div>
          ) : posts.map(p => <PostCard key={p.id} post={p} onDelete={handleDeletePost} />)
        )}

        {(tab === 'followers' || tab === 'following') && (
          (tab === 'followers' ? followers : followingList).map(u => (
            <Link to={`/profile/${u.username}`} key={u.id} className={styles.userRow}>
              <Avatar user={u} size={44} />
              <div>
                <div className={styles.userName}>{u.first_name || u.username} {u.last_name}</div>
                <div className={styles.userHandle}>@{u.username}</div>
                {u.bio && <div className={styles.userBio}>{u.bio}</div>}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
