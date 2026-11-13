from pydantic import BaseModel
from typing import List, Union

class DataDetalleDiario(BaseModel):
    habito: str
    tipo: str

class DetalleDiario(BaseModel):
    data: DataDetalleDiario
    metDia: str
    unidad: str
    realizado: Union[bool, float]      # true o false
    porcSemHabito: float

class Diario(BaseModel):
    idDiario: str | None = None
    fechaReg: str
    habitosRealizados: List[DetalleDiario]  # Un