next=>function(value){const raw=String(value??''),s=raw.trim();let m,out;
if((m=s.match(/^(\d+)\s*·\s*key$/)))out=m[1]+' · 快捷键';
else if((m=s.match(/^Chart type · (.+)$/)))out='控制图类型 · '+zhPhrase(m[1]);
else if((m=s.match(/^X axis · (.+)$/)))out='X 轴 · '+zhPhrase(m[1]);
else if((m=s.match(/^Next run · (.+)$/)))out='下一运行 · '+m[1];
else if((m=s.match(/^press (\d+)$/)))out='按 '+m[1];
else if((m=s.match(/^(\d+) · select( · in use)?$/)))out=m[1]+' · 选择'+(m[2]?' · 当前使用':'');
else if((m=s.match(/^(Hide header \/ controls|Show header \/ controls) \(H\)$/)))out=zhPhrase(m[1])+'（H）';
if(out!==undefined)return raw.replace(s,out);return next(value);
}