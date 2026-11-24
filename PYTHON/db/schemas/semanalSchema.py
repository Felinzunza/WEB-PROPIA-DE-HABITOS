def detalle_semana_schema(detalle) -> dict:
    data_habito = detalle.get("data", {})
    dias = detalle.get("diasSemana", {})

    return {
        "data": {
            "habito": data_habito.get("habito", ""),
            "tipo": data_habito.get("tipo", ""),
            "metDia": data_habito.get("metDia", ""),
            "unidad": data_habito.get("unidad", "")
        },
        "diasSemana": {
            "lunes": dias.get("lunes", None),
            "martes": dias.get("martes", None),
            "miercoles": dias.get("miercoles", None),
            "jueves": dias.get("jueves", None),
            "viernes": dias.get("viernes", None),
            "sabado": dias.get("sabado", None),
            "domingo": dias.get("domingo", None)
        },
        "metSem": detalle.get("metSem", 0),
        "totalDias_Horas": detalle.get("totalDias_Horas", 0),
        "porcSemHabito": detalle.get("porcSemHabito", 0.0)
    }

def detalles_semana_schema(detalles) -> list:
    return [detalle_semana_schema(detalle) for detalle in detalles]

def semanal_schema(semanal: dict) -> dict:
    return {
        "idSemanal": str(semanal.get("_id")),
        "fechaInicio": semanal.get("fechaInicio", ""),
        "fechaFin": semanal.get("fechaFin", ""),
        "porcSemHabito": semanal.get("porcSemHabito", 0.0),
        "listDetalleSemanal": detalles_semana_schema(semanal.get("listDetalleSemanal", []))
    }

def semanales_schema(semanales) -> list:
    return [semanal_schema(semanal) for semanal in semanales]
