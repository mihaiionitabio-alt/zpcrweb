next=>function(value){const raw=String(value??''),s=raw.trim();let m,out;
if((m=s.match(/^(.+) — all targets$/)))out=m[1]+'－全部靶标';
else if((m=s.match(/^SOP zone spread (.+) °C \(×10\)$/)))out='SOP 温区温差 '+m[1]+' °C（×10）';
else if((m=s.match(/^SN (.+) · protocol ([a-f0-9]+) · acquisition group (\d+)$/)))out='SN '+m[1]+' · 实验程序 '+m[2]+' · 采集组 '+m[3];
return out===undefined?next(value):raw.replace(s,out);
}