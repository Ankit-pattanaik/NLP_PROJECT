import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

const SENT_COLORS = { POSITIVE: '#10b981', NEUTRAL: '#f59e0b', NEGATIVE: '#ef4444' }

function ConfusionMatrix({ cm, labels }) {
  if (!cm?.length) return null
  const max = Math.max(...cm.flat())

  return (
    <div>
      <div style={{ color: 'var(--muted)', fontSize: '0.75rem', fontWeight: 600, marginBottom: 12 }}>
        CONFUSION MATRIX  ·  Rows = Actual  ·  Cols = Predicted
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: `80px repeat(${labels.length}, 1fr)`, gap: 4 }}>
        {/* Header row */}
        <div />
        {labels.map(l => (
          <div key={l} style={{
            textAlign: 'center', fontSize: '0.7rem', fontWeight: 700,
            color: SENT_COLORS[l], padding: '4px 0',
          }}>{l.slice(0, 3)}</div>
        ))}
        {/* Data rows */}
        {cm.map((row, i) => (
          <>
            <div key={`lbl-${i}`} style={{
              display: 'flex', alignItems: 'center',
              fontSize: '0.7rem', fontWeight: 700,
              color: SENT_COLORS[labels[i]],
              paddingRight: 8,
            }}>
              {labels[i].slice(0, 3)}
            </div>
            {row.map((val, j) => {
              const isDiag = i === j
              const alpha  = 0.1 + (val / max) * 0.8
              return (
                <div key={`${i}-${j}`}
                  className="cm-cell"
                  style={{
                    aspectRatio: '1',
                    background: isDiag
                      ? `rgba(16,185,129,${alpha})`
                      : `rgba(239,68,68,${val > 0 ? alpha * 0.6 : 0})`,
                    border: isDiag
                      ? '1px solid rgba(16,185,129,0.4)'
                      : '1px solid rgba(255,255,255,0.04)',
                    color: isDiag ? '#10b981' : val > 0 ? '#ef4444' : 'var(--muted)',
                    fontSize: val > 9999 ? '0.75rem' : '0.9rem',
                  }}
                  title={`Actual: ${labels[i]} → Predicted: ${labels[j]}: ${val.toLocaleString()}`}
                >
                  {val >= 1000 ? `${(val/1000).toFixed(1)}k` : val}
                </div>
              )
            })}
          </>
        ))}
      </div>
    </div>
  )
}

export default function ModelMetrics({ modelMetrics }) {
  if (!modelMetrics) return null
  const { accuracy, metrics, confusion_matrix, labels } = modelMetrics

  // Radar chart data
  const radarData = ['precision', 'recall', 'f1'].map(metric => {
    const row = { metric: metric.charAt(0).toUpperCase() + metric.slice(1) }
    metrics?.forEach(m => { row[m.class] = m[metric] })
    return row
  })

  return (
    <div id="metrics" className="section">
      <div className="section-header">
        <div className="section-title">Model Performance</div>
        <div className="section-sub">
          Word TF-IDF (20K) + Char TF-IDF (30K) + hand-crafted features → LinearSVC with class_weight=balanced
        </div>
      </div>

      {/* Accuracy banner */}
      <div className="card" style={{
        marginBottom: 24, textAlign: 'center',
        borderColor: 'rgba(16,185,129,0.3)',
        background: 'rgba(16,185,129,0.05)',
        boxShadow: '0 0 40px rgba(16,185,129,0.1)',
      }}>
        <div style={{ color: 'var(--muted)', fontSize: '0.8rem', marginBottom: 8 }}>
          OVERALL TEST ACCURACY
        </div>
        <div style={{
          fontSize: '4rem', fontWeight: 900, color: '#10b981',
          textShadow: '0 0 40px rgba(16,185,129,0.5)',
        }}>
          {accuracy}%
        </div>
        <div style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: 8 }}>
          Evaluated on {(modelMetrics?.metrics?.reduce((s, m) => s + m.support, 0) || 0).toLocaleString()} held-out test samples
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Per-class metrics */}
        <div className="card">
          <div style={{ fontWeight: 700, marginBottom: 20 }}>Per-Class Metrics</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {metrics?.map(m => (
              <div key={m.class}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span className={`badge badge-${m.class.toLowerCase()}`}>{m.class}</span>
                  <span style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>
                    {m.support.toLocaleString()} samples
                  </span>
                </div>
                {['precision', 'recall', 'f1'].map(metric => (
                  <div key={metric} style={{ marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'capitalize' }}>
                        {metric === 'f1' ? 'F1 Score' : metric}
                      </span>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: SENT_COLORS[m.class] }}>
                        {m[metric]}%
                      </span>
                    </div>
                    <div className="progress-bar-bg">
                      <div className="progress-bar-fill"
                        style={{ width: `${m[metric]}%`, background: SENT_COLORS[m.class] }} />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Radar chart */}
        <div className="card">
          <div style={{ fontWeight: 700, marginBottom: 20 }}>Metrics Radar</div>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius={100}>
              <PolarGrid stroke="rgba(255,255,255,0.08)" />
              <PolarAngleAxis dataKey="metric"
                tick={{ fill: 'var(--muted)', fontSize: 13, fontWeight: 600 }} />
              <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
              {['POSITIVE', 'NEUTRAL', 'NEGATIVE'].map(s => (
                <Radar key={s} name={s} dataKey={s}
                  stroke={SENT_COLORS[s]} fill={SENT_COLORS[s]} fillOpacity={0.12}
                  strokeWidth={2} dot={{ fill: SENT_COLORS[s], r: 4 }} />
              ))}
              <Tooltip
                contentStyle={{ background: '#1a1a35', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10 }}
                formatter={(v, n) => [`${v}%`, n]}
              />
              <Legend formatter={v => <span style={{ color: 'var(--text)', fontSize: '0.82rem' }}>{v}</span>} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Confusion matrix */}
      <div className="card">
        <ConfusionMatrix cm={confusion_matrix} labels={labels || []} />
      </div>

      {/* Pipeline summary */}
      <div className="card" style={{ marginTop: 24 }}>
        <div style={{ fontWeight: 700, marginBottom: 16, color: 'var(--pink)' }}>
          🔬 NLP Pipeline Summary
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[
            { step: '1', title: 'Data Loading',        desc: '155K train + 38K test Nykaa app reviews',                   color: '#3b82f6' },
            { step: '2', title: 'Text Cleaning',        desc: 'Strip emoji/URLs, normalize repeated chars (loove→love)',   color: '#a855f7' },
            { step: '3', title: 'Word TF-IDF',          desc: '20K features, unigram+bigram, sublinear TF',               color: '#f59e0b' },
            { step: '4', title: 'Char TF-IDF',          desc: '30K features, 3–5 char n-grams (catches typos/Hinglish)',  color: '#fc2779' },
            { step: '5', title: 'Hand-crafted Features',desc: 'Length, caps ratio, exclamation density, emoji flag',      color: '#06b6d4' },
            { step: '6', title: 'LinearSVC + Platt',    desc: 'class_weight=balanced + CalibratedClassifierCV (σ)',       color: '#10b981' },
          ].map(({ step, title, desc, color }) => (
            <div key={step} style={{
              flex: '1 1 160px', padding: '16px', borderRadius: 12,
              background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)',
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', background: color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: '0.8rem', marginBottom: 10,
              }}>
                {step}
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 4 }}>{title}</div>
              <div style={{ color: 'var(--muted)', fontSize: '0.78rem', lineHeight: 1.5 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
