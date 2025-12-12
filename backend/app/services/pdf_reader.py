import PyPDF2

async def read_pdf(file):
    pdf_reader = PyPDF2.PdfReader(file.file)
    texto = ""

    for page in pdf_reader.pages:
        texto += page.extract_text() + "\n"

    return texto
