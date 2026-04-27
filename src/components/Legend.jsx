import { useLang } from '../i18n'

const CATEGORIES = [
  { name: 'Wildfire', color: '#ef4444' },
  { name: 'Pollution', color: '#8b5cf6' },
  { name: 'Snow Closure', color: '#3b82f6' },
  { name: 'Illegal Dumping', color: '#f59e0b' },
  { name: 'Water Contamination', color: '#06b6d4' },
  { name: 'Deforestation', color: '#22c55e' },
]

const URGENCIES = [
  { name: 'Critical', size: 18 },
  { name: 'High', size: 14 },
  { name: 'Medium', size: 10 },
  { name: 'Low', size: 7 },
]

export default function Legend() {
  const { t } = useLang()
  return (
    <div className="legend">
      <h4>{t('legend.title')}</h4>
      <div className="legend-items">
        {CATEGORIES.map(c => (
          <div key={c.name} className="legend-item">
            <div className="legend-color" style={{ background: c.color }} />
            <span>{t(`cat.${c.name}`)}</span>
          </div>
        ))}
      </div>
      <div className="legend-size" style={{ marginTop: '0.5rem' }}>
        <span style={{ fontSize: '0.75rem', color: '#64748b', marginRight: '0.5rem' }}>{t('legend.urgencySize')}</span>
        {URGENCIES.map(u => (
          <div key={u.name} style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', marginRight: '0.5rem' }}>
            <div className="size-dot" style={{ width: u.size, height: u.size }} />
            <span style={{ fontSize: '0.7rem' }}>{t(`urg.${u.name}`)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
