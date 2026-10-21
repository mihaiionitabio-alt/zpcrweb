from pathlib import Path
import json,math,fitz
from PIL import Image,ImageDraw
p=Path(__file__).parent;d=fitz.open(p/'MODULAR_MIXED_REPORT.pdf');thumbs=[];text=[];bad=[];image_count=0
for i,page in enumerate(d):
 assert page.rect.width<page.rect.height
 t=page.get_text();text.append(t);assert 'Page' in t
 for block in page.get_text('dict')['blocks']:
  if block['type']==1:
   image_count+=1
   x0,y0,x1,y1=block['bbox']
   if x0<-.5 or y0<-.5 or x1>page.rect.width+.5 or y1>page.rect.height+.5:bad.append([i+1,'image bounds',block['bbox']])
  for line in block.get('lines',[]):
   for span in line['spans']:
    x0,y0,x1,y1=span['bbox']
    if x0<-.5 or y0<-.5 or x1>page.rect.width+.5 or y1>page.rect.height+.5:bad.append([i+1,span['text'],span['bbox']])
    if not span['text'].startswith('Page ') and y1>page.rect.height-42:bad.append([i+1,'content enters footer: '+span['text'],span['bbox']])
 pix=page.get_pixmap(matrix=fitz.Matrix(.5,.5),alpha=False);thumbs.append(Image.frombytes('RGB',(pix.width,pix.height),pix.samples));page.get_pixmap(matrix=fitz.Matrix(1.2,1.2),alpha=False).save(p/f'page_{i+1:02}.png')
assert not bad,bad
flat=''.join('\n'.join(text).split())
for s in ['couldnotberasterised','couldnotberasterized','undefined','NaN']:assert s not in flat,s
assert 'ResearchUseOnly' in flat
for e in json.loads((p/'fixtures/PCRD_EXPECTATIONS.json').read_text(encoding='utf8')):
 assert ''.join(e['name'].split()) in flat,e['name']
 assert e['sha256'] in flat,e['name']
assert image_count>=12,('Not enough rendered figures',image_count)
for start in range(0,len(thumbs),12):
 a=thumbs[start:start+12];w=a[0].width;h=a[0].height+22;sheet=Image.new('RGB',(w*3,h*math.ceil(len(a)/3)),'#cbd5e1');draw=ImageDraw.Draw(sheet)
 for j,img in enumerate(a):x=j%3*w;y=j//3*h;sheet.paste(img,(x,y+22));draw.text((x+5,y+4),str(start+j+1),fill='black')
 sheet.save(p/f'contact_{start//12+1}.png')
r={'pages':len(d),'renderedImages':image_count,'portrait':True,'pagination':True,'allPageTextAndImageBounds':True,'all27FilenamesAndHashes':True,'noRasterisationFallbacks':True,'RUO':True,'tablePolicy':'The existing PDF writer summarises tables and marks omitted rows; full numerical CSV exports remain available.'}
(p/'MODULAR_PDF_CHECKS.json').write_text(json.dumps(r,indent=2));print(json.dumps(r,indent=2))
