#!/usr/bin/env python3
"""Sincronización entre Vikunja (fuente de verdad de tareas) y el repositorio.

Por defecto todo es de solo lectura o simulación: el script muestra qué haría y
no escribe nada. Para escribir en Vikunja o en sprint_actual.md usa --apply.
Las tareas existentes solo se actualizan con --apply --force-update, y siempre
se envía el objeto completo leído del servidor con los campos modificados.
Mapeo de columnas, etiquetas y estados: docs/vikunja.md.

Solo usa la biblioteca estándar (Python 3.10+).
"""

from __future__ import annotations

import argparse
import difflib
import http.client
import json
import os
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[1]

EXIT_OK = 0
EXIT_USO = 1
EXIT_REMOTO = 2

URL_POR_DEFECTO = "https://vikunja.arcav.us"
PROYECTO_POR_DEFECTO = 2
TIMEOUT_POR_DEFECTO = 20.0
PREFIJO_CLAVE_POR_DEFECTO = "lp-arcav-us"
POR_PAGINA = 50
MAX_PAGINAS = 200
MAX_REAPERTURAS = 3
TOKEN_PLACEHOLDER = "tu_token_de_vikunja_aqui"
USER_AGENT = "arcav-vikunja-sync/2.0"

ROLES = ("producto", "frontend", "integraciones", "qa-revisor", "release")
PREFIJO_ROL = "rol:"
COLORES_ROL = {
    "producto": "3B82F6",
    "frontend": "10B981",
    "integraciones": "8B5CF6",
    "qa-revisor": "F59E0B",
    "release": "6366F1",
}
# Etiquetas y agentes del squad agyFlow anterior. No se borran en Vikunja; solo se mapean.
ROLES_ANTIGUOS = {
    "role:po": "producto",
    "role:scrum": "producto",
    "role:designer": "frontend",
    "role:frontend": "frontend",
    "role:backend": "integraciones",
    "role:qa": "qa-revisor",
    "role:devops": "release",
}
AGENTES_ANTIGUOS = {
    "po-agent": "producto",
    "scrum-master-agent": "producto",
    "designer-agent": "frontend",
    "frontend-dev-agent": "frontend",
    "backend-dev-agent": "integraciones",
    "qa-agent": "qa-revisor",
    "devops-agent": "release",
}

# Columnas Kanban esperadas: (título, posición, estado lógico).
COLUMNAS_KANBAN = (
    ("To-Do", 100, "pendiente"),
    ("Doing", 200, "en_curso"),
    ("QA / Review", 250, "en_qa"),
    ("Done", 300, "cerrado"),
)
ESTADO_POR_COLUMNA = {titulo.lower(): estado for titulo, _, estado in COLUMNAS_KANBAN}
# Etiquetas de estado, en orden de precedencia (la primera presente gana).
PREFIJO_ESTADO = "estado:"
ETIQUETAS_ESTADO = ("escalado", "bloqueado", "correccion", "en_produccion", "en_pr", "qa_aprobado")
COLORES_ESTADO = {
    "escalado": "DC2626",
    "bloqueado": "EF4444",
    "correccion": "F97316",
    "en_produccion": "059669",
    "en_pr": "0EA5E9",
    "qa_aprobado": "22C55E",
}
PRIORIDADES = {0: "sin prioridad", 1: "baja", 2: "media", 3: "alta", 4: "urgente", 5: "inmediata"}

MARCA_INICIO = "<!-- vikunja-sync:inicio -->"
MARCA_FIN = "<!-- vikunja-sync:fin -->"
TITULOS_RESUMEN = ("## resumen", "## resumen del sprint")
TITULOS_DETALLE = ("## detalle por tarea", "## detalle de tareas")
LINEA_FECHA = "Última sincronización UTC:"
LINEA_RESULTADO = "Resultado de la sincronización:"
# Viñetas de detalle que genera el script (o que usaba el espejo antiguo) y no se copian del archivo local.
VINETAS_GENERADAS = {
    "clave estable", "enlace", "id y enlace de vikunja", "historia asociada", "rol responsable",
    "responsable", "estado (vikunja / lógico)", "estado (remoto / lógico)", "prioridad",
    "etiquetas", "reaperturas", "descripción & criterios", "historia y escenarios",
}

SLUG = r"[A-Za-z0-9][A-Za-z0-9-]*"
CLAVE_TITULO_RE = re.compile(rf"^\s*\[\s*(US-\d+)\s*(?::\s*({SLUG})\s*)?\](?:\s*\[\s*({SLUG})\s*\])?", re.I)
CLAVE_ARG_RE = re.compile(rf"^(?:{SLUG}:)?(US-\d+)(?::({SLUG}))?$", re.I)
HISTORIA_RE = re.compile(r"^###\s+\[\s*(US-\d+)\s*\]\s*(.+?)\s*$", re.I)
ENCABEZADO_CORTE_RE = re.compile(r"^#{1,3}\s")
RESPONSABLE_RE = re.compile(r"\*\*\s*(?:Responsable|Rol)[^*]*\*\*")
PRIORIDAD_RE = re.compile(r"\*\*\s*Prioridad\s*\*\*\s*:?\s*([0-5])\b")
VINETA_RE = re.compile(r"^-\s+(?:\*\*)?([^:*]+?)(?:\*\*)?\s*:\s*(.*?)\s*$")


class ErrorUso(Exception):
    """Error de uso o de configuración local (código de salida 1)."""


class ErrorRemoto(Exception):
    """Error al hablar con Vikunja (código de salida 2)."""

    def __init__(self, mensaje: str, status: int | None = None):
        super().__init__(mensaje)
        self.status = status


def eprint(*partes: object) -> None:
    print(*partes, file=sys.stderr)


def ahora_utc() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")


# ---------------------------------------------------------------------------
# Configuración
# ---------------------------------------------------------------------------


def cargar_env(ruta: Path, obligatorio: bool = False) -> list[str]:
    """Carga variables VIKUNJA_* de un archivo .env sin sobrescribir el entorno.

    Nunca imprime valores. Devuelve solo los nombres cargados.
    """
    if not ruta.is_file():
        if obligatorio:
            raise ErrorUso(f"no existe el archivo de entorno {ruta}")
        return []
    cargadas = []
    for linea in ruta.read_text(encoding="utf-8").splitlines():
        linea = linea.strip()
        if not linea or linea.startswith("#") or "=" not in linea:
            continue
        if linea.startswith("export "):
            linea = linea[len("export "):].strip()
        clave, _, valor = linea.partition("=")
        clave = clave.strip()
        if not clave.startswith("VIKUNJA_") or clave in os.environ:
            continue
        valor = valor.strip()
        if len(valor) >= 2 and valor[0] == valor[-1] and valor[0] in "\"'":
            valor = valor[1:-1]
        os.environ[clave] = valor
        cargadas.append(clave)
    return cargadas


class Config:
    def __init__(self, url: str, token: str, proyecto: int, timeout: float):
        self.url = url
        self.api = f"{url}/api/v1"
        self.token = token
        self.proyecto = proyecto
        self.timeout = timeout

    def enlace_tarea(self, tarea_id: object) -> str:
        return f"{self.url}/tasks/{tarea_id}"

    def enlace_proyecto(self) -> str:
        return f"{self.url}/projects/{self.proyecto}"


def normalizar_url(valor: str) -> str:
    url = valor.strip().rstrip("/")
    if url.endswith("/api/v1"):
        url = url[: -len("/api/v1")]
    partes = urllib.parse.urlsplit(url)
    if not partes.scheme or not partes.hostname:
        raise ErrorUso(f"VIKUNJA_URL no es una URL válida: {valor!r}")
    local = partes.hostname in ("localhost", "127.0.0.1", "::1")
    if partes.scheme != "https" and not (partes.scheme == "http" and local):
        raise ErrorUso("VIKUNJA_URL debe usar https (http solo se admite para localhost)")
    return url


def resolver_config(args: argparse.Namespace) -> Config:
    if not args.sin_env:
        if args.env_file:
            cargar_env(Path(args.env_file), obligatorio=True)
        else:
            cargar_env(ROOT_DIR / ".env")

    url = normalizar_url(args.url or os.environ.get("VIKUNJA_URL") or URL_POR_DEFECTO)

    proyecto_bruto = args.proyecto if args.proyecto is not None else os.environ.get("VIKUNJA_PROJECT_ID")
    try:
        proyecto = int(proyecto_bruto) if proyecto_bruto not in (None, "") else PROYECTO_POR_DEFECTO
    except (TypeError, ValueError):
        raise ErrorUso(f"VIKUNJA_PROJECT_ID debe ser un entero positivo (recibido {proyecto_bruto!r})") from None
    if proyecto <= 0:
        raise ErrorUso("VIKUNJA_PROJECT_ID debe ser un entero positivo")

    timeout_bruto = args.timeout if args.timeout is not None else os.environ.get("VIKUNJA_TIMEOUT")
    try:
        timeout = float(timeout_bruto) if timeout_bruto not in (None, "") else TIMEOUT_POR_DEFECTO
    except (TypeError, ValueError):
        raise ErrorUso(f"VIKUNJA_TIMEOUT debe ser un número de segundos (recibido {timeout_bruto!r})") from None
    if timeout <= 0:
        raise ErrorUso("VIKUNJA_TIMEOUT debe ser mayor que 0")

    token = (os.environ.get("VIKUNJA_API_TOKEN") or "").strip()
    if not token or token == TOKEN_PLACEHOLDER:
        raise ErrorUso(
            "falta VIKUNJA_API_TOKEN. Defínelo en el entorno o en .env (nunca en archivos "
            "versionados). No se hizo ninguna petición a Vikunja."
        )
    return Config(url=url, token=token, proyecto=proyecto, timeout=timeout)


# ---------------------------------------------------------------------------
# Cliente HTTP
# ---------------------------------------------------------------------------


class _SinRedirecciones(urllib.request.HTTPRedirectHandler):
    """Evita que el token viaje a otro destino tras una redirección."""

    def redirect_request(self, req, fp, code, msg, headers, newurl):
        raise ErrorRemoto(
            f"el servidor respondió con una redirección HTTP {code} a {newurl}; revisa VIKUNJA_URL",
            status=code,
        )


def _detalle_error(err: urllib.error.HTTPError) -> str:
    try:
        cuerpo = err.read().decode("utf-8", errors="replace")
    except Exception:  # cuerpo ilegible
        return ""
    try:
        datos = json.loads(cuerpo)
        if isinstance(datos, dict) and datos.get("message"):
            cuerpo = str(datos["message"])
    except ValueError:
        pass
    return " ".join(cuerpo.split())[:200]


def _entero(valor: object) -> int | None:
    try:
        return int(str(valor).strip())
    except (TypeError, ValueError):
        return None


def _numero_inicial(valor: str) -> int | None:
    coincidencia = re.match(r"\s*(\d+)", valor or "")
    return int(coincidencia.group(1)) if coincidencia else None


class ClienteVikunja:
    def __init__(self, config: Config, opener=None):
        self.config = config
        self._opener = opener if opener is not None else urllib.request.build_opener(_SinRedirecciones)

    def peticion(self, metodo: str, ruta: str, datos: object = None, params: dict | None = None):
        url = self.config.api + ruta
        if params:
            url = f"{url}?{urllib.parse.urlencode(params)}"
        cuerpo = json.dumps(datos).encode("utf-8") if datos is not None else None
        cabeceras = {
            "Accept": "application/json",
            "User-Agent": USER_AGENT,
            "Authorization": f"Bearer {self.config.token}",
        }
        if cuerpo is not None:
            cabeceras["Content-Type"] = "application/json"
        req = urllib.request.Request(url, data=cuerpo, headers=cabeceras, method=metodo)
        try:
            with self._opener.open(req, timeout=self.config.timeout) as resp:
                crudo = resp.read()
                cabeceras_resp = resp.headers
        except ErrorRemoto:
            raise
        except urllib.error.HTTPError as err:
            pista = ""
            if err.code in (401, 403):
                pista = " (revisa VIKUNJA_API_TOKEN y sus permisos)"
            elif err.code == 404:
                pista = " (recurso inexistente o sin permisos)"
            raise ErrorRemoto(
                f"{metodo} {ruta} respondió HTTP {err.code}{pista}: {_detalle_error(err)}",
                status=err.code,
            ) from None
        except urllib.error.URLError as err:
            raise ErrorRemoto(f"{metodo} {ruta}: no se pudo conectar ({err.reason})") from None
        except (TimeoutError, OSError, http.client.HTTPException) as err:
            raise ErrorRemoto(f"{metodo} {ruta}: sin respuesta o conexión fallida ({err})") from None
        if not crudo:
            return None, cabeceras_resp
        try:
            return json.loads(crudo.decode("utf-8")), cabeceras_resp
        except (UnicodeDecodeError, ValueError):
            raise ErrorRemoto(f"{metodo} {ruta}: la respuesta no es JSON válido") from None

    def obtener(self, ruta: str, params: dict | None = None):
        datos, _ = self.peticion("GET", ruta, params=params)
        return datos

    def listar(self, ruta: str, params: dict | None = None) -> list:
        """Recorre todas las páginas. Cualquier fallo aborta con ErrorRemoto."""
        elementos: list = []
        pagina = 1
        while True:
            consulta = dict(params or {})
            consulta.update({"page": pagina, "per_page": POR_PAGINA})
            datos, cabeceras = self.peticion("GET", ruta, params=consulta)
            if datos is None:
                datos = []
            if not isinstance(datos, list):
                raise ErrorRemoto(f"GET {ruta} (página {pagina}) no devolvió una lista")
            elementos.extend(datos)
            total = _entero(cabeceras.get("x-pagination-total-pages")) if cabeceras is not None else None
            if total is not None:
                if pagina >= total:
                    break
            elif len(datos) < POR_PAGINA:
                break
            pagina += 1
            if pagina > MAX_PAGINAS:
                raise ErrorRemoto(f"GET {ruta}: más de {MAX_PAGINAS} páginas; se aborta")
        return elementos

    # Lecturas -------------------------------------------------------------

    def proyecto(self, proyecto_id: int) -> dict:
        datos = self.obtener(f"/projects/{proyecto_id}")
        if not isinstance(datos, dict) or "id" not in datos:
            raise ErrorRemoto(f"GET /projects/{proyecto_id} no devolvió un proyecto")
        return datos

    def tareas(self, proyecto_id: int) -> list[dict]:
        # /projects/{id}/tasks no aplica el filtro "done = false" de la vista Lista.
        unicas: dict[int, dict] = {}
        for tarea in self.listar(f"/projects/{proyecto_id}/tasks"):
            if not isinstance(tarea, dict) or not isinstance(tarea.get("id"), int):
                raise ErrorRemoto("el listado de tareas contiene elementos inválidos")
            unicas[tarea["id"]] = tarea
        return list(unicas.values())

    def tarea(self, tarea_id: int) -> dict:
        datos = self.obtener(f"/tasks/{tarea_id}")
        if not isinstance(datos, dict) or datos.get("id") != tarea_id:
            raise ErrorRemoto(f"GET /tasks/{tarea_id} no devolvió la tarea esperada")
        return datos

    def etiquetas(self) -> list[dict]:
        return [e for e in self.listar("/labels") if isinstance(e, dict)]

    def columnas(self, proyecto_id: int, vista_id: int) -> list[dict]:
        return [b for b in self.listar(f"/projects/{proyecto_id}/views/{vista_id}/buckets") if isinstance(b, dict)]

    def columna_por_tarea(self, proyecto_id: int, vista_id: int) -> dict[int, str]:
        """Devuelve {id_tarea: título de columna} leyendo la vista Kanban completa."""
        ruta = f"/projects/{proyecto_id}/views/{vista_id}/tasks"
        datos = self.obtener(ruta, params={"page": 1, "per_page": POR_PAGINA})
        if datos is None:
            datos = []
        if not isinstance(datos, list):
            raise ErrorRemoto(f"GET {ruta} no devolvió la lista de columnas")
        resultado: dict[int, str] = {}
        for columna in datos:
            if not isinstance(columna, dict):
                raise ErrorRemoto(f"GET {ruta} devolvió columnas inválidas")
            titulo = str(columna.get("title") or f"columna {columna.get('id')}")
            tareas = list(columna.get("tasks") or [])
            total = columna.get("count")
            pagina = 2
            # Vikunja pagina las tareas de cada columna por separado (filtro bucket_id).
            while isinstance(total, int) and len(tareas) < total:
                if pagina > MAX_PAGINAS:
                    raise ErrorRemoto(f"GET {ruta}: demasiadas páginas en la columna {titulo!r}")
                extra = self.obtener(
                    ruta,
                    params={"filter": f"bucket_id = {columna.get('id')}", "page": pagina, "per_page": POR_PAGINA},
                )
                nuevas: list = []
                if isinstance(extra, list):
                    for otra in extra:
                        if isinstance(otra, dict) and otra.get("id") == columna.get("id"):
                            nuevas = list(otra.get("tasks") or [])
                if not nuevas:
                    raise ErrorRemoto(f"GET {ruta}: paginación inconsistente en la columna {titulo!r}")
                tareas.extend(nuevas)
                pagina += 1
            for tarea in tareas:
                if isinstance(tarea, dict) and isinstance(tarea.get("id"), int):
                    resultado[tarea["id"]] = titulo
        return resultado

    # Escrituras (solo se llaman con --apply) ------------------------------

    def crear_tarea(self, proyecto_id: int, datos: dict) -> dict:
        creada, _ = self.peticion("PUT", f"/projects/{proyecto_id}/tasks", datos=datos)
        if not isinstance(creada, dict) or not isinstance(creada.get("id"), int):
            raise ErrorRemoto("Vikunja no devolvió la tarea creada")
        return creada

    def actualizar_tarea(self, tarea_id: int, objeto_completo: dict) -> dict:
        # Vikunja pone a cero los campos que faltan en un POST: siempre objeto completo.
        actualizada, _ = self.peticion("POST", f"/tasks/{tarea_id}", datos=objeto_completo)
        if not isinstance(actualizada, dict):
            raise ErrorRemoto(f"Vikunja no confirmó la actualización de la tarea {tarea_id}")
        return actualizada

    def crear_etiqueta(self, titulo: str, color: str) -> dict:
        creada, _ = self.peticion("PUT", "/labels", datos={"title": titulo, "hex_color": color})
        if not isinstance(creada, dict) or not isinstance(creada.get("id"), int):
            raise ErrorRemoto(f"Vikunja no devolvió la etiqueta {titulo!r}")
        return creada

    def asignar_etiqueta(self, tarea_id: int, etiqueta_id: int) -> None:
        self.peticion("PUT", f"/tasks/{tarea_id}/labels", datos={"label_id": etiqueta_id})

    def crear_columna(self, proyecto_id: int, vista_id: int, titulo: str, posicion: int) -> None:
        self.peticion(
            "PUT",
            f"/projects/{proyecto_id}/views/{vista_id}/buckets",
            datos={"title": titulo, "position": posicion},
        )


# ---------------------------------------------------------------------------
# Dominio: claves, roles y estados
# ---------------------------------------------------------------------------


def normalizar_clave(historia: str, subtarea: str | None) -> str:
    historia = historia.upper()
    return f"{historia}:{subtarea.lower()}" if subtarea else historia


def clave_desde_argumento(valor: str) -> str | None:
    coincidencia = CLAVE_ARG_RE.match((valor or "").strip().strip("`"))
    return normalizar_clave(coincidencia.group(1), coincidencia.group(2)) if coincidencia else None


def clave_de_titulo(titulo: str) -> str | None:
    coincidencia = CLAVE_TITULO_RE.match(titulo or "")
    if not coincidencia:
        return None
    return normalizar_clave(coincidencia.group(1), coincidencia.group(2) or coincidencia.group(3))


def clave_de_descripcion(descripcion: str, prefijo: str) -> str | None:
    texto = re.sub(r"<[^>]+>", " ", descripcion or "").replace("`", " ")
    patron = rf"Clave estable\s*:?\s*{re.escape(prefijo)}:(US-\d+)(?::({SLUG}))?"
    coincidencia = re.search(patron, texto, re.I)
    return normalizar_clave(coincidencia.group(1), coincidencia.group(2)) if coincidencia else None


def clave_de_tarea(tarea: dict, prefijo: str) -> str | None:
    """Clave sin prefijo (US-07 o US-07:contrato): primero la descripción, luego el título."""
    return clave_de_descripcion(str(tarea.get("description") or ""), prefijo) or clave_de_titulo(
        str(tarea.get("title") or "")
    )


def orden_por_clave(clave: str | None, tarea_id: int) -> tuple:
    if clave:
        historia, _, subtarea = clave.partition(":")
        return (0, int(historia.split("-")[1]), subtarea, tarea_id)
    return (1, 0, "", tarea_id)


def titulos_etiquetas(tarea: dict) -> list[str]:
    return [str(e.get("title") or "") for e in (tarea.get("labels") or []) if isinstance(e, dict)]


def rol_desde_texto(valor: str) -> str | None:
    valor = valor.strip().strip("`").lower()
    if valor.startswith(PREFIJO_ROL):
        valor = valor[len(PREFIJO_ROL):]
    if valor in ROLES:
        return valor
    return AGENTES_ANTIGUOS.get(valor) or ROLES_ANTIGUOS.get(valor)


def roles_de_tarea(tarea: dict) -> list[str]:
    titulos = [t.strip().lower() for t in titulos_etiquetas(tarea)]
    nuevos = {t[len(PREFIJO_ROL):] for t in titulos if t.startswith(PREFIJO_ROL) and t[len(PREFIJO_ROL):] in ROLES}
    if nuevos:
        return sorted(nuevos, key=ROLES.index)
    return sorted({ROLES_ANTIGUOS[t] for t in titulos if t in ROLES_ANTIGUOS}, key=ROLES.index)


def estado_logico(tarea: dict, columna: str | None) -> str:
    """Aplica el mapeo documentado en docs/vikunja.md."""
    if tarea.get("done"):
        return "cerrado"
    titulos = {t.strip().lower() for t in titulos_etiquetas(tarea)}
    for estado in ETIQUETAS_ESTADO:
        if f"{PREFIJO_ESTADO}{estado}" in titulos:
            return estado
    if not columna:
        return "sin_columna"
    return ESTADO_POR_COLUMNA.get(columna.strip().lower(), "sin_mapear")


def texto_prioridad(valor: object) -> str:
    numero = _entero(valor)
    if numero is None:
        return "sin prioridad"
    return f"{numero} ({PRIORIDADES.get(numero, 'desconocida')})"


def vista_kanban(proyecto: dict, vista_id: int | None = None) -> dict | None:
    vistas = proyecto.get("views")
    if not isinstance(vistas, list):
        return None
    for vista in vistas:
        if not isinstance(vista, dict):
            continue
        if vista_id is not None:
            if vista.get("id") == vista_id:
                return vista
        elif vista.get("view_kind") in ("kanban", 3):
            return vista
    return None


def leer_estado_remoto(cliente: ClienteVikunja, cfg: Config, vista_id: int | None):
    """Solo lecturas. Devuelve (proyecto, tareas, columna_por_tarea, avisos)."""
    avisos: list[str] = []
    proyecto = cliente.proyecto(cfg.proyecto)
    tareas = cliente.tareas(cfg.proyecto)
    vista = vista_kanban(proyecto, vista_id)
    columnas: dict[int, str] = {}
    if vista is None:
        if vista_id is not None:
            raise ErrorUso(f"el proyecto {cfg.proyecto} no tiene la vista {vista_id}")
        avisos.append("el proyecto no expone una vista Kanban; el estado se deriva de 'done' y etiquetas")
    else:
        columnas = cliente.columna_por_tarea(cfg.proyecto, vista["id"])
    return proyecto, tareas, columnas, avisos


def _indice_etiquetas(etiquetas: list[dict]) -> dict[str, dict]:
    return {str(e.get("title") or "").strip().lower(): e for e in etiquetas}


# ---------------------------------------------------------------------------
# PRD
# ---------------------------------------------------------------------------


def leer_historias(texto: str) -> list[dict]:
    historias: list[dict] = []
    actual: dict | None = None
    cuerpo: list[str] = []

    def cerrar() -> None:
        if actual is None:
            return
        while cuerpo and cuerpo[-1].strip() in ("", "---"):
            cuerpo.pop()
        while cuerpo and not cuerpo[0].strip():
            cuerpo.pop(0)
        actual["cuerpo"] = "\n".join(cuerpo)
        for linea in cuerpo:
            if actual["rol"] is None and RESPONSABLE_RE.search(linea):
                for valor in re.findall(r"`([^`]+)`", linea):
                    rol = rol_desde_texto(valor)
                    if rol:
                        actual["rol"] = rol
                        break
            prioridad = PRIORIDAD_RE.search(linea)
            if actual["prioridad"] is None and prioridad:
                actual["prioridad"] = int(prioridad.group(1))
        historias.append(actual)

    for linea in texto.splitlines():
        encabezado = HISTORIA_RE.match(linea)
        if encabezado:
            cerrar()
            clave = encabezado.group(1).upper()
            actual = {"clave": clave, "titulo": f"[{clave}] {encabezado.group(2)}", "rol": None, "prioridad": None}
            cuerpo = []
        elif actual is not None and ENCABEZADO_CORTE_RE.match(linea):
            cerrar()
            actual, cuerpo = None, []
        elif actual is not None:
            cuerpo.append(linea)
    cerrar()

    vistas: set[str] = set()
    for historia in historias:
        if historia["clave"] in vistas:
            raise ErrorUso(f"el PRD repite la historia {historia['clave']}")
        vistas.add(historia["clave"])
    return historias


def descripcion_con_clave(prefijo: str, clave: str, cuerpo: str) -> str:
    return f"Clave estable: `{prefijo}:{clave}`\n\n{cuerpo}".strip()


def descripcion_historia(historia: dict, prefijo: str) -> str:
    cuerpo = f"{historia['cuerpo']}\n\nFuente: PRD.md ({historia['clave']})"
    return descripcion_con_clave(prefijo, historia["clave"], cuerpo)


def diferencias_historia(historia: dict, tarea: dict, prefijo: str) -> list[str]:
    campos = []
    if str(tarea.get("title") or "").strip() != historia["titulo"].strip():
        campos.append("title")
    if str(tarea.get("description") or "").strip() != descripcion_historia(historia, prefijo):
        campos.append("description")
    if historia["prioridad"] is not None and tarea.get("priority") != historia["prioridad"]:
        campos.append("priority")
    return campos


# ---------------------------------------------------------------------------
# Espejo sprint_actual.md (formato de templates/sprint_actual.md)
# ---------------------------------------------------------------------------


def _limpiar_celda(valor: str) -> str:
    return valor.strip().strip("`*").strip()


def leer_espejo_local(texto: str):
    """Lee lo que se conserva del espejo: Reaperturas (por clave e id) y viñetas locales por clave."""
    por_clave: dict[str, str] = {}
    por_id: dict[int, str] = {}
    vinetas: dict[str, list[tuple[str, str]]] = {}
    indices: tuple[int, int, int | None] | None = None
    clave_bloque: str | None = None
    bloque: list[tuple[str, str]] = []
    recogiendo = False  # solo la lista de viñetas contigua al encabezado ### de cada tarea

    for linea in (texto or "").splitlines():
        limpia = linea.strip()
        if limpia.startswith("#"):
            if clave_bloque:
                vinetas[clave_bloque] = bloque
            clave_bloque, bloque = None, []
            recogiendo = limpia.startswith("### ")
            continue
        if limpia.startswith("|"):
            celdas = [c.strip() for c in limpia.strip("|").split("|")]
            if indices is None:
                normal = [c.lower() for c in celdas]
                if "clave estable" in normal and "reaperturas" in normal:
                    id_col = next(
                        (i for i, c in enumerate(normal) if "vikunja" in c or "ticket" in c or c == "id"), None
                    )
                    indices = (normal.index("clave estable"), normal.index("reaperturas"), id_col)
                continue
            if all(set(c) <= set("-: ") for c in celdas):
                continue
            i_clave, i_reap, i_id = indices
            if len(celdas) <= max(i_clave, i_reap):
                continue
            valor = _limpiar_celda(celdas[i_reap])
            if not valor:
                continue
            clave = _limpiar_celda(celdas[i_clave])
            if clave:
                por_clave.setdefault(clave, valor)
            if i_id is not None and i_id < len(celdas):
                ident = re.search(r"(?:VK-|#)(\d+)", celdas[i_id])
                if ident:
                    por_id.setdefault(int(ident.group(1)), valor)
            continue
        indices = None
        if limpia and not limpia.startswith("- "):
            recogiendo = False
        vineta = VINETA_RE.match(limpia) if recogiendo else None
        if vineta and vineta.group(2):
            etiqueta, valor = vineta.group(1).strip(), vineta.group(2)
            if etiqueta.lower() == "clave estable":
                clave_bloque = _limpiar_celda(valor)
            else:
                bloque.append((etiqueta, valor))
    if clave_bloque:
        vinetas[clave_bloque] = bloque

    # Reaperturas del detalle como respaldo si la tabla no la tenía.
    for clave, lista in vinetas.items():
        for etiqueta, valor in lista:
            if etiqueta.lower() == "reaperturas":
                por_clave.setdefault(clave, valor)
    return por_clave, por_id, vinetas


def construir_filas(tareas: list[dict], columnas: dict[int, str], prefijo: str) -> list[dict]:
    filas = []
    for tarea in tareas:
        clave = clave_de_tarea(tarea, prefijo)
        columna = columnas.get(tarea["id"])
        filas.append(
            {
                "id": tarea["id"],
                "orden": orden_por_clave(clave, tarea["id"]),
                "titulo": " ".join(str(tarea.get("title") or "").split()),
                "clave": f"{prefijo}:{clave}" if clave else f"{prefijo}:VK-{tarea['id']}",
                "historia": clave.split(":")[0] if clave else None,
                "roles": roles_de_tarea(tarea),
                "columna": columna,
                "done": bool(tarea.get("done")),
                "estado": estado_logico(tarea, columna),
                "prioridad": texto_prioridad(tarea.get("priority")),
                "etiquetas": sorted(titulos_etiquetas(tarea), key=str.lower),
            }
        )
    return sorted(filas, key=lambda f: f["orden"])


def reaperturas_de(fila: dict, por_clave: dict[str, str], por_id: dict[int, str]) -> str:
    return por_clave.get(fila["clave"]) or por_id.get(fila["id"]) or f"0/{MAX_REAPERTURAS}"


def generar_bloque(filas: list[dict], local, cfg: Config) -> str:
    por_clave, por_id, vinetas = local
    lineas = [
        MARCA_INICIO,
        "## Resumen",
        "",
        f"Generado con `python3 tools/vikunja_sync.py espejo --apply` desde Vikunja (proyecto {cfg.proyecto}). "
        "Del archivo local solo se conservan Reaperturas y las viñetas de detalle que Vikunja no tiene.",
        "",
        "| Vikunja | Clave estable | Rol | Estado (Vikunja / lógico) | Reaperturas |",
        "|---|---|---|---|---|",
    ]
    for fila in filas:
        rol = ", ".join(f"`{r}`" for r in fila["roles"]) or "sin rol"
        columna = fila["columna"] or "sin columna"
        lineas.append(
            f"| #{fila['id']} | `{fila['clave']}` | {rol} | {columna} / {fila['estado']} | "
            f"{reaperturas_de(fila, por_clave, por_id)} |"
        )
    if not filas:
        lineas.append("| sin tareas | - | - | - | - |")
    lineas += ["", "## Detalle por tarea", ""]
    for fila in filas:
        locales = vinetas.get(fila["clave"], [])
        historia = next((v for e, v in locales if e.lower() == "historia y escenarios"), None)
        if historia is None:
            historia = f"{fila['historia']} (escenarios por confirmar en PRD.md)" if fila["historia"] else "sin historia"
        rol = ", ".join(f"`{r}`" for r in fila["roles"]) or "sin rol"
        hecho = "sí" if fila["done"] else "no"
        etiquetas = ", ".join(f"`{e}`" for e in fila["etiquetas"]) or "ninguna"
        lineas += [
            f"### [#{fila['id']}] {fila['titulo']}",
            f"- Clave estable: `{fila['clave']}`",
            f"- Enlace: {cfg.enlace_tarea(fila['id'])}",
            f"- Historia y escenarios: {historia}",
            f"- Rol responsable: {rol}",
            f"- Estado (Vikunja / lógico): {fila['columna'] or 'sin columna'} (done={hecho}) / {fila['estado']}",
            f"- Prioridad: {fila['prioridad']}",
            f"- Etiquetas: {etiquetas}",
        ]
        lineas += [f"- {e}: {v}" for e, v in locales if e.lower() not in VINETAS_GENERADAS]
        lineas += [f"- Reaperturas: {reaperturas_de(fila, por_clave, por_id)}", ""]
    if not filas:
        lineas += ["Sin tareas en Vikunja.", ""]
    lineas.append(MARCA_FIN)
    return "\n".join(lineas)


def cabecera_por_defecto(cfg: Config) -> str:
    return (
        f"# Sprint actual — {PREFIJO_CLAVE_POR_DEFECTO}\n\n"
        f"Proyecto Vikunja: {cfg.enlace_proyecto()}\n"
        "PRD de referencia: PRD.md\n"
        "Responsable del espejo: `producto`\n"
        f"{LINEA_FECHA} nunca\n"
        f"{LINEA_RESULTADO} no ejecutada\n\n"
        "Vikunja es la fuente de verdad; este archivo es un espejo que solo regenera `producto` "
        "desde una lectura remota confirmada (ver `docs/protocolo.md` y `docs/vikunja.md`).\n\n"
    )


COLA_POR_DEFECTO = (
    "## Bloqueos y escalados\n\n"
    "| Tarea | Motivo | Dato o decisión faltante | Responsable | Desde (UTC) |\n"
    "|---|---|---|---|---|\n"
)


def separar_espejo(existente: str) -> tuple[str, str]:
    """Devuelve (cabecera, cola) alrededor de la sección generada."""
    inicio = existente.find(MARCA_INICIO)
    fin = existente.find(MARCA_FIN)
    if inicio != -1 and fin > inicio:
        return existente[:inicio], existente[fin + len(MARCA_FIN):]
    lineas = existente.splitlines(keepends=True)
    i_resumen = next((i for i, l in enumerate(lineas) if l.strip().lower() in TITULOS_RESUMEN), None)
    if i_resumen is None:
        return existente.rstrip("\n") + "\n\n", "\n"
    i_detalle = next(
        (i for i in range(i_resumen + 1, len(lineas)) if lineas[i].strip().lower() in TITULOS_DETALLE), None
    )
    desde = i_detalle if i_detalle is not None else i_resumen
    i_cola = next((i for i in range(desde + 1, len(lineas)) if re.match(r"^## \S", lineas[i])), None)
    cola = "".join(lineas[i_cola:]) if i_cola is not None else ""
    return "".join(lineas[:i_resumen]), "\n" + ("\n" + cola if cola else "")


def actualizar_cabecera(cabecera: str, fecha: str, resultado: str) -> str:
    lineas = cabecera.split("\n")
    pendientes = {LINEA_FECHA: f"{LINEA_FECHA} {fecha}", LINEA_RESULTADO: f"{LINEA_RESULTADO} {resultado}"}
    for i, linea in enumerate(lineas):
        for prefijo in list(pendientes):
            if linea.startswith(prefijo):
                lineas[i] = pendientes.pop(prefijo)
    texto = "\n".join(lineas)
    if pendientes:
        texto = texto.rstrip("\n") + "\n\n" + "\n".join(pendientes.values()) + "\n\n"
    return texto


def componer_espejo(existente: str | None, bloque: str, cfg: Config, fecha: str, resultado: str) -> str:
    if existente:
        cabecera, cola = separar_espejo(existente)
    else:
        cabecera, cola = cabecera_por_defecto(cfg), "\n\n" + COLA_POR_DEFECTO
    return actualizar_cabecera(cabecera, fecha, resultado) + bloque + cola


def _sin_marcas_de_sincronizacion(texto: str | None) -> str:
    patron = rf"^({re.escape(LINEA_FECHA)}|{re.escape(LINEA_RESULTADO)}).*$"
    return re.sub(patron, r"\1", texto or "", flags=re.M)


# ---------------------------------------------------------------------------
# Comandos
# ---------------------------------------------------------------------------


def _modo(args: argparse.Namespace) -> str:
    return "APLICAR" if args.apply else "SIMULACIÓN (no se escribe nada; usa --apply)"


def _leer_texto(ruta: Path, que: str) -> str:
    try:
        return ruta.read_text(encoding="utf-8")
    except FileNotFoundError:
        raise ErrorUso(f"no existe {que}: {ruta}") from None
    except OSError as err:
        raise ErrorUso(f"no se pudo leer {que} {ruta}: {err}") from None


def cmd_info(_args, cfg: Config, cliente: ClienteVikunja) -> int:
    info = cliente.obtener("/info")
    usuario = cliente.obtener("/user")
    proyecto = cliente.proyecto(cfg.proyecto)
    version = info.get("version", "desconocida") if isinstance(info, dict) else "desconocida"
    nombre = usuario.get("username", "desconocido") if isinstance(usuario, dict) else "desconocido"
    kanban = vista_kanban(proyecto)
    print(f"Servidor: {cfg.url} (versión {version})")
    print(f"Usuario autenticado: {nombre}")
    print(f"Proyecto: {proyecto.get('id')} - {proyecto.get('title')}")
    print(f"Vista Kanban: {kanban.get('id') if kanban else 'no encontrada'}")
    return EXIT_OK


def cmd_proyectos(_args, cfg: Config, cliente: ClienteVikunja) -> int:
    proyectos = [p for p in cliente.listar("/projects") if isinstance(p, dict)]
    print(f"Proyectos accesibles: {len(proyectos)}")
    for proyecto in proyectos:
        archivado = " (archivado)" if proyecto.get("is_archived") else ""
        marca = " <- configurado" if proyecto.get("id") == cfg.proyecto else ""
        print(f"  [{proyecto.get('id')}] {proyecto.get('title')}{archivado}{marca}")
    return EXIT_OK


def cmd_tareas(args, cfg: Config, cliente: ClienteVikunja) -> int:
    _, tareas, columnas, avisos = leer_estado_remoto(cliente, cfg, args.vista_kanban)
    for aviso in avisos:
        eprint(f"aviso: {aviso}")
    filas = construir_filas(tareas, columnas, args.prefijo_clave)
    if args.pendientes:
        filas = [f for f in filas if not f["done"]]
    print(f"Tareas en el proyecto {cfg.proyecto}: {len(filas)}")
    for fila in filas:
        roles = ",".join(fila["roles"]) or "sin rol"
        print(
            f"  #{fila['id']:<5} {fila['clave']:<34} {roles:<14} {fila['estado']:<13} "
            f"{fila['columna'] or 'sin columna':<13} prioridad {fila['prioridad']:<15} {fila['titulo']}"
        )
    return EXIT_OK


def cmd_preparar(args, cfg: Config, cliente: ClienteVikunja) -> int:
    # 1) Solo lecturas: si algo falla, se aborta sin escribir.
    proyecto = cliente.proyecto(cfg.proyecto)
    etiquetas = _indice_etiquetas(cliente.etiquetas())
    vista = vista_kanban(proyecto, args.vista_kanban)
    existentes_col: set[str] = set()
    if vista is not None:
        existentes_col = {str(b.get("title") or "").strip().lower() for b in cliente.columnas(cfg.proyecto, vista["id"])}
    tareas = cliente.tareas(cfg.proyecto) if args.migrar_roles else []

    deseadas = [(f"{PREFIJO_ROL}{r}", COLORES_ROL[r]) for r in ROLES]
    deseadas += [(f"{PREFIJO_ESTADO}{e}", COLORES_ESTADO[e]) for e in ETIQUETAS_ESTADO]
    faltan_etiquetas = [(t, c) for t, c in deseadas if t not in etiquetas]
    faltan_columnas = [(t, p) for t, p, _ in COLUMNAS_KANBAN if t.lower() not in existentes_col] if vista else []
    migraciones: list[tuple[dict, str]] = []
    for tarea in tareas:
        titulos = {t.strip().lower() for t in titulos_etiquetas(tarea)}
        destino = {ROLES_ANTIGUOS[t] for t in titulos if t in ROLES_ANTIGUOS}
        for rol in sorted(destino, key=ROLES.index):
            if f"{PREFIJO_ROL}{rol}" not in titulos:
                migraciones.append((tarea, rol))

    print(f"Modo: {_modo(args)}")
    print(f"Proyecto {cfg.proyecto}: {proyecto.get('title')}")
    print("Etiquetas (nunca se borran las existentes):")
    for titulo, _ in deseadas:
        print(f"  {'crear' if titulo not in etiquetas else 'existe':<7} {titulo}")
    if vista is None:
        eprint("aviso: el proyecto no tiene vista Kanban; créala en Vikunja (este script no crea vistas)")
    else:
        print(f"Columnas Kanban (vista {vista.get('id')}):")
        for titulo, _, estado in COLUMNAS_KANBAN:
            print(f"  {'crear' if titulo.lower() not in existentes_col else 'existe':<7} {titulo} -> {estado}")
    if args.migrar_roles:
        print(f"Migración de roles (se añade la etiqueta nueva; las antiguas no se tocan): {len(migraciones)}")
        for tarea, rol in migraciones:
            print(f"  añadir  {PREFIJO_ROL}{rol} a #{tarea['id']} {tarea.get('title')}")

    if not args.apply:
        return EXIT_OK

    # 2) Escrituras.
    for titulo, color in faltan_etiquetas:
        etiquetas[titulo] = cliente.crear_etiqueta(titulo, color)
        print(f"creada etiqueta {titulo} (id {etiquetas[titulo]['id']})")
    for titulo, posicion in faltan_columnas:
        cliente.crear_columna(cfg.proyecto, vista["id"], titulo, posicion)
        print(f"creada columna {titulo}")
    for tarea, rol in migraciones:
        cliente.asignar_etiqueta(tarea["id"], etiquetas[f"{PREFIJO_ROL}{rol}"]["id"])
        print(f"añadida {PREFIJO_ROL}{rol} a #{tarea['id']}")
    return EXIT_OK


def cmd_sincronizar(args, cfg: Config, cliente: ClienteVikunja) -> int:
    prefijo = args.prefijo_clave
    historias = leer_historias(_leer_texto(Path(args.prd), "el PRD"))
    if not historias:
        raise ErrorUso(f"{args.prd} no contiene historias con encabezado '### [US-xx] Título'")

    # 1) Solo lecturas: si algo falla, se aborta sin crear nada.
    cliente.proyecto(cfg.proyecto)
    tareas = cliente.tareas(cfg.proyecto)
    etiquetas = _indice_etiquetas(cliente.etiquetas())

    por_clave: dict[str, list[dict]] = {}
    for tarea in tareas:
        clave = clave_de_tarea(tarea, prefijo)
        if clave:
            por_clave.setdefault(clave, []).append(tarea)

    crear, actualizar, ambiguas, iguales = [], [], [], []
    for historia in historias:
        candidatas = por_clave.get(historia["clave"], [])
        if len(candidatas) > 1:
            ambiguas.append((historia, candidatas))
        elif candidatas:
            campos = diferencias_historia(historia, candidatas[0], prefijo)
            (actualizar if campos else iguales).append((historia, candidatas[0], campos))
        else:
            crear.append(historia)
    faltan = sorted({h["rol"] for h in crear if h["rol"] and f"{PREFIJO_ROL}{h['rol']}" not in etiquetas})

    print(f"Modo: {_modo(args)}")
    print(f"Proyecto {cfg.proyecto}; historias en {args.prd}: {len(historias)}; tareas remotas: {len(tareas)}")
    for historia in crear:
        print(f"  crear      {historia['clave']:<7} {historia['titulo']} (rol: {historia['rol'] or 'sin rol'})")
    for historia, tarea, campos in actualizar:
        accion = "actualizar" if args.force_update else "difiere"
        print(f"  {accion:<10} {historia['clave']:<7} #{tarea['id']} campos: {', '.join(campos)}")
    for historia, tarea, _ in iguales:
        print(f"  al día     {historia['clave']:<7} #{tarea['id']}")
    for historia, candidatas in ambiguas:
        print(f"  ambigua    {historia['clave']:<7} {', '.join('#' + str(t['id']) for t in candidatas)}")
    for historia in crear:
        if not historia["rol"]:
            eprint(f"aviso: {historia['clave']} no declara '**Responsable**: `rol`' en el PRD; se crearía sin etiqueta de rol")
    if actualizar and not args.force_update:
        print("Las tareas que difieren no se actualizan (manda Vikunja). --apply --force-update hace prevalecer el PRD.")

    nivel = "error" if args.apply else "aviso"
    if ambiguas:
        eprint(f"{nivel}: hay claves duplicadas en Vikunja; resuélvelas a mano. Con duplicados no se escribe nada.")
        if args.apply:
            return EXIT_USO
    if faltan and crear:
        nombres = ", ".join(f"{PREFIJO_ROL}{r}" for r in faltan)
        eprint(f"{nivel}: faltan etiquetas {nombres}. Ejecuta primero: python3 tools/vikunja_sync.py preparar --apply")
        if args.apply:
            return EXIT_USO
    if not args.apply:
        return EXIT_OK

    # 2) Escrituras.
    for historia in crear:
        datos = {"title": historia["titulo"], "description": descripcion_historia(historia, prefijo)}
        if historia["prioridad"] is not None:
            datos["priority"] = historia["prioridad"]
        creada = cliente.crear_tarea(cfg.proyecto, datos)
        print(f"creada #{creada['id']} {historia['titulo']}")
        if historia["rol"]:
            cliente.asignar_etiqueta(creada["id"], etiquetas[f"{PREFIJO_ROL}{historia['rol']}"]["id"])
    if args.force_update:
        for historia, tarea, campos in actualizar:
            completo = cliente.tarea(tarea["id"])
            if "title" in campos:
                completo["title"] = historia["titulo"]
            if "description" in campos:
                completo["description"] = descripcion_historia(historia, prefijo)
            if "priority" in campos:
                completo["priority"] = historia["prioridad"]
            cliente.actualizar_tarea(tarea["id"], completo)
            print(f"actualizada #{tarea['id']} ({', '.join(campos)})")
    if crear or (args.force_update and actualizar):
        print("Confirma con una lectura nueva y regenera el espejo: python3 tools/vikunja_sync.py espejo --apply")
    return EXIT_OK


def cmd_crear_tarea(args, cfg: Config, cliente: ClienteVikunja) -> int:
    prefijo = args.prefijo_clave
    titulo = " ".join((args.titulo or "").split())
    if not titulo:
        raise ErrorUso("--titulo no puede estar vacío")
    if args.clave:
        clave = clave_desde_argumento(args.clave)
        if clave is None:
            raise ErrorUso("--clave debe tener la forma US-xx o US-xx:<tarea> (por ejemplo US-07:contrato)")
    else:
        clave = clave_de_titulo(titulo)
        if clave is None:
            raise ErrorUso("indica --clave US-xx[:tarea] o empieza el título por [US-xx] o [US-xx][tarea]")
    descripcion = args.descripcion or ""
    if args.descripcion_archivo:
        descripcion = _leer_texto(Path(args.descripcion_archivo), "el archivo de descripción")
    descripcion = descripcion_con_clave(prefijo, clave, descripcion)

    # 1) Solo lecturas.
    cliente.proyecto(cfg.proyecto)
    tareas = cliente.tareas(cfg.proyecto)
    etiquetas = _indice_etiquetas(cliente.etiquetas())

    for tarea in tareas:
        mismo_titulo = str(tarea.get("title") or "").strip().lower() == titulo.lower()
        if mismo_titulo or clave_de_tarea(tarea, prefijo) == clave:
            eprint(f"error: ya existe #{tarea['id']} {tarea.get('title')!r} con esa clave o título; no se crea un duplicado")
            return EXIT_USO
    etiqueta = etiquetas.get(f"{PREFIJO_ROL}{args.rol}")

    print(f"Modo: {_modo(args)}")
    print(f"  crear {titulo!r} clave {prefijo}:{clave} (rol: {args.rol}, prioridad: {texto_prioridad(args.prioridad)})")
    if etiqueta is None:
        nivel = "error" if args.apply else "aviso"
        eprint(f"{nivel}: falta la etiqueta {PREFIJO_ROL}{args.rol}. Ejecuta: python3 tools/vikunja_sync.py preparar --apply")
        return EXIT_USO if args.apply else EXIT_OK
    if not args.apply:
        return EXIT_OK

    # 2) Escrituras.
    datos = {"title": titulo, "description": descripcion}
    if args.prioridad is not None:
        datos["priority"] = args.prioridad
    creada = cliente.crear_tarea(cfg.proyecto, datos)
    cliente.asignar_etiqueta(creada["id"], etiqueta["id"])
    print(f"creada #{creada['id']} {titulo}")
    print("Confirma con una lectura nueva y regenera el espejo: python3 tools/vikunja_sync.py espejo --apply")
    return EXIT_OK


def cmd_espejo(args, cfg: Config, cliente: ClienteVikunja) -> int:
    ruta = Path(args.archivo)
    existente = _leer_texto(ruta, "el espejo") if ruta.exists() else None
    local = leer_espejo_local(existente or "")

    # Si la lectura remota falla se lanza ErrorRemoto y el espejo queda intacto.
    _, tareas, columnas, avisos = leer_estado_remoto(cliente, cfg, args.vista_kanban)
    for aviso in avisos:
        eprint(f"aviso: {aviso}")
    filas = construir_filas(tareas, columnas, args.prefijo_clave)
    resultado = f"correcta ({len(filas)} tareas leídas de Vikunja)"
    nuevo = componer_espejo(existente, generar_bloque(filas, local, cfg), cfg, ahora_utc(), resultado)

    por_clave, por_id, _ = local
    presentes = {f["clave"] for f in filas}
    conservadas = sum(1 for f in filas if f["clave"] in por_clave or f["id"] in por_id)
    print(f"Modo: {_modo(args)}")
    print(f"Tareas remotas: {len(filas)}; con reaperturas locales conservadas: {conservadas}")
    for clave, valor in sorted(por_clave.items()):
        if clave.startswith(f"{args.prefijo_clave}:") and clave not in presentes and (_numero_inicial(valor) or 0) > 0:
            eprint(f"aviso: {clave} tenía reaperturas {valor} y ya no está en Vikunja; revísalo a mano")
    for fila in filas:
        if (_numero_inicial(reaperturas_de(fila, por_clave, por_id)) or 0) >= MAX_REAPERTURAS:
            eprint(f"aviso: #{fila['id']} ({fila['clave']}) llegó a {MAX_REAPERTURAS} reaperturas: escalado humano")
        if fila["estado"] in ("sin_mapear", "sin_columna"):
            eprint(f"aviso: #{fila['id']} en columna {fila['columna']!r} sin estado lógico mapeado (ver docs/vikunja.md)")

    if _sin_marcas_de_sincronizacion(existente) == _sin_marcas_de_sincronizacion(nuevo):
        print(f"{ruta.name}: sin cambios en las tareas")
    else:
        diff = difflib.unified_diff(
            (existente or "").splitlines(keepends=True),
            nuevo.splitlines(keepends=True),
            fromfile=f"{ruta.name} (actual)",
            tofile=f"{ruta.name} (desde Vikunja)",
            n=1,
        )
        sys.stdout.writelines(diff)
        if not nuevo.endswith("\n"):
            print()
    if not args.apply:
        return EXIT_OK
    try:
        ruta.write_text(nuevo, encoding="utf-8")
    except OSError as err:
        raise ErrorUso(f"no se pudo escribir {ruta}: {err}") from None
    print(f"{ruta.name} regenerado desde Vikunja; fecha de sincronización registrada")
    return EXIT_OK


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------


class _Formato(argparse.RawDescriptionHelpFormatter):
    def add_usage(self, usage, actions, groups, prefix=None):
        return super().add_usage(usage, actions, groups, prefix="uso: " if prefix is None else prefix)


class _Parser(argparse.ArgumentParser):
    def __init__(self, *args, **kwargs):
        kwargs.setdefault("formatter_class", _Formato)
        kwargs.setdefault("add_help", False)
        padres = kwargs.pop("parents", [])
        super().__init__(*args, **kwargs)
        # Títulos en español antes de copiar los padres para que se fusionen los grupos.
        self._positionals.title = "comandos"
        self._optionals.title = "opciones"
        for padre in padres:
            self._add_container_actions(padre)
            self._defaults.update(getattr(padre, "_defaults", {}))

    def error(self, message):
        self.print_usage(sys.stderr)
        self.exit(EXIT_USO, f"error: {message}\n")


EPILOGO = """\
variables de entorno (también se leen de .env si existe; solo claves VIKUNJA_*):
  VIKUNJA_API_TOKEN   token de API (obligatorio para cualquier comando)
  VIKUNJA_URL         URL base, por defecto https://vikunja.arcav.us
  VIKUNJA_PROJECT_ID  id del proyecto, por defecto 2
  VIKUNJA_TIMEOUT     segundos por petición, por defecto 20

ejemplos:
  python3 tools/vikunja_sync.py info
  python3 tools/vikunja_sync.py tareas --pendientes
  python3 tools/vikunja_sync.py espejo                # muestra el diff, no escribe
  python3 tools/vikunja_sync.py espejo --apply        # escribe sprint_actual.md
  python3 tools/vikunja_sync.py sincronizar           # plan PRD.md -> Vikunja
  python3 tools/vikunja_sync.py sincronizar --apply   # crea solo las faltantes
  python3 tools/vikunja_sync.py crear-tarea --clave US-07:contrato \\
      --titulo "[US-07][contrato] Contrato del formulario" --rol integraciones

códigos de salida: 0 correcto, 1 error de uso o configuración, 2 error remoto.
Mapeo de columnas, etiquetas y estados lógicos: docs/vikunja.md.
"""


def construir_parser() -> _Parser:
    ayuda = _Parser()
    ayuda.add_argument("-h", "--help", action="help", help="muestra esta ayuda y sale")

    comun = _Parser()
    grupo = comun.add_argument_group("conexión")
    grupo.add_argument("--url", help="URL base de Vikunja (sustituye a VIKUNJA_URL)")
    grupo.add_argument("--proyecto", type=int, metavar="ID", help="id del proyecto (sustituye a VIKUNJA_PROJECT_ID)")
    grupo.add_argument("--timeout", type=float, metavar="SEG", help="timeout por petición en segundos")
    grupo.add_argument("--env-file", metavar="RUTA", help="archivo .env alternativo (por defecto .env del repo)")
    grupo.add_argument("--sin-env", action="store_true", help="no leer ningún archivo .env")

    clave = _Parser()
    clave.add_argument(
        "--prefijo-clave", default=PREFIJO_CLAVE_POR_DEFECTO, metavar="TEXTO",
        help=f"prefijo de la clave estable (por defecto {PREFIJO_CLAVE_POR_DEFECTO})",
    )

    escritura = _Parser()
    modo = escritura.add_mutually_exclusive_group()
    modo.add_argument("--dry-run", action="store_true", help="simula y muestra qué haría (por defecto)")
    modo.add_argument("--apply", action="store_true", help="aplica los cambios")

    vista = _Parser()
    vista.add_argument("--vista-kanban", type=int, metavar="ID", help="id de la vista Kanban (por defecto la primera)")

    parser = _Parser(prog="vikunja_sync.py", description=__doc__, epilog=EPILOGO, parents=[ayuda])
    sub = parser.add_subparsers(dest="comando", metavar="COMANDO", parser_class=_Parser)

    def agregar(nombre, funcion, texto, padres):
        p = sub.add_parser(nombre, help=texto, description=texto, parents=[ayuda] + padres)
        p.set_defaults(funcion=funcion)
        return p

    agregar("info", cmd_info, "comprueba conexión, token, versión y proyecto (solo lectura)", [comun])
    agregar("proyectos", cmd_proyectos, "lista los proyectos accesibles (solo lectura)", [comun])
    p = agregar("tareas", cmd_tareas, "lista tareas con clave, rol, estado lógico y prioridad (solo lectura)",
                [comun, clave, vista])
    p.add_argument("--pendientes", action="store_true", help="oculta las tareas cerradas")

    p = agregar("preparar", cmd_preparar,
                "asegura etiquetas rol:* y estado:* y columnas Kanban; nunca borra nada", [comun, escritura, vista])
    p.add_argument("--migrar-roles", action="store_true", help="añade rol:* a las tareas que solo tienen role:* antiguas")

    p = agregar("sincronizar", cmd_sincronizar,
                "compara las historias de PRD.md con Vikunja por clave estable; crea las faltantes con --apply",
                [comun, clave, escritura])
    p.add_argument("--prd", default=str(ROOT_DIR / "PRD.md"), metavar="RUTA", help="ruta del PRD (por defecto PRD.md)")
    p.add_argument("--force-update", action="store_true",
                   help="con --apply, sobrescribe título, descripción y prioridad de tareas existentes desde el PRD")

    p = agregar("crear-tarea", cmd_crear_tarea, "crea una tarea con clave estable y etiqueta de rol",
                [comun, clave, escritura])
    p.add_argument("--titulo", required=True, help="título, p. ej. '[US-07][contrato] Contrato del formulario'")
    p.add_argument("--clave", help="clave sin prefijo, p. ej. US-07:contrato (por defecto se deduce del título)")
    p.add_argument("--rol", required=True, choices=ROLES, help="rol responsable")
    p.add_argument("--prioridad", type=int, choices=range(0, 6), metavar="0-5", help="prioridad de Vikunja (0-5)")
    p.add_argument("--descripcion", help="descripción en texto (se antepone la clave estable)")
    p.add_argument("--descripcion-archivo", metavar="RUTA", help="lee la descripción de un archivo")

    p = agregar("espejo", cmd_espejo,
                "regenera sprint_actual.md desde Vikunja conservando Reaperturas y viñetas locales",
                [comun, clave, escritura, vista])
    p.add_argument("--archivo", default=str(ROOT_DIR / "sprint_actual.md"), metavar="RUTA", help="ruta del espejo")
    return parser


def main(argv: list[str] | None = None, opener=None) -> int:
    parser = construir_parser()
    args = parser.parse_args(argv)
    if not getattr(args, "comando", None):
        parser.print_help(sys.stderr)
        return EXIT_USO
    if getattr(args, "force_update", False) and not args.apply:
        eprint("aviso: --force-update sin --apply solo muestra lo que se actualizaría")
    try:
        cfg = resolver_config(args)
        cliente = ClienteVikunja(cfg, opener=opener)
        return args.funcion(args, cfg, cliente)
    except ErrorUso as err:
        eprint(f"error: {err}")
        return EXIT_USO
    except ErrorRemoto as err:
        eprint(f"error remoto: {err}")
        eprint("Operación abortada: no se hicieron más escrituras. Relee antes de reintentar.")
        return EXIT_REMOTO


if __name__ == "__main__":
    sys.exit(main())
