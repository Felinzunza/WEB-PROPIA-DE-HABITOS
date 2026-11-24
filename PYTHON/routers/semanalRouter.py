from fastapi import APIRouter, HTTPException, status
from bson import ObjectId
from datetime import datetime
from db.schemas.semanalSchema import semanales_schema, semanal_schema
from db.models.semanalModel import historialSemanal
from service.semanalService import  procesar_reporte_semanal, semana_cerrada
                                    

from db.client import db_client



router = APIRouter(prefix="/semanal",
                   tags=["semanal"], 
                   responses={status.HTTP_404_NOT_FOUND: 
                              {"message": "No encontrado"}}) 

def searchSemana(field: str, key:str):
    semanal = db_client.local.semanal.find_one({field: key})
    if not semanal:
        return None
    return semanal_schema(semanal)



@router.get("", status_code=status.HTTP_200_OK)
async def obtenerRegistrosSemanal():
    semanales = semanales_schema(db_client.local.semanal.find())

    if not semanales:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="No hay registros semanales")

    return semanales

@router.get("/rangos", status_code=status.HTTP_200_OK)
async def obtenerRegistroSemanalxRangoSemanal(fechaInicio: str, fechaFin: str):
    formato_fecha = "%d-%m-%Y"

    try:
        dt_inicio = datetime.strptime(fechaInicio, formato_fecha)
        dt_fin = datetime.strptime(fechaFin, formato_fecha)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El formato de fecha debe ser dd-mm-yyyy (ejemplo: 28-09-2026)"
        )

    if dt_inicio > dt_fin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La fecha de inicio no puede ser mayor a la fecha de fin"
        )

    todos_registros = db_client.local.semanal.find()
    list_rangos = [
        reg for reg in todos_registros
        if dt_inicio <= datetime.strptime(reg["fechaInicio"], formato_fecha)
        and datetime.strptime(reg["fechaFin"], formato_fecha) <= dt_fin
    ]

    if not list_rangos:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No hay registros para el rango de fechas especificado"
        )

    return semanales_schema(list_rangos)


@router.get("/en_curso", status_code=status.HTTP_200_OK)
async def obtener_reporte_semanal_en_curso(fechaInicio: str, fechaFin: str):
    formato_fecha = "%d-%m-%Y"

    try:
        dt_inicio = datetime.strptime(fechaInicio, formato_fecha)
        dt_fin = datetime.strptime(fechaFin, formato_fecha)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El formato de fecha debe ser dd-mm-yyyy (ejemplo: 28-09-2026)"
        )

    if dt_inicio > dt_fin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La fecha de inicio no puede ser mayor a la fecha de fin"
        )

    todos_diarios = list(db_client.local.diarios.find())
    diarios_rango = [
        doc for doc in todos_diarios
        if doc.get("fechaReg")
        and dt_inicio <= datetime.strptime(doc["fechaReg"], formato_fecha) <= dt_fin
    ]

    habitos_docs = list(db_client.local.habitos.find())
    metas_por_habito = {}

    for h in habitos_docs:
        data_habito = h.get("data") or {}
        nombre_habito = data_habito.get("habito")
        if nombre_habito:
            metas_por_habito[nombre_habito] = h.get("metSem", 0.0)

    return procesar_reporte_semanal(
        fecha_inicio=fechaInicio,
        fecha_fin=fechaFin,
        diarios=diarios_rango,
        semana_id=None,
        ahora=datetime.now(),
        metas_por_habito=metas_por_habito,
    )
  

@router.get("/semana/{idSemanal}", status_code=status.HTTP_200_OK)
async def obtenerDetalleSemanal(idSemanal: str):
    detalle = db_client.local.semanal.find_one({"_id": ObjectId(idSemanal)})
    if not detalle:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="No hay registro para el id especificado")
    #Necesito obtener el detalle de la semana al hacer click en el boton de ver detalle, para eso necesito el id del registro semanal y con eso buscar en la base de datos el registro correspondiente y devolverlo al front-end

    return semanal_schema(detalle)



@router.post("", status_code=status.HTTP_201_CREATED)
async def guardarRegistroSemanal(semanal: historialSemanal):

    semanal.model_dump(exclude={"idSemanal"})

   

    if searchSemana("fechaInicio", semanal.fechaInicio) is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT,
                            detail="Ya se guardo un registro para esa semana")

    semanal_dict = semanal.model_dump()
    resultado = db_client.local.semanal.insert_one(semanal_dict)

    new_semanal = semanal_schema(
        db_client.local.semanal.find_one({"_id": resultado.inserted_id})
    )

    return new_semanal



@router.delete("/{idSemanal}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminarRegistroSemanal(idSemanal: str):

    resultado = db_client.local.semanal.delete_one({"_id": ObjectId(idSemanal)})

    if resultado.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="No se ha encontrado registro con ese id para eliminar")



        

