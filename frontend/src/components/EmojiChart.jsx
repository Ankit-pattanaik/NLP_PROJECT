import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Cell,
} from 'recharts'

const SENT_COLORS = { POSITIVE: '#10b981', NEUTRAL: '#f59e0b', NEGATIVE: '#ef4444' }

export default function EmojiChart({ emojiStats }) {
  const data = ['POSITIVE', 'NEUTRAL', 'NEGATIVE'].map(s => ({
    name:    s,
    'With Emoji':    emojiStats?.[s]?.with    || 0,
    'Without Emoji': emojiStats?.[s]?.without || 0,
  }))

  const pctData = ['POSITIVE', 'NEUTRAL', 'NEGATIVE'].map(s => {
    const w = emojiStats?.[s]?.with    || 0
    const wo = emojiStats?.[s]?.without || 0
    const total = w + wo || 1
    return { name: s, pct: Math.round((w / total) * 100) }
  })

  return (
    <div id="emoji" className="section">
      <div className="section-header">
        <div className="section-title">Emoji Usage Analysis</div>
        <div className="section-sub">
          Emojis are a strong signal — positive reviewers use them far more than negative ones
        </div>
      </div>

      <div className="grid-2">
        {/* Stacked bar */}
        <div className="card">
          <div style={{ fontWeight: 700, marginBottom: 4 }}>Emoji Usage — Absolute Counts</div>
          <div style={{ color: 'var(--muted)', fontSize: '0.8rem', marginBottom: 20 }}>
            Reviews containing at least one emoji character
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: 'var(--muted)', fontSize: 12 }}
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
              <Bar dataKey="With Emoji"    stackId="a" fill="#fc2779" radius={[0,0,0,0]} />
              <Bar dataKey="Without Emoji" stackId="a" fill="rgba(255,255,255,0.08)" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* % emoji usage */}
        <div className="card">
          <div style={{ fontWeight: 700, marginBottom: 4 }}>Emoji Usage Rate (%)</div>
          <div style={{ color: 'var(--muted)', fontSize: '0.8rem', marginBottom: 24 }}>
            Share of reviews containing emojis per sentiment class
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {pctData.map(({ name, pct }) => (
              <div key={name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span className={`badge badge-${name.toLowerCase()}`}>{name}</span>
                  <span style={{ fontWeight: 800, fontSize: '1.1rem', color: SENT_COLORS[name] }}>
                    {pct}%
                  </span>
                </div>
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill"
                    style={{ width: `${pct}%`, background: SENT_COLORS[name] }} />
                </div>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: 24, padding: '12px 16px',
            background: 'rgba(252,39,121,0.06)', borderRadius: 10,
            border: '1px solid rgba(252,39,121,0.15)',
            fontSize: '0.82rem', color: 'var(--muted)', lineHeight: 1.6,
          }}>
            😊 Positive reviewers use emojis <strong style={{ color: 'var(--green)' }}>
              {pctData[0]?.pct || 0}%
            </strong> of the time — suggesting excitement and satisfaction.
            Negative reviewers rarely use emojis ({pctData[2]?.pct || 0}%), preferring text to
            express detailed complaints.
          </div>
        </div>
      </div>
    </div>
  )
}
