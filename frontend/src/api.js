import axios from 'axios'

const BASE = '/api'

export const getStatus        = () => axios.get(`${BASE}/status`).then(r => r.data)
export const getOverview      = () => axios.get(`${BASE}/overview`).then(r => r.data)
export const getBalance       = () => axios.get(`${BASE}/balance`).then(r => r.data)
export const getWordcloud     = (sentiment) => axios.get(`${BASE}/wordcloud`, { params: { sentiment } }).then(r => r.data)
export const getKeywords      = () => axios.get(`${BASE}/keywords`).then(r => r.data)
export const getLengthAnalysis = () => axios.get(`${BASE}/length-analysis`).then(r => r.data)
export const getEmojiStats    = () => axios.get(`${BASE}/emoji-stats`).then(r => r.data)
export const getModelMetrics  = () => axios.get(`${BASE}/model-metrics`).then(r => r.data)
export const predictSentiment = (text) => axios.post(`${BASE}/predict`, { text }).then(r => r.data)
export const getReviews       = (sentiment, page = 1, limit = 8) =>
  axios.get(`${BASE}/reviews`, { params: { sentiment, page, limit } }).then(r => r.data)
