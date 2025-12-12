def dividir_texto(texto, max_chars=15000):
    chunks = []
    inicio = 0

    while inicio < len(texto):
        fin = min(inicio + max_chars, len(texto))
        chunks.append(texto[inicio:fin])
        inicio = fin

    return chunks
