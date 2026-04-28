import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { fetchAuthorityReports, fetchStats, fetchConfig } from '../api'
import MapView from '../components/MapView'
import { useLang } from '../i18n'

const URGENCY_RANK = { Critical: 0, High: 1, Medium: 2, Low: 3 }
const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000
const POLL_INTERVAL_MS = 30000

function CountUp({ value, duration = 700 }) {
  const [n, setN] = useState(0)
  useEffect(() => {
    if (value == null) return
    let raf
    const start = performance.now()
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setN(Math.round(value * eased))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value])
  return <span className="stat-pop">{n}</span>
}

function StatCard({ color, lightColor, label, value, share }) {
  return (
    <div className="stat-card hover-lift">
      <div className="stat-dot" style={{ background: color }} />
      <div>
        <div className="number"><CountUp value={value ?? 0} /></div>
        <div className="label">{label}</div>
      </div>
      {share != null && (
        <div className="share-bar" style={{ '--bar-color': color, '--bar-color-light': lightColor || color }}>
          <div className="fill" style={{ width: `${Math.max(0, Math.min(100, share))}%` }} />
        </div>
      )}
    </div>
  )
}

export default function Dashboard() {
  const { t, toggleLang, lang } = useLang()
  const [reports, setReports] = useState([])
  const [stats, setStats] = useState(null)
  const [config, setConfig] = useState(null)
  const [filters, setFilters] = useState({})
  const [selectedId, setSelectedId] = useState(null)
  const [view, setView] = useState('dashboard')
  const [newPendingCount, setNewPendingCount] = useState(0)
  const [pendingPulse, setPendingPulse] = useState(false)
  const [doneExpanded, setDoneExpanded] = useState(false)
  const navigate = useNavigate()

  const filtersRef = useRef(filters)
  const seenPendingIdsRef = useRef(new Set())
  const pendingSectionRef = useRef(null)

  useEffect(() => { filtersRef.current = filters }, [filters])

  function formatDate(d) {
    return new Date(d).toLocaleDateString(lang === 'ar' ? 'ar-MA' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  async function loadReports({ silent = false } = {}) {
    try {
      const r = await fetchAuthorityReports(filtersRef.current)
      setReports(r)
      const currentPendingIds = new Set(r.filter(x => x.verification === 'Pending').map(x => x.id))
      if (!silent) {
        const newIds = [...currentPendingIds].filter(id => !seenPendingIdsRef.current.has(id))
        if (newIds.length > 0) {
          setNewPendingCount(prev => prev + newIds.length)
          setPendingPulse(true)
        }
      }
      seenPendingIdsRef.current = currentPendingIds
    } catch {
      navigate('/login')
    }
  }

  async function loadStats() {
    try { setStats(await fetchStats()) } catch {}
  }

  useEffect(() => {
    loadReports({ silent: true })
    loadStats()
    fetchConfig().then(setConfig)
    const id = setInterval(() => { loadReports({ silent: false }); loadStats() }, POLL_INTERVAL_MS)
    return () => clearInterval(id)
  }, [])

  // Auto-dismiss toast after 6 seconds
  useEffect(() => {
    if (newPendingCount === 0) return
    const t = setTimeout(() => setNewPendingCount(0), 6000)
    return () => clearTimeout(t)
  }, [newPendingCount])

  // When a report is selected (e.g. by clicking a map marker), scroll its row
  // into view and auto-expand the Done section if needed.
  useEffect(() => {
    if (!selectedId) return
    const sel = reports.find(r => r.id === selectedId)
    if (sel && (sel.verification === 'Rejected' || sel.resolution === 'Resolved')) {
      setDoneExpanded(true)
    }
    const tryScroll = (attempt = 0) => {
      const row = document.querySelector(`tr[data-report-id="${selectedId}"]`)
      if (row) row.scrollIntoView({ behavior: 'smooth', block: 'center' })
      else if (attempt < 5) setTimeout(() => tryScroll(attempt + 1), 80)
    }
    setTimeout(tryScroll, 50)
  }, [selectedId])

  function applyFilters() {
    loadReports({ silent: true })
  }

  function acknowledgePending() {
    setNewPendingCount(0)
    setPendingPulse(false)
    if (pendingSectionRef.current) {
      pendingSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  function logout() {
    localStorage.removeItem('ecoguard_token')
    localStorage.removeItem('ecoguard_officer')
    navigate('/login')
  }

  const fresh = reports.filter(r => Date.now() - new Date(r.created_at).getTime() <= ONE_MONTH_MS)

  const promoteSelected = (arr) => {
    if (!selectedId) return arr
    const i = arr.findIndex(r => r.id === selectedId)
    if (i <= 0) return arr
    const out = [...arr]
    const [item] = out.splice(i, 1)
    out.unshift(item)
    return out
  }

  const pending = promoteSelected(fresh
    .filter(r => r.verification === 'Pending')
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))) // oldest first (FIFO)

  const active = promoteSelected(fresh
    .filter(r => r.verification === 'Approved' && r.resolution !== 'Resolved')
    .sort((a, b) => {
      const ua = URGENCY_RANK[a.urgency] ?? 99
      const ub = URGENCY_RANK[b.urgency] ?? 99
      if (ua !== ub) return ua - ub
      return new Date(b.created_at) - new Date(a.created_at)
    }))

  const done = promoteSelected(fresh
    .filter(r => r.verification === 'Rejected' || r.resolution === 'Resolved')
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)))

  const renderRow = (r) => (
    <tr
      key={r.id}
      data-report-id={r.id}
      className={selectedId === r.id ? 'selected-row flash-row' : ''}
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
  )

  const tableHead = (
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
  )

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
          <Link to="/authority/notices">{t('notices.title')}</Link>
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
              <StatCard color="#3b82f6" lightColor="#93c5fd" label={t('dash.total')} value={stats.total} share={100} />
              <StatCard color="#f59e0b" lightColor="#fcd34d" label={t('dash.pending')} value={stats.pending} share={stats.total ? (stats.pending / stats.total) * 100 : 0} />
              <StatCard color="#22c55e" lightColor="#86efac" label={t('dash.approved')} value={stats.approved} share={stats.total ? (stats.approved / stats.total) * 100 : 0} />
              <StatCard color="#ef4444" lightColor="#fca5a5" label={t('dash.rejected')} value={stats.rejected} share={stats.total ? (stats.rejected / stats.total) * 100 : 0} />
            </div>

            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.35rem', fontWeight: 600, textTransform: 'uppercase' }}>{t('dash.resolutionApproved')}</div>
            <div className="stats-row">
              <StatCard color="#f59e0b" lightColor="#fcd34d" label={t('dash.ongoing')} value={stats.ongoing} share={stats.approved ? (stats.ongoing / stats.approved) * 100 : 0} />
              <StatCard color="#3b82f6" lightColor="#93c5fd" label={t('dash.inProgress')} value={stats.in_progress} share={stats.approved ? (stats.in_progress / stats.approved) * 100 : 0} />
              <StatCard color="#22c55e" lightColor="#86efac" label={t('dash.resolved')} value={stats.resolved} share={stats.approved ? (stats.resolved / stats.approved) * 100 : 0} />
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
              <MapView reports={fresh} selectedId={selectedId} onSelect={setSelectedId} />
            </div>
          </div>
        )}

        {/* Pending Review section — top priority, FIFO */}
        <div ref={pendingSectionRef}>
          <h3 className="section-header pending">
            <span
              className={`section-dot ${pendingPulse ? 'pulsing' : ''}`}
              style={{ background: '#f59e0b', color: '#f59e0b' }}
            />
            {t('dash.section.pending')}
            <span className="count-pill">{pending.length}</span>
          </h3>
          {pending.length > 0 ? (
            <table className="report-table">
              {tableHead}
              <tbody>{pending.map(renderRow)}</tbody>
            </table>
          ) : (
            <div className="empty-state">
              <div className="icon">✓</div>
              {t('dash.section.allCaughtUp')}
            </div>
          )}
        </div>

        {/* Active section — Approved + (Ongoing or In Progress), urgency-sorted */}
        {active.length > 0 && (
          <div>
            <h3 className="section-header active">
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#3b82f6', display: 'inline-block' }} />
              {t('dash.section.active')}
              <span className="count-pill">{active.length}</span>
            </h3>
            <table className="report-table">
              {tableHead}
              <tbody>{active.map(renderRow)}</tbody>
            </table>
          </div>
        )}

        {/* Done section — Resolved + Rejected, collapsed by default */}
        {done.length > 0 && (
          <div>
            <h3
              className="section-header done"
              style={{ cursor: 'pointer', userSelect: 'none' }}
              onClick={() => setDoneExpanded(e => !e)}
            >
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#94a3b8', display: 'inline-block' }} />
              {t('dash.section.done')}
              <span className="count-pill">{done.length}</span>
              <span className="toggle-hint">
                {doneExpanded ? `▾ ${t('dash.section.hide')}` : `▸ ${t('dash.section.show')}`}
              </span>
            </h3>
            {doneExpanded && (
              <table className="report-table">
                {tableHead}
                <tbody>{done.map(renderRow)}</tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Live notification toast (glass) */}
      {newPendingCount > 0 && (
        <div
          className="toast-glass"
          onClick={acknowledgePending}
          style={{
            position: 'fixed',
            top: 24,
            right: 24,
            color: 'white',
            padding: '0.85rem 1.4rem',
            borderRadius: 14,
            zIndex: 1000,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            fontSize: '0.9rem',
            fontWeight: 600,
            letterSpacing: '0.01em',
          }}
        >
          <span style={{ fontSize: '1.05rem' }}>🔔</span>
          {newPendingCount} {newPendingCount === 1 ? t('dash.toast.newReport') : t('dash.toast.newReports')}
        </div>
      )}
    </div>
  )
}
