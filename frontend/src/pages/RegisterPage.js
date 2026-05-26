import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './AuthPage.module.css';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', password2: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.password2) { setError('As senhas não conferem.'); return; }
    setLoading(true);
    try {
      await register(form);
      navigate('/feed');
    } catch (err) {
      const data = err.response?.data;
      if (data) {
        const msg = Object.values(data).flat().join(' ');
        setError(msg);
      } else {
        setError('Erro ao criar conta.');
      }
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
          <p className={styles.heroSub}>Sua voz importa.<br/>Junte-se à comunidade.</p>
        </div>
      </div>
      <div className={styles.right}>
        <div className={styles.card}>
          <h2 className={styles.title}>Criar sua conta</h2>
          <p className={styles.sub}>É rápido e fácil.</p>

          {error && <div className={styles.error}>{error}</div>}

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.row}>
              <div className={styles.field}>
                <label>Usuário *</label>
                <input type="text" placeholder="@nome" value={form.username}
                  onChange={e => setForm(f => ({ ...f, username: e.target.value }))} required autoFocus />
              </div>
              <div className={styles.field}>
                <label>E-mail *</label>
                <input type="email" placeholder="email@exemplo.com" value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
              </div>
            </div>
            <div className={styles.field}>
              <label>Senha *</label>
              <input type="password" placeholder="Mínimo 6 caracteres" value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required minLength={6} />
            </div>
            <div className={styles.field}>
              <label>Confirmar senha *</label>
              <input type="password" placeholder="Repita a senha" value={form.password2}
                onChange={e => setForm(f => ({ ...f, password2: e.target.value }))} required />
            </div>
            <button type="submit" className="btn btn-primary btn-lg" style={{width:'100%'}} disabled={loading}>
              {loading ? <span className="spinner" /> : 'Criar conta'}
            </button>
          </form>

          <p className={styles.switch}>Já tem conta? <Link to="/login">Entrar</Link></p>
        </div>
      </div>
    </div>
  );
}
