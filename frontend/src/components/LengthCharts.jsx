import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, Cell,
} from 'recharts'

const SENT_COLORS = { POSITIVE: '#10b981', NEUTRAL: '#f59e0b', NEGATIVE: '#ef4444' }
const BUCKETS     = ['1–10', '11–30', '31–100', '101–300', '300+']

export default function LengthCharts({ lengthAnalysis }) {
  const stats = lengthAnalysis?.stats       || {}
  const dist  = lengthAnalysis?.distribution || {}

  // Average length bar data
  const avgData = ['POSITIVE', 'NEUTRAL', 'NEGATIVE'].map(s => ({
    name:   s,
    avg:    stats[s]?.avg    || 0,
    median: stats[s]?.median || 0,
  }))

  // Length distribution grouped by bucket
  const bucketData = BUCKETS.map(bucket => {
    const row = { bucket }
    ;['POSITIVE', 'NEUTRAL', 'NEGATIVE'].forEach(s => {
      const item = (dist[s] || []).find(d => d.bucket === bucket)
      row[s] = item?.count || 0
    })
    return row
  })

  // Stats cards
  const statCards = ['POSITIVE', 'NEUTRAL', 'NEGATIVE'].flatMap(s => [
    { label: `Avg (${s})`,    value: stats[s]?.avg    || 0, color: SENT_COLORS[s] },
    { label: `Median (${s})`, value: stats[s]?.median || 0, color: SENT_COLORS[s] },
  ])

  return (
    <div id="length" className="section">
      <div className="section-header">
        <div className="section-title">Review Length Analysis</div>
        <div className="section-sub">
          How verbose are users across different sentiments? Negative reviews tend to be significantly longer.
        </div>
      </div>

      {/* Avg & median stat cards */}
      <div className="grid-3" style={{ marginBottom: 24 }}>
        {['POSITIVE', 'NEUTRAL', 'NEGATIVE'].map(s => (
          <div key={s} className="card" style={{ textAlign: 'center' }}>
            <span className={`badge badge-${s.toLowerCase()}`} style={{ marginBottom: 12 }}>{s}</span>
            <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 8 }}>
              <div>
                <div style={{ color: 'var(--muted)', fontSize: '0.72rem', marginBottom: 4 }}>AVG LENGTH</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: SENT_COLORS[s] }}>
                  {stats[s]?.avg || 0}
                </div>
                <div style={{ color: 'var(--muted)', fontSize: '0.72rem' }}>chars</div>
              </div>
              <div style={{ width: 1, background: 'var(--border)' }} />
              <div>
                <div style={{ color: 'var(--muted)', fontSize: '0.72rem', marginBottom: 4 }}>MEDIAN</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: SENT_COLORS[s] }}>
                  {stats[s]?.median || 0}
                </div>
                <div style={{ color: 'var(--muted)', fontSize: '0.72rem' }}>chars</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        {/* Avg length bar */}
        <div className="card">
          <div style={{ fontWeight: 700, marginBottom: 4 }}>Average vs Median Length</div>
          <div style={{ color: 'var(--muted)', fontSize: '0.8rem', marginBottom: 20 }}>
            Negative reviews are ~4× longer than positive — users write more when unhappy
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={avgData} barGap={6}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: 'var(--muted)', fontSize: 12 }}
                axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--muted)', fontSize: 11 }}
                axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#1a1a35', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10 }}
                labelStyle={{ color: 'var(--text)', fontWeight: 700 }}
                formatter={(v, n) => [`${v} chars`, n]}
              />
              <Legend formatter={v => <span style={{ color: 'var(--text)', fontSize: '0.82rem' }}>{v}</span>} />
              <Bar dataKey="avg"    name="Average" radius={[6,6,0,0]} maxBarSize={50}>
                {avgData.map(d => <Cell key={d.name} fill={SENT_COLORS[d.name]} />)}
              </Bar>
              <Bar dataKey="median" name="Median"  radius={[6,6,0,0]} maxBarSize={50}>
                {avgData.map(d => <Cell key={d.name} fill={SENT_COLORS[d.name]} fillOpacity={0.45} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Bucket distribution */}
        <div className="card">
          <div style={{ fontWeight: 700, marginBottom: 4 }}>Review Length Distribution</div>
          <div style={{ color: 'var(--muted)', fontSize: '0.8rem', marginBottom: 20 }}>
            Most positive reviews are short (1–30 chars) — a word or two like "Love it"
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={bucketData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="bucket" tick={{ fill: 'var(--muted)', fontSize: 11 }}
                axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--muted)', fontSize: 11 }}
                axisLine={false} tickLine={false}
                tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
              <Tooltip
                contentStyle={{ background: '#1a1a35', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10 }}
                labelStyle={{ color: 'var(--text)', fontWeight: 700 }}
                formatter={(v, n) => [v.toLocaleString(), n]}
              />
              <Legend formatter={v => <span style={{ color: 'var(--text)', fontSize: '0.82rem' }}>{v}</span>} />
              {['POSITIVE', 'NEUTRAL', 'NEGATIVE'].map(s => (
                <Bar key={s} dataKey={s} fill={SENT_COLORS[s]} radius={[4,4,0,0]} maxBarSize={28} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insight callout */}
      <div className="card" style={{ marginTop: 24, borderColor: 'rgba(252,39,121,0.25)', background: 'rgba(252,39,121,0.05)' }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          <div style={{ fontSize: '1.5rem' }}>💡</div>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--pink)', marginBottom: 6 }}>Key Insight</div>
            <div style={{ color: 'var(--muted)', fontSize: '0.88rem', lineHeight: 1.7 }}>
              Negative reviews have an average length of <strong style={{ color: 'var(--red)' }}>{stats.NEGATIVE?.avg || 0} chars</strong>{' '}
              vs <strong style={{ color: 'var(--green)' }}>{stats.POSITIVE?.avg || 0} chars</strong> for positive ones.
              This feature (review length) is a strong predictor and was indirectly captured by the TF-IDF bigram model.
              Users are far more descriptive when voicing complaints — a pattern common across e-commerce platforms.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
