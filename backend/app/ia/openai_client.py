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
    Importante: no incluyas asteriscos en ninguna parte del texto, cuando marques la respuesta correcta pon entre paréntesis la letra de la respuesta correcta.
    Genera un cuestionario de {cantidad} preguntas sobre el tema: "{tema}".

    Tipo de preguntas: {tipo}.

    Reglas:
    - Cada pregunta debe tener 4 opciones (A, B, C, D)
    - Marca la respuesta correcta al final de cada pregunta, ejemplo (Respuesta correcta: A)
    - No incluyas explicaciones adicionales
    
    
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

def parafrasear_texto(texto):
    completion = client.chat.completions.create(
        model="deepseek-chat",
        messages=[
            {
                "role": "system",
                "content": "Parafrasea el texto proporcionado manteniendo el mismo significado pero utilizando diferentes palabras y estructuras. Devuelve solo el texto parafraseado."
            },
            {
                "role": "user",
                "content": texto
            }
        ],
        temperature=0.7
    )

    return completion.choices[0].message.content