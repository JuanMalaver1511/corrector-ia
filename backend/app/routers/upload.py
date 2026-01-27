from fastapi import APIRouter, UploadFile, File
from services.pdf_reader import read_pdf
from services.word_reader import read_word

router = APIRouter(prefix="/upload", tags=["Upload"])

@router.post("")
async def upload_file(file: UploadFile = File(...)):
    if file.filename.endswith(".pdf"):
        text = await read_pdf(file)
    elif file.filename.endswith(".docx"):
        text = await read_word(file)
    else:
        return {"error": "Formato no soportado. Solo PDF o DOCX."}

    return {"texto": text}
