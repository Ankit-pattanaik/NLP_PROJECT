import { useState, useEffect } from 'react'
import { getWordcloud } from '../api'

const PALETTE = [
  '#fc2779','#ff6b9d','#ffb800','#3b82f6','#a855f7',
  '#10b981','#f97316','#06b6d4','#ec4899','#84cc16',
]

const SENTIMENTS = [
  { key: 'POSITIVE', label: 'Positive Reviews', cls: 'pos', color: '#10b981' },
  { key: 'NEGATIVE', label: 'Negative Reviews', cls: 'neg', color: '#ef4444' },
  { key: 'NEUTRAL',  label: 'Neutral Reviews',  cls: 'neu', color: '#f59e0b' },
]

function WordCloud({ words }) {
  if (!words.length) return null
  const maxVal = Math.max(...words.map(w => w.value))
  const minVal = Math.min(...words.map(w => w.value))

  const getSize = (val) => {
    const normalized = (Math.log(val + 1) - Math.log(minVal + 1)) /
      (Math.log(maxVal + 1) - Math.log(minVal + 1) || 1)
    return Math.round(12 + normalized * 38)
  }

  // Shuffle for visual variety
  const shuffled = [...words].sort(() => Math.sin(words.indexOf(words[0])) - 0.5)

  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap', gap: '10px 18px',
      padding: '32px 24px', justifyContent: 'center', alignItems: 'center',
      minHeight: 300, background: 'rgba(0,0,0,0.2)', borderRadius: 12,
    }}>
      {shuffled.slice(0, 65).map((word, i) => {
        const size = getSize(word.value)
        const color = PALETTE[i % PALETTE.length]
        return (
          <span
            key={word.text}
            title={`"${word.text}" — ${word.value.toLocaleString()} occurrences`}
            style={{
              fontSize: size,
              color,
              fontWeight: size > 32 ? 900 : size > 22 ? 700 : size > 16 ? 500 : 400,
              opacity: 0.55 + (size / 50) * 0.45,
              cursor: 'default',
              transition: 'transform 0.18s, opacity 0.18s',
              lineHeight: 1.3,
              userSelect: 'none',
              textShadow: size > 28 ? `0 0 24px ${color}55` : 'none',
              letterSpacing: size > 24 ? '-0.02em' : 'normal',
            }}
            onMouseEnter={e => {
              e.target.style.transform = 'scale(1.18)'
              e.target.style.opacity = '1'
              e.target.style.textShadow = `0 0 20px ${color}`
            }}
            onMouseLeave={e => {
              e.target.style.transform = 'scale(1)'
              e.target.style.opacity = String(0.55 + (size / 50) * 0.45)
              e.target.style.textShadow = size > 28 ? `0 0 24px ${color}55` : 'none'
            }}
          >
            {word.text}
          </span>
        )
      })}
    </div>
  )
}

export default function WordCloudViz() {
  const [active, setActive]   = useState('POSITIVE')
  const [words, setWords]     = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    getWordcloud(active)
      .then(setWords)
      .finally(() => setLoading(false))
  }, [active])

  const activeCfg = SENTIMENTS.find(s => s.key === active)

  return (
    <div id="wordcloud" className="section">
      <div className="section-header">
        <div className="section-title">Word Cloud</div>
        <div className="section-sub">
          Most frequent words per sentiment class — stopwords removed
        </div>
      </div>

      <div className="card">
        {/* Tabs */}
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

        {/* Legend note */}
        <div style={{ color: 'var(--muted)', fontSize: '0.8rem', marginBottom: 16 }}>
          Word size ∝ frequency &nbsp;·&nbsp; Hover for exact count &nbsp;·&nbsp;
          <span style={{ color: activeCfg.color, fontWeight: 600 }}>
            {active} reviews
          </span>
        </div>

        {/* Cloud */}
        {loading ? (
          <div style={{
            minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--muted)',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              border: '3px solid transparent',
              borderTopColor: activeCfg.color,
              animation: 'spin 0.8s linear infinite',
              marginRight: 12,
            }} />
            Loading word cloud…
          </div>
        ) : (
          <WordCloud words={words} />
        )}

        {/* Top 10 bar */}
        {!loading && words.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <div style={{ color: 'var(--muted)', fontSize: '0.78rem', fontWeight: 600, marginBottom: 12 }}>
              TOP 10 WORDS
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {words.slice(0, 10).map((word, i) => {
                const pct = Math.round((word.value / words[0].value) * 100)
                const color = PALETTE[i % PALETTE.length]
                return (
                  <div key={word.text} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ width: 90, fontSize: '0.82rem', fontWeight: 600, color }}>{word.text}</span>
                    <div style={{ flex: 1 }}>
                      <div className="progress-bar-bg">
                        <div className="progress-bar-fill" style={{ width: `${pct}%`, background: color }} />
                      </div>
                    </div>
                    <span style={{ width: 60, fontSize: '0.78rem', color: 'var(--muted)', textAlign: 'right' }}>
                      {word.value.toLocaleString()}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
