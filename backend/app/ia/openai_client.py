from openai import OpenAI
import os

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def corregir_chunk(texto):
    completion = client.chat.completions.create(
        model="gpt-4.1",
        messages=[
            {"role": "system", "content": "Corrige ortografía, gramática y estilo sin resumir."},
            {"role": "user", "content": texto}
        ]
    )
    return completion.choices[0].message["content"]
