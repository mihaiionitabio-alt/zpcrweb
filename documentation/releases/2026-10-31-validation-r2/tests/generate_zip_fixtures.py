"""Deterministic invented containers, not native vendor archive fixtures."""
from pathlib import Path
import zipfile,io,struct,json,hashlib
root=Path(__file__).resolve().parents[1]/'fixtures'
root.mkdir(exist_ok=True)
xml=b'<rdml version="1.4"><dye id="FAM"/><sample id="ARTIFICIAL_ZIP"><type>unkn</type></sample><target id="ZIP_TARGET"><type>toi</type><dyeId id="FAM"/></target><experiment id="ZIP_FIXTURE"><run id="SYNTHETIC"><pcrFormat><rows>8</rows><columns>12</columns></pcrFormat><react id="1"><sample id="ARTIFICIAL_ZIP"/><data><tar id="ZIP_TARGET"/><cq>25.5</cq></data></react></run></experiment></rdml>'
(root/'zip_synthetic.rdml').write_bytes(xml)
def archive(entries,method=0):
    buf=io.BytesIO()
    with zipfile.ZipFile(buf,'w') as z:
        for name,data in entries:
            i=zipfile.ZipInfo(name,(2020,1,1,0,0,0));i.compress_type=method;i.external_attr=0o600<<16
            z.writestr(i,data,compresslevel=9 if method==8 else None)
    return bytearray(buf.getvalue())
fixtures={}
def save(name,data):
    (root/name).write_bytes(data);fixtures[name]={'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()}
for name,method in [('stored.zip',0),('deflated.zip',8)]:
    save(name,archive([('nested/中文/zip_synthetic.rdml',xml),('notes.txt',b'ignored')],method))
save('filters.zip',archive([('中文/one.ixo',b'content'),('nested/two.rdml',xml),('skip.txt',b'ignored')]))
base=archive([('one.ixo',b'content')]);central=base.index(b'PK\x01\x02')
bad=base.copy();struct.pack_into('<I',bad,central+16,0);save('bad_crc.zip',bad)
bad=base.copy();struct.pack_into('<H',bad,central+10,99);save('unsupported.zip',bad)
bad=base.copy();struct.pack_into('<I',bad,central+24,512*1024*1024+1);save('oversize.zip',bad)
bad=base.copy();struct.pack_into('<I',bad,central+24,8);save('size_mismatch.zip',bad)
save('traversal.zip',archive([('../outside/zip_synthetic.rdml',xml)]))
save('expanded.zip',archive([('nested/padded.rdml',xml+b' '*20000)],8))
save('two_members.zip',archive([('a/one.rdml',xml),('b/two.rdml',xml)]))
save('malformed.zip',b'not an archive')
(root/'archive_manifest.json').write_text(json.dumps({'schema':'MISSY_SYNTHETIC_ZIP_FIXTURES/1','scope':'Invented container guards and one RDML intake; does not replace native vendor quirks or password decryption coverage.','files':fixtures},indent=2)+'\n',encoding='utf-8')
print('Generated',len(fixtures),'deterministic synthetic ZIP fixtures')
