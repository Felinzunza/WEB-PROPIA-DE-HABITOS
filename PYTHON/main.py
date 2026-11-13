from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import habitoRouter, diarioRouter




app = FastAPI()


# --- 2. Configura los orígenes permitidos (CORS) ---
origins = [
    "http://127.0.0.1:3000",
    "http://localhost:3000",
    "http://127.0.0.1:5500",  # Por si usas Live Server clásico en el 5500
    "http://localhost:5500"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Permite GET, POST, PUT, DELETE, etc.
    allow_headers=["*"],  # Permite todos los headers (incluyendo 'Content-Type')
)

app.include_router(habitoRouter.router)
app.include_router(diarioRouter.router)

@app.get('/')
async def roof():  #cada vez que se llama a un servidor se usa asincronia
    return "Hola FastAPI" 

r""" @app.get('/url')
async def roof():  #cada vez que se llama a un servidor se usa asincronia
    return {"url": "https://fastapi.tiangolo.com/"}
 """

#venv\Scripts\activate.bat"
#uvicorn main:app --reload




