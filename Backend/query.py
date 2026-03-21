from sentence_transformers import SentenceTransformer
import chromadb
from groq import Groq

groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
model = SentenceTransformer('all-MiniLM-L6-v2')
client = chromadb.PersistentClient(path="./wellness_db")
collection = client.get_or_create_collection(name="wellness")

question="I can't sleep at night"

question_embedding=model.encode(question).tolist()

results=collection.query(
    query_embeddings=[question_embedding],
    n_results=5,
)
print("\n--- DEBUG: Raw chunks retrieved ---")
for i, chunk in enumerate(results["documents"][0]):
    print(f"Chunk {i+1}: {chunk[:150]}")
print("--- END DEBUG ---\n")
retrieved_chunks = results["documents"][0]

context = "\n\n".join(retrieved_chunks)

prompt = f"""You are a compassionate mental wellness assistant.
Use the context below to answer the question as helpfully as possible.
If the context contains related information, use it to give a helpful answer even if it doesn't directly mention the topic.
Only say "I don't have enough information" if the context is completely unrelated to the question.

Context:
{context}

Question: {question}

Answer:"""

response = groq_client.chat.completions.create(
    model="llama-3.3-70b-versatile",
    messages=[
        {"role": "user", "content": prompt}
    ]
)

answer = response.choices[0].message.content
print(f"\nQuestion: {question}")
print(f"\nAnswer: {answer}")
