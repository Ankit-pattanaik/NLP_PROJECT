import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

const COLORS = { POSITIVE: '#10b981', NEUTRAL: '#f59e0b', NEGATIVE: '#ef4444' }

export default function BalanceChart({ balance }) {
  const before = balance?.before || {}
  const after  = balance?.after  || {}

  const data = ['POSITIVE', 'NEUTRAL', 'NEGATIVE'].map(label => ({
    name:   label,
    Before: before[label] || 0,
    After:  after[label]  || 0,
  }))

  const maxBefore = Math.max(...Object.values(before))
  const maxAfter  = Math.max(...Object.values(after))
  const ratio = maxBefore
    ? (Math.max(...Object.values(before)) / Math.min(...Object.values(before).filter(Boolean))).toFixed(1)
    : 0

  return (
    <div id="balance" className="section">
      <div className="section-header">
        <div className="section-title">Handling Class Imbalance</div>
        <div className="section-sub">
          Dataset is highly skewed — Positive:Negative ratio ≈ {ratio}:1. Fixed with RandomOverSampler.
        </div>
      </div>

      {/* Info cards */}
      <div className="grid-3" style={{ marginBottom: 24 }}>
        {[
          {
            title: 'Problem',
            icon: '⚠️',
            color: '#ef4444',
            desc: `POSITIVE class dominates with ${((before.POSITIVE || 0) /
              ((before.POSITIVE || 0) + (before.NEUTRAL || 0) + (before.NEGATIVE || 0)) * 100).toFixed(0)}% of samples.
              This causes the model to be biased toward majority class.`,
          },
          {
            title: 'Solution',
            icon: '⚖️',
            color: '#f59e0b',
            desc: 'Applied RandomOverSampler from imbalanced-learn library to duplicate minority class samples until all classes are balanced.',
          },
          {
            title: 'Result',
            icon: '✅',
            color: '#10b981',
            desc: `After resampling, all three classes have ${(after.POSITIVE || 0).toLocaleString()} samples — enabling unbiased learning.`,
          },
        ].map(({ title, icon, color, desc }) => (
          <div key={title} className="card">
            <div style={{ fontSize: '1.8rem', marginBottom: 10 }}>{icon}</div>
            <div style={{ fontWeight: 700, color, marginBottom: 8 }}>{title}</div>
            <div style={{ color: 'var(--muted)', fontSize: '0.85rem', lineHeight: 1.6 }}>{desc}</div>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div className="card">
        <div style={{ fontWeight: 700, marginBottom: 4 }}>Sample Count — Before vs After Resampling</div>
        <div style={{ color: 'var(--muted)', fontSize: '0.8rem', marginBottom: 20 }}>
          Technique: <span style={{ color: 'var(--pink)', fontWeight: 600 }}>RandomOverSampler</span> (imbalanced-learn)
          — duplicates minority samples with replacement
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} barGap={8}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" tick={{ fill: 'var(--muted)', fontSize: 13 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'var(--muted)', fontSize: 12 }} axisLine={false} tickLine={false}
              tickFormatter={v => (v / 1000).toFixed(0) + 'k'} />
            <Tooltip
              contentStyle={{ background: '#1a1a35', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10 }}
              labelStyle={{ color: 'var(--text)', fontWeight: 700 }}
              formatter={(v, n) => [v.toLocaleString(), n]}
            />
            <Legend formatter={v => <span style={{ color: 'var(--text)', fontSize: '0.82rem' }}>{v}</span>} />
            <Bar dataKey="Before" fill="rgba(239,68,68,0.7)"  radius={[6, 6, 0, 0]} maxBarSize={70} />
            <Bar dataKey="After"  fill="rgba(16,185,129,0.8)" radius={[6, 6, 0, 0]} maxBarSize={70} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Stats comparison */}
      <div className="grid-3" style={{ marginTop: 24 }}>
        {['NEGATIVE', 'NEUTRAL', 'POSITIVE'].map(cls => (
          <div key={cls} className="card" style={{ textAlign: 'center' }}>
            <div className={`badge badge-${cls.toLowerCase()}`} style={{ marginBottom: 12 }}>
              {cls}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-around', gap: 12 }}>
              <div>
                <div style={{ color: 'var(--muted)', fontSize: '0.75rem', marginBottom: 4 }}>BEFORE</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--red)' }}>
                  {(before[cls] || 0).toLocaleString()}
                </div>
              </div>
              <div style={{ color: 'var(--muted)', fontSize: '1.2rem', alignSelf: 'center' }}>→</div>
              <div>
                <div style={{ color: 'var(--muted)', fontSize: '0.75rem', marginBottom: 4 }}>AFTER</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--green)' }}>
                  {(after[cls] || 0).toLocaleString()}
                </div>
              </div>
            </div>
            <div style={{ marginTop: 10, fontSize: '0.78rem', color: 'var(--muted)' }}>
              {before[cls] && after[cls]
                ? `${((after[cls] / before[cls] - 1) * 100).toFixed(0)}% increase`
                : '—'}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
