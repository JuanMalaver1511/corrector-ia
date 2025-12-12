import docx

async def read_word(file):
    doc = docx.Document(file.file)
    texto = ""

    for para in doc.paragraphs:
        texto += para.text + "\n"

    return texto
