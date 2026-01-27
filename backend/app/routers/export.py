from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from docx import Document
import io

router = APIRouter(prefix="/export", tags=["Export"])

class Documento(BaseModel):
    texto: str

@router.post("/docx")
def exportar_docx(data: Documento):
    doc = Document()

    for linea in data.texto.split("\n"):
        doc.add_paragraph(linea)

    buffer = io.BytesIO()
    doc.save(buffer)
    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={
            "Content-Disposition": "attachment; filename=documento-corregido.docx"
        }
    )
