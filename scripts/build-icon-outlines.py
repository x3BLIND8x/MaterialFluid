"""Add official FILL=0 paths from the already pinned Material Symbols font.

Keep existing filled geometry, stroke masks, aliases and names exactly intact.
The font and codepoints in .cache/material-source must match material-icons.lock.json.
"""
from pathlib import Path
import hashlib
import json
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

root = Path(__file__).resolve().parents[1]
cache = root / '.cache/material-source'
lock = json.loads((root / 'scripts/material-icons.lock.json').read_text())
for name in ('rounded.ttf', 'rounded.codepoints'):
    if hashlib.sha256((cache / name).read_bytes()).hexdigest() != lock['sha256'][name]:
        raise RuntimeError(f'Pinned source hash mismatch: {name}')
font = TTFont(cache / 'rounded.ttf')
glyphs = font.getGlyphSet(location={'FILL': 0, 'GRAD': 0, 'opsz': 24, 'wght': 400})
cmap = font.getBestCmap()
codes = {name: int(code, 16) for name, code in (line.split() for line in (cache / 'rounded.codepoints').read_text().splitlines())}
outlines = {}
for filename in ('icon-map.ts', 'material-icons.ts'):
    path = root / 'src/kit' / filename
    source = path.read_text(encoding='utf-8')
    data = json.loads(source.split(' = ', 1)[1].strip().removesuffix(';'))
    if filename == 'icon-map.ts':
        full = json.loads((root / 'src/kit/material-icons.ts').read_text(encoding='utf-8').split(' = ', 1)[1].strip().removesuffix(';'))
        for name in ('play_arrow', 'pause'):
            data[name] = full[name]
    for icon in data.values():
        name = icon['symbol']
        if name not in outlines:
            pen = SVGPathPen(glyphs, ntos=lambda v: format(round(v, 3), 'g'))
            glyphs[cmap[codes[name]]].draw(TransformPen(pen, (1/40, 0, 0, -1/40, 0, 24)))
            outlines[name] = pen.getCommands()
        if outlines[name] and [outlines[name]] != icon['paths']:
            icon['outlinePaths'] = [outlines[name]]
        else:
            icon.pop('outlinePaths', None)
    header = '// Generated Material Symbols Rounded, pinned Apache-2.0 source. Filled paths and optional FILL=0 outlinePaths.\n'
    path.write_text(header + 'import type { MaterialIconData } from "./icon-types";\nexport const materialIcons: Record<string, MaterialIconData> = ' + json.dumps(data, separators=(',', ':')) + ';\n', encoding='utf-8', newline='\n')
    print(f'{filename}: {len(data)} icons, {sum("outlinePaths" in icon for icon in data.values())} with distinct official outline geometry.', flush=True)
