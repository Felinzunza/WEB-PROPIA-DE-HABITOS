from bson import ObjectId
from fastapi import APIRouter, HTTPException, status

from PYTHON.db.schemas.semanalSchema import semanales_schema
from db.models.detSemanaModel import DetSemanaModel
from db.models.semanalModel import SemanaModel

from db.client import db_client



router = APIRouter(prefix="/semanal",
                   tags=["semanal"], 
                   responses={status.HTTP_404_NOT_FOUND: 
                              {"message": "No encontrado"}}) 

def searchFechas(inicio: str, fin: str):
    fechas = db_client.local.semanal.find({"fechaInicio": {"$gte": inicio}, 
                                           "fechaFin": {"$lte": fin}})
    if not fechas:
        return None
    return semanales_schema(fechas)



@router.get("", status_code=200)
async def obtenerRegistrosSemanal():
    semanal = semanales_schema(db_client.local.semanal.find())
    if not semanal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="No hay registros semanal")
    return semanal;

@router.get("/rangos", status_code=200)
async def obtenerRegistroSemanalxRangoSemanal(fechaInicio: str, fechaFin: str):
  rangos =  searchFechas(fechaInicio, fechaFin)

  list_rangos = list(rangos)

  if not list_rangos:
      raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="No hay registros para el rango de fechas especificado")
  return list_rangos



@router.post("", status_code=201)
async def guardarRegistroDiario(diario: Diario):
  
  

@router.put("/fecha/{fechaReg}", status_code=status.HTTP_200_OK)
async def modificarRegistroDiario(fechaReg: str, diario: Diario):

    diario_dict = diario.model_dump(exclude=("idDiario"))

    diarioMod = db_client.local.diarios.find_one_and_update({"fechaReg": fechaReg},
                                                            {"$set": diario_dict})

    if not diarioMod:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="No se ha encontrado el registro")

    return diario_schema(diarioMod)



@router.delete("/fecha/{fechaReg}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminarRegistroDiario(fechaReg: str):

    resultado = db_client.local.diarios.delete_many({"fechaReg": fechaReg})

    if resultado.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="No se ha encontrado registro en esa fecha para eliminar")

    return



        

