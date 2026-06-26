import { useEffect, useState, useCallback } from 'react'
import * as api from './api'

import LoadingScreen          from './components/LoadingScreen'
import Navbar                 from './components/Navbar'
import HeroStats              from './components/HeroStats'
import SentimentDistribution  from './components/SentimentDistribution'
import BalanceChart           from './components/BalanceChart'
import WordCloudViz           from './components/WordCloudViz'
import KeywordsChart          from './components/KeywordsChart'
import LengthCharts           from './components/LengthCharts'
import EmojiChart             from './components/EmojiChart'
import ModelMetrics           from './components/ModelMetrics'
import Predictor              from './components/Predictor'

export default function App() {
  const [status,   setStatus]   = useState({ ready: false, step: 'Connecting to backend…' })
  const [data,     setData]     = useState({
    overview: null, balance: null, keywords: null,
    lengthAnalysis: null, emojiStats: null, modelMetrics: null,
  })

  // Poll backend until ready
  useEffect(() => {
    let interval
    const poll = async () => {
      try {
        const s = await api.getStatus()
        setStatus(s)
        if (s.ready) {
          clearInterval(interval)
          loadAll()
        }
      } catch {
        setStatus({ ready: false, step: 'Waiting for backend to start…' })
      }
    }
    poll()
    interval = setInterval(poll, 2500)
    return () => clearInterval(interval)
  }, [])

  const loadAll = useCallback(async () => {
    const [overview, balance, keywords, lengthAnalysis, emojiStats, modelMetrics] =
      await Promise.all([
        api.getOverview(),
        api.getBalance(),
        api.getKeywords(),
        api.getLengthAnalysis(),
        api.getEmojiStats(),
        api.getModelMetrics(),
      ])
    setData({ overview, balance, keywords, lengthAnalysis, emojiStats, modelMetrics })
  }, [])

  if (!status.ready) return <LoadingScreen step={status.step} />

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />

      {/* ── Hero ── */}
      <HeroStats
        overview={data.overview}
        accuracy={data.modelMetrics?.accuracy}
      />

      <div className="divider" />

      {/* ── Sentiment Distribution ── */}
      <SentimentDistribution overview={data.overview} />

      <div className="divider" />

      {/* ── Imbalance Handling ── */}
      <BalanceChart balance={data.balance} />

      <div className="divider" />

      {/* ── Word Cloud ── */}
      <WordCloudViz />

      <div className="divider" />

      {/* ── Keywords ── */}
      <KeywordsChart keywords={data.keywords} />

      <div className="divider" />

      {/* ── Length Analysis ── */}
      <LengthCharts lengthAnalysis={data.lengthAnalysis} />

      <div className="divider" />

      {/* ── Emoji Analysis ── */}
      <EmojiChart emojiStats={data.emojiStats} />

      <div className="divider" />

      {/* ── Model Metrics ── */}
      <ModelMetrics modelMetrics={data.modelMetrics} />

      <div className="divider" />

      {/* ── Predictor ── */}
      <Predictor />

      {/* Footer */}
      <div style={{
        textAlign: 'center', padding: '32px 24px',
        color: 'var(--muted)', fontSize: '0.8rem',
        borderTop: '1px solid var(--border)',
      }}>
        NykaaSentiment · TF-IDF + Logistic Regression · imbalanced-learn · React + Flask
        <br />
        <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.72rem' }}>
          Built as an end-to-end NLP project on 194K+ Nykaa app reviews
        </span>
      </div>
    </div>
  )
}
