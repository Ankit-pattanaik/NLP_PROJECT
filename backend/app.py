import os, re, threading
from collections import Counter
from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import numpy as np
from scipy.sparse import hstack, csr_matrix
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import LinearSVC
from sklearn.calibration import CalibratedClassifierCV
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.pipeline import Pipeline

app = Flask(__name__)
CORS(app)

# ── PATHS ─────────────────────────────────────────────────────────────────────
BASE     = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE, "..", "..", "APP")

LABELS    = {"POSITIVE", "NEUTRAL", "NEGATIVE"}
LABEL_MAP = {"NEGATIVE": 0, "NEUTRAL": 1, "POSITIVE": 2}
REV_LABEL = {v: k for k, v in LABEL_MAP.items()}

STOPWORDS = set([
    "the","is","a","an","i","it","in","to","and","of","for","on","this","that",
    "with","my","are","was","have","not","so","but","app","nykaa","be","very",
    "really","me","they","you","we","all","at","by","from","just","can","its",
    "had","has","as","or","do","did","more","no","what","get","got","when","if",
    "he","she","their","there","will","been","one","about","your","even","after",
    "also","too","use","using","would","could","should","which","am","let","please",
    "dont","nt","our","his","her","us","than","only","now","some","like",
    "much","well","into","over","such","while","them","these","those","then","here","where",
])

# ── GLOBAL STATE ──────────────────────────────────────────────────────────────
_status         = {"ready": False, "step": "Starting up..."}
_word_vec       = None   # word-level TF-IDF
_char_vec       = None   # char-level TF-IDF
_model          = None   # CalibratedClassifierCV(LinearSVC)
_model_acc      = 0.0
_report         = {}
_cm             = []
_before_balance = {}
_after_balance  = {}
_train_df       = None
_test_df        = None
_overview       = {}
_wc_data        = {}
_kw_data        = {}
_len_data       = {}
_emoji_data     = {}
_len_dist       = {}

# ── TEXT HELPERS ──────────────────────────────────────────────────────────────
def normalize_repeated(text):
    """loooove → loove  (max 2 consecutive identical chars)"""
    return re.sub(r'(.)\1{2,}', r'\1\1', text)

def clean_text(text):
    if not isinstance(text, str):
        return ""
    text = re.sub(r"[^\x00-\x7F]+", " ", text)    # strip emoji/unicode
    text = re.sub(r"http\S+|www\S+", " ", text)    # strip URLs
    text = normalize_repeated(text)                 # loooove → loove
    text = re.sub(r"[^a-zA-Z\s]", " ", text)       # letters only
    text = re.sub(r"\s+", " ", text)
    return text.lower().strip()

def has_emoji(text):
    return bool(re.search(r"[^\x00-\x7F]", text)) if isinstance(text, str) else False

def top_words(texts, n=80):
    words = []
    for t in texts:
        words.extend([w for w in re.findall(r"[a-zA-Z]+", t.lower())
                      if len(w) > 2 and w not in STOPWORDS])
    return Counter(words).most_common(n)

BUCKET_ORDER = ["1–10", "11–30", "31–100", "101–300", "300+"]

def length_bucket(l):
    if l <= 10:  return "1–10"
    if l <= 30:  return "11–30"
    if l <= 100: return "31–100"
    if l <= 300: return "101–300"
    return "300+"

# ── FEATURE BUILDER ───────────────────────────────────────────────────────────
def build_features(texts, fit=False):
    """
    Stack three feature sets:
      1. Word TF-IDF  — unigrams + bigrams  (20K features)
      2. Char TF-IDF  — 3-5 char n-grams    (30K features)
      3. Hand-crafted — length, caps ratio, punctuation signals
    """
    global _word_vec, _char_vec

    if fit:
        _word_vec = TfidfVectorizer(
            max_features=20000, ngram_range=(1, 2),
            min_df=2, sublinear_tf=True, analyzer="word",
        )
        _char_vec = TfidfVectorizer(
            max_features=30000, ngram_range=(3, 5),
            min_df=3, sublinear_tf=True, analyzer="char_wb",
        )
        X_word = _word_vec.fit_transform(texts)
        X_char = _char_vec.fit_transform(texts)
    else:
        X_word = _word_vec.transform(texts)
        X_char = _char_vec.transform(texts)

    # Hand-crafted features (length, caps, exclamation, question)
    feats = []
    for t in texts:
        raw = t if isinstance(t, str) else ""
        total   = max(len(raw), 1)
        feats.append([
            min(len(raw) / 500, 1.0),                             # normalised length
            sum(1 for c in raw if c.isupper()) / total,           # caps ratio
            min(raw.count("!") / 5, 1.0),                        # exclamation density
            min(raw.count("?") / 3, 1.0),                        # question density
            1.0 if has_emoji(raw) else 0.0,                      # emoji present
        ])
    X_hand = csr_matrix(np.array(feats, dtype=np.float32))

    return hstack([X_word, X_char, X_hand], format="csr")

# ── TRAINING THREAD ───────────────────────────────────────────────────────────
def _train():
    global _train_df, _test_df, _overview, _before_balance, _after_balance
    global _wc_data, _kw_data, _len_data, _emoji_data, _len_dist
    global _model, _model_acc, _report, _cm, _status

    try:
        # 1. Load ──────────────────────────────────────────────────────────────
        _status["step"] = "Loading CSV files…"
        train_df = pd.read_csv(
            os.path.join(DATA_DIR, "train_nykaa_review_sentiment.csv"),
            encoding="utf-8", on_bad_lines="skip")
        test_df = pd.read_csv(
            os.path.join(DATA_DIR, "test_nykaa_review_sentiment.csv"),
            encoding="utf-8", on_bad_lines="skip")

        for df in [train_df, test_df]:
            df.dropna(subset=["content", "sentiment_labels"], inplace=True)
        train_df = train_df[train_df["sentiment_labels"].isin(LABELS)].reset_index(drop=True)
        test_df  = test_df[test_df["sentiment_labels"].isin(LABELS)].reset_index(drop=True)
        _train_df, _test_df = train_df, test_df

        # 2. Dataset stats ─────────────────────────────────────────────────────
        _status["step"] = "Computing dataset statistics…"
        train_dist = train_df["sentiment_labels"].value_counts().to_dict()
        test_dist  = test_df["sentiment_labels"].value_counts().to_dict()
        _overview  = {
            "total_train": len(train_df), "total_test": len(test_df),
            "total": len(train_df) + len(test_df),
            "train_dist": train_dist, "test_dist": test_dist,
        }

        # 3. Word frequencies ──────────────────────────────────────────────────
        _status["step"] = "Computing word frequencies…"
        for sent in LABELS:
            texts = train_df[train_df["sentiment_labels"] == sent]["content"].tolist()
            words = top_words(texts, 80)
            _wc_data[sent] = [{"text": w, "value": c} for w, c in words]
            _kw_data[sent] = [{"word": w, "count": c} for w, c in words[:20]]

        # 4. Length & emoji stats ──────────────────────────────────────────────
        train_df["_len"]   = train_df["content"].str.len()
        test_df["_len"]    = test_df["content"].str.len()
        train_df["_emoji"] = train_df["content"].apply(has_emoji)

        for sent in LABELS:
            sub = train_df[train_df["sentiment_labels"] == sent]["_len"]
            _len_data[sent] = {
                "avg": round(float(sub.mean()), 1),
                "median": int(sub.median()), "max": int(sub.max()),
            }
            bc = train_df[train_df["sentiment_labels"] == sent]["_len"] \
                     .apply(length_bucket).value_counts().to_dict()
            _len_dist[sent] = [{"bucket": b, "count": bc.get(b, 0)} for b in BUCKET_ORDER]

            sub2 = train_df[train_df["sentiment_labels"] == sent]
            w = int(sub2["_emoji"].sum())
            _emoji_data[sent] = {"with": w, "without": len(sub2) - w}

        # 5. Text cleaning ─────────────────────────────────────────────────────
        _status["step"] = "Cleaning text…"
        train_df["_clean"] = train_df["content"].apply(clean_text)
        test_df["_clean"]  = test_df["content"].apply(clean_text)

        y_train = train_df["sentiment_labels"].map(LABEL_MAP).values
        y_test  = test_df["sentiment_labels"].map(LABEL_MAP).values

        _before_balance = {REV_LABEL[k]: int(v) for k, v in Counter(y_train.tolist()).items()}
        # class_weight handles imbalance — no manual oversampling needed
        _after_balance  = {k: "balanced (class_weight)" for k in _before_balance}

        # 6. Vectorize — word + char + hand-crafted ────────────────────────────
        _status["step"] = "Vectorizing text (Word + Char TF-IDF)…"
        X_train = build_features(train_df["_clean"].tolist(), fit=True)
        X_test  = build_features(test_df["_clean"].tolist(),  fit=False)
        print(f"  Feature matrix shape: {X_train.shape}")

        # 7. Train — LinearSVC + Platt scaling ────────────────────────────────
        _status["step"] = "Training LinearSVC (class_weight=balanced)…"
        base_clf = LinearSVC(C=0.5, max_iter=2000,
                             class_weight="balanced", random_state=42)
        clf = CalibratedClassifierCV(base_clf, cv=3, method="sigmoid")
        clf.fit(X_train, y_train)

        # 8. Evaluate ──────────────────────────────────────────────────────────
        _status["step"] = "Evaluating model on test set…"
        y_pred     = clf.predict(X_test)
        _model_acc = round(float(accuracy_score(y_test, y_pred)) * 100, 2)
        _report    = classification_report(
            y_test, y_pred,
            target_names=["NEGATIVE", "NEUTRAL", "POSITIVE"],
            output_dict=True,
        )
        _cm    = confusion_matrix(y_test, y_pred).tolist()
        _model = clf

        _status = {"ready": True, "step": "Ready"}
        print(f"✅  Model trained — accuracy {_model_acc}%")

    except Exception as exc:
        _status = {"ready": False, "step": f"Error: {exc}"}
        print(f"❌  Training failed: {exc}")
        raise


threading.Thread(target=_train, daemon=True).start()

# ── ROUTES ────────────────────────────────────────────────────────────────────

@app.route("/api/status")
def api_status():
    return jsonify(_status)

@app.route("/api/overview")
def api_overview():
    return jsonify(_overview)

@app.route("/api/balance")
def api_balance():
    return jsonify({
        "before":    _before_balance,
        "after":     {k: _before_balance.get("POSITIVE", 0) for k in _before_balance},
        "technique": "class_weight='balanced' in LinearSVC (no oversampling needed)",
    })

@app.route("/api/wordcloud")
def api_wordcloud():
    sent = request.args.get("sentiment", "POSITIVE").upper()
    if sent not in LABELS:
        return jsonify({"error": "Invalid sentiment"}), 400
    return jsonify(_wc_data.get(sent, []))

@app.route("/api/keywords")
def api_keywords():
    return jsonify(_kw_data)

@app.route("/api/length-analysis")
def api_length():
    return jsonify({"stats": _len_data, "distribution": _len_dist})

@app.route("/api/emoji-stats")
def api_emoji():
    return jsonify(_emoji_data)

@app.route("/api/model-metrics")
def api_metrics():
    if not _status["ready"]:
        return jsonify({"error": "Model not ready"}), 503
    metrics = []
    for label in ["NEGATIVE", "NEUTRAL", "POSITIVE"]:
        r = _report[label]
        metrics.append({
            "class":     label,
            "precision": round(r["precision"] * 100, 1),
            "recall":    round(r["recall"] * 100, 1),
            "f1":        round(r["f1-score"] * 100, 1),
            "support":   int(r["support"]),
        })
    return jsonify({
        "accuracy":         _model_acc,
        "metrics":          metrics,
        "confusion_matrix": _cm,
        "labels":           ["NEGATIVE", "NEUTRAL", "POSITIVE"],
    })

@app.route("/api/predict", methods=["POST"])
def api_predict():
    if not _status["ready"]:
        return jsonify({"error": "Model is still training. Please wait."}), 503
    data = request.get_json(force=True)
    text = data.get("text", "").strip()
    if not text:
        return jsonify({"error": "Empty text"}), 400

    cleaned = clean_text(text)
    X       = build_features([cleaned], fit=False)
    pred    = int(_model.predict(X)[0])
    proba   = _model.predict_proba(X)[0]

    return jsonify({
        "sentiment":  REV_LABEL[pred],
        "confidence": round(float(max(proba)) * 100, 1),
        "probabilities": {
            "NEGATIVE": round(float(proba[0]) * 100, 1),
            "NEUTRAL":  round(float(proba[1]) * 100, 1),
            "POSITIVE": round(float(proba[2]) * 100, 1),
        },
    })

@app.route("/api/reviews")
def api_reviews():
    sent  = request.args.get("sentiment", "").upper()
    page  = max(1, int(request.args.get("page", 1)))
    limit = min(20, int(request.args.get("limit", 10)))
    if _test_df is None:
        return jsonify({"reviews": [], "total": 0, "page": 1, "pages": 0})
    df    = _test_df.copy()
    if sent in LABELS:
        df = df[df["sentiment_labels"] == sent]
    total = len(df)
    start = (page - 1) * limit
    rows  = df.iloc[start: start + limit][["content", "sentiment_labels"]].to_dict("records")
    return jsonify({"reviews": rows, "total": total, "page": page,
                    "pages": max(1, (total + limit - 1) // limit)})

if __name__ == "__main__":
    app.run(debug=False, port=5000)
