from bson import ObjectId
from fastapi import APIRouter, HTTPException, status

from db.models.diarioModel import Diario
from db.schemas.diarioSchema import diario_schema, diarios_schema
from db.client import db_client



router = APIRouter(prefix="/diario", 
                   tags=["diario"],
                   responses={status.HTTP_404_NOT_FOUND: {"message": "No encontrado"}})



def searchRegDiario(field: str, key:str):
    diario = db_client.local.diarios.find_one({field: key})
    if not diario:
        return None
    return Diario(**diario_schema(diario))

@router.get("", status_code=200)
async def obtenerRegistrosDiarios():
    diarios = diarios_schema(db_client.local.diarios.find())
    if not diarios:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="No hay registros diarios")
    return diarios;

@router.get("/fecha/{fechaReg}", status_code=200)
async def obtenerRegistroDeHoy(fechaReg: str):
  fechaHoy =  searchRegDiario("fechaReg", fechaReg)

  if not fechaHoy:
      raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="No hay registro para el dia de hoy")
  return fechaHoy



@router.post("", status_code=201)
async def guardarRegistroDiario(diario: Diario):
    if searchRegDiario("fechaReg", diario.fechaReg) is not None: #esto funciona porque la funcion si no es el objeto, siempre va a devolver None
        raise HTTPException(status_code=status.HTTP_409_CONFLICT,
                            detail="Ya se guardo")


    diario_dict = diario.model_dump(exclude=("idDiario"))

    idDiario = db_client.local.diarios.insert_one(diario_dict).inserted_id

    new_diario = diario_schema(
        db_client.local.diarios.find_one({"_id": idDiario})
    )

    return new_diario
  

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



        

