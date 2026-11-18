"""Tests de scripts/generate_diagram_canvas.py (lienzo del flujo y vista previa SVG)."""

import importlib.util
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest import mock
from xml.etree import ElementTree

SOURCE = Path(__file__).resolve().parents[1]
SCRIPT = SOURCE / "scripts/generate_diagram_canvas.py"
SVG_NS = "{http://www.w3.org/2000/svg}"
ROLES = ("producto", "frontend", "integraciones", "qa-revisor", "release")
OBSOLETE = ("agy", "AGENTS.md", ".agents/", "po-agent", "qa-agent", "devops-agent", "Plane", "Antigravity")

spec = importlib.util.spec_from_file_location("generate_diagram_canvas", SCRIPT)
canvas = importlib.util.module_from_spec(spec)
spec.loader.exec_module(canvas)


def load_module():
    module_spec = importlib.util.spec_from_file_location("diagrama_aislado", SCRIPT)
    module = importlib.util.module_from_spec(module_spec)
    module_spec.loader.exec_module(module)
    return module


def texts(data):
    return "\n".join(element.get("text", "") for element in data["elements"] if element["type"] == "text")


class ImportTests(unittest.TestCase):
    def test_importing_the_script_does_not_write_anything(self):
        with mock.patch.object(Path, "mkdir", side_effect=AssertionError("importar no debe crear carpetas")), \
             mock.patch.object(Path, "write_text", side_effect=AssertionError("importar no debe escribir")):
            load_module()

    def test_importing_does_not_touch_the_output_directory(self):
        directory = SOURCE / "docs/diagrams"
        before = sorted(p.name for p in directory.iterdir()) if directory.is_dir() else []
        load_module()
        after = sorted(p.name for p in directory.iterdir()) if directory.is_dir() else []
        self.assertEqual(before, after)


class CanvasTests(unittest.TestCase):
    def setUp(self):
        self.data = canvas.build_full_canvas()

    def test_output_is_deterministic(self):
        self.assertEqual(json.dumps(self.data, sort_keys=True), json.dumps(canvas.build_full_canvas(), sort_keys=True))
        self.assertEqual(canvas.render_svg(self.data), canvas.render_svg(canvas.build_full_canvas()))
        for element in self.data["elements"]:
            self.assertEqual(element["updated"], canvas.FIXED_TIMESTAMP)
            self.assertEqual(element["created"], canvas.FIXED_TIMESTAMP)

    def test_canvas_describes_the_five_roles_and_the_seven_steps(self):
        content = texts(self.data)
        for role in ROLES:
            self.assertIn(role, content)
        for step in ("1. Requisitos", "2. Planificación", "3. Implementación", "4. QA", "5. Release",
                     "6. Merge a main", "7. Verificación en producción"):
            self.assertIn(step, content)
        self.assertIn("Vikunja", content)

    def test_canvas_has_no_obsolete_references(self):
        content = texts(self.data) + "\n".join(
            element.get("name", "") for element in self.data["elements"] if element["type"] == "frame")
        for term in OBSOLETE:
            with self.subTest(term=term):
                self.assertNotIn(term, content)

    def test_elements_belong_to_a_frame(self):
        frames = {element["id"] for element in self.data["elements"] if element["type"] == "frame"}
        self.assertEqual(len(frames), 4)
        for element in self.data["elements"]:
            if element["frameId"] is not None:
                self.assertIn(element["frameId"], frames)


class SvgTests(unittest.TestCase):
    def setUp(self):
        self.data = canvas.build_full_canvas()
        self.svg = canvas.render_svg(self.data)

    def test_svg_is_well_formed_xml(self):
        root = ElementTree.fromstring(self.svg)
        self.assertEqual(root.tag, f"{SVG_NS}svg")
        self.assertTrue(root.get("viewBox"))

    def test_defs_are_siblings_of_style_and_markers_are_declared(self):
        root = ElementTree.fromstring(self.svg)
        defs = root.findall(f"{SVG_NS}defs")
        styles = root.findall(f"{SVG_NS}style")
        self.assertEqual(len(defs), 1)
        self.assertEqual(len(styles), 1)
        self.assertEqual(len(list(styles[0])), 0, "<style> no puede contener elementos")
        self.assertNotIn("<defs", styles[0].text or "")
        markers = defs[0].findall(f"{SVG_NS}marker")
        colors = {element["strokeColor"] for element in self.data["elements"] if element["type"] == "arrow"}
        self.assertEqual(len(markers), len(colors))
        declared = {marker.get("id") for marker in markers}
        for line in root.findall(f"{SVG_NS}line"):
            self.assertIn(line.get("marker-end")[len("url(#"):-1], declared)

    def test_xml_special_characters_are_escaped(self):
        builder = canvas.ExcalidrawBuilder()
        frame = builder.add_frame('Marco <"&">', 0, 0, 200, 200)
        builder.add_text('Texto con <tag> & "comillas"', 10, 10, frame_id=frame)
        builder.add_rect(0, 0, 10, 10, stroke='#000" onload="x', frame_id=frame)
        data = dict(self.data, elements=builder.elements)
        root = ElementTree.fromstring(canvas.render_svg(data))
        rendered = [node.text for node in root.iter(f"{SVG_NS}text")]
        self.assertIn('Texto con <tag> & "comillas"', rendered)
        self.assertIn('Marco <"&">', rendered)
        self.assertEqual(root.findall(f"{SVG_NS}rect")[-1].get("stroke"), '#000" onload="x')

    def test_multiline_text_becomes_one_element_per_line(self):
        builder = canvas.ExcalidrawBuilder()
        builder.add_text("una\ndos\ntres", 0, 0)
        root = ElementTree.fromstring(canvas.render_svg(dict(self.data, elements=builder.elements)))
        self.assertEqual([node.text for node in root.iter(f"{SVG_NS}text")], ["una", "dos", "tres"])


class OutputTests(unittest.TestCase):
    def setUp(self):
        temp = tempfile.TemporaryDirectory(prefix="diagramas-")
        self.addCleanup(temp.cleanup)
        self.out_dir = Path(temp.name) / "salida"

    def test_write_outputs_creates_both_files(self):
        excalidraw_path, svg_path, count = canvas.write_outputs(self.out_dir, "flujo-claude")
        self.assertEqual(excalidraw_path.name, "flujo-claude.excalidraw")
        self.assertGreater(count, 0)
        data = json.loads(excalidraw_path.read_text(encoding="utf-8"))
        self.assertEqual(data["type"], "excalidraw")
        self.assertEqual(len(data["elements"]), count)
        ElementTree.fromstring(svg_path.read_text(encoding="utf-8"))

    def test_output_name_must_be_a_slug(self):
        for name in ("Flujo Claude", "../fuera", "flujo/claude", "flujo_claude", ""):
            with self.subTest(name=name):
                with self.assertRaises(ValueError):
                    canvas.write_outputs(self.out_dir, name)
        self.assertFalse(self.out_dir.exists())

    def test_cli_is_reproducible(self):
        first = subprocess.run([sys.executable, str(SCRIPT), "--out-dir", str(self.out_dir)],
                               capture_output=True, text=True, check=False)
        self.assertEqual(first.returncode, 0, first.stderr)
        self.assertIn("flujo-claude.excalidraw", first.stdout)
        digests = {path.name: path.read_bytes() for path in sorted(self.out_dir.iterdir())}
        second = subprocess.run([sys.executable, str(SCRIPT), "--out-dir", str(self.out_dir)],
                                capture_output=True, text=True, check=False)
        self.assertEqual(second.returncode, 0, second.stderr)
        self.assertEqual({path.name: path.read_bytes() for path in sorted(self.out_dir.iterdir())}, digests)

    def test_cli_rejects_an_invalid_name_without_traceback(self):
        result = subprocess.run([sys.executable, str(SCRIPT), "--out-dir", str(self.out_dir), "--name", "Mal Nombre"],
                                capture_output=True, text=True, check=False)
        self.assertEqual(result.returncode, 1)
        self.assertIn("ERROR", result.stderr)
        self.assertNotIn("Traceback", result.stderr)


if __name__ == "__main__":
    unittest.main()
