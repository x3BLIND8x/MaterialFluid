"""Generate all official Rounded icons and automatic stroke reveal masks.

Install scripts/icon-requirements.txt; run this script with --offline to use the
verified cache or --update to explicitly pin the latest upstream revision.
Filled contours remain the visible artwork. Centerlines are mask geometry only.
"""
from pathlib import Path
import argparse, hashlib, json, urllib.request, re
from collections import Counter
import numpy as np
from scipy.ndimage import distance_transform_edt
from PIL import Image, ImageDraw, ImageFont
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / '.cache/material-source'
LOCK = ROOT / 'scripts/material-icons.lock.json'
ALIASES = {'bell':'notifications','plus':'add','sun':'light_mode','moon':'dark_mode',
 'copy':'content_copy','arrow-right':'arrow_forward','arrow-left':'arrow_back',
 'chevron-down':'expand_more','chevron-right':'chevron_right','chevron-left':'chevron_left',
 'chevron-up':'expand_less','eye':'visibility','eye-off':'visibility_off',
 'wifi-off':'wifi_off','bluetooth-off':'bluetooth_disabled','heart':'favorite',
 'loader':'progress_activity','check-check':'done_all','sliders':'tune',
 'external':'open_in_new','minus':'remove','activity':'water_drop'}
CORE = ['bell','check','menu','close','plus','search','settings','sun','moon','copy',
 'arrow-right','arrow-left','chevron-down','chevron-right','chevron-left','chevron-up',
 'eye','eye-off','wifi','wifi-off','bluetooth','bluetooth-off','heart','loader',
 'check-check','sliders','help','download','external','minus','activity']
# Statically used kit and showcase controls must not depend on the lazy full pack.
CORE += ['arrow_downward', 'arrow_upward', 'category', 'dashboard', 'edit_note', 'filter_list', 'layers', 'more_vert', 'notifications', 'reply', 'tab', 'touch_app', 'undo', 'unfold_more']
SIZE = 192

def thin(binary):
    """Zhang-Suen topology-preserving parallel thinning."""
    a = np.pad(binary, 1).astype(np.uint8)
    while True:
        changed = False
        for phase in (0, 1):
            p = [a[:-2,1:-1],a[:-2,2:],a[1:-1,2:],a[2:,2:],
                 a[2:,1:-1],a[2:,:-2],a[1:-1,:-2],a[:-2,:-2]]
            count = sum(p)
            transitions = sum((p[i] == 0) & (p[(i+1)%8] == 1) for i in range(8))
            if phase == 0:
                guard = (p[0]*p[2]*p[4] == 0) & (p[2]*p[4]*p[6] == 0)
            else:
                guard = (p[0]*p[2]*p[6] == 0) & (p[0]*p[4]*p[6] == 0)
            remove = (a[1:-1,1:-1] == 1) & (count >= 2) & (count <= 6) & (transitions == 1) & guard
            if remove.any():
                a[1:-1,1:-1][remove] = 0
                changed = True
        if not changed:
            return a[1:-1,1:-1].astype(bool)

def simplify(points, tolerance=.7):
    if len(points) < 3:
        return points
    a, b = np.array(points[0]), np.array(points[-1])
    ab = b-a
    delta = np.array(points)-a
    t = np.clip(delta @ ab / max(float(ab @ ab), 1), 0, 1)
    distances = np.linalg.norm(delta-t[:,None]*ab, axis=1)
    i = int(np.argmax(distances))
    if distances[i] <= tolerance:
        return [points[0],points[-1]]
    return simplify(points[:i+1],tolerance)[:-1] + simplify(points[i:],tolerance)

def trace(skeleton):
    nodes = set(zip(*np.nonzero(skeleton)))
    graph = {}
    for y,x in sorted(nodes):
        neighbors=[]
        for dy,dx in ((-1,0),(0,-1),(0,1),(1,0),(-1,-1),(-1,1),(1,-1),(1,1)):
            if (y+dy,x+dx) not in nodes:
                continue
            if dy and dx and ((y+dy,x) in nodes or (y,x+dx) in nodes):
                continue
            neighbors.append((y+dy,x+dx))
        graph[(y,x)] = neighbors
    visited=set()
    strands=[]
    starts=sorted(graph,key=lambda p:(len(graph[p]) == 2,p))
    for start in starts:
        if not graph[start]:
            y,x=start
            strands.append(f'M{(x+.5)/8:.3f} {(y+.5)/8:.3f}h.001')
        for neighbor in graph[start]:
            edge=tuple(sorted((start,neighbor)))
            if edge in visited:
                continue
            visited.add(edge)
            points=[start,neighbor]
            previous,current=start,neighbor
            while len(graph[current]) == 2:
                nxt=next(p for p in graph[current] if p != previous)
                edge=tuple(sorted((current,nxt)))
                if edge in visited:
                    break
                visited.add(edge)
                points.append(nxt)
                previous,current=current,nxt
            if len(points) < 3:
                continue
            points=simplify(points)
            strands.append('M'+' L'.join(f'{(x+.5)/8:.3f} {(y+.5)/8:.3f}' for y,x in points))
    return strands

def render(font, code):
    image=Image.new('L',(SIZE,SIZE))
    ImageDraw.Draw(image).text((0,SIZE),chr(code),font=font,fill=255,anchor='ls')
    return np.asarray(image) >= 128

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--offline',action='store_true')
    parser.add_argument('--update',action='store_true')
    args=parser.parse_args()
    if args.offline and args.update:
        parser.error('--offline and --update are mutually exclusive')
    CACHE.mkdir(parents=True,exist_ok=True)
    lock=json.loads(LOCK.read_text()) if LOCK.exists() else {}
    if args.update or not lock:
        if args.offline:
            parser.error('No source lock exists')
        revision=json.load(urllib.request.urlopen('https://api.github.com/repos/google/material-design-icons/commits/master',timeout=60))['sha']
        lock={'revision':revision,'sha256':{}}
    files={'rounded.ttf':'variablefont/MaterialSymbolsRounded%5BFILL,GRAD,opsz,wght%5D.ttf',
           'rounded.codepoints':'variablefont/MaterialSymbolsRounded%5BFILL,GRAD,opsz,wght%5D.codepoints','LICENSE':'LICENSE'}
    for name,source in files.items():
        target=CACHE/name
        valid=target.exists() and (not lock['sha256'].get(name) or hashlib.sha256(target.read_bytes()).hexdigest() == lock['sha256'][name])
        if not valid or args.update:
            if args.offline:
                raise RuntimeError(f'Missing or changed cached source: {name}')
            data=urllib.request.urlopen(f'https://raw.githubusercontent.com/google/material-design-icons/{lock["revision"]}/{source}',timeout=90).read()
            target.write_bytes(data)
        digest=hashlib.sha256(target.read_bytes()).hexdigest()
        if lock['sha256'].get(name) and lock['sha256'][name] != digest and not args.update:
            raise RuntimeError(f'Source hash mismatch: {name}')
        lock['sha256'][name]=digest
    LOCK.write_text(json.dumps(lock,indent=2)+'\n')
    font=TTFont(CACHE/'rounded.ttf')
    glyphs=font.getGlyphSet(location={'FILL':1,'GRAD':0,'opsz':24,'wght':400})
    cmap=font.getBestCmap()
    filled=ImageFont.truetype(str(CACHE/'rounded.ttf'),SIZE)
    filled.set_variation_by_axes([1,0,24,400])
    unfilled=ImageFont.truetype(str(CACHE/'rounded.ttf'),SIZE)
    unfilled.set_variation_by_axes([0,0,24,400])
    icons={}
    report=[]
    for index,line in enumerate((CACHE/'rounded.codepoints').read_text().splitlines()):
        name,code=line.split()
        code=int(code,16)
        if code not in cmap:
            raise RuntimeError(f'Missing font glyph: {name}')
        pen=SVGPathPen(glyphs,ntos=lambda v:format(round(v,3),'g'))
        glyphs[cmap[code]].draw(TransformPen(pen,(1/40,0,0,-1/40,0,24)))
        data={'symbol':name,'viewBox':'0 0 24 24','paths':[pen.getCommands()]}
        mask=render(filled,code)
        outline=render(unfilled,code)
        delta=float(np.logical_xor(mask,outline).sum()/max(1,mask.sum()))
        radius=float(distance_transform_edt(mask).max())
        reason='solid-or-mixed'
        if delta <= .012 and radius <= 16:
            strands=trace(thin(mask))
            if strands and len(strands) <= 48:
                # Measure coverage after simplification/pruning, rather than
                # assuming the medial-axis radius still reconstructs corners.
                centerlines=Image.new('L',(SIZE,SIZE))
                draw=ImageDraw.Draw(centerlines)
                for strand in strands:
                    numbers=[float(n) for n in re.findall(r'-?\d+(?:\.\d+)?',strand)]
                    points=[(round(numbers[i]*8),round(numbers[i+1]*8)) for i in range(0,len(numbers)-1,2)]
                    if len(points)>1:
                        draw.line(points,fill=255,width=1)
                    elif points:
                        draw.point(points[0],fill=255)
                cover=float(distance_transform_edt(np.asarray(centerlines) == 0)[mask].max())
                data.update(strokes=strands,revealWidth=round((cover*2+4)/8,3))
                reason='fill-invariant-thin'
        icons[name]=data
        report.append({'name':name,'animation':'stroke' if 'strokes' in data else 'center-fill',
                       'reason':reason,'fillDifference':round(delta,4),'maxRadiusPx':round(radius,3)})
        if index % 500 == 0:
            print(f'Processed {index+1} symbols',flush=True)
    for alias,name in ALIASES.items():
        if alias not in icons:
            icons[alias]=icons[name]
    names=CORE+sorted(set(icons)-set(CORE))
    icons={name:icons[name] for name in names}
    header='// Generated by scripts/fetch-icons.py. Google Material Symbols Rounded FILL=1, Apache-2.0.\n'
    def write_data(path,data):
        path.write_text(header+'import type { MaterialIconData } from "./icon-types";\nexport const materialIcons: Record<string, MaterialIconData> = '+json.dumps(data,separators=(',',':'))+';\n',encoding='utf-8')
    write_data(ROOT/'src/kit/icon-map.ts',{name:icons[name] for name in CORE})
    write_data(ROOT/'src/kit/material-icons.ts',icons)
    (ROOT/'src/kit/icon-names.ts').write_text(header+'export type IconName = '+ ' | '.join(json.dumps(name) for name in names)+';\n',encoding='utf-8')
    (ROOT/'src/kit/icon-generation-report.json').write_text(json.dumps({'revision':lock['revision'],
        'canonicalCount':len(report),'aliasCount':len(icons)-len(report),'counts':dict(Counter(r['animation'] for r in report)),
        'method':'Fill invariance plus thinness; skeleton paths reveal original vector artwork. Heuristic, not semantic classification.',
        'icons':report},indent=2)+'\n',encoding='utf-8')
    (ROOT/'licenses/material-symbols.txt').write_bytes((CACHE/'LICENSE').read_bytes())
    print(f'Generated {len(report)} canonical symbols + {len(icons)-len(report)} compatibility aliases: '+str(Counter(r['animation'] for r in report)),flush=True)

if __name__ == '__main__':
    main()
