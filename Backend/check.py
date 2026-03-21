import chromadb

client = chromadb.PersistentClient(path="./wellness_db")
collection = client.get_or_create_collection(name="wellness")

print(f"Total items in ChromaDB: {collection.count()}")