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
                "content": "Corrige ortografía, gramática y estilo sin resumir. Devuelve solo el texto corregido. pero inicia con 'Texto corregido: '"
            },
            {
                "role": "user",
                "content": texto
            }
        ],
        temperature=0.3
    )

    return completion.choices[0].message.content

def generar_cuestionario(texto):
    completion = client.chat.completions.create(
        model="deepseek-chat",
        messages=[
            {
                "role": "system",
                "content": "Genera un cuestionario de 10 preguntas de opción múltiple basadas en el siguiente texto. Cada pregunta debe tener 4 opciones (A, B, C, D) y la respuesta correcta debe estar marcada al final. Devuelve solo las preguntas y opciones."
            },
            {
                "role": "user",
                "content": texto
            }
        ],
        temperature=0.3
    )

    return completion.choices[0].message.content