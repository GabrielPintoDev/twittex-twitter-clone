import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';
import api from '../utils/api';
import styles from './SettingsPage.module.css';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const fileRef = useRef();
  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    bio: user?.bio || '',
  });
  const [pwForm, setPwForm] = useState({ old_password: '', new_password: '', confirm: '' });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const data = new FormData();
      data.append('first_name', form.first_name);
      data.append('last_name', form.last_name);
      data.append('bio', form.bio);
      if (avatarFile) data.append('avatar', avatarFile);

      const res = await api.patch('/me/', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      updateUser(res.data);
      setSuccess('Perfil atualizado com sucesso!');
      setAvatarFile(null);
    } catch (err) {
      setError('Erro ao salvar perfil.');
    }
    setSaving(false);
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');
    if (pwForm.new_password !== pwForm.confirm) {
      setPwError('As senhas não conferem.'); return;
    }
    setPwSaving(true);
    try {
      await api.patch('/me/', {
        old_password: pwForm.old_password,
        new_password: pwForm.new_password,
      });
      setPwSuccess('Senha alterada com sucesso!');
      setPwForm({ old_password: '', new_password: '', confirm: '' });
    } catch (err) {
      setPwError(err.response?.data?.old_password || 'Erro ao alterar senha.');
    }
    setPwSaving(false);
  };

  const displayUser = { ...user };
  if (avatarPreview) displayUser.avatar_url = avatarPreview;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2 className={styles.title}>Ajustes</h2>
      </div>

      <div className={styles.content}>
        {/* Profile */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Informações do Perfil</h3>

          <div className={styles.avatarArea}>
            <Avatar user={displayUser} size={80} />
            <div>
              <button className="btn btn-outline btn-sm" onClick={() => fileRef.current.click()}>
                Alterar foto
              </button>
              <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleAvatarChange} />
              <p style={{fontSize:13,color:'var(--text-2)',marginTop:6}}>JPG, PNG ou GIF. Máx 5MB.</p>
            </div>
          </div>

          {success && <div className={styles.success}>{success}</div>}
          {error && <div className={styles.error}>{error}</div>}

          <form className={styles.form} onSubmit={handleSave}>
            <div className={styles.row}>
              <div className={styles.field}>
                <label>Nome</label>
                <input
                  type="text"
                  placeholder="Seu nome"
                  value={form.first_name}
                  onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))}
                />
              </div>
              <div className={styles.field}>
                <label>Sobrenome</label>
                <input
                  type="text"
                  placeholder="Seu sobrenome"
                  value={form.last_name}
                  onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))}
                />
              </div>
            </div>
            <div className={styles.field}>
              <label>Bio</label>
              <textarea
                placeholder="Conte um pouco sobre você..."
                value={form.bio}
                onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                rows={3}
                maxLength={160}
              />
              <span style={{fontSize:12,color:'var(--text-3)',textAlign:'right'}}>{form.bio.length}/160</span>
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <span className="spinner" /> : 'Salvar alterações'}
            </button>
          </form>
        </section>

        <div className="divider" style={{margin:'0 16px'}} />

        {/* Password */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Alterar Senha</h3>

          {pwSuccess && <div className={styles.success}>{pwSuccess}</div>}
          {pwError && <div className={styles.error}>{pwError}</div>}

          <form className={styles.form} onSubmit={handlePasswordSave}>
            <div className={styles.field}>
              <label>Senha atual</label>
              <input
                type="password"
                placeholder="••••••••"
                value={pwForm.old_password}
                onChange={e => setPwForm(f => ({ ...f, old_password: e.target.value }))}
                required
              />
            </div>
            <div className={styles.field}>
              <label>Nova senha</label>
              <input
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={pwForm.new_password}
                onChange={e => setPwForm(f => ({ ...f, new_password: e.target.value }))}
                required
                minLength={6}
              />
            </div>
            <div className={styles.field}>
              <label>Confirmar nova senha</label>
              <input
                type="password"
                placeholder="Repita a nova senha"
                value={pwForm.confirm}
                onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={pwSaving}>
              {pwSaving ? <span className="spinner" /> : 'Alterar senha'}
            </button>
          </form>
        </section>

        <div className="divider" style={{margin:'0 16px'}} />

        {/* Account info */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Informações da Conta</h3>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Usuário</span>
            <span className={styles.infoValue}>@{user?.username}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>E-mail</span>
            <span className={styles.infoValue}>{user?.email}</span>
          </div>
        </section>
      </div>
    </div>
  );
}
