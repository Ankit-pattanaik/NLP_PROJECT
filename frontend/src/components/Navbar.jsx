import { useState, useEffect } from 'react'

const LINKS = [
  { href: '#overview',   label: 'Overview' },
  { href: '#balance',    label: 'Balancing' },
  { href: '#wordcloud',  label: 'Word Cloud' },
  { href: '#keywords',   label: 'Keywords' },
  { href: '#length',     label: 'Length' },
  { href: '#metrics',    label: 'Metrics' },
  { href: '#predictor',  label: 'Predict' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      padding: '12px 32px',
      background: scrolled ? 'rgba(8,8,26,0.92)' : 'transparent',
      backdropFilter: scrolled ? 'blur(16px)' : 'none',
      borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      transition: 'all 0.3s',
    }}>
      {/* Brand */}
      <div style={{
        fontWeight: 900, fontSize: '1.3rem', letterSpacing: '-0.02em',
        background: 'linear-gradient(135deg,#fc2779,#ff6b9d)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
      }}>
        NykaaSentiment
      </div>

      {/* Links */}
      <div style={{ display: 'flex', gap: 4 }}>
        {LINKS.map(l => (
          <a key={l.href} href={l.href} style={{
            padding: '6px 14px', borderRadius: 99,
            fontSize: '0.82rem', fontWeight: 500,
            color: 'var(--muted)', textDecoration: 'none',
            transition: 'color 0.2s, background 0.2s',
          }}
          onMouseEnter={e => { e.target.style.color = 'var(--text)'; e.target.style.background = 'rgba(255,255,255,0.06)' }}
          onMouseLeave={e => { e.target.style.color = 'var(--muted)'; e.target.style.background = 'transparent' }}
          >
            {l.label}
          </a>
        ))}
      </div>

      {/* Tag */}
      <div style={{
        padding: '5px 14px', borderRadius: 99,
        background: 'rgba(252,39,121,0.12)', color: 'var(--pink)',
        border: '1px solid rgba(252,39,121,0.3)',
        fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em',
      }}>
        NLP PROJECT
      </div>
    </nav>
  )
}
