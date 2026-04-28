import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fetchPublicReports, fetchNotices, fetchConfig } from '../api'
import MapView from '../components/MapView'
import Legend from '../components/Legend'
import SceneBg from '../components/SceneBg'
import { useLang } from '../i18n'

const URGENCY_RANK = { Critical: 0, High: 1, Medium: 2, Low: 3 }
const RESOLUTION_RANK = { Ongoing: 0, 'In Progress': 1, Resolved: 2 }
const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000

export default function Home() {
  const { t, lang } = useLang()
  const [reports, setReports] = useState([])
  const [notices, setNotices] = useState([])
  const [config, setConfig] = useState(null)
  const [filters, setFilters] = useState({})
  const [selectedId, setSelectedId] = useState(null)
  const [expandedNotesId, setExpandedNotesId] = useState(null)
  const [loaded, setLoaded] = useState(false)

  function formatDate(d) {
    return new Date(d).toLocaleDateString(lang === 'ar' ? 'ar-MA' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  function timeAgo(d) {
    const diff = Date.now() - new Date(d).getTime()
    const hours = Math.floor(diff / 3600000)
    if (hours < 1) return t('home.justNow')
    if (hours < 24) return `${hours}${t('home.hoursAgo')}`
    return `${Math.floor(hours / 24)}${t('home.daysAgo')}`
  }

  useEffect(() => {
    Promise.all([fetchConfig(), fetchPublicReports(), fetchNotices()])
      .then(([c, r, n]) => { setConfig(c); setReports(r); setNotices(n); setLoaded(true) })
  }, [])

  function applyFilters() { fetchPublicReports(filters).then(setReports) }

  const freshReports = reports.filter(r => Date.now() - new Date(r.created_at).getTime() <= ONE_MONTH_MS)

  const sortedReports = [...freshReports].sort((a, b) => {
    const ua = URGENCY_RANK[a.urgency] ?? 99
    const ub = URGENCY_RANK[b.urgency] ?? 99
    if (ua !== ub) return ua - ub
    const ra = RESOLUTION_RANK[a.resolution] ?? 99
    const rb = RESOLUTION_RANK[b.resolution] ?? 99
    if (ra !== rb) return ra - rb
    return new Date(b.created_at) - new Date(a.created_at)
  })

  const displayedReports = (() => {
    if (!selectedId) return sortedReports
    const i = sortedReports.findIndex(r => r.id === selectedId)
    if (i <= 0) return sortedReports
    const arr = [...sortedReports]
    const [item] = arr.splice(i, 1)
    arr.unshift(item)
    return arr
  })()

  const criticalHigh = freshReports.filter(r => r.urgency === 'Critical' || r.urgency === 'High').length
  const resolvedCount = freshReports.filter(r => r.resolution === 'Resolved').length
  const primaryImage = (r) => r.images?.find(i => i.is_primary)?.file_path || r.images?.[0]?.file_path
  const latestPublicNote = (r) => r.public_notes?.[0]?.content

  return (
    <div className={`page page-with-scene ${loaded ? 'fade-in' : ''}`}>
      <div className="scene-bg"><SceneBg variant="mountains" /></div>
      {/* Hero */}
      <div className="hero slide-up">
        <div className="hero-text">
          <h1>{t('home.title')}</h1>
          <p>{t('home.subtitle')}</p>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
            <Link to="/submit" className="btn btn-primary btn-hover-lift" style={{ padding: '0.7rem 1.5rem', fontSize: '0.95rem' }}>{t('home.submitBtn')}</Link>
            <Link to="/track" className="btn btn-secondary btn-hover-lift" style={{ padding: '0.7rem 1.5rem', fontSize: '0.95rem' }}>{t('home.trackBtn')}</Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-row slide-up" style={{ animationDelay: '0.1s' }}>
        {[
          { n: criticalHigh, l: t('home.criticalHigh'), c: '#f59e0b' },
          { n: resolvedCount, l: t('home.resolved'), c: '#22c55e' },
          { n: freshReports.length - resolvedCount, l: t('home.active'), c: '#3b82f6' },
        ].map((s, i) => (
          <div key={i} className="stat-card hover-lift">
            <div className={`stat-dot ${s.pulse ? 'pulse-dot' : ''}`} style={{ background: s.c }} />
            <div><div className="number">{s.n}</div><div className="label">{s.l}</div></div>
          </div>
        ))}
      </div>

      {/* Filters */}
      {config && (
        <div className="filters-bar card slide-up" style={{ padding: '1rem 1.25rem', animationDelay: '0.15s' }}>
          {[
            { label: t('home.filter.category'), key: 'category', opts: config.categories, prefix: 'cat' },
            { label: t('home.filter.resolution'), key: 'resolution', opts: config.resolution_statuses, prefix: 'res' },
            { label: t('home.filter.urgency'), key: 'urgency', opts: config.urgency_levels, prefix: 'urg' },
            { label: t('home.filter.location'), key: 'location', opts: config.locations, prefix: null },
          ].map(f => (
            <div key={f.key} className="filter-group">
              <label>{f.label}</label>
              <select value={filters[f.key] || ''} onChange={e => setFilters({ ...filters, [f.key]: e.target.value })}>
                <option value="">{t('home.filter.any')}</option>
                {f.opts.map(o => <option key={o} value={o}>{f.prefix ? t(`${f.prefix}.${o}`) : o}</option>)}
              </select>
            </div>
          ))}
          <button className="btn btn-primary btn-hover-lift" onClick={applyFilters}>{t('home.filter.apply')}</button>
        </div>
      )}

      {/* Main grid */}
      <div className="home-grid" style={{ marginTop: '1.5rem' }}>
        <div className="slide-up" style={{ animationDelay: '0.2s' }}>
          <h3 style={{ marginBottom: '0.75rem' }}>{t('home.map')}</h3>
          <div className="map-container hover-glow">
            <MapView reports={freshReports} selectedId={selectedId} onSelect={setSelectedId} />
          </div>
          <div style={{ marginTop: '0.75rem' }}><Legend /></div>
        </div>

        <div className="slide-up" style={{ animationDelay: '0.25s' }}>
          <h3 style={{ marginBottom: '0.75rem' }}>{t('home.latestReports')}</h3>
          <div className="reports-list">
            {displayedReports.map((r, i) => {
              const img = primaryImage(r)
              const selected = selectedId === r.id
              return (
                <div
                  key={r.id}
                  className={`report-card-rich cat-${r.category.split(' ')[0]} hover-lift stagger-in`}
                  style={{ animationDelay: `${0.25 + i * 0.04}s`, ...(selected ? { boxShadow: '0 0 0 2px #0d9488, 0 8px 24px rgba(13,148,136,0.15)' } : {}) }}
                  onClick={() => setSelectedId(selected ? null : r.id)}
                >
                  {img && <div className="report-thumb"><img src={img} alt="" /></div>}
                  <div className="report-body">
                    <div className="report-top">
                      <div>
                        <h4>{t(`cat.${r.category}`)}</h4>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.15rem' }}>
                          <span style={{ fontStyle: 'italic', color: '#0d9488', fontWeight: 500 }}>{r.location}</span>
                          <span style={{ color: '#cbd5e1', margin: '0 0.35rem' }}>/</span>
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{timeAgo(r.created_at)}</span>
                        </div>
                      </div>
                      <div className="report-badges">
                        <span className={`badge badge-resolution ${r.resolution.replace(/ /g, '-')}`}>{t(`res.${r.resolution}`)}</span>
                        {r.urgency && <span className={`badge badge-urgency ${r.urgency}`}>{t(`urg.${r.urgency}`)}</span>}
                      </div>
                    </div>
                    {selected && (r.public_notes?.length > 0) && (
                      <div className="note fade-in" style={{ marginTop: '0.5rem', padding: '0.5rem 0.75rem', background: '#f8fafc', borderRadius: '6px', borderLeft: '3px solid #0d9488', fontSize: '0.8rem' }}>
                        {expandedNotesId === r.id ? (
                          r.public_notes.map((n, idx) => (
                            <div key={n.id} style={{ marginTop: idx === 0 ? 0 : '0.5rem', paddingTop: idx === 0 ? 0 : '0.5rem', borderTop: idx === 0 ? 'none' : '1px solid #e2e8f0' }}>
                              <div>{n.content}</div>
                              <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '0.15rem' }}>{n.author_name || ''} · {timeAgo(n.created_at)}</div>
                            </div>
                          ))
                        ) : (
                          <div>{latestPublicNote(r)}</div>
                        )}
                        {r.public_notes.length > 1 && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setExpandedNotesId(expandedNotesId === r.id ? null : r.id) }}
                            style={{ marginTop: '0.4rem', background: 'none', border: 'none', color: '#0d9488', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                          >
                            {expandedNotesId === r.id ? t('home.showLess') : `+${r.public_notes.length - 1} ${t('home.moreUpdates')}`}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
            {displayedReports.length === 0 && (
              <div className="card fade-in" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                {t('home.noReports')}
              </div>
            )}
          </div>

          {/* Notices */}
          <div className="notices-section" style={{ marginTop: '2rem' }}>
            <h3>{t('home.recentNotices')}</h3>
            {notices.map((n, i) => (
              <div key={n.id} className="notice-item hover-lift stagger-in" style={{ animationDelay: `${0.3 + i * 0.04}s`, borderRadius: '8px', padding: '0.75rem' }}>
                <div className="notice-date">{formatDate(n.created_at)}</div>
                <div>
                  <div className="notice-title">{n.title}</div>
                  <div className="notice-content">{n.content}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom spacer so content doesn't overlap the fixed bg */}
      <div style={{ height: '4rem' }} />
    </div>
  )
}
