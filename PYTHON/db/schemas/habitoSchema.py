def habito_schema(habito) -> dict:
    data_habito = habito.get("data", {})
    return {
        "idHabito": str(habito["_id"]),
        "data": {
            "habito": data_habito.get("habito", ""),
            "tipo": data_habito.get("tipo", "")
        },
        "fechaReg": habito.get("fechaReg", ""),
        "unidad": habito.get("unidad", ""),
        "sitBase": habito.get("sitBase", ""),
        "metSem": habito.get("metSem", 0),
        "metDia": habito.get("metDia", ""),
        "activo": habito.get("activo", True)  # O False según tu lógica por defecto
    }

def habitos_schema(habitos) -> list:
    return [habito_schema(habito) for habito in habitos]

