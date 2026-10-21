"""Recover source text using glyph identities and the PDF's fraction geometry.

The PDF uses unmapped script glyphs. Mappings below were visually checked
against each glyph in the supplied source, rather than inferred from chemistry.
Run from the repository root. Input files stay outside the public application.
"""
import collections
import json
import re
import unicodedata
from pathlib import Path

import fitz

ROOT = Path(__file__).resolve().parents[3]
WORK = ROOT / 'recovered'
DOC = fitz.open(WORK / 'Chapter three.pdf')
FONT_MAP = json.loads((Path(__file__).resolve().parent / 'ahmed-ch3-font-map.json').read_text())
CM = {int(k): v for k, v in FONT_MAP['CambriaMath'].items()}
for start in (2868, 3116):
    CM.update({start+i: str(i) for i in range(10)})
for start, alphabet in ((2885,'ABCDEFGHIJKLMNOPQRSTUVWXYZ'), (2911,'abcdefghijklmnopqrstuvwxyz'),
                        (3002,'ABCDEFGHIJKLMNOPQRSTUVWXYZ'), (3028,'abcdefghijklmnopqrstuvwxyz')):
    CM.update({start+i:c for i,c in enumerate(alphabet)})
CM.update({2878:'+',2879:'−',3126:'+',3127:'−',3143:'K',3144:'L',3159:'a',3160:'b',3165:'g',3166:'h',3181:'w',3183:'y',3261:'L',3282:'g',3287:'l',3288:'m',3290:'o',3415:'/',3427:'[',3431:']',3435:'(',3439:')',3493:'∛',3495:'√',3496:'√',4654:'→',4657:'→'})
SYMBOL = {0xf0de:'⇒',0xf05d:']',0xf05b:'[',0xf0ae:'→',0xf0be:'',0xf0b4:'×',0xf05c:'∴',0xf044:'Δ',0xf0a2:'′',0xf0b7:'·',0xf03c:'<'}
SUP = str.maketrans('0123456789+-=()ni','⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁼⁽⁾ⁿⁱ')
SUB = str.maketrans('0123456789+-=()aeoxhn','₀₁₂₃₄₅₆₇₈₉₊₋₌₍₎ₐₑₒₓₕₙ')
AR_FONTS = ('Hacen','MCS-','ANegaar','Noto','Koufi')
UNMAPPED = collections.Counter()

def norm(t):
    t = unicodedata.normalize('NFKC',t)
    return t.replace('\u00ad','').replace('⎯','').replace('⟶','→').replace('⟹','⇒')

def page_nodes(page):
    out=[]
    for s in page.get_texttrace():
        f=s['font']
        if any(a in f for a in AR_FONTS): continue
        for u,g,origin,b in s['chars']:
            if f=='CambriaMath': t=CM.get(g,chr(u))
            elif f=='SymbolMT': t=SYMBOL.get(u,chr(u))
            elif u==65533:
                t=FONT_MAP.get(f,{}).get(str(g),'')
                if not t and f=='TimesNewRomanPSMT': t={177:'−',33:'>',32:'=',12:')',238:'×'}.get(g,'')
                if not t and f=='Calibri' and g==1104:t='Δ'
                if not t and f=='ArialMT' and g==34:t='?'
                if not t: continue # Arabic annotation encoded in a Latin font.
            else:t=chr(u)
            if any('\u0600'<=c<='\u06ff' or '\ufb50'<=c<='\ufeff' for c in t):continue
            if t=='�': UNMAPPED[(f,g)]+=1;continue
            t=norm(t)
            if not t or not t.strip():continue
            out.append(dict(t=t,x=b[0],y=b[1],r=b[2],b=b[3],base=origin[1],size=s['size'],font=f,white=min(s.get('color',(0,0,0)))>.8))
    return out

NODES={p.number+1:page_nodes(p) for p in DOC}

def plain(nodes, fractions=True):
    if not nodes:return ''
    if fractions:
        # Fractions are replaced with a single inline text atom before row sorting.
        for rect in CURRENT_RULES:
            x,y,r,b=rect
            candidates=[n for n in nodes if n['x']>=x-1.4 and n['r']<=r+1.4 and abs((n['y']+n['b'])/2-y)<21]
            above=[n for n in candidates if n['b']<=y+1.5]
            below=[n for n in candidates if n['y']>=b-1.5]
            if not above or not below:continue
            # Nearest numerator/denominator rows only; don't collect the next equation.
            ab=max(n['base'] for n in above);bb=min(n['base'] for n in below)
            above=[n for n in above if n['base']>=ab-9]
            below=[n for n in below if n['base']<=bb+9]
            if ab>y+4 or bb-y>23:continue
            used=above+below
            if any(sum(n.get('font')=='CambriaMath' for n in side)<len(side)*.5 for side in (above,below)):continue
            numerator=plain(above,False);denominator=plain(below,False)
            if not numerator or not denominator:continue
            size=max(n['size'] for n in used)*1.35
            node=dict(t='('+numerator+')/('+denominator+')',x=x,y=y-size*.5,r=r,b=y+size*.5,base=y+size*.35,size=size,white=False,frac=True)
            used_ids={id(n) for n in used};nodes=[n for n in nodes if id(n) not in used_ids]+[node]
    rows=[]
    for n in sorted(nodes,key=lambda n:(n['base'],n['x'])):
        row=next((r for r in rows if abs(r['base']-n['base'])<2.0),None)
        if row is None:row=dict(base=n['base'],size=n['size'],nodes=[]);rows.append(row)
        row['nodes'].append(n);row['size']=max(row['size'],n['size'])
    # Chemical subscripts/superscripts belong to the surrounding text line.
    for row in sorted(rows,key=lambda r:r['size']):
        if not row['nodes']:continue
        larger=[r for r in rows if r is not row and r['nodes'] and r['size']>row['size']*1.13 and -13<row['base']-r['base']<9]
        if not larger:continue
        moving=[]
        for n in row['nodes']:
            near=[r for r in larger if any(abs(n['x']-m['r'])<12 or m['x']-1<=n['x']<=m['r']+1 for m in r['nodes'])]
            if not near:continue
            target=min(near,key=lambda r:(abs(row['base']-r['base']) + (0 if r['size']>12 else 3)))
            target['nodes'].append(n);moving.append(n)
        mi={id(n) for n in moving};row['nodes']=[n for n in row['nodes'] if id(n) not in mi]
    lines=[]
    for row in sorted(rows,key=lambda r:r['base']):
        ns=sorted(row['nodes'],key=lambda n:n['x'])
        if not ns:continue
        text='';last=None
        for n in ns:
            t=n['t'];delta=n['base']-row['base']
            if n['size']<row['size']*.86 and not n.get('frac'):
                if delta<-1.0 and all(c in '0123456789+-−=()ni' for c in t):t=t.replace('−','-').translate(SUP)
                elif delta>1.0 and all(c in '0123456789+-−=()aeoxhn' for c in t):t=t.replace('−','-').translate(SUB)
                elif delta<-1.0:t='^('+t+')'
            if last:
                gap=n['x']-last['r']
                if gap>row['size']*1.5:text+=' | '
                elif gap>row['size']*.10:text+=' '
            text+=t;last=n
        text=re.sub(r' +',' ',text).strip()
        if text:lines.append(text)
    return '\n'.join(lines)

RULES={}
for p in DOC:
    rr=[]
    for d in p.get_drawings():
        r=d['rect'];color=d.get('fill') if d['type']=='f' else d.get('color')
        if color and min(color)<.8 and 3<r.width<230 and r.height<1.7:
            rr.append(tuple(r))
    RULES[p.number+1]=sorted(rr,key=lambda r:r[2]-r[0])
CURRENT_RULES=[]

def extract(regions,question=False):
    global CURRENT_RULES
    results=[]
    for reg in regions:
        pn=reg['page'];x,y,r,b=reg['box'];CURRENT_RULES=RULES[pn]
        ns=[dict(n) for n in NODES[pn] if x<= (n['x']+n['r'])/2 <=r and y<= (n['y']+n['b'])/2 <=b]
        if question:
            whites=[n for n in ns if n['white']]
            if len(whites)>len(ns)*.25:ns=whites
        result=plain(ns)
        if result:results.append(result)
    return '\n\n'.join(results)

if __name__=='__main__':
    cards=json.loads((WORK/'deck/cards.json').read_text())
    for c in cards:
        media=c.pop('sourceMedia')
        q=extract(media['question'],True) if media['question'] else norm(c['q'])
        a=extract(media['answer'])
        # Remove question/title duplication from the reverse side only when exact.
        if a.startswith(q):a=a[len(q):].lstrip(' :\n')
        c['q']=q;c['a']=a
    (WORK/'text-draft.json').write_text(json.dumps(cards,ensure_ascii=False,indent=2))
    (WORK/'text-draft.txt').write_text('\n\n'.join(f"{i+1}. {c['id']} {c['pages']}\nQ: {c['q']}\nA: {c['a']}" for i,c in enumerate(cards)))
    print('Extracted',len(cards),'Unmapped',dict(UNMAPPED))
