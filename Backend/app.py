from flask import Flask, request, jsonify
from flask_cors import CORS
from sentence_transformers import SentenceTransformer
import chromadb
from groq import Groq
import os
from dotenv import load_dotenv
load_dotenv()

from database import (
    init_db,
    create_session,
    save_message,
    get_all_sessions,
    get_session_messages,
    delete_session
)

app = Flask(__name__)
CORS(app)
init_db()

# ── Load RAG tools ────────────────────────────────────────────
model        = SentenceTransformer('all-MiniLM-L6-v2')
client       = chromadb.PersistentClient(path="./wellness_db")
collection   = client.get_or_create_collection(name="wellness")
groq_client = groq_client  = Groq(api_key=os.getenv("GROQ_API_KEY"))

# ── RAG function ──────────────────────────────────────────────
def run_rag(question):
    question_embedding = model.encode(question).tolist()

    results = collection.query(
        query_embeddings=[question_embedding],
        n_results=5
    )

    retrieved_chunks = results["documents"][0]
    context = "\n\n".join(retrieved_chunks)

    prompt = f"""You are a compassionate mental wellness assistant.
Use the context below to answer the question as helpfully as possible.
If the context contains related information, use it to give a helpful answer even if it doesn't directly mention the topic.
Only say "I don't have enough information" if the context is completely unrelated to the question.

Follow these response rules strictly:
- Keep answers concise and clear — maximum 4-5 sentences for simple questions
- Use bullet points only when listing multiple tips or steps
- Never start with "According to the context" or "Based on the context"
- Speak directly and warmly like a real wellness counselor
- If the question is simple, give a simple short answer
- Never repeat the question back to the user

Context:
{context}

Question: {question}

Answer:"""

    response = groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}]
    )

    return response.choices[0].message.content

# ── Routes ────────────────────────────────────────────────────

@app.route("/ask", methods=["POST"])
def ask():
    data       = request.get_json()
    question   = data.get("question", "")
    session_id = data.get("session_id", None)

    if not question:
        return jsonify({"error": "No question provided"}), 400

    if not session_id:
        session_id = create_session(question)
        save_message(
            session_id,
            "bot",
            "Hi! I am MindQuery. Ask me anything about mental health and wellness."
        )

    save_message(session_id, "user", question)

    answer = run_rag(question)

    save_message(session_id, "bot", answer)

    return jsonify({
        "answer":     answer,
        "session_id": session_id
    })


@app.route("/sessions", methods=["GET"])
def sessions():
    return jsonify(get_all_sessions())


@app.route("/sessions/<int:session_id>", methods=["GET"])
def load_session(session_id):
    messages = get_session_messages(session_id)
    return jsonify(messages)


@app.route("/sessions/<int:session_id>", methods=["DELETE"])
def remove_session(session_id):
    delete_session(session_id)
    return jsonify({"status": "deleted"})


if __name__ == "__main__":
    app.run(debug=False, port=5000)