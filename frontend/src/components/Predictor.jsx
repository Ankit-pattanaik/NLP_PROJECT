import { useState, useRef } from 'react'
import { predictSentiment } from '../api'

const EMOJI   = { POSITIVE: '😊', NEGATIVE: '😠', NEUTRAL: '😐' }
const LABELS  = { POSITIVE: 'Positive', NEGATIVE: 'Negative', NEUTRAL: 'Neutral' }
const COLORS  = { POSITIVE: '#10b981', NEGATIVE: '#ef4444', NEUTRAL: '#f59e0b' }
const BADGES  = { POSITIVE: 'badge-positive', NEGATIVE: 'badge-negative', NEUTRAL: 'badge-neutral' }

const EXAMPLES = [
  { text: 'Absolutely love Nykaa! Amazing products and super fast delivery every time 😍',    label: 'POSITIVE' },
  { text: 'Worst experience ever. Ordered 10 days ago, still not delivered. No refund.',       label: 'NEGATIVE' },
  { text: 'Okay app. Some products are good, some are not. Delivery was on time.',             label: 'NEUTRAL' },
  { text: 'Best beauty app in India. Genuine products with great discounts! Highly recommend', label: 'POSITIVE' },
  { text: 'My order was cancelled without any reason. Customer service is very bad.',          label: 'NEGATIVE' },
  { text: 'Good collection of makeup products. Would be better with more offers.',             label: 'NEUTRAL' },
]

export default function Predictor() {
  const [text, setText]       = useState('')
  const [result, setResult]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const textRef = useRef()

  const predict = async () => {
    if (!text.trim()) { setError('Please enter a review.'); return }
    setError('')
    setLoading(true)
    setResult(null)
    try {
      const data = await predictSentiment(text)
      if (data.error) { setError(data.error); return }
      setResult(data)
    } catch (e) {
      setError(e.response?.data?.error || 'Prediction failed. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  const useExample = (ex) => {
    setText(ex.text)
    setResult(null)
    setError('')
    textRef.current?.focus()
  }

  const sentiment = result?.sentiment
  const color     = sentiment ? COLORS[sentiment] : 'var(--pink)'

  return (
    <div id="predictor" className="section" style={{ paddingBottom: 100 }}>
      <div className="section-header">
        <div className="section-title">Live Sentiment Predictor</div>
        <div className="section-sub">
          Type any Nykaa app review and get an instant sentiment prediction from the trained model
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* Input panel */}
        <div className="card">
          <div style={{ fontWeight: 700, marginBottom: 16 }}>Enter a Review</div>

          <textarea
            ref={textRef}
            className="predict-textarea"
            rows={5}
            placeholder="e.g. Love the products! Fast delivery and genuine items. Will definitely order again 😊"
            value={text}
            onChange={e => { setText(e.target.value); setResult(null); setError('') }}
            onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) predict() }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, marginBottom: 20 }}>
            <span style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>
              {text.length} chars · Ctrl+Enter to predict
            </span>
            <button
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--muted)', fontSize: '0.78rem', padding: 0,
              }}
              onClick={() => { setText(''); setResult(null); setError('') }}
            >
              Clear
            </button>
          </div>

          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: '1rem' }}
            onClick={predict} disabled={loading || !text.trim()}>
            {loading
              ? <><span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Analyzing…</>
              : '⚡ Predict Sentiment'
            }
          </button>

          {error && (
            <div style={{
              marginTop: 12, padding: '10px 14px', borderRadius: 10,
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              color: '#ef4444', fontSize: '0.85rem',
            }}>
              {error}
            </div>
          )}

          {/* Example reviews */}
          <div style={{ marginTop: 24 }}>
            <div style={{ color: 'var(--muted)', fontSize: '0.75rem', fontWeight: 600, marginBottom: 10 }}>
              TRY AN EXAMPLE
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {EXAMPLES.map((ex, i) => (
                <button key={i} onClick={() => useExample(ex)}
                  style={{
                    background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)',
                    borderRadius: 10, padding: '10px 14px', cursor: 'pointer',
                    textAlign: 'left', transition: 'all 0.2s', color: 'var(--text)',
                    fontSize: '0.82rem', lineHeight: 1.4,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS[ex.label]; e.currentTarget.style.background = `${COLORS[ex.label]}0d` }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'rgba(0,0,0,0.2)' }}
                >
                  <span className={`badge ${BADGES[ex.label]}`} style={{ marginRight: 8, fontSize: '0.65rem' }}>
                    {ex.label}
                  </span>
                  {ex.text.length > 70 ? ex.text.slice(0, 70) + '…' : ex.text}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Result panel */}
        <div className="card" style={{
          borderColor: result ? `${color}40` : 'var(--border)',
          boxShadow: result ? `0 0 40px ${color}20` : 'none',
          transition: 'all 0.5s',
          minHeight: 400,
          display: 'flex', flexDirection: 'column',
        }}>
          {!result && !loading && (
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              color: 'var(--muted)', gap: 12,
            }}>
              <div style={{ fontSize: '3rem', opacity: 0.3 }}>🤔</div>
              <div style={{ fontSize: '0.9rem' }}>Prediction will appear here</div>
            </div>
          )}

          {loading && (
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 16,
            }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                border: '3px solid transparent',
                borderTopColor: 'var(--pink)', borderRightColor: '#ff6b9d',
                animation: 'spin 0.8s linear infinite',
              }} />
              <div style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Running NLP pipeline…</div>
            </div>
          )}

          {result && (
            <div style={{ animation: 'fadeUp 0.4s ease' }}>
              {/* Main result */}
              <div style={{ textAlign: 'center', marginBottom: 32 }}>
                <div style={{ fontSize: '4rem', marginBottom: 8 }}>
                  {EMOJI[sentiment]}
                </div>
                <div style={{
                  fontSize: '2.2rem', fontWeight: 900, color,
                  textShadow: `0 0 30px ${color}60`,
                  marginBottom: 8,
                }}>
                  {LABELS[sentiment]}
                </div>
                <div style={{
                  display: 'inline-block', padding: '4px 16px',
                  background: `${color}18`, border: `1px solid ${color}40`,
                  borderRadius: 99, color, fontSize: '0.85rem', fontWeight: 700,
                }}>
                  {result.confidence}% confident
                </div>
              </div>

              {/* Probability bars */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ color: 'var(--muted)', fontSize: '0.75rem', fontWeight: 600, marginBottom: 12 }}>
                  PROBABILITY BREAKDOWN
                </div>
                {['POSITIVE', 'NEUTRAL', 'NEGATIVE'].map(cls => {
                  const pct = result.probabilities?.[cls] || 0
                  return (
                    <div key={cls} style={{ marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: '1rem' }}>{EMOJI[cls]}</span>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: COLORS[cls] }}>
                            {LABELS[cls]}
                          </span>
                        </div>
                        <span style={{ fontWeight: 800, color: COLORS[cls], fontSize: '0.9rem' }}>
                          {pct}%
                        </span>
                      </div>
                      <div className="progress-bar-bg">
                        <div className="progress-bar-fill"
                          style={{
                            width: `${pct}%`,
                            background: cls === sentiment
                              ? COLORS[cls]
                              : `${COLORS[cls]}55`,
                            boxShadow: cls === sentiment ? `0 0 10px ${COLORS[cls]}80` : 'none',
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Review echo */}
              <div style={{
                padding: '12px 16px', borderRadius: 10,
                background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border)',
              }}>
                <div style={{ color: 'var(--muted)', fontSize: '0.72rem', marginBottom: 6 }}>YOUR REVIEW</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.6, fontStyle: 'italic' }}>
                  "{text.length > 140 ? text.slice(0, 140) + '…' : text}"
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
