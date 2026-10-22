from pathlib import Path
import fitz,re,json,hashlib
results={}; current=hashlib.sha256(Path('dist/Missy-public.html').read_bytes()).hexdigest()
for f in Path('tests/chinese_pdf').glob('*_Chinese.pdf'):
 d=fitz.open(f);e=json.loads(f.with_name(f.stem.replace('_Chinese','')+'_EVIDENCE.json').read_text(encoding='utf8'));assert e['sha256']==current
 text='\n'.join(p.get_text() for p in d);compact=re.sub(r'\s+','',text)
 assert '仅供研究使用' in text and '不能替代厂商' in text
 for r in e['sources']:
  assert re.sub(r'\s+','',r['file']) in compact,r['file'];assert r['sha'] in compact,r['sha']
 assert all(p.rect.width<p.rect.height for p in d)
 assert all(re.search(rf'{i+1} / {len(d)}',p.get_text()) for i,p in enumerate(d))
 assert any(len(d.extract_font(x[0])[3])>1000000 for x in d[0].get_fonts())
 for i,p in enumerate(d):
  for block in p.get_text('dict')['blocks']:
   if block['type']==1:
    r=fitz.Rect(block['bbox']);assert r.x0>=40 and r.x1<=p.rect.width-40 and r.y0>=30 and r.y1<=p.rect.height-40,(f,i,'image',r)
    continue
   for line in block['lines']:
    for s in line['spans']:
     r=fitz.Rect(s['bbox'])
     if re.fullmatch(r'\d+ / \d+',s['text']):continue
     assert r.x0>=40 and r.x1<=p.rect.width-40 and r.y0>=30 and r.y1<=p.rect.height-35,(f,i,s['text'],r)
 assert not any(s in text for s in ['Descriptive counts across','Numbers behind this figure','Raw acquisition data; no vendor','Stored PCRD acquisition values;','Vendor-processed CFX RDML;'])
 results[f.stem]={'pages':len(d),'files':e['files'],'allFilenamesAndChecksums':True,'portrait':True,'pagination':True,'embeddedChineseFont':True,'textAndImageBounds':True,'RUO':True}
 if f.stem=='RDML_Chinese':assert '解码的板规格：96 孔，8 行 × 12 列。' in text
Path('tests/CHINESE_PDF_CHECKS.json').write_text(json.dumps({'sha256':current,'reports':results},indent=2),encoding='utf8');print(json.dumps(results,indent=2))
