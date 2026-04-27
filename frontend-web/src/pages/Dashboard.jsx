import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { fetchAuthorityReports, fetchStats, fetchConfig } from '../api'
import MapView from '../components/MapView'
import { useLang } from '../i18n'

export default function Dashboard() {
  const { t, toggleLang, lang } = useLang()
  const [reports, setReports] = useState([])
  const [stats, setStats] = useState(null)
  const [config, setConfig] = useState(null)
  const [filters, setFilters] = useState({})
  const [selectedId, setSelectedId] = useState(null)
  const [view, setView] = useState('dashboard')
  const navigate = useNavigate()

  function formatDate(d) {
    return new Date(d).toLocaleDateString(lang === 'ar' ? 'ar-MA' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  useEffect(() => {
    loadData()
    fetchConfig().then(setConfig)
  }, [])

  async function loadData() {
    try {
      const [r, s] = await Promise.all([fetchAuthorityReports(filters), fetchStats()])
      setReports(r)
      setStats(s)
    } catch {
      navigate('/login')
    }
  }

  function applyFilters() {
    fetchAuthorityReports(filters).then(setReports).catch(() => navigate('/login'))
  }

  function logout() {
    localStorage.removeItem('ecoguard_token')
    localStorage.removeItem('ecoguard_officer')
    navigate('/login')
  }

  return (
    <div className="dashboard-layout">
      <div className="sidebar">
        <div className="sidebar-logo">
          <img src="/logo.svg" alt="EcoGuard" style={{ height: 30, marginBottom: 4 }} />
          <span>{t('dash.title')}</span>
        </div>
        <div className="sidebar-nav">
          <a href="#" className={view === 'dashboard' ? 'active' : ''} onClick={() => setView('dashboard')}>{t('dash.dashboard')}</a>
          <a href="#" className={view === 'reports' ? 'active' : ''} onClick={() => setView('reports')}>{t('dash.reports')}</a>
          <a href="#" onClick={toggleLang}>🌐 {t('nav.language')}</a>
          <a href="#" onClick={logout}>{t('dash.logout')}</a>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-header">
          <h2>{t('dash.operationalDashboard')}</h2>
          <span className="shift-badge">{t('dash.shift')}</span>
        </div>

        {stats && (
          <>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.35rem', fontWeight: 600, textTransform: 'uppercase' }}>{t('dash.verification')}</div>
            <div className="stats-row">
              <div className="stat-card hover-lift">
                <div className="stat-dot" style={{ background: '#3b82f6' }} />
                <div><div className="number">{stats.total}</div><div className="label">{t('dash.total')}</div></div>
              </div>
              <div className="stat-card hover-lift">
                <div className="stat-dot" style={{ background: '#f59e0b' }} />
                <div><div className="number">{stats.pending}</div><div className="label">{t('dash.pending')}</div></div>
              </div>
              <div className="stat-card hover-lift">
                <div className="stat-dot" style={{ background: '#22c55e' }} />
                <div><div className="number">{stats.approved}</div><div className="label">{t('dash.approved')}</div></div>
              </div>
              <div className="stat-card hover-lift">
                <div className="stat-dot" style={{ background: '#ef4444' }} />
                <div><div className="number">{stats.rejected}</div><div className="label">{t('dash.rejected')}</div></div>
              </div>
            </div>

            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.35rem', fontWeight: 600, textTransform: 'uppercase' }}>{t('dash.resolutionApproved')}</div>
            <div className="stats-row">
              <div className="stat-card hover-lift">
                <div className="stat-dot" style={{ background: '#f59e0b' }} />
                <div><div className="number">{stats.ongoing}</div><div className="label">{t('dash.ongoing')}</div></div>
              </div>
              <div className="stat-card hover-lift">
                <div className="stat-dot" style={{ background: '#3b82f6' }} />
                <div><div className="number">{stats.in_progress}</div><div className="label">{t('dash.inProgress')}</div></div>
              </div>
              <div className="stat-card hover-lift">
                <div className="stat-dot" style={{ background: '#22c55e' }} />
                <div><div className="number">{stats.resolved}</div><div className="label">{t('dash.resolved')}</div></div>
              </div>
            </div>
          </>
        )}

        {config && (
          <div className="filters-bar">
            <div className="filter-group">
              <label>{t('dash.search')}</label>
              <input placeholder={t('dash.searchPlaceholder')} value={filters.search || ''} onChange={e => setFilters({ ...filters, search: e.target.value })} />
            </div>
            <div className="filter-group">
              <label>{t('dash.category')}</label>
              <select value={filters.category || ''} onChange={e => setFilters({ ...filters, category: e.target.value })}>
                <option value="">{t('dash.all')}</option>
                {config.categories.map(c => <option key={c} value={c}>{t(`cat.${c}`)}</option>)}
              </select>
            </div>
            <div className="filter-group">
              <label>{t('dash.verificationLabel')}</label>
              <select value={filters.verification || ''} onChange={e => setFilters({ ...filters, verification: e.target.value })}>
                <option value="">{t('dash.all')}</option>
                {config.verification_statuses.map(s => <option key={s} value={s}>{t(`ver.${s}`)}</option>)}
              </select>
            </div>
            <div className="filter-group">
              <label>{t('dash.resolutionLabel')}</label>
              <select value={filters.resolution || ''} onChange={e => setFilters({ ...filters, resolution: e.target.value })}>
                <option value="">{t('dash.all')}</option>
                {config.resolution_statuses.map(s => <option key={s} value={s}>{t(`res.${s}`)}</option>)}
              </select>
            </div>
            <div className="filter-group">
              <label>{t('dash.urgency')}</label>
              <select value={filters.urgency || ''} onChange={e => setFilters({ ...filters, urgency: e.target.value })}>
                <option value="">{t('dash.all')}</option>
                {config.urgency_levels.map(u => <option key={u} value={u}>{t(`urg.${u}`)}</option>)}
              </select>
            </div>
            <button className="btn btn-primary" onClick={applyFilters}>{t('dash.filter')}</button>
          </div>
        )}

        {view === 'dashboard' && (
          <div style={{ marginBottom: '1.5rem' }}>
            <div className="map-container" style={{ height: 300, marginBottom: '1rem' }}>
              <MapView reports={reports} selectedId={selectedId} onSelect={setSelectedId} />
            </div>
          </div>
        )}

        <table className="report-table">
          <thead>
            <tr>
              <th>{t('dash.tableRef')}</th>
              <th>{t('dash.tableCategory')}</th>
              <th>{t('dash.tableLocation')}</th>
              <th>{t('dash.tableDate')}</th>
              <th>{t('dash.tableVerification')}</th>
              <th>{t('dash.tableResolution')}</th>
              <th>{t('dash.tableUrgency')}</th>
              <th>{t('dash.tablePublic')}</th>
              <th>{t('dash.tableAction')}</th>
            </tr>
          </thead>
          <tbody>
            {reports.map(r => (
              <tr
                key={r.id}
                style={selectedId === r.id ? { background: '#f0fdf4' } : {}}
                onClick={() => setSelectedId(r.id)}
              >
                <td style={{ fontWeight: 600 }}>{r.reference}</td>
                <td>{t(`cat.${r.category}`)}</td>
                <td>{r.location}</td>
                <td>{formatDate(r.created_at)}</td>
                <td><span className={`badge badge-verification ${r.verification}`}>{t(`ver.${r.verification}`)}</span></td>
                <td><span className={`badge badge-resolution ${r.resolution.replace(/ /g, '-')}`}>{t(`res.${r.resolution}`)}</span></td>
                <td><span className={`badge badge-urgency ${r.urgency || 'Unassigned'}`}>{r.urgency ? t(`urg.${r.urgency}`) : '—'}</span></td>
                <td><span className={`badge ${r.is_public ? 'badge-verification Approved' : 'badge-verification'}`}>{r.is_public ? t('dash.on') : t('dash.off')}</span></td>
                <td><Link to={`/authority/reports/${r.id}`} className="btn btn-primary" style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem' }}>{t('dash.view')}</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
