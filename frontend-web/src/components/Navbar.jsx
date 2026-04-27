import { NavLink } from 'react-router-dom'
import { useLang } from '../i18n'

export default function Navbar() {
  const { t, toggleLang, lang } = useLang()
  return (
    <nav className="navbar">
      <NavLink to="/" className="navbar-logo">
        <img src="/logo.svg" alt="EcoGuard" style={{ height: 36 }} />
      </NavLink>
      <div className="navbar-links">
        <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''} end>{t('nav.home')}</NavLink>
        <button
          onClick={toggleLang}
          className="lang-toggle"
          aria-label="Toggle language"
          title={lang === 'en' ? 'Switch to Arabic' : 'التبديل إلى الإنجليزية'}
        >
          <span style={{ fontSize: '1rem' }}>🌐</span>
          <span>{t('nav.language')}</span>
        </button>
        <NavLink to="/login" className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '0.4rem 1rem' }}>{t('nav.authorityLogin')}</NavLink>
      </div>
    </nav>
  )
}
