from ia.chunking import dividir_texto
from ia.openai_client import corregir_chunk

def procesar_texto(texto):
    partes = dividir_texto(texto)
    resultado = ""

    for parte in partes:
        corregido = corregir_chunk(parte)
        resultado += corregido + "\n"

    return resultado
