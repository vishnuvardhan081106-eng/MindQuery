from sentence_transformers import SentenceTransformer
import chromadb
import pandas as pd
model = SentenceTransformer('all-MiniLM-L6-v2')
client = chromadb.PersistentClient(path="./wellness_db")
collection = client.get_or_create_collection(name="wellness")

df = pd.read_csv(r"C:\Users\vishn\Desktop\Projects\MindQuery\Mental_Health_FAQ.csv")
print(f"loaded{len(df)} rows")

for index, row in df.iterrows():
    answer_text=str(row["Answers"])
    question_text=str(row["Questions"])
    unique_id=str(row["Question_ID"])

    embedding = model.encode(answer_text).tolist()

    collection.add(
        documents=[answer_text],
        embeddings=[embedding],
        ids=[unique_id],
        metadatas=[{"question": question_text}]
    )

    print(f"Indexed Row{index+1}/98")

print(f"\nDone! Total indexed: {collection.count()}")
