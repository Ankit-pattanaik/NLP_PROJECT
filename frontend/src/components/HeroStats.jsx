import { useEffect, useRef, useState } from 'react'

function AnimatedNumber({ target, duration = 1500, suffix = '' }) {
  const [val, setVal] = useState(0)
  const ref = useRef(null)

  useEffect(() => {
    if (!target) return
    const start = Date.now()
    const tick = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setVal(Math.round(eased * target))
      if (progress < 1) ref.current = requestAnimationFrame(tick)
    }
    ref.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(ref.current)
  }, [target, duration])

  return <>{val.toLocaleString()}{suffix}</>
}

const CARD_CONFIGS = [
  { key: 'total',       label: 'Total Reviews',  color: '#fc2779', glowColor: '#fc2779' },
  { key: 'total_train', label: 'Training Set',   color: '#3b82f6', glowColor: '#3b82f6' },
  { key: 'total_test',  label: 'Test Set',       color: '#a855f7', glowColor: '#a855f7' },
  { key: 'accuracy',    label: 'Model Accuracy', color: '#10b981', glowColor: '#10b981', suffix: '%' },
]

export default function HeroStats({ overview, accuracy }) {
  const values = {
    total:       overview?.total       || 0,
    total_train: overview?.total_train || 0,
    total_test:  overview?.total_test  || 0,
    accuracy:    accuracy              || 0,
  }

  const dist = overview?.train_dist || {}
  const total = values.total_train || 1

  return (
    <div style={{ paddingTop: 110, paddingBottom: 60, maxWidth: 1200, margin: '0 auto', padding: '110px 24px 60px' }}>
      {/* Hero heading */}
      <div style={{ textAlign: 'center', marginBottom: 56 }}>
        <div style={{
          display: 'inline-block', padding: '6px 18px', borderRadius: 99,
          background: 'rgba(252,39,121,0.12)', color: 'var(--pink)',
          border: '1px solid rgba(252,39,121,0.3)',
          fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.1em',
          marginBottom: 20, textTransform: 'uppercase',
        }}>
          NLP · Sentiment Analysis · Nykaa App Reviews
        </div>
        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900,
          lineHeight: 1.1, marginBottom: 16, letterSpacing: '-0.03em',
        }}>
          <span style={{
            background: 'linear-gradient(135deg,#fc2779 0%,#ff6b9d 50%,#ffb800 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>Understanding Customer Sentiment</span>
          <br />
          <span style={{ color: 'var(--text)' }}>on India's #1 Beauty App</span>
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '1.05rem', maxWidth: 600, margin: '0 auto' }}>
          End-to-end NLP pipeline with TF-IDF vectorization, imbalance handling via RandomOverSampler,
          and Logistic Regression trained on 155K+ reviews.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid-4 fade-up">
        {CARD_CONFIGS.map(({ key, label, color, glowColor, suffix }) => (
          <div key={key} className="stat-card">
            <div className="glow" style={{ background: glowColor }} />
            <div className="label">{label}</div>
            <div className="value" style={{ color }}>
              <AnimatedNumber target={values[key]} suffix={suffix || ''} />
            </div>
            {key === 'total' && (
              <div className="sub">Train + Test combined</div>
            )}
            {key === 'accuracy' && (
              <div className="sub">On held-out test set</div>
            )}
          </div>
        ))}
      </div>

      {/* Class distribution bar */}
      <div className="card fade-up fade-up-2" style={{ marginTop: 24 }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: 12, fontWeight: 600 }}>
          TRAINING SET CLASS DISTRIBUTION
        </div>
        <div style={{ display: 'flex', height: 12, borderRadius: 99, overflow: 'hidden', gap: 2, marginBottom: 16 }}>
          {[
            { label: 'POSITIVE', color: 'var(--green)' },
            { label: 'NEUTRAL',  color: 'var(--amber)' },
            { label: 'NEGATIVE', color: 'var(--red)' },
          ].map(({ label, color }) => (
            <div key={label} style={{
              flex: dist[label] || 0,
              background: color,
              transition: 'flex 1s ease',
            }} />
          ))}
        </div>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          {[
            { label: 'POSITIVE', color: 'var(--green)',  cls: 'badge-positive' },
            { label: 'NEUTRAL',  color: 'var(--amber)',  cls: 'badge-neutral' },
            { label: 'NEGATIVE', color: 'var(--red)',    cls: 'badge-negative' },
          ].map(({ label, color, cls }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className={`badge ${cls}`}>{label}</span>
              <span style={{ fontWeight: 700, color }}>{(dist[label] || 0).toLocaleString()}</span>
              <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>
                ({total > 0 ? ((dist[label] || 0) / total * 100).toFixed(1) : 0}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
