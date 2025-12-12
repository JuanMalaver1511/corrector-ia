from fastapi import APIRouter
from pydantic import BaseModel
from app.ia.pipeline import procesar_texto

router = APIRouter(prefix="/ia", tags=["IA"])

class Texto(BaseModel):
    texto: str

@router.post("/corregir")
def corregir_texto(data: Texto):
    resultado = procesar_texto(data.texto)
    return {"corregido": resultado}
