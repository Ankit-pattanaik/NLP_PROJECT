import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
} from 'recharts'

const COLORS = { POSITIVE: '#10b981', NEUTRAL: '#f59e0b', NEGATIVE: '#ef4444' }

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const d = payload[0]
  return (
    <div style={{
      background: '#1a1a35', border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 10, padding: '10px 16px',
    }}>
      <div style={{ fontWeight: 700, color: d.payload.fill }}>{d.name}</div>
      <div style={{ color: 'var(--text)' }}>{d.value.toLocaleString()} reviews</div>
    </div>
  )
}

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const RADIAN = Math.PI / 180
  const r = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + r * Math.cos(-midAngle * RADIAN)
  const y = cy + r * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central"
      fontSize={13} fontWeight={700}>
      {`${(percent * 100).toFixed(1)}%`}
    </text>
  )
}

export default function SentimentDistribution({ overview }) {
  const trainDist = overview?.train_dist || {}
  const testDist  = overview?.test_dist  || {}

  const trainData = Object.entries(trainDist).map(([name, value]) => ({ name, value }))
  const testData  = Object.entries(testDist).map(([name, value]) => ({ name, value }))

  const barData = ['POSITIVE', 'NEUTRAL', 'NEGATIVE'].map(label => ({
    name: label,
    Train: trainDist[label] || 0,
    Test:  testDist[label]  || 0,
  }))

  return (
    <div id="overview" className="section">
      <div className="section-header">
        <div className="section-title">Sentiment Distribution</div>
        <div className="section-sub">
          Class breakdown across training and test sets — note the heavy class imbalance
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Train pie */}
        <div className="card">
          <div style={{ fontWeight: 700, marginBottom: 4 }}>Training Set</div>
          <div style={{ color: 'var(--muted)', fontSize: '0.8rem', marginBottom: 16 }}>
            {(overview?.total_train || 0).toLocaleString()} reviews
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={trainData} dataKey="value" nameKey="name"
                cx="50%" cy="50%" outerRadius={100} innerRadius={45}
                labelLine={false} label={renderCustomLabel}>
                {trainData.map(e => (
                  <Cell key={e.name} fill={COLORS[e.name]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(v) => <span style={{ color: 'var(--text)', fontSize: '0.82rem' }}>{v}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Test pie */}
        <div className="card">
          <div style={{ fontWeight: 700, marginBottom: 4 }}>Test Set</div>
          <div style={{ color: 'var(--muted)', fontSize: '0.8rem', marginBottom: 16 }}>
            {(overview?.total_test || 0).toLocaleString()} reviews
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={testData} dataKey="value" nameKey="name"
                cx="50%" cy="50%" outerRadius={100} innerRadius={45}
                labelLine={false} label={renderCustomLabel}>
                {testData.map(e => (
                  <Cell key={e.name} fill={COLORS[e.name]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(v) => <span style={{ color: 'var(--text)', fontSize: '0.82rem' }}>{v}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grouped bar */}
      <div className="card">
        <div style={{ fontWeight: 700, marginBottom: 4 }}>Train vs Test — Absolute Counts</div>
        <div style={{ color: 'var(--muted)', fontSize: '0.8rem', marginBottom: 20 }}>
          Verifying consistent class proportions across both splits
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={barData} barGap={6}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" tick={{ fill: 'var(--muted)', fontSize: 13 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'var(--muted)', fontSize: 12 }} axisLine={false} tickLine={false}
              tickFormatter={v => (v / 1000).toFixed(0) + 'k'} />
            <Tooltip
              contentStyle={{ background: '#1a1a35', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10 }}
              labelStyle={{ color: 'var(--text)', fontWeight: 700 }}
              itemStyle={{ color: 'var(--muted)' }}
              formatter={(v, n) => [v.toLocaleString(), n]}
            />
            <Legend formatter={v => <span style={{ color: 'var(--text)', fontSize: '0.82rem' }}>{v}</span>} />
            <Bar dataKey="Train" fill="#fc2779" radius={[6, 6, 0, 0]} maxBarSize={60} />
            <Bar dataKey="Test"  fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={60} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
