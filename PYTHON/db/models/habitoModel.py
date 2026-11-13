from pydantic import BaseModel


# 1. Un sub-modelo para los datos internos
class DataHabito(BaseModel):
    habito: str
    tipo: str

# 2. El modelo principal que incluye 'data'
class Habito(BaseModel):
    idHabito: str | None = None
    data: DataHabito          # <-- Aquí anidas la estructura
    fechaReg: str
    unidad: str 
    sitBase: float 
    metSem: float
    metDia: float | str
    activo: bool  | str            # (Recuerda que aquí también debes recibir booleano true/false)





  