def detalle_semana_schema(detalle) -> dict:
    # Extraemos de forma segura los subdocumentos con diccionarios vacíos por defecto
    data_habito = detalle.get("data", {})
    dias = detalle.get("diasSemana", {})

    return {
        "idDetalle": str(detalle["_id"]),
        "idSemanal": str(detalle.get("idSemanal", "")),
        "data": {
            "habito": data_habito.get("habito", ""),
            "tipo": data_habito.get("tipo", ""),
            "metDia": data_habito.get("metDia", ""),
            "unidad": data_habito.get("unidad", "")
        },
        "diasSemana": {
            "lunes": dias.get("lunes", None),       # None para que el frontend lo pinte como guión "-"
            "martes": dias.get("martes", None),
            "miercoles": dias.get("miercoles", None),
            "jueves": dias.get("jueves", None),
            "viernes": dias.get("viernes", None),
            "sabado": dias.get("sabado", None),
            "domingo": dias.get("domingo", None)
        },
        "totalDias_Horas": detalle.get("totalDias_Horas", None),
        "porcSemHabito": detalle.get("porcSemHabito", 0.0) # Como es float, por defecto 0.0
    }

def detalles_semana_schema(detalles) -> list:
    return [detalle_semana_schema(detalle) for detalle in detalles]