from time import time

from fastapi import HTTPException

from db.schemas.semanalSchema import semanal_schema
from datetime import datetime, timedelta

def parsear_fecha(fecha: str):

    try:
        return datetime.strptime(fecha, "%d-%m-%Y")

    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="formato de fecha no valido, se espera dd-mm-yyyy"
        )

def rango_semanal(fecha_inicio: str):

    fecha_inicio_dt = parsear_fecha(fecha_inicio)

    if fecha_inicio_dt.weekday() != 0:
       fecha_inicio_dt = fecha_inicio_dt - timedelta(days=fecha_inicio_dt.weekday())


    fecha_fin_dt = fecha_inicio_dt + timedelta(days=6)

    return fecha_inicio_dt.strftime("%d-%m-%Y"), fecha_fin_dt.strftime("%d-%m-%Y")


Dias = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"]

def agrupar_por_habito(diarios: list[dict]) -> dict:
    habitos_agrupados = {}

    for diario in diarios:
        fecha = parsear_fecha(diario["fechaReg"])
        dia = Dias[fecha.weekday()]

        for registro in diario.get("habitosRealizados", []):
            data_reg = registro.get("data", {})
            habito = data_reg.get("habito")

            if not habito:
                continue

            tipo = data_reg.get("tipo")
            metDia = data_reg.get("metDia", registro.get("metDia", ""))
            unidad = data_reg.get("unidad", registro.get("unidad", ""))

            if habito not in habitos_agrupados:
                habitos_agrupados[habito] = {
                    "data": {
                        "habito": habito,
                        "tipo": tipo,
                        "metDia": metDia,
                        "unidad": unidad,
                    },
                    "diasSemana": {d: None for d in Dias},
                    "totalDias_Horas": 0,
                    "porcSemHabito": 0.0,
                }

            habitos_agrupados[habito]["diasSemana"][dia] = registro.get("realizado", None)

    return habitos_agrupados


def calcular_dias_u_horas_semanales(dias_semana: dict) -> float:
    total = 0.0 

    for valor in dias_semana.values():
        if valor is None or valor is False:
            continue

        if isinstance(valor, bool):
            total += 1 if valor else 0
        elif isinstance(valor, (int, float)):
            total += valor

    return round(total, 2)



def calcular_porcentaje_semanal(total: float, met_sem: float | int | None) -> float:
    if not met_sem or met_sem <= 0:
        return 0.0

    try:
        porcentaje = (total / float(met_sem)) * 100

        return round(min(porcentaje, 100.0), 2)
    
    except (ValueError, ZeroDivisionError):
        return 0.0
    

def calcular_porcentaje_general(detalles: list[dict]) -> float:
    if not detalles:
        return 0.0

    suma_porcentajes = sum(
        float(detalle.get("porcSemHabito", 0.0) or 0.0)
        for detalle in detalles
    )
    return round(suma_porcentajes / len(detalles), 2)


def armar_documento_semanal(
        fecha_inicio: str,
        fecha_fin: str,
        habitos_agrupados: dict,
        semana_id: str | None = None
)-> dict:
    detalles = []

    for info in habitos_agrupados.values():
        data_raw = info.get("data") or {}
        dias_semana = info.get("diasSemana") or {}
        met_sem = info.get("metSem", 0.0) 

        total_dias_horas = calcular_dias_u_horas_semanales(dias_semana)
        porc_sem_habito = calcular_porcentaje_semanal(total_dias_horas, met_sem)

        data_habito = {
            "habito": data_raw.get("habito", ""),
            "tipo": data_raw.get("tipo", ""),
            "metDia": data_raw.get("metDia", ""),
            "unidad": data_raw.get("unidad", "")
        }
        detalle = {
            "data": data_habito, 
            "diasSemana": dias_semana,
            "metSem": met_sem,
            "totalDias_Horas": total_dias_horas,
            "porcSemHabito": porc_sem_habito
        } 

        detalles.append(detalle)

    porc_sem_general = calcular_porcentaje_general(detalles)

    documento_semanal = {
        "idSemanal": semana_id,
        "fechaInicio": fecha_inicio,
        "fechaFin": fecha_fin,
        "porcSemGeneral": porc_sem_general,
        "listDetalleSemanal": detalles
    }

    return documento_semanal
        



def fin_del_domingo(fecha_fin: str) -> datetime:
    fecha_fin_parseado = parsear_fecha(fecha_fin)

    fecha_fin_dt = datetime.combine(fecha_fin_parseado.date(), time(23, 59, 59))

    return fecha_fin_dt


def semana_cerrada(fecha_fin: str, ahora: datetime | None = None) -> bool:
    if ahora is None:
        ahora = datetime.now()

    fecha_fin_dt = fin_del_domingo(fecha_fin)

    return ahora > fecha_fin_dt

def procesar_reporte_semanal(
    fecha_inicio: str,
    fecha_fin: str,
    diarios: list[dict],
    semana_id: str | None = None,
    ahora: datetime | None = None,
) -> dict:
    habitos_agrupados = agrupar_por_habito(diarios) 
    esta_cerrada = semana_cerrada(fecha_fin, ahora)

    id_semana = semana_id if esta_cerrada else None

    documento = armar_documento_semanal(
        fecha_inicio=fecha_inicio,
        fecha_fin=fecha_fin,
        habitos_agrupados=habitos_agrupados,
        semana_id=id_semana,
    )

    if esta_cerrada: 
        pass

    return documento