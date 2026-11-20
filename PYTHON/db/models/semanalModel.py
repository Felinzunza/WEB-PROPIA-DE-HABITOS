from typing import List, Optional, Union
from pydantic import BaseModel


class DataHabitoSemana(BaseModel):
    habito: str
    tipo: str
    metDia: float | str
    unidad: str


class DiasSemana(BaseModel):
    lunes: Optional[Union[bool, float]] = None
    martes: Optional[Union[bool, float]] = None
    miercoles: Optional[Union[bool, float]] = None
    jueves: Optional[Union[bool, float]] = None
    viernes: Optional[Union[bool, float]] = None
    sabado: Optional[Union[bool, float]] = None
    domingo: Optional[Union[bool, float]] = None


class DetalleSemana(BaseModel):
    data: DataHabitoSemana
    diasSemana: DiasSemana
    metSem: float
    totalDias_Horas: float
    porcSemHabito: float


class historialSemanal(BaseModel):
    idSemanal: Optional[str] = None
    fechaInicio: str
    fechaFin: str
    porcSemGeneral: float
    listDetalleSemanal: List[DetalleSemana]