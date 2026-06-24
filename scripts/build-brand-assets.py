from __future__ import annotations

import re
from pathlib import Path
from xml.etree import ElementTree as ET

from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.ttLib import TTFont


ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "assets-source" / "brand"
OUTPUT_DIR = ROOT / "public" / "assets" / "brand"
FONT_PATH = ROOT / "public" / "assets" / "fonts" / "Orbitron_SemiBold.ttf"

SVG_NS = "http://www.w3.org/2000/svg"
ET.register_namespace("", SVG_NS)


class OutlineFont:
    def __init__(self, path: Path, font_size: float, letter_spacing_em: float) -> None:
        self.font = TTFont(path)
        self.glyph_set = self.font.getGlyphSet()
        self.cmap = self.font.getBestCmap()
        self.hmtx = self.font["hmtx"]
        self.units_per_em = self.font["head"].unitsPerEm
        self.scale = font_size / self.units_per_em
        self.letter_spacing_units = letter_spacing_em * self.units_per_em

    def glyph_path(self, character: str) -> tuple[str, float]:
        glyph_name = self.cmap[ord(character)]
        glyph = self.glyph_set[glyph_name]
        pen = SVGPathPen(self.glyph_set)
        glyph.draw(pen)
        advance, _ = self.hmtx[glyph_name]
        return pen.getCommands(), advance

    def text_paths(self, text: str, css_class: str, tx: float, ty: float) -> ET.Element:
        group = ET.Element(
            f"{{{SVG_NS}}}g",
            {
                "class": css_class,
                "aria-label": text,
                "transform": f"translate({tx:g} {ty:g}) scale({self.scale:g} {-self.scale:g})",
            },
        )

        cursor = 0.0
        for index, character in enumerate(text):
            path_data, advance = self.glyph_path(character)
            attrs = {"d": path_data}
            if cursor:
                attrs["transform"] = f"translate({cursor:g} 0)"
            ET.SubElement(group, f"{{{SVG_NS}}}path", attrs)
            cursor += advance
            if index < len(text) - 1:
                cursor += self.letter_spacing_units

        return group


def strip_font_css(svg_text: str) -> str:
    svg_text = re.sub(r"\s*@font-face\s*\{.*?\}\s*", "\n", svg_text, flags=re.S)
    svg_text = re.sub(r"\s*font-family:[^;]+;\n", "\n", svg_text)
    svg_text = re.sub(r"\s*font-size:[^;]+;\n", "\n", svg_text)
    svg_text = re.sub(r"\s*font-weight:[^;]+;\n", "\n", svg_text)
    svg_text = re.sub(r"\s*letter-spacing:[^;]+;\n", "\n", svg_text)
    svg_text = re.sub(r"\n{3,}", "\n\n", svg_text)
    return svg_text


def parse_translate(transform: str) -> tuple[float, float]:
    match = re.search(r"translate\(([-\d.]+)[ ,]+([-\d.]+)\)", transform)
    if not match:
        raise ValueError(f"Unsupported text transform: {transform}")
    return float(match.group(1)), float(match.group(2))


def replace_text_nodes(root: ET.Element, outline_font: OutlineFont) -> None:
    for parent in list(root.iter()):
        for child in list(parent):
            if child.tag != f"{{{SVG_NS}}}text":
                continue

            text = "".join(child.itertext()).strip()
            css_class = child.attrib.get("class", "")
            tx, ty = parse_translate(child.attrib.get("transform", ""))
            parent.remove(child)
            parent.append(outline_font.text_paths(text, css_class, tx, ty))


def build_svg(source_name: str) -> None:
    source_path = SOURCE_DIR / source_name
    output_path = OUTPUT_DIR / source_name
    outline_font = OutlineFont(FONT_PATH, font_size=100, letter_spacing_em=0.2)

    raw_svg = strip_font_css(source_path.read_text(encoding="utf-8"))
    root = ET.fromstring(raw_svg)
    replace_text_nodes(root, outline_font)

    output_path.write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        + ET.tostring(root, encoding="unicode", short_empty_elements=True)
        + "\n",
        encoding="utf-8",
    )


def main() -> None:
    for source_name in ("char_only.svg", "icon_with_char.svg"):
        build_svg(source_name)


if __name__ == "__main__":
    main()
