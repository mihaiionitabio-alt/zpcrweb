from pathlib import Path
import fitz,statistics,json,math,hashlib,re
from PIL import Image,ImageDraw
root=Path('tests/separate_batches');summary={}
for file in root.glob('*_Assisted.pdf'):
 fmt=file.name.split('_')[0];data=json.loads((root/(fmt+'_POINTS.json')).read_text())
 for stat in data['stats']:
  values=[r['value'] for g in data['cohorts'] if g['id']==stat['cohort'] for r in g['points'] if r['role']==stat['role']]
  assert stat['n']==len(values)
  for k,v in [('mean',statistics.mean(values)),('median',statistics.median(values)),('min',min(values)),('max',max(values))]:assert math.isclose(stat[k],v,rel_tol=1e-12)
  if len(values)>1:assert math.isclose(stat['SD'],statistics.stdev(values),rel_tol=1e-12)
 a=fitz.open(file);b=fitz.open(root/(fmt+'_Command.pdf'));assert len(a)==len(b)
 ts=[];alltext=[]
 def images(doc,page):return [(hashlib.sha256(doc.extract_image(x[0])['image']).hexdigest(),[tuple(r) for r in page.get_image_rects(x[0])]) for x in page.get_images()]
 for i,p in enumerate(a):
  assert images(a,p)==images(b,b[i]),(fmt,i,'image/layout mismatch')
  assert p.rect.width<p.rect.height; t=p.get_text();alltext.append(t);assert re.sub(r'2026-\d\d-\d\d \d\d:\d\d:\d\d UTC','BUILD_TIME',t)==re.sub(r'2026-\d\d-\d\d \d\d:\d\d:\d\d UTC','BUILD_TIME',b[i].get_text());assert f'Page {i+1} of {len(a)}' in t
  for block in p.get_text('dict')['blocks']:
   if block['type']==1:assert p.rect.contains(fitz.Rect(block['bbox']))
   for line in block.get('lines',[]):
    for s in line['spans']:
     x0,y0,x1,y1=s['bbox'];assert x0>=-.5 and x1<=p.rect.width+.5 and y0>=-.5 and y1<=p.rect.height+.5,(fmt,i,s)
     if not s['text'].startswith('Page '):assert y1<p.rect.height-40,(fmt,i,s)
  pix=p.get_pixmap(matrix=fitz.Matrix(.65,.65),alpha=False);ts.append(Image.frombytes('RGB',(pix.width,pix.height),pix.samples))
 flat=''.join(''.join(alltext).split());assert 'ResearchUseOnly' in flat;assert not any(x in flat for x in ['NaN','undefined','couldnotbedrawn'])
 for src in data['sources']:assert ''.join(src['file'].split()) in flat and src['sha256'] in flat
 for start in range(0,len(ts),9):
  batch=ts[start:start+9];w=ts[0].width;h=ts[0].height+20;sheet=Image.new('RGB',(w*3,h*math.ceil(len(batch)/3)),'#d2d6dc');dr=ImageDraw.Draw(sheet)
  for j,im in enumerate(batch):x=j%3*w;y=j//3*h;sheet.paste(im,(x,y+20));dr.text((x+5,y+3),str(start+j+1),fill='black')
  sheet.save(root/(fmt+'_CONTACT_'+str(start//9+1)+'.png'))
 summary[fmt]={'pages':len(a),'portrait':True,'commandAssistedTextEqual':True,'commandAssistedImagesEqual':True,'bounds':True,'statistics':True,'filenamesChecksums':True}
(root/'PDF_CHECKS.json').write_text(json.dumps(summary,indent=2));print(json.dumps(summary,indent=2))
