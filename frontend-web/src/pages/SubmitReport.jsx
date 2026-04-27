import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fetchConfig, submitReport } from '../api'
import LocationPicker from '../components/LocationPicker'
import SceneBg from '../components/SceneBg'
import { useLang } from '../i18n'

export default function SubmitReport() {
  const { t } = useLang()
  const [config, setConfig] = useState(null)
  const [form, setForm] = useState({ cin: '', category: '', location: '', description: '', road_details: '' })
  const [coords, setCoords] = useState({ lat: null, lng: null })
  const [images, setImages] = useState([])
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { fetchConfig().then(setConfig) }, [])

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleMapPick(lat, lng) {
    setCoords({ lat, lng })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.cin || !form.category || !form.location || !form.description) {
      setError(t('submit.error.required'))
      return
    }
    if (!coords.lat || !coords.lng) {
      setError(t('submit.error.location'))
      return
    }
    if (form.category === 'Snow Closure' && !form.road_details) {
      setError(t('submit.error.road'))
      return
    }

    setSubmitting(true)
    try {
      const fd = new FormData()
      fd.append('cin', form.cin)
      fd.append('category', form.category)
      fd.append('location', form.location)
      fd.append('description', form.description)
      fd.append('latitude', coords.lat)
      fd.append('longitude', coords.lng)
      if (form.road_details) fd.append('road_details', form.road_details)
      images.forEach(img => fd.append('images', img))

      const res = await submitReport(fd)
      setResult(res)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (result) {
    return (
      <div className="page">
        <div className="success-card card fade-in">
          <div className="checkmark bounce-in">&#10003;</div>
          <h2>{t('submit.success')}</h2>
          <p style={{ color: '#64748b' }}>{t('submit.successText')}</p>
          <div className="reference-box">
            <div>{t('submit.refNumber')}</div>
            <div className="ref-number">{result.reference}</div>
          </div>
          <div className="btn-row">
            <Link to="/" className="btn btn-secondary">{t('submit.returnHome')}</Link>
            <Link to="/track" className="btn btn-primary">{t('submit.trackReport')}</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page page-with-scene fade-in">
      <div className="scene-bg"><SceneBg variant="forest" /></div>
      <div className="page-header">
        <h1>{t('submit.title')}</h1>
        <p>{t('submit.subtitle')}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <div className="card slide-up">
          <h3 style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#64748b' }}>{t('submit.formTitle')}</h3>

          {error && (
            <div className="shake" style={{ background: '#fef2f2', color: '#991b1b', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>{t('submit.cin')} *</label>
                <input name="cin" placeholder={t('submit.cinPlaceholder')} value={form.cin} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>{t('submit.category')} *</label>
                <select name="category" value={form.category} onChange={handleChange}>
                  <option value="">{t('submit.selectCategory')}</option>
                  {config?.categories.map(c => <option key={c} value={c}>{t(`cat.${c}`)}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>{t('submit.locationArea')} *</label>
                <select name="location" value={form.location} onChange={handleChange}>
                  <option value="">{t('submit.selectArea')}</option>
                  {config?.locations.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              {form.category === 'Snow Closure' && (
                <div className="form-group">
                  <label>{t('submit.roadDetails')} *</label>
                  <input name="road_details" placeholder={t('submit.roadPlaceholder')} value={form.road_details} onChange={handleChange} />
                </div>
              )}

              <div className="form-group full">
                <label>{t('submit.exactLocation')} *</label>
                <LocationPicker lat={coords.lat} lng={coords.lng} onPick={handleMapPick} />
                {coords.lat && (
                  <div className="coord-display fade-in" style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#0d9488', fontWeight: 600 }}>
                    {t('submit.pinnedAt')} {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
                  </div>
                )}
              </div>

              <div className="form-group full">
                <label>{t('submit.description')} *</label>
                <textarea name="description" placeholder={t('submit.descriptionPlaceholder')} value={form.description} onChange={handleChange} />
              </div>
              <div className="form-group full">
                <label>{t('submit.images')}</label>
                <div className="image-upload" onClick={() => document.getElementById('file-input').click()}>
                  <input id="file-input" type="file" accept="image/jpeg,image/png" multiple style={{ display: 'none' }}
                    onChange={e => { const files = Array.from(e.target.files).slice(0, 5); setImages(files) }} />
                  {images.length > 0 ? (
                    <div className="fade-in" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                      {images.map((img, i) => (
                        <div key={i} style={{ width: 80, textAlign: 'center' }}>
                          <img src={URL.createObjectURL(img)} alt="" style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 6 }} />
                          <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{img.name}</div>
                        </div>
                      ))}
                      <p style={{ width: '100%', fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>{t('submit.clickToChange')}</p>
                    </div>
                  ) : (
                    <p>{t('submit.clickToAdd')}<br /><small>{t('submit.imagesHint')}</small></p>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <Link to="/" className="btn btn-secondary">{t('submit.cancel')}</Link>
              <button type="submit" className="btn btn-primary btn-pulse" disabled={submitting}>
                {submitting ? t('submit.submitting') : t('submit.submit')}
              </button>
            </div>
          </form>
        </div>

        <div className="card slide-up" style={{ alignSelf: 'flex-start', animationDelay: '0.1s' }}>
          <h3 style={{ marginBottom: '0.75rem', fontSize: '1rem' }}>{t('submit.rules')}</h3>
          <ul style={{ fontSize: '0.85rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.5rem', listStyle: 'disc', paddingLeft: '1.25rem' }}>
            <li>{t('submit.rule1')}</li>
            <li>{t('submit.rule2')}</li>
            <li>{t('submit.rule3')}</li>
            <li>{t('submit.rule4')}</li>
            <li>{t('submit.rule5')}</li>
            <li>{t('submit.rule6')}</li>
          </ul>

          <div style={{ marginTop: '1.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem' }}>
              <div><strong>{t('submit.category')}</strong><br />{form.category ? t(`cat.${form.category}`) : '—'}</div>
              <div><strong>{t('submit.summary.images')}</strong><br />{images.length || t('submit.summary.optional')}</div>
              <div><strong>{t('submit.summary.reference')}</strong><br />{t('submit.summary.generated')}</div>
              <div><strong>{t('submit.summary.visibility')}</strong><br />{t('submit.summary.offByDefault')}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
