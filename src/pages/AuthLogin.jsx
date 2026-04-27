import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../api'
import SceneBg from '../components/SceneBg'
import { useLang } from '../i18n'

export default function AuthLogin() {
  const { t, toggleLang, lang } = useLang()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    try {
      const data = await login(email, password)
      localStorage.setItem('ecoguard_token', data.access_token)
      localStorage.setItem('ecoguard_officer', data.officer_name)
      navigate('/authority')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="login-page page-with-scene">
      <div className="scene-bg"><SceneBg variant="snow" /></div>

      <button
        onClick={toggleLang}
        className="lang-toggle"
        aria-label="Toggle language"
        title={lang === 'en' ? 'Switch to Arabic' : 'التبديل إلى الإنجليزية'}
        style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 10 }}
      >
        <span style={{ fontSize: '1rem' }}>🌐</span>
        <span>{t('nav.language')}</span>
      </button>

      <div className="login-info">
        <h2>{t('auth.title')}</h2>
        <p>{t('auth.subtitle')}</p>
        <ul>
          <li>{t('auth.feat1')}</li>
          <li>{t('auth.feat2')}</li>
          <li>{t('auth.feat3')}</li>
          <li>{t('auth.feat4')}</li>
        </ul>
      </div>

      <div className="card login-form">
        <h3>{t('auth.signIn')}</h3>
        {error && <div style={{ background: '#fef2f2', color: '#991b1b', padding: '0.6rem', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>{t('auth.emailLabel')}</label>
            <input type="email" placeholder={t('auth.emailPlaceholder')} value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="form-group">
            <label>{t('auth.password')}</label>
            <input type="password" placeholder={t('auth.passwordPlaceholder')} value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary">{t('auth.login')}</button>
        </form>

        <div className="hint">{t('auth.staffOnly')}</div>
        <div className="hint" style={{ marginTop: '0.5rem', background: '#f0fdf4', padding: '0.5rem', borderRadius: '6px' }}>
          <strong>{t('auth.demoCreds')}</strong><br />
          authority@ifrane.ma / admin123
        </div>
      </div>
    </div>
  )
}
