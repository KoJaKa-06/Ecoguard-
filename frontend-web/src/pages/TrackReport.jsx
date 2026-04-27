import { useState } from 'react'
import { lookupReport } from '../api'
import SceneBg from '../components/SceneBg'
import { useLang } from '../i18n'

export default function TrackReport() {
  const { t, lang } = useLang()
  const [cin, setCin] = useState('')
  const [reference, setReference] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function formatDate(d) {
    return new Date(d).toLocaleDateString(lang === 'ar' ? 'ar-MA' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  async function handleSearch(e) {
    e.preventDefault()
    setError('')
    setResult(null)
    if (!cin || !reference) {
      setError(t('track.error.required'))
      return
    }
    setLoading(true)
    try {
      const data = await lookupReport(cin, reference)
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page page-with-scene" style={{ maxWidth: 800, margin: '0 auto' }}>
      <div className="scene-bg"><SceneBg variant="lake" /></div>
      <div className="page-header">
        <h1>{t('track.title')}</h1>
        <p>{t('track.subtitle')}</p>
      </div>

      <form className="card" onSubmit={handleSearch} style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label>{t('track.cin')}</label>
            <input placeholder={t('track.cinPlaceholder')} value={cin} onChange={e => setCin(e.target.value)} />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label>{t('track.reference')}</label>
            <input placeholder={t('track.refPlaceholder')} value={reference} onChange={e => setReference(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginBottom: '0.35rem' }}>
            {loading ? t('track.searching') : t('track.search')}
          </button>
        </div>
      </form>

      {result && (
        <div className="card lookup-result fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem' }}>{t('track.status')}</h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <span className={`badge badge-verification ${result.verification}`}>{t(`ver.${result.verification}`)}</span>
              {result.verification === 'Approved' && (
                <span className={`badge badge-resolution ${result.resolution.replace(/ /g, '-')}`}>{t(`res.${result.resolution}`)}</span>
              )}
            </div>
          </div>

          <div className="result-grid">
            <div className="result-item">
              <label>{t('track.category')}</label>
              <div className="value">{t(`cat.${result.category}`)}</div>
            </div>
            <div className="result-item">
              <label>{t('track.location')}</label>
              <div className="value">{result.location}</div>
            </div>
            <div className="result-item">
              <label>{t('track.submissionDate')}</label>
              <div className="value">{formatDate(result.created_at)}</div>
            </div>
            <div className="result-item">
              <label>{t('track.referenceLabel')}</label>
              <div className="value">{result.reference}</div>
            </div>
            <div className="result-item">
              <label>{t('track.visibility')}</label>
              <div className="value">{result.is_public ? t('track.public') : t('track.notPublic')}</div>
            </div>
            <div className="result-item">
              <label>{t('track.urgency')}</label>
              <div className="value">
                <span className={`badge badge-urgency ${result.urgency || 'Unassigned'}`}>
                  {result.urgency ? t(`urg.${result.urgency}`) : t('track.unassigned')}
                </span>
              </div>
            </div>
          </div>

          {result.public_note && (
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
              <label style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>{t('track.publicInfo')}</label>
              <p style={{ marginTop: '0.25rem', fontSize: '0.9rem', color: '#475569' }}>{result.public_note}</p>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="error-card">
          <div className="icon">&#9888;</div>
          <div style={{ flex: 1 }}>
            <h4>{t('track.notFound')}</h4>
            <p>{t('track.checkInputs')}</p>
          </div>
          <button className="btn btn-secondary" onClick={() => { setError(''); setResult(null) }}>{t('track.searchAgain')}</button>
        </div>
      )}

      {!result && !error && (
        <div className="card" style={{ marginTop: '1rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>{t('track.afterSearch')}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {[
              [t('track.info.verification'), t('track.info.verificationDesc')],
              [t('track.info.resolution'), t('track.info.resolutionDesc')],
              [t('track.info.urgencyLocation'), t('track.info.urgencyLocationDesc')],
              [t('track.info.publicInfo'), t('track.info.publicInfoDesc')],
            ].map(([title, desc]) => (
              <div key={title} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', marginTop: 6, flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{title}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
