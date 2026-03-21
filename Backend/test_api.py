import requests

response = requests.post(
    "http://127.0.0.1:5000/ask",
    json={"question": "How do I deal with anxiety?"}
)

print(response.json())