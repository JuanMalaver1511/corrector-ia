from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(
    api_key=os.getenv("DEEPSEEK_API_KEY"),
    base_url="https://api.deepseek.com"
)

def corregir_chunk(texto):
    completion = client.chat.completions.create(
        model="deepseek-chat",
        messages=[
            {
                "role": "system",
                "content": "Corrige ortografía, gramática y estilo sin resumir."
            },
            {
                "role": "user",
                "content": texto
            }
        ],
        temperature=0.3
    )

    return completion.choices[0].message.content
