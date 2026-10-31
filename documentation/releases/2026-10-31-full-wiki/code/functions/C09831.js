next=>function(value){const raw=String(value??''),s=raw.trim();let m,out;
if((m=s.match(/^acquisition group (\d+)$/)))out='采集组 '+m[1];
else if((m=s.match(/^(.+) \/ raw channel (\d+)$/)))out=m[1]+'／原始通道 '+m[2];
else if((m=s.match(/^channel (.+) \/ raw channel (\d+)$/)))out='通道 '+m[1]+'／原始通道 '+m[2];
return out===undefined?next(value):raw.replace(s,out);
}