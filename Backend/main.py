from fastapi import FastAPI
from app.routes.NoteBook import router


app = FastAPI()

app.include_router(router, prefix="/Backend")



@app.get('/')
def get():
    return {"message" : "Hello"}


