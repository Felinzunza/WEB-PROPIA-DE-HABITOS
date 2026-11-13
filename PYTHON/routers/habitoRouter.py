from bson import ObjectId
from fastapi import APIRouter, HTTPException, status
from db.models.habitoModel import Habito
from db.schemas.habitoSchema import habito_schema, habitos_schema
from db.client import db_client



router = APIRouter(prefix="/habitos", 
                   tags=["habitos"],
                   responses={status.HTTP_404_NOT_FOUND: {"message": "No encontrado"}})


def searchHabito(field: str, key:str):
    habito = db_client.local.habitos.find_one({field: key})
    if not habito:
        return None
    return Habito(**habito_schema(habito))



@router.post("", status_code=201)
async def guardarHabito(habito: Habito):

    if type(searchHabito("data.habito", habito.data.habito)) == Habito:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT
        )

    habito_dict = habito.model_dump(exclude={"idHabito"})

    idHabito = db_client.local.habitos.insert_one(habito_dict).inserted_id

    nuevo_habito = habito_schema(
        db_client.local.habitos.find_one({"_id": idHabito})
    )

    return nuevo_habito


@router.get("", status_code=200)
async def obtenerHabitos():
    habitos = habitos_schema(db_client.local.habitos.find())

    if not habitos:
        raise HTTPException(status_code=status.HTTP_204_NO_CONTENT)
    return habitos

@router.get("/tipo/{tipo}", status_code=200)
async def obtenerHabitoXTipo(tipo: str):
    habitos_tipo = db_client.local.habitos.find({"tipo": tipo})

    if not habitos_tipo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

    return habitos_schema(habitos_tipo)


@router.get("/{id}", status_code=200)
async def obtenerHabitoXId(id: str):
    habitoxid = db_client.local.habitos.find_one({"_id": ObjectId(id)})

    if not habitoxid:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

    return habito_schema(habitoxid)




@router.put("/{idHabito}", status_code=status.HTTP_200_OK)
async def modificarUsuario(idHabito: str, habito: Habito):

    habito_dict = habito.model_dump(exclude={"idHabito"})
    

    habitoMod = db_client.local.habitos.find_one_and_update({"_id":ObjectId(idHabito)}, 
                                                            {"$set":habito_dict})
    
    if not habitoMod:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, 
                             detail="No se ha encontrado el habito")

    return habito_schema(habitoMod)


@router.delete("/{idHabito}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminarHabito(idHabito: str):
    delete_result = db_client.local.habitos.find_one_and_delete({"_id": ObjectId(idHabito)})

    if not delete_result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, 
                             detail="No se ha encontrado el habito")


documentos = list(db_client.local.habitos.find())

print(documentos)

habitos = habitos_schema(documentos)