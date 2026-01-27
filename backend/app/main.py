from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import upload, ia, export
from dotenv import load_dotenv


load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router)
app.include_router(ia.router)

@app.get("/")
def root():
    return {"message": "Backend IA funcionandoo"}


