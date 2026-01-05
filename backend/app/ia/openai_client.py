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

def generar_cuestionario(tema, tipo, cantidad):
    prompt = f"""
    Genera un cuestionario de {cantidad} preguntas sobre el tema: "{tema}".

    Tipo de preguntas: {tipo}.

    no pongas astericos.
    Reglas:
    - Cada pregunta debe tener 4 opciones (A, B, C, D)
    - Marca la respuesta correcta al final de cada pregunta
    - No incluyas explicaciones adicionales
    
    Importante: no incluyas asteriscos, cuando marques la respuesta correcta, pon entre paréntesis la letra de la respuesta correcta.
    """

    completion = client.chat.completions.create(
        model="deepseek-chat",
        messages=[
            {"role": "system", "content": "Eres un generador de cuestionarios educativos."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.3
    )

    return completion.choices[0].message.content