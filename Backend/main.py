from fastapi import FastAPI
from app.routes.NoteBook import router

app = FastAPI()

app.include_router(router, prefix="/Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get('/')
def get():
    return {"message" : "Hello"}


