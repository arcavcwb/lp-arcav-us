"""Pruebas de tools/vikunja_sync.py con un servidor Vikunja simulado (nunca red real)."""

import ast
import contextlib
import copy
import email.message
import importlib.util
import io
import json
import os
import py_compile
import tempfile
import unittest
import urllib.error
import urllib.parse
from pathlib import Path
from unittest import mock

SOURCE = Path(__file__).resolve().parents[1]
SCRIPT = SOURCE / "tools" / "vikunja_sync.py"
spec = importlib.util.spec_from_file_location("vikunja_sync", SCRIPT)
vs = importlib.util.module_from_spec(spec)
spec.loader.exec_module(vs)

PREFIJO = "lp-arcav-us"
FECHA = "2026-09-17 10:00 UTC"
ENTORNO = {"VIKUNJA_API_TOKEN": "token-de-prueba", "VIKUNJA_URL": "https://vikunja.test"}
_parches = []


def _red_prohibida(*_args, **_kwargs):
    raise AssertionError("las pruebas nunca deben abrir conexiones reales")


def setUpModule():
    for objetivo in ("urllib.request.build_opener", "urllib.request.urlopen"):
        parche = mock.patch(objetivo, _red_prohibida)
        parche.start()
        _parches.append(parche)


def tearDownModule():
    while _parches:
        _parches.pop().stop()


class RespuestaFalsa:
    def __init__(self, datos, cabeceras=None):
        self._cuerpo = b"" if datos is None else json.dumps(datos).encode("utf-8")
        self.headers = email.message.Message()
        for clave, valor in (cabeceras or {}).items():
            self.headers[clave] = str(valor)

    def read(self):
        return self._cuerpo

    def __enter__(self):
        return self

    def __exit__(self, *exc):
        return False


class ServidorFalso:
    """Opener falso: enruta (método, ruta) a respuestas y registra cada llamada."""

    def __init__(self):
        self.rutas = {}
        self.llamadas = []

    def en(self, metodo, ruta, respuesta):
        self.rutas[(metodo, ruta)] = respuesta
        return self

    def escrituras(self):
        return [c for c in self.llamadas if c["metodo"] != "GET"]

    def open(self, req, timeout=None):
        partes = urllib.parse.urlsplit(req.full_url)
        ruta = partes.path[len("/api/v1"):] if partes.path.startswith("/api/v1") else partes.path
        llamada = {
            "metodo": req.get_method(),
            "ruta": ruta,
            "consulta": {k: v[0] for k, v in urllib.parse.parse_qs(partes.query).items()},
            "cuerpo": json.loads(req.data.decode("utf-8")) if req.data else None,
            "timeout": timeout,
            "cabeceras": dict(req.header_items()),
        }
        self.llamadas.append(llamada)
        respuesta = self.rutas.get((llamada["metodo"], ruta))
        if respuesta is None:
            raise AssertionError(f"petición no esperada: {llamada['metodo']} {ruta}")
        resultado = respuesta(llamada) if callable(respuesta) else respuesta
        estado, datos = resultado[0], resultado[1]
        cabeceras = resultado[2] if len(resultado) > 2 else None
        if estado >= 400:
            raise urllib.error.HTTPError(
                req.full_url, estado, "error", email.message.Message(),
                io.BytesIO(json.dumps(datos).encode("utf-8")),
            )
        return RespuestaFalsa(datos, cabeceras)


def paginado(elementos):
    """Respuesta que pagina como Vikunja y publica x-pagination-total-pages."""
    def respuesta(llamada):
        tam = int(llamada["consulta"].get("per_page", 50))
        pagina = int(llamada["consulta"].get("page", 1))
        total = max(1, -(-len(elementos) // tam))
        inicio = (pagina - 1) * tam
        return 200, elementos[inicio:inicio + tam], {"x-pagination-total-pages": total}
    return respuesta


def tarea(id_, titulo, **extra):
    base = {
        "id": id_, "title": titulo, "description": "", "done": False, "priority": 0,
        "labels": [], "assignees": None, "due_date": "0001-01-01T00:00:00Z", "project_id": 2,
    }
    base.update(extra)
    return base


def etiqueta(id_, titulo):
    return {"id": id_, "title": titulo}


PROYECTO = {"id": 2, "title": "lp-arcav-us", "views": [{"id": 5, "view_kind": "list"}, {"id": 8, "view_kind": "kanban"}]}
ETIQUETAS_ROL = [etiqueta(100 + i, f"rol:{r}") for i, r in enumerate(vs.ROLES)]

PRD = """# PRD

## Historias de usuario

### [US-01] Definición del PRD
- **Como** Product Owner (`po-agent`)
- **Responsable**: `producto`

#### Criterios
1. Camino feliz.

---

### [US-02] Formulario de contacto
- **Responsable**: `integraciones`
- **Prioridad**: 3

---

## Fuera de alcance
- Nada.
"""


def servidor_base(tareas, etiquetas=None):
    servidor = ServidorFalso()
    servidor.en("GET", "/projects/2", (200, copy.deepcopy(PROYECTO)))
    servidor.en("GET", "/projects/2/tasks", paginado(tareas))
    servidor.en("GET", "/labels", paginado(ETIQUETAS_ROL if etiquetas is None else etiquetas))
    return servidor


def ejecutar(argv, servidor=None, entorno=None, fecha=FECHA):
    salida, errores = io.StringIO(), io.StringIO()
    env = dict(ENTORNO if entorno is None else entorno)
    servidor = servidor if servidor is not None else ServidorFalso()
    with mock.patch.dict(os.environ, env, clear=True), mock.patch.object(vs, "ahora_utc", return_value=fecha), \
            contextlib.redirect_stdout(salida), contextlib.redirect_stderr(errores):
        codigo = vs.main(argv + ["--sin-env"], opener=servidor)
    return codigo, salida.getvalue(), errores.getvalue()


class CompatibilidadTests(unittest.TestCase):
    def test_compila_en_python_310(self):
        with tempfile.TemporaryDirectory() as tmp:
            py_compile.compile(str(SCRIPT), cfile=str(Path(tmp) / "vikunja_sync.pyc"), doraise=True)
        ast.parse(SCRIPT.read_text(encoding="utf-8"), feature_version=(3, 10))

    def test_solo_biblioteca_estandar(self):
        modulos = set()
        for nodo in ast.walk(ast.parse(SCRIPT.read_text(encoding="utf-8"))):
            if isinstance(nodo, ast.Import):
                modulos.update(a.name.split(".")[0] for a in nodo.names)
            elif isinstance(nodo, ast.ImportFrom) and nodo.module:
                modulos.add(nodo.module.split(".")[0])
        permitidos = {"__future__", "argparse", "datetime", "difflib", "http", "json", "os", "re", "sys",
                      "urllib", "pathlib"}
        self.assertLessEqual(modulos, permitidos)

    def test_help_en_espanol_y_errores_de_uso(self):
        with contextlib.redirect_stdout(io.StringIO()) as salida, self.assertRaises(SystemExit) as ctx:
            vs.main(["--help"])
        self.assertEqual(ctx.exception.code, 0)
        self.assertIn("uso:", salida.getvalue())
        self.assertIn("códigos de salida", salida.getvalue())
        with contextlib.redirect_stderr(io.StringIO()), self.assertRaises(SystemExit) as ctx:
            vs.main(["espejo", "--apply", "--dry-run"])
        self.assertEqual(ctx.exception.code, vs.EXIT_USO)
        with contextlib.redirect_stderr(io.StringIO()):
            self.assertEqual(vs.main([]), vs.EXIT_USO)


class ConfiguracionTests(unittest.TestCase):
    def test_sin_token_falla_sin_peticiones(self):
        comandos = [
            ["info"], ["proyectos"], ["tareas"], ["preparar"], ["sincronizar"],
            ["crear-tarea", "--titulo", "[US-01] x", "--rol", "producto"], ["espejo"],
        ]
        for argv in comandos:
            with self.subTest(argv=argv):
                servidor = ServidorFalso()
                codigo, _, errores = ejecutar(argv, servidor, entorno={})
                self.assertEqual(codigo, vs.EXIT_USO)
                self.assertIn("VIKUNJA_API_TOKEN", errores)
                self.assertEqual(servidor.llamadas, [])

    def test_token_placeholder_equivale_a_sin_token(self):
        servidor = ServidorFalso()
        codigo, _, _ = ejecutar(["info"], servidor, entorno={"VIKUNJA_API_TOKEN": vs.TOKEN_PLACEHOLDER})
        self.assertEqual(codigo, vs.EXIT_USO)
        self.assertEqual(servidor.llamadas, [])

    def test_configuracion_invalida_es_error_de_uso(self):
        for entorno in (
            dict(ENTORNO, VIKUNJA_URL="http://vikunja.arcav.us"),
            dict(ENTORNO, VIKUNJA_PROJECT_ID="dos"),
            dict(ENTORNO, VIKUNJA_TIMEOUT="0"),
        ):
            with self.subTest(entorno=entorno):
                servidor = ServidorFalso()
                codigo, _, _ = ejecutar(["info"], servidor, entorno=entorno)
                self.assertEqual(codigo, vs.EXIT_USO)
                self.assertEqual(servidor.llamadas, [])

    def test_url_proyecto_y_timeout_configurables(self):
        servidor = ServidorFalso()
        servidor.en("GET", "/info", (200, {"version": "v0.24.6"}))
        servidor.en("GET", "/user", (200, {"username": "armando"}))
        servidor.en("GET", "/projects/7", (200, dict(PROYECTO, id=7)))
        entorno = dict(ENTORNO, VIKUNJA_PROJECT_ID="7", VIKUNJA_URL="https://otro.test/api/v1/")
        codigo, salida, _ = ejecutar(["info", "--timeout", "3.5"], servidor, entorno=entorno)
        self.assertEqual(codigo, vs.EXIT_OK)
        self.assertIn("v0.24.6", salida)
        self.assertTrue(all(c["timeout"] == 3.5 for c in servidor.llamadas))
        self.assertEqual(servidor.llamadas[0]["cabeceras"].get("Authorization"), "Bearer token-de-prueba")

    def test_cargar_env_solo_vikunja_sin_sobrescribir_ni_imprimir(self):
        with tempfile.TemporaryDirectory() as tmp:
            ruta = Path(tmp) / ".env"
            ruta.write_text(
                "VIKUNJA_API_TOKEN='secreto'\nexport VIKUNJA_PROJECT_ID=9\nOTRA_CLAVE=no\n"
                "VIKUNJA_URL=https://ignorada.test\n",
                encoding="utf-8",
            )
            with mock.patch.dict(os.environ, {"VIKUNJA_URL": "https://entorno.test"}, clear=True), \
                    contextlib.redirect_stdout(io.StringIO()) as salida:
                cargadas = vs.cargar_env(ruta)
                self.assertEqual(os.environ["VIKUNJA_API_TOKEN"], "secreto")
                self.assertEqual(os.environ["VIKUNJA_PROJECT_ID"], "9")
                self.assertEqual(os.environ["VIKUNJA_URL"], "https://entorno.test")
                self.assertNotIn("OTRA_CLAVE", os.environ)
            self.assertEqual(sorted(cargadas), ["VIKUNJA_API_TOKEN", "VIKUNJA_PROJECT_ID"])
            self.assertEqual(salida.getvalue(), "")

    def test_redireccion_no_se_sigue(self):
        with self.assertRaises(vs.ErrorRemoto):
            vs._SinRedirecciones().redirect_request(None, None, 302, "Found", {}, "https://otro.test/login")


class PaginacionTests(unittest.TestCase):
    def cliente(self, servidor):
        return vs.ClienteVikunja(vs.Config("https://vikunja.test", "t", 2, 5.0), opener=servidor)

    def test_recorre_todas_las_paginas_con_cabecera(self):
        servidor = ServidorFalso().en("GET", "/projects/2/tasks", paginado([tarea(i, f"T{i}") for i in range(1, 54)]))
        self.assertEqual(len(self.cliente(servidor).tareas(2)), 53)
        self.assertEqual([c["consulta"]["page"] for c in servidor.llamadas], ["1", "2"])

    def test_sin_cabecera_se_detiene_en_pagina_incompleta(self):
        paginas = {1: [etiqueta(i, "x") for i in range(50)], 2: [etiqueta(99, "y")]}
        servidor = ServidorFalso().en("GET", "/labels", lambda ll: (200, paginas.get(int(ll["consulta"]["page"]), [])))
        self.assertEqual(len(self.cliente(servidor).listar("/labels")), 51)
        self.assertEqual(len(servidor.llamadas), 2)

    def test_listado_que_no_es_lista_aborta(self):
        servidor = ServidorFalso().en("GET", "/labels", (200, {"message": "raro"}))
        with self.assertRaises(vs.ErrorRemoto):
            self.cliente(servidor).listar("/labels")

    def test_columnas_kanban_paginadas_por_columna(self):
        def respuesta(llamada):
            if llamada["consulta"].get("filter") == "bucket_id = 11":
                return 200, [{"id": 11, "title": "Doing", "tasks": [tarea(3, "c")], "count": 2}]
            return 200, [
                {"id": 10, "title": "To-Do", "tasks": [tarea(1, "a")], "count": 1},
                {"id": 11, "title": "Doing", "tasks": [tarea(2, "b")], "count": 2},
            ]

        servidor = ServidorFalso().en("GET", "/projects/2/views/8/tasks", respuesta)
        self.assertEqual(self.cliente(servidor).columna_por_tarea(2, 8), {1: "To-Do", 2: "Doing", 3: "Doing"})


class DominioTests(unittest.TestCase):
    def test_clave_desde_descripcion_titulo_y_html(self):
        self.assertEqual(vs.clave_de_tarea(tarea(1, "x", description="Clave estable: `lp-arcav-us:US-07:Contrato`"), PREFIJO),
                         "US-07:contrato")
        html = "<p>Clave estable: <code>lp-arcav-us:US-03</code></p><p>Dependencias: lp-arcav-us:US-02</p>"
        self.assertEqual(vs.clave_de_tarea(tarea(1, "Sin clave en título", description=html), PREFIJO), "US-03")
        self.assertEqual(vs.clave_de_tarea(tarea(1, "[US-07][contrato] Contrato"), PREFIJO), "US-07:contrato")
        self.assertEqual(vs.clave_de_tarea(tarea(1, "[US-08:qa] QA"), PREFIJO), "US-08:qa")
        self.assertIsNone(vs.clave_de_tarea(tarea(1, "Otra", description="Dependencias: lp-arcav-us:US-02"), PREFIJO))

    def test_estado_logico_segun_mapeo(self):
        self.assertEqual(vs.estado_logico(tarea(1, "x"), "To-Do"), "pendiente")
        self.assertEqual(vs.estado_logico(tarea(1, "x"), "QA / Review"), "en_qa")
        self.assertEqual(vs.estado_logico(tarea(1, "x", done=True), "Doing"), "cerrado")
        con_etiquetas = tarea(1, "x", labels=[etiqueta(1, "estado:correccion"), etiqueta(2, "estado:escalado")])
        self.assertEqual(vs.estado_logico(con_etiquetas, "Doing"), "escalado")
        self.assertEqual(vs.estado_logico(tarea(1, "x"), "Backlog"), "sin_mapear")
        self.assertEqual(vs.estado_logico(tarea(1, "x"), None), "sin_columna")

    def test_mapeo_de_roles_antiguos(self):
        self.assertEqual(vs.roles_de_tarea(tarea(1, "x", labels=[etiqueta(1, "role:devops")])), ["release"])
        self.assertEqual(vs.roles_de_tarea(tarea(1, "x", labels=[etiqueta(1, "role:designer")])), ["frontend"])
        nuevo_y_viejo = tarea(1, "x", labels=[etiqueta(1, "rol:integraciones"), etiqueta(2, "role:frontend")])
        self.assertEqual(vs.roles_de_tarea(nuevo_y_viejo), ["integraciones"])
        self.assertEqual(vs.rol_desde_texto("`backend-dev-agent`"), "integraciones")
        self.assertEqual(set(vs.ROLES_ANTIGUOS.values()), set(vs.ROLES))

    def test_lee_historias_del_prd(self):
        historias = vs.leer_historias(PRD)
        self.assertEqual([h["clave"] for h in historias], ["US-01", "US-02"])
        self.assertEqual(historias[0]["rol"], "producto")
        self.assertEqual(historias[1]["prioridad"], 3)
        self.assertIn("#### Criterios", historias[0]["cuerpo"])
        self.assertNotIn("Fuera de alcance", historias[1]["cuerpo"])


class SincronizarTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.prd = Path(self.tmp.name) / "PRD.md"
        self.prd.write_text(PRD, encoding="utf-8")
        self.historias = vs.leer_historias(PRD)

    def tearDown(self):
        self.tmp.cleanup()

    def sincronizar(self, servidor, *extra):
        return ejecutar(["sincronizar", *extra, "--prd", str(self.prd)], servidor)

    def test_listado_fallido_no_crea_nada(self):
        servidor = servidor_base([])
        servidor.en("GET", "/projects/2/tasks", (500, {"message": "boom"}))
        codigo, _, errores = self.sincronizar(servidor, "--apply")
        self.assertEqual(codigo, vs.EXIT_REMOTO)
        self.assertIn("HTTP 500", errores)
        self.assertEqual(servidor.escrituras(), [])

    def test_segunda_pagina_fallida_no_crea_nada(self):
        primera = [tarea(i, f"T{i}") for i in range(1, 51)]

        def respuesta(llamada):
            if llamada["consulta"]["page"] == "2":
                return 502, {"message": "gateway"}
            return 200, primera, {"x-pagination-total-pages": 2}

        servidor = servidor_base([])
        servidor.en("GET", "/projects/2/tasks", respuesta)
        codigo, _, _ = self.sincronizar(servidor, "--apply")
        self.assertEqual(codigo, vs.EXIT_REMOTO)
        self.assertEqual(servidor.escrituras(), [])

    def test_dry_run_no_escribe(self):
        servidor = servidor_base([tarea(4, "[US-01] Título viejo")])
        for extra in ((), ("--dry-run",), ("--force-update",)):
            with self.subTest(extra=extra):
                codigo, salida, _ = self.sincronizar(servidor, *extra)
                self.assertEqual(codigo, vs.EXIT_OK)
                self.assertIn("SIMULACIÓN", salida)
                self.assertIn("crear      US-02", salida)
        self.assertEqual(servidor.escrituras(), [])

    def test_apply_crea_solo_faltantes_y_no_actualiza_sin_force(self):
        servidor = servidor_base([tarea(4, "[US-01] Título editado en Vikunja", description="editada")])
        servidor.en("PUT", "/projects/2/tasks", (200, tarea(20, "[US-02] Formulario de contacto")))
        servidor.en("PUT", "/tasks/20/labels", (200, {"label_id": 101}))
        codigo, salida, _ = self.sincronizar(servidor, "--apply")
        self.assertEqual(codigo, vs.EXIT_OK, salida)
        escrituras = servidor.escrituras()
        self.assertEqual([(c["metodo"], c["ruta"]) for c in escrituras],
                         [("PUT", "/projects/2/tasks"), ("PUT", "/tasks/20/labels")])
        self.assertEqual(escrituras[0]["cuerpo"]["title"], "[US-02] Formulario de contacto")
        self.assertEqual(escrituras[0]["cuerpo"]["priority"], 3)
        self.assertTrue(escrituras[0]["cuerpo"]["description"].startswith("Clave estable: `lp-arcav-us:US-02`"))
        self.assertEqual(escrituras[1]["cuerpo"], {"label_id": 102})
        self.assertIn("difiere", salida)

    def test_clave_en_descripcion_evita_duplicado_aunque_cambie_el_titulo(self):
        renombrada = tarea(30, "Formulario (renombrado en Vikunja)", description="Clave estable: `lp-arcav-us:US-02`")
        servidor = servidor_base([tarea(4, "[US-01] A"), renombrada])
        codigo, salida, _ = self.sincronizar(servidor, "--apply")
        self.assertEqual(codigo, vs.EXIT_OK)
        self.assertNotIn("crear      US-02", salida)
        self.assertEqual(servidor.escrituras(), [])

    def test_duplicadas_remotas_bloquean_toda_escritura(self):
        servidor = servidor_base([tarea(4, "[US-01] A"), tarea(9, "[US-01] B")])
        codigo, salida, errores = self.sincronizar(servidor, "--apply", "--force-update")
        self.assertEqual(codigo, vs.EXIT_USO)
        self.assertIn("ambigua    US-01", salida)
        self.assertIn("duplicadas", errores)
        self.assertEqual(servidor.escrituras(), [])

    def test_faltan_etiquetas_de_rol_aborta_antes_de_crear(self):
        servidor = servidor_base([], etiquetas=[etiqueta(1, "role:po")])
        codigo, _, errores = self.sincronizar(servidor, "--apply")
        self.assertEqual(codigo, vs.EXIT_USO)
        self.assertIn("preparar --apply", errores)
        self.assertEqual(servidor.escrituras(), [])

    def test_force_update_envia_objeto_completo(self):
        remota = tarea(
            4, "[US-01] Título editado", description="editada en Vikunja", done=True, priority=5,
            due_date="2026-10-01T12:00:00Z", percent_done=0.5, hex_color="ff0000",
            labels=[etiqueta(100, "rol:producto")], assignees=[{"id": 1, "username": "armando"}],
            bucket_id=0, repeat_after=0, start_date="2026-09-01T00:00:00Z",
        )
        completa = dict(remota, identifier="#4", index=4, created="2026-09-01T00:00:00Z", reminders=[{"reminder": "x"}])
        al_dia = tarea(5, self.historias[1]["titulo"], priority=3,
                       description=vs.descripcion_historia(self.historias[1], PREFIJO))
        servidor = servidor_base([remota, al_dia])
        servidor.en("GET", "/tasks/4", (200, copy.deepcopy(completa)))
        servidor.en("POST", "/tasks/4", lambda llamada: (200, llamada["cuerpo"]))
        codigo, salida, _ = self.sincronizar(servidor, "--apply", "--force-update")
        self.assertEqual(codigo, vs.EXIT_OK, salida)
        self.assertIn("al día     US-02", salida)
        self.assertEqual([(c["metodo"], c["ruta"]) for c in servidor.escrituras()], [("POST", "/tasks/4")])
        enviado = servidor.escrituras()[0]["cuerpo"]
        esperado = dict(completa, title="[US-01] Definición del PRD",
                        description=vs.descripcion_historia(self.historias[0], PREFIJO))
        self.assertEqual(enviado, esperado)
        for campo in ("done", "due_date", "labels", "assignees", "priority", "reminders", "start_date"):
            self.assertEqual(enviado[campo], completa[campo])


class CrearTareaTests(unittest.TestCase):
    def test_crea_con_clave_en_descripcion_y_etiqueta(self):
        servidor = servidor_base([])
        servidor.en("PUT", "/projects/2/tasks", (200, tarea(40, "x")))
        servidor.en("PUT", "/tasks/40/labels", (200, {}))
        argv = ["crear-tarea", "--apply", "--clave", "US-07:contrato", "--rol", "integraciones",
                "--titulo", "[US-07][contrato] Contrato del formulario", "--descripcion", "Tipos y errores."]
        codigo, salida, _ = ejecutar(argv, servidor)
        self.assertEqual(codigo, vs.EXIT_OK, salida)
        creada, etiquetada = servidor.escrituras()
        self.assertEqual(creada["cuerpo"]["description"], "Clave estable: `lp-arcav-us:US-07:contrato`\n\nTipos y errores.")
        self.assertEqual(etiquetada["cuerpo"], {"label_id": 102})

    def test_rechaza_duplicado_por_clave_en_descripcion(self):
        existente = tarea(30, "Contrato", description="<p>Clave estable: lp-arcav-us:US-07:contrato</p>")
        servidor = servidor_base([existente])
        argv = ["crear-tarea", "--apply", "--titulo", "[US-07][contrato] Otro título", "--rol", "integraciones"]
        codigo, _, errores = ejecutar(argv, servidor)
        self.assertEqual(codigo, vs.EXIT_USO)
        self.assertIn("#30", errores)
        self.assertEqual(servidor.escrituras(), [])

    def test_sin_clave_es_error_de_uso_sin_peticiones(self):
        servidor = ServidorFalso()
        codigo, _, _ = ejecutar(["crear-tarea", "--titulo", "Tarea suelta", "--rol", "frontend"], servidor)
        self.assertEqual(codigo, vs.EXIT_USO)
        self.assertEqual(servidor.llamadas, [])


class EspejoTests(unittest.TestCase):
    ESPEJO_PREVIO = """# Sprint 1 — ARCAV

Estado: activo (Sprint 1)

Vikunja es la fuente de verdad.

## Resumen del sprint

| Ticket / ID | Clave estable | Responsable | Estado | Reaperturas |
|---|---|---|---|---|
| VK-2 | `lp-arcav-us:US-01` | `po-agent` | *por iniciar* | 0 |
| VK-4 | `lp-arcav-us:US-03` | `frontend-agent` | *por iniciar* | 2 |
| VK-99 | `lp-arcav-us:US-07:contrato` | `backend-agent` | *por iniciar* | 1/3 |

## Detalle de tareas

### [VK-4] [US-03] Hero
- **Clave estable**: `lp-arcav-us:US-03`
- **Estado (remoto / lógico)**: todo / por iniciar
- **Dependencias**: `lp-arcav-us:US-02`
- **Descripción & Criterios**:
Texto libre de la descripción antigua.
- **Paleta**: no debe copiarse
#### Criterios viejos

## Bloqueos y entregas

- US-03 espera contrato de integraciones.
"""

    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.archivo = Path(self.tmp.name) / "sprint_actual.md"
        self.archivo.write_text(self.ESPEJO_PREVIO, encoding="utf-8")
        tareas = [
            tarea(2, "[US-01] Definición", done=True, priority=4, labels=[etiqueta(1, "role:po")]),
            tarea(4, "[US-03] Hero", labels=[etiqueta(3, "rol:frontend"), etiqueta(4, "role:frontend")]),
            tarea(12, "Contrato del formulario", description="Clave estable: `lp-arcav-us:US-07:contrato`",
                  labels=[etiqueta(5, "role:backend"), etiqueta(6, "estado:bloqueado")]),
            tarea(13, "Tarea sin clave"),
        ]
        self.servidor = servidor_base(tareas)
        self.servidor.en("GET", "/projects/2/views/8/tasks", (200, [
            {"id": 10, "title": "To-Do", "tasks": [tarea(12, "x"), tarea(13, "y")], "count": 2},
            {"id": 11, "title": "Doing", "tasks": [tarea(4, "x")], "count": 1},
            {"id": 12, "title": "Done", "tasks": [tarea(2, "x")], "count": 1},
        ]))

    def tearDown(self):
        self.tmp.cleanup()

    def espejo(self, *extra, fecha=FECHA):
        return ejecutar(["espejo", *extra, "--archivo", str(self.archivo)], self.servidor, fecha=fecha)

    def test_dry_run_muestra_diff_y_no_escribe(self):
        codigo, salida, _ = self.espejo()
        self.assertEqual(codigo, vs.EXIT_OK)
        self.assertIn("SIMULACIÓN", salida)
        self.assertIn("+| #4 | `lp-arcav-us:US-03` | `frontend` | Doing / en_curso | 2 |", salida)
        self.assertEqual(self.archivo.read_text(encoding="utf-8"), self.ESPEJO_PREVIO)
        self.assertEqual(self.servidor.escrituras(), [])

    def test_apply_regenera_desde_remoto_preservando_reaperturas(self):
        codigo, salida, _ = self.espejo("--apply")
        self.assertEqual(codigo, vs.EXIT_OK, salida)
        nuevo = self.archivo.read_text(encoding="utf-8")
        self.assertIn("| #2 | `lp-arcav-us:US-01` | `producto` | Done / cerrado | 0 |", nuevo)
        self.assertIn("| #4 | `lp-arcav-us:US-03` | `frontend` | Doing / en_curso | 2 |", nuevo)
        # La clave estable manda aunque el id local fuera otro.
        self.assertIn("| #12 | `lp-arcav-us:US-07:contrato` | `integraciones` | To-Do / bloqueado | 1/3 |", nuevo)
        self.assertIn("| #13 | `lp-arcav-us:VK-13` | sin rol | To-Do / pendiente | 0/3 |", nuevo)
        self.assertIn("- Estado (Vikunja / lógico): Done (done=sí) / cerrado", nuevo)
        self.assertIn("- Dependencias: `lp-arcav-us:US-02`\n- Reaperturas: 2\n", nuevo)
        self.assertIn(f"Última sincronización UTC: {FECHA}", nuevo)
        self.assertIn("Resultado de la sincronización: correcta (4 tareas leídas de Vikunja)", nuevo)
        self.assertTrue(nuevo.startswith("# Sprint 1 — ARCAV\n\nEstado: activo (Sprint 1)"))
        self.assertIn("## Bloqueos y entregas\n\n- US-03 espera contrato de integraciones.\n", nuevo)
        self.assertNotIn("Criterios viejos", nuevo)
        self.assertNotIn("Descripción & Criterios", nuevo)
        self.assertNotIn("Paleta", nuevo)
        self.assertEqual(self.servidor.escrituras(), [])

    def test_regeneracion_idempotente_y_reaperturas_editadas_se_conservan(self):
        self.espejo("--apply")
        editado = self.archivo.read_text(encoding="utf-8").replace(
            "| `frontend` | Doing / en_curso | 2 |", "| `frontend` | Doing / en_curso | 3/3 |"
        )
        self.archivo.write_text(editado, encoding="utf-8")
        codigo, _, errores = self.espejo("--apply")
        self.assertEqual(codigo, vs.EXIT_OK)
        self.assertIn("escalado humano", errores)
        segundo = self.archivo.read_text(encoding="utf-8")
        # La tabla manda: el detalle se alinea con el valor editado.
        self.assertIn("| #4 | `lp-arcav-us:US-03` | `frontend` | Doing / en_curso | 3/3 |", segundo)
        self.assertIn("- Dependencias: `lp-arcav-us:US-02`\n- Reaperturas: 3/3\n", segundo)
        codigo, salida, _ = self.espejo("--apply", fecha="2026-09-18 08:30 UTC")
        self.assertEqual(codigo, vs.EXIT_OK)
        self.assertIn("sin cambios en las tareas", salida)
        final = self.archivo.read_text(encoding="utf-8")
        self.assertEqual(final.replace("2026-09-18 08:30 UTC", FECHA), segundo)

    def test_fallo_remoto_no_toca_el_archivo(self):
        self.servidor.en("GET", "/projects/2/views/8/tasks", (503, {"message": "caído"}))
        codigo, _, _ = self.espejo("--apply")
        self.assertEqual(codigo, vs.EXIT_REMOTO)
        self.assertEqual(self.archivo.read_text(encoding="utf-8"), self.ESPEJO_PREVIO)

    def test_crea_espejo_con_formato_de_plantilla_si_no_existe(self):
        self.archivo.unlink()
        codigo, _, _ = self.espejo("--apply")
        self.assertEqual(codigo, vs.EXIT_OK)
        nuevo = self.archivo.read_text(encoding="utf-8")
        for fragmento in (vs.MARCA_INICIO, "Responsable del espejo: `producto`", "## Resumen\n",
                          "## Detalle por tarea", "## Bloqueos y escalados", f"Última sincronización UTC: {FECHA}"):
            self.assertIn(fragmento, nuevo)


class PrepararYErroresTests(unittest.TestCase):
    def test_preparar_dry_run_no_escribe_y_apply_solo_crea(self):
        tareas = [tarea(2, "[US-01] A", labels=[etiqueta(1, "role:po")])]
        servidor = servidor_base(tareas, etiquetas=[etiqueta(1, "role:po"), etiqueta(100, "rol:producto")])
        servidor.en("GET", "/projects/2/views/8/buckets", paginado([{"id": 10, "title": "To-Do"}]))
        codigo, salida, _ = ejecutar(["preparar", "--migrar-roles"], servidor)
        self.assertEqual(codigo, vs.EXIT_OK)
        self.assertIn("añadir  rol:producto a #2", salida)
        self.assertEqual(servidor.escrituras(), [])

        contador = iter(range(200, 300))
        servidor.en("PUT", "/labels", lambda ll: (200, {"id": next(contador), "title": ll["cuerpo"]["title"]}))
        servidor.en("PUT", "/projects/2/views/8/buckets", (200, {"id": 50}))
        servidor.en("PUT", "/tasks/2/labels", (200, {}))
        codigo, _, _ = ejecutar(["preparar", "--apply", "--migrar-roles"], servidor)
        self.assertEqual(codigo, vs.EXIT_OK)
        self.assertEqual({c["metodo"] for c in servidor.escrituras()}, {"PUT"})
        creadas = [c["cuerpo"]["title"] for c in servidor.escrituras() if c["ruta"] == "/labels"]
        esperadas = [f"rol:{r}" for r in vs.ROLES[1:]] + [f"estado:{e}" for e in vs.ETIQUETAS_ESTADO]
        self.assertEqual(creadas, esperadas)
        columnas = [c["cuerpo"]["title"] for c in servidor.escrituras() if c["ruta"].endswith("/buckets")]
        self.assertEqual(columnas, ["Doing", "QA / Review", "Done"])
        self.assertIn({"label_id": 100}, [c["cuerpo"] for c in servidor.escrituras() if c["ruta"] == "/tasks/2/labels"])

    def test_http_401_devuelve_codigo_remoto_sin_filtrar_token(self):
        servidor = ServidorFalso().en("GET", "/info", (401, {"message": "invalid token"}))
        codigo, salida, errores = ejecutar(["info"], servidor)
        self.assertEqual(codigo, vs.EXIT_REMOTO)
        self.assertIn("HTTP 401", errores)
        self.assertNotIn("token-de-prueba", errores + salida)

    def test_timeout_devuelve_codigo_remoto(self):
        def lenta(_llamada):
            raise TimeoutError("timed out")

        servidor = ServidorFalso().en("GET", "/projects", lenta)
        codigo, _, _ = ejecutar(["proyectos"], servidor)
        self.assertEqual(codigo, vs.EXIT_REMOTO)


if __name__ == "__main__":
    unittest.main()
