import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Layout.module.css';
import Avatar from './Avatar';
import NewPostModal from './NewPostModal';

const HomeIcon = ({ filled }) => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9,22 9,12 15,12 15,22"/>
  </svg>
);
const ExploreIcon = ({ filled }) => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const ProfileIcon = ({ filled }) => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const SettingsIcon = ({ filled }) => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showPost, setShowPost] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <Link to="/feed" className={styles.logo}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M16 2L4 8v8c0 7.18 5.15 13.89 12 15.49C22.85 29.89 28 23.18 28 16V8L16 2z" fill="#1d9bf0"/>
            <path d="M22 11L14 19l-4-4" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className={styles.logoText}>Twittex</span>
        </Link>

        <nav className={styles.nav}>
          <NavLink to="/feed" className={({isActive}) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
            {({isActive}) => <><HomeIcon filled={isActive} /><span>Início</span></>}
          </NavLink>
          <NavLink to="/explore" className={({isActive}) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
            {({isActive}) => <><ExploreIcon filled={isActive} /><span>Explorar</span></>}
          </NavLink>
          <NavLink to={`/profile/${user?.username}`} className={({isActive}) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
            {({isActive}) => <><ProfileIcon filled={isActive} /><span>Perfil</span></>}
          </NavLink>
          <NavLink to="/settings" className={({isActive}) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
            {({isActive}) => <><SettingsIcon filled={isActive} /><span>Ajustes</span></>}
          </NavLink>
        </nav>

        <button className={`btn btn-primary ${styles.postBtn}`} onClick={() => setShowPost(true)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          <span>Publicar</span>
        </button>

        <div className={styles.userArea} onClick={() => setShowUserMenu(!showUserMenu)}>
          <Avatar user={user} size={40} />
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user?.first_name || user?.username}</span>
            <span className={styles.userHandle}>@{user?.username}</span>
          </div>
          <span style={{marginLeft:'auto', color:'var(--text-2)', fontSize:18}}>⋯</span>
          {showUserMenu && (
            <div className={styles.userMenu}>
              <button onClick={handleLogout} className={styles.logoutBtn}>
                Sair de @{user?.username}
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main */}
      <main className={styles.main}>
        <Outlet />
      </main>

      {/* Right panel */}
      <aside className={styles.right}>
        <div className={styles.searchBox}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            placeholder="Buscar usuários..."
            onKeyDown={e => {
              if (e.key === 'Enter' && e.target.value) {
                navigate(`/explore?q=${e.target.value}`);
              }
            }}
          />
        </div>
        <div className={styles.suggestBox}>
          <h3 className={styles.suggestTitle}>Novidades</h3>
          <p className={styles.suggestText}>Explore perfis e descubra novas vozes!</p>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/explore')}>
            Explorar
          </button>
        </div>
      </aside>

      {/* Bottom nav (mobile) */}
      <nav className={styles.bottomNav}>
        <NavLink to="/feed" className={({isActive}) => `${styles.bottomItem} ${isActive ? styles.active : ''}`}>
          {({isActive}) => <HomeIcon filled={isActive} />}
        </NavLink>
        <NavLink to="/explore" className={({isActive}) => `${styles.bottomItem} ${isActive ? styles.active : ''}`}>
          {({isActive}) => <ExploreIcon filled={isActive} />}
        </NavLink>
        <button className={styles.bottomPost} onClick={() => setShowPost(true)}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
        <NavLink to={`/profile/${user?.username}`} className={({isActive}) => `${styles.bottomItem} ${isActive ? styles.active : ''}`}>
          {({isActive}) => <ProfileIcon filled={isActive} />}
        </NavLink>
        <NavLink to="/settings" className={({isActive}) => `${styles.bottomItem} ${isActive ? styles.active : ''}`}>
          {({isActive}) => <SettingsIcon filled={isActive} />}
        </NavLink>
      </nav>

      {showPost && <NewPostModal onClose={() => setShowPost(false)} onPost={() => setShowPost(false)} />}
    </div>
  );
}
