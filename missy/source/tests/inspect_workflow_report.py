from pathlib import Path
import json,fitz,hashlib,math
from PIL import Image,ImageDraw
p=Path('tests/WORKFLOW_ALL_RUNS.pdf');d=fitz.open(p);text=[];thumbs=[]
for i,page in enumerate(d):
 assert page.rect.width<page.rect.height
 t=page.get_text();text.append(t);assert f'Page {i+1} of {len(d)}' in t
 for b in page.get_text('dict')['blocks']:
  if b['type']==1:
   assert page.rect.contains(fitz.Rect(b['bbox']))
  for l in b.get('lines',[]):
   for s in l['spans']:
    x0,y0,x1,y1=s['bbox'];assert x0>=-.5 and x1<=page.rect.width+.5 and y0>=-.5 and y1<=page.rect.height+.5
    if not s['text'].startswith('Page '):assert y1<page.rect.height-42,(i,s['text'])
 pix=page.get_pixmap(matrix=fitz.Matrix(.5,.5),alpha=False);thumbs.append(Image.frombytes('RGB',(pix.width,pix.height),pix.samples))
flat=''.join('\n'.join(text).split());assert 'ResearchUseOnly' in flat
files=['D:/IXO/phy/ef/QC.03-Mar-2026.28284.ixo','D:/IXO/export/1/4Plex_Multiplex_MMx_10uL.eds','D:/IXO/CFX_RDML_vendor_exports_2026-10-20/CFX96_Qualification Plate.rdml','D:/IXO/zpcr_support_review_2026-10-20/reference/samples/20190516_122922_CT019138_SHORT_QUALIF.zpcr','D:/IXO/CFX/SampleFiles/DataFiles/Sample Data Files/CFX96_Qualification Plate.pcrd']
for file in files:
 f=Path(file);assert ''.join(f.name.split()) in flat,f.name;assert hashlib.sha256(f.read_bytes()).hexdigest() in flat,f.name
for start in range(0,len(thumbs),12):
 ts=thumbs[start:start+12];w=ts[0].width;h=ts[0].height+20;sheet=Image.new('RGB',(w*3,h*math.ceil(len(ts)/3)),'#cbd5e1');dr=ImageDraw.Draw(sheet)
 for j,img in enumerate(ts):x=j%3*w;y=j//3*h;sheet.paste(img,(x,y+20));dr.text((x+5,y+3),str(start+j+1),fill='black')
 sheet.save('tests/WORKFLOW_CONTACT_'+str(start//12+1)+'.png')
print('PASS all-run PDF: '+str(len(d))+' portrait pages; full filenames and SHA-256 for all five formats; no page/footer overflow')
