import { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  Cell, ResponsiveContainer, CartesianGrid,
} from 'recharts'

const SENTIMENTS = [
  { key: 'POSITIVE', label: 'Positive', cls: 'pos', color: '#10b981', gradient: ['#10b981','#059669'] },
  { key: 'NEGATIVE', label: 'Negative', cls: 'neg', color: '#ef4444', gradient: ['#ef4444','#dc2626'] },
  { key: 'NEUTRAL',  label: 'Neutral',  cls: 'neu', color: '#f59e0b', gradient: ['#f59e0b','#d97706'] },
]

const COMPARE_COLORS = ['#fc2779','#3b82f6','#a855f7']

export default function KeywordsChart({ keywords }) {
  const [mode, setMode]   = useState('single')
  const [active, setActive] = useState('POSITIVE')

  const cfg = SENTIMENTS.find(s => s.key === active)

  // Single view data
  const singleData = (keywords?.[active] || []).slice(0, 15).map(d => ({
    word: d.word, count: d.count,
  }))

  // Compare view — top 10 per class side by side
  const allWords = new Set()
  SENTIMENTS.forEach(s => {
    ;(keywords?.[s.key] || []).slice(0, 8).forEach(d => allWords.add(d.word))
  })
  const compareData = [...allWords].slice(0, 12).map(word => {
    const row = { word }
    SENTIMENTS.forEach(s => {
      const found = (keywords?.[s.key] || []).find(d => d.word === word)
      row[s.key] = found?.count || 0
    })
    return row
  }).sort((a, b) => b.POSITIVE - a.POSITIVE)

  return (
    <div id="keywords" className="section">
      <div className="section-header">
        <div className="section-title">Top Keywords by Sentiment</div>
        <div className="section-sub">
          Frequent terms extracted after TF-IDF preprocessing and stopword removal
        </div>
      </div>

      {/* Mode toggle */}
      <div className="tabs" style={{ marginBottom: 24 }}>
        <button className={`tab ${mode === 'single' ? 'active all' : ''}`} onClick={() => setMode('single')}>
          Per Sentiment
        </button>
        <button className={`tab ${mode === 'compare' ? 'active all' : ''}`} onClick={() => setMode('compare')}>
          Compare All
        </button>
      </div>

      {mode === 'single' ? (
        <div className="card">
          {/* Sentiment tabs */}
          <div className="tabs">
            {SENTIMENTS.map(s => (
              <button
                key={s.key}
                className={`tab ${active === s.key ? `active ${s.cls}` : ''}`}
                onClick={() => setActive(s.key)}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div style={{ color: 'var(--muted)', fontSize: '0.8rem', marginBottom: 20 }}>
            Top 15 most frequent words in{' '}
            <span style={{ color: cfg.color, fontWeight: 600 }}>{active}</span> reviews
          </div>

          <ResponsiveContainer width="100%" height={380}>
            <BarChart data={singleData} layout="vertical" margin={{ left: 16, right: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
              <XAxis type="number" tick={{ fill: 'var(--muted)', fontSize: 11 }}
                axisLine={false} tickLine={false}
                tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
              <YAxis type="category" dataKey="word" width={90}
                tick={{ fill: 'var(--text)', fontSize: 12, fontWeight: 600 }}
                axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#1a1a35', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10 }}
                labelStyle={{ color: 'var(--text)', fontWeight: 700 }}
                formatter={v => [v.toLocaleString(), 'occurrences']}
              />
              <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={22}>
                {singleData.map((_, i) => (
                  <Cell key={i} fill={cfg.color}
                    fillOpacity={1 - i * 0.04}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="card">
          <div style={{ color: 'var(--muted)', fontSize: '0.8rem', marginBottom: 20 }}>
            Shared vocabulary across all three sentiment classes
          </div>
          <ResponsiveContainer width="100%" height={420}>
            <BarChart data={compareData} layout="vertical" barGap={3} margin={{ left: 16, right: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
              <XAxis type="number" tick={{ fill: 'var(--muted)', fontSize: 11 }}
                axisLine={false} tickLine={false}
                tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
              <YAxis type="category" dataKey="word" width={90}
                tick={{ fill: 'var(--text)', fontSize: 12, fontWeight: 600 }}
                axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#1a1a35', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10 }}
                labelStyle={{ color: 'var(--text)', fontWeight: 700 }}
                formatter={(v, n) => [v.toLocaleString(), n]}
              />
              {SENTIMENTS.map((s, i) => (
                <Bar key={s.key} dataKey={s.key} fill={s.color}
                  radius={i === 2 ? [0, 6, 6, 0] : [0, 0, 0, 0]}
                  maxBarSize={16} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
