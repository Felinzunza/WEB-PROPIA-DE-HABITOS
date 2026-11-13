def diario_schema(diario) -> dict:
    return {
        "idDiario": str(diario["_id"]),
        "fechaReg": diario.get("fechaReg", ""),
        "habitosRealizados": [
            {
                "data": {
                    "habito": item["data"].get("habito", ""),
                    "tipo": item["data"].get("tipo", "")
                },
                "metDia": item.get("metDia", ""),
                "unidad": item.get("unidad", ""),
                "realizado": item.get("realizado", False),
                "porcSemHabito": item.get("porcSemHabito", 0.0)
            }
            for item in diario.get("habitosRealizados", [])
        ]
    }

def diarios_schema(diarios) -> list:
    return [diario_schema(diario) for diario in diarios]