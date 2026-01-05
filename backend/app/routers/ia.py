from fastapi import APIRouter
from pydantic import BaseModel
from app.ia.pipeline import procesar_texto
from app.ia.openai_client import generar_cuestionario

router = APIRouter(prefix="/ia", tags=["IA"])

class Texto(BaseModel):
    texto: str

@router.post("/corregir")
def corregir_texto(data: Texto):
    resultado = procesar_texto(data.texto)
    return {"corregido": resultado}

class QuestionnaireRequest(BaseModel):
    tema: str
    tipo: str
    cantidad: int

@router.post("/questionnaire")
def questionnaire(data: QuestionnaireRequest):
    resultado = generar_cuestionario(
        data.tema,
        data.tipo,
        data.cantidad
    )
    return {
        "cuestionario": resultado
    }