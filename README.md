# MindQuery 🧠

A mental wellness RAG chatbot built from scratch.

## Tech Stack
- **Frontend**: React
- **Backend**: Flask (Python)
- **Vector DB**: ChromaDB
- **Embeddings**: all-MiniLM-L6-v2
- **LLM**: Llama 3 via Groq API
- **Database**: SQLite

## Features
- Semantic search over mental health FAQ dataset
- AI-generated compassionate answers
- Dark mode
- Mood check-in screen
- Breathing exercise widget
- Chat history with SQLite
- Markdown rendering

## Setup

### Backend
```
cd MindQuery
pip install -r requirements.txt
python index.py
python app.py
```

### Frontend
```
cd mindquery-ui
npm install
npm start
```

## Environment Variables
Create a `.env` file in the MindQuery folder:
```
GROQ_API_KEY=your_key_here
```
```

---

**Step 5 — Create `requirements.txt`**

In your MindQuery folder run:
```
pip freeze > requirements.txt
```

This saves all your Python packages so anyone can install them with one command.

---

**Step 6 — Push to GitHub**

In your terminal, navigate to your MindQuery folder:
```
cd c:\Users\vishn\Desktop\Projects\MindQuery
```

Then run these commands one by one:
```
git init
git add .
git commit -m "Initial commit - MindQuery mental wellness RAG chatbot"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/MindQuery.git
git push -u origin main