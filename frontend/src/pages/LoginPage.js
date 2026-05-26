import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './AuthPage.module.css';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.username, form.password);
      navigate('/feed');
    } catch (err) {
      setError(err.response?.data?.detail || 'Credenciais inválidas.');
    }
    setLoading(false);
  };

  return (
    <div className={styles.page}>
      <div className={styles.left}>
        <div className={styles.hero}>
          <svg width="64" height="64" viewBox="0 0 32 32" fill="none">
            <path d="M16 2L4 8v8c0 7.18 5.15 13.89 12 15.49C22.85 29.89 28 23.18 28 16V8L16 2z" fill="#1d9bf0"/>
            <path d="M22 11L14 19l-4-4" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h1 className={styles.heroTitle}>Twittex</h1>
          <p className={styles.heroSub}>Compartilhe ideias. Conecte pessoas.<br/>Faça parte da conversa.</p>
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.card}>
          <h2 className={styles.title}>Entrar na sua conta</h2>
          <p className={styles.sub}>Bem-vindo de volta!</p>

          {error && <div className={styles.error}>{error}</div>}

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label>Usuário ou e-mail</label>
              <input
                type="text"
                placeholder="@usuário ou email"
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                required
                autoFocus
              />
            </div>
            <div className={styles.field}>
              <label>Senha</label>
              <input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-lg" style={{width:'100%'}} disabled={loading}>
              {loading ? <span className="spinner" /> : 'Entrar'}
            </button>
          </form>

          <div className={styles.divider}><span>ou</span></div>

          <div className={styles.demo}>
            <p className={styles.demoLabel}>Contas demo:</p>
            {['joao_silva','maria_santos','pedro_dev','ana_tech'].map(u => (
              <button
                key={u}
                className={`btn btn-outline btn-sm`}
                onClick={() => setForm({ username: u, password: 'senha123' })}
              >@{u}</button>
            ))}
          </div>

          <p className={styles.switch}>
            Não tem conta? <Link to="/register">Criar conta</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
