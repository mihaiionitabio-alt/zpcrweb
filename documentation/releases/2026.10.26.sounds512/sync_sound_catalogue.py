"""Update the inline sound bank from its editable JSON source."""
import json,re
from pathlib import Path
root=Path(__file__).resolve().parents[1]
items=json.loads((root/'src/core/ui/sound_catalogue.json').read_text(encoding='utf-8'))
assert len({x['id'] for x in items})==len(items)
path=root/'src/shell/public_startup_sound.html'
text,count=re.subn(r' const catalog=\[.*?\];',lambda _:' const catalog='+json.dumps(items,ensure_ascii=False,separators=(',',':'))+';',path.read_text(encoding='utf-8'),count=1)
assert count==1
path.write_text(text,encoding='utf-8')
print(f'Synchronized {len(items)} sound choices')
