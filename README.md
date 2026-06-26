# NykaaSentiment — End-to-End NLP Sentiment Analysis

> **Resume-ready NLP project** · TF-IDF · Logistic Regression · Imbalanced Data · React + Flask

---

## Tech Stack

| Layer      | Technology |
|------------|-----------|
| Backend    | Python · Flask · scikit-learn · imbalanced-learn · pandas |
| ML Model   | TF-IDF (10K features, bigrams) + Logistic Regression (saga) |
| Imbalance  | RandomOverSampler — minority class upsampled to majority count |
| Frontend   | React 18 · Vite · Recharts · Axios |
| Dataset    | 155K train + 38K test Nykaa app reviews (POSITIVE / NEUTRAL / NEGATIVE) |

---

## Quick Start

```bash
# Windows — double-click or run:
start.bat
```

This will:
1. Install Python dependencies (`pip install -r requirements.txt`)
2. Start Flask API on `http://localhost:5000`
3. Install Node dependencies (`npm install`)
4. Start React dashboard on `http://localhost:3000`

> **First startup trains the model** on 155K reviews — expect ~1–2 minutes.  
> A real-time loading screen shows progress steps.

---

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/status` | Model training progress |
| GET | `/api/overview` | Dataset statistics |
| GET | `/api/balance` | Before/after class resampling |
| GET | `/api/wordcloud?sentiment=POSITIVE` | Word frequencies |
| GET | `/api/keywords` | Top 20 keywords per class |
| GET | `/api/length-analysis` | Review length stats |
| GET | `/api/emoji-stats` | Emoji usage per sentiment |
| GET | `/api/model-metrics` | Accuracy, P/R/F1, confusion matrix |
| POST | `/api/predict` | `{ "text": "..." }` → sentiment + probabilities |
| GET | `/api/reviews?sentiment=&page=` | Paginated review browser |

---

## Dashboard Sections

1. **Hero Stats** — Total reviews, train/test split, model accuracy, class distribution bar
2. **Sentiment Distribution** — Donut charts (train/test) + grouped bar comparison
3. **Class Imbalance Handling** — Before/after RandomOverSampler visualization
4. **Word Cloud** — Top 65 words per sentiment, sized by frequency
5. **Top Keywords** — Horizontal bar chart (per-class & compare mode)
6. **Review Length Analysis** — Avg/median length, length bucket distribution
7. **Emoji Analysis** — Emoji usage rate per sentiment class
8. **Model Performance** — Accuracy, per-class P/R/F1 bars, radar chart, confusion matrix, pipeline summary
9. **Live Predictor** — Type any review → instant sentiment + probability breakdown

---

## NLP Pipeline

```
Raw Text
  → Clean (remove emoji, URLs, punctuation, lowercase)
  → TF-IDF Vectorizer (max_features=10000, ngram_range=(1,2), sublinear_tf=True)
  → RandomOverSampler (balance 8:2.3:1 → 1:1:1)
  → Logistic Regression (solver=saga, C=1.0, max_iter=1000)
  → Predict on test set
```

---

## Project Structure

```
nykaa_nlp_project/
├── backend/
│   ├── app.py            ← Flask API + ML pipeline
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx                      ← Main layout + data fetching
│   │   ├── api.js                       ← Axios API calls
│   │   └── components/
│   │       ├── LoadingScreen.jsx
│   │       ├── Navbar.jsx
│   │       ├── HeroStats.jsx
│   │       ├── SentimentDistribution.jsx
│   │       ├── BalanceChart.jsx
│   │       ├── WordCloudViz.jsx
│   │       ├── KeywordsChart.jsx
│   │       ├── LengthCharts.jsx
│   │       ├── EmojiChart.jsx
│   │       ├── ModelMetrics.jsx
│   │       └── Predictor.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── start.bat             ← One-click startup
```
