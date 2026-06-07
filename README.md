# StudyMind — AI-Powered Study Assistant

## 🚀 Quick Start (Frontend Only)

No backend needed! Just open the frontend directly in your browser.

### Option 1: Open directly
```
Double-click frontend/index.html
```

### Option 2: Local server (recommended)
```bash
cd frontend
npx serve .
# or
python3 -m http.server 8080
```
Then open http://localhost:8080

---

## 🔑 API Key Setup
1. Get your key from: https://console.anthropic.com/settings/keys
2. Open the app → paste key in the sidebar → click Save
3. Key is stored in localStorage (stays private in your browser)

---

## ✨ Features
| Feature | Description |
|---------|-------------|
| 💬 AI Chat | Ask your tutor anything — explains concepts, solves problems |
| 🧠 Quiz | Auto-generates multiple-choice quizzes on any topic |
| 📝 Summarizer | 4 styles: Concise, Detailed, ELI5, Study Notes |
| 🃏 Flashcards | Interactive flip cards — click to reveal answers |

---

## 🏗 Backend (Optional)
If you want a backend proxy (to hide your API key from browser):

```bash
cd backend
npm install
npm start
# Runs on http://localhost:3001
```

Then update `API_URL` in `frontend/app.js` to point to your backend.

---

## 📁 Structure
```
study-assistant/
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── app.js
├── backend/
│   ├── server.js
│   └── package.json
└── README.md
```
