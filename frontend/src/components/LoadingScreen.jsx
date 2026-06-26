export default function LoadingScreen({ step }) {
  const steps = [
    'Loading CSV files…',
    'Computing dataset statistics…',
    'Computing word frequencies…',
    'Vectorizing text (TF-IDF)…',
    'Resampling imbalanced data (RandomOverSampler)…',
    'Training Logistic Regression model…',
    'Evaluating model on test set…',
  ]
  const current = steps.findIndex(s => step?.includes(s.slice(0, 15)))
  const pct = current === -1 ? 10 : Math.round(((current + 1) / steps.length) * 95)

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', padding: '32px',
    }}>
      {/* Logo */}
      <div style={{ marginBottom: 32, textAlign: 'center' }}>
        <div style={{
          fontSize: '2.8rem', fontWeight: 900, letterSpacing: '-0.02em',
          background: 'linear-gradient(135deg,#fc2779,#ff6b9d,#ffb800)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text', marginBottom: 8,
        }}>
          NykaaSentiment
        </div>
        <div style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
          NLP · TF-IDF · Logistic Regression · 194K Reviews
        </div>
      </div>

      {/* Spinner */}
      <div style={{ position: 'relative', width: 80, height: 80, marginBottom: 32 }}>
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          border: '3px solid transparent',
          borderTopColor: '#fc2779', borderRightColor: '#ff6b9d',
          animation: 'spin 0.9s linear infinite',
        }} />
        <div style={{
          position: 'absolute', inset: 8, borderRadius: '50%',
          border: '2px solid transparent',
          borderTopColor: '#ffb800',
          animation: 'spin 1.4s linear infinite reverse',
        }} />
      </div>

      {/* Progress bar */}
      <div style={{ width: '100%', maxWidth: 420, marginBottom: 16 }}>
        <div className="progress-bar-bg">
          <div
            className="progress-bar-fill"
            style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#fc2779,#ff6b9d)' }}
          />
        </div>
      </div>

      <div style={{ color: 'var(--muted)', fontSize: '0.9rem', textAlign: 'center', marginBottom: 32 }}>
        {step || 'Initializing…'}
      </div>

      {/* Step checklist */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 400, width: '100%' }}>
        {steps.map((s, i) => {
          const done = i < current || (current === -1 && step === 'Ready')
          const active = i === current
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.75rem', fontWeight: 700,
                background: done ? 'var(--green)' : active ? 'var(--pink)' : 'rgba(255,255,255,0.06)',
                border: active ? '2px solid var(--pink-light)' : 'none',
                boxShadow: active ? '0 0 12px rgba(252,39,121,0.5)' : 'none',
                transition: 'all 0.4s',
              }}>
                {done ? '✓' : i + 1}
              </div>
              <span style={{
                fontSize: '0.8rem',
                color: done ? 'var(--green)' : active ? 'var(--text)' : 'var(--muted)',
                fontWeight: active ? 600 : 400,
              }}>
                {s}
              </span>
            </div>
          )
        })}
      </div>

      <div style={{ color: 'var(--muted)', fontSize: '0.75rem', marginTop: 32, textAlign: 'center' }}>
        First startup trains the model on 155K reviews — typically 1–2 minutes.
      </div>
    </div>
  )
}
