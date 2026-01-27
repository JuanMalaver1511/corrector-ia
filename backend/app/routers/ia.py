from fastapi import APIRouter
from pydantic import BaseModel
from ia.pipeline import procesar_texto
from ia.openai_client import generar_cuestionario
from ia.openai_client import parafrasear_texto

router = APIRouter(prefix="/ia", tags=["IA"])

# -----------------------------
# MODELOS
# -----------------------------

class Texto(BaseModel):
    texto: str

class QuestionnaireRequest(BaseModel):
    tema: str
    tipo: str
    cantidad: int

class ParaphraseRequest(BaseModel):
    texto: str

# -----------------------------
# ENDPOINTS
# -----------------------------

@router.post("/corregir")
def corregir_texto(data: Texto):
    resultado = procesar_texto(data.texto)
    return {
        "corregido": resultado
    }

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

@router.post("/paraphrase")
def paraphrase(data: ParaphraseRequest):
    resultado = parafrasear_texto(data.texto)
    return {
        "resultado": resultado
    }
