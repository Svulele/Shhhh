from openai import OpenAI
from dotenv import load_dotenv
import os

load_dotenv()

from openai import OpenAI
client = OpenAI(api_key=os.getenv("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"))
client = OpenAI()

BOOK_CONTENT = ""

def ingest_book(path):
    global BOOK_CONTENT

    try:
        with open(path, "r", errors="ignore") as f:
            BOOK_CONTENT = f.read()

        return "Book loaded successfully"

    except Exception as e:
        return str(e)


def ask_book(question):
    try:
        response = client.chat.completions.create(
            model="gpt-4.1-mini",
            messages=[
                {"role": "system", "content": "Answer based on the book."},
                {"role": "user", "content": f"{BOOK_CONTENT}\n\nQuestion: {question}"}
            ]
        )

        return response.choices[0].message.content

    except Exception as e:
        return str(e)