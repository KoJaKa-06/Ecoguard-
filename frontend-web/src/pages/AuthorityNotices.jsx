import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { fetchNotices, createNotice, deleteNotice } from '../api'
import { useLang } from '../i18n'

export default function AuthorityNotices() {
  const { t, toggleLang, lang } = useLang()
  const [notices, setNotices] = useState([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  function formatTime(d) {
    return new Date(d).toLocaleString(lang === 'ar' ? 'ar-MA' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  function load() {
    fetchNotices().then(setNotices)
  }

  useEffect(() => {
    if (!localStorage.getItem('ecoguard_token')) { navigate('/login'); return }
    load()
  }, [])

  async function handleCreate(e) {
    e.preventDefault()
    setMessage('')
    if (!title.trim() || !content.trim()) {
      setMessage(t('notices.error.required'))
      return
    }
    setSubmitting(true)
    try {
      await createNotice(title.trim(), content.trim())
      setTitle(''); setContent('')
      setMessage(t('notices.created'))
      load()
    } catch (err) { setMessage(err.message) }
    finally { setSubmitting(false) }
  }

  async function handleDelete(id) {
    if (!window.confirm(t('notices.confirmDelete'))) return
    try {
      await deleteNotice(id)
      load()
    } catch (err) { setMessage(err.message) }
  }

  function logout() {
    localStorage.removeItem('ecoguard_token')
    localStorage.removeItem('ecoguard_officer')
    navigate('/login')
  }

  const isError = message && !message.includes(t('notices.created'))

  return (
    <div className="dashboard-layout">
      <div className="sidebar">
        <div className="sidebar-logo">
          <img src="/logo.svg" alt="EcoGuard" style={{ height: 30, marginBottom: 4 }} />
          <span>{t('dash.title')}</span>
        </div>
        <div className="sidebar-nav">
          <Link to="/authority">{t('dash.dashboard')}</Link>
          <a className="active">{t('notices.title')}</a>
          <a href="#" onClick={toggleLang}>🌐 {t('nav.language')}</a>
          <a href="#" onClick={logout}>{t('dash.logout')}</a>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-header">
          <h2>{t('notices.title')}</h2>
        </div>

        {message && (
          <div className="fade-in" style={{ background: isError ? '#fef2f2' : '#f0fdf4', color: isError ? '#991b1b' : '#166534', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem' }}>
            {message}
          </div>
        )}

        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>{t('notices.addNew')}</h3>
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label>{t('notices.titleLabel')}</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder={t('notices.titlePlaceholder')} />
            </div>
            <div className="form-group">
              <label>{t('notices.contentLabel')}</label>
              <textarea value={content} onChange={e => setContent(e.target.value)} placeholder={t('notices.contentPlaceholder')} rows={3} />
            </div>
            <button className="btn btn-primary" disabled={submitting} style={{ marginTop: '0.5rem' }}>
              {submitting ? t('notices.publishing') : t('notices.publish')}
            </button>
          </form>
        </div>

        <h3 style={{ marginBottom: '0.75rem', fontSize: '0.95rem' }}>{t('notices.existing')} ({notices.length})</h3>
        {notices.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', fontSize: '0.9rem' }}>
            {t('notices.empty')}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {notices.map(n => (
              <div key={n.id} className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.25rem' }}>{n.title}</div>
                  <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '0.4rem', lineHeight: 1.5 }}>{n.content}</div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{formatTime(n.created_at)}</div>
                </div>
                <button className="btn btn-danger" onClick={() => handleDelete(n.id)} style={{ padding: '0.4rem 0.9rem', fontSize: '0.8rem' }}>
                  {t('notices.delete')}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
