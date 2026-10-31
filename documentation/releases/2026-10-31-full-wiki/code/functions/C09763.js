function(value){const raw=String(value??''),s=raw.trim();let m,out;
if((m=s.match(/^(.+?)\s*·\s*item (\d+) of (\d+)\s*·\s*(\d+) outside limits\s*·\s*(\d+) to watch$/)))out=zhPhrase(m[1])+' · 第 '+m[2]+' / '+m[3]+' 项 · '+m[4]+' 项超限 · '+m[5]+' 项待关注';
else if((m=s.match(/^of (\d+)$/)))out='／共 '+m[1]+' 项';
else if((m=s.match(/^a chart needs (\d+) runs before it has limits$/)))out='建立控制限需要 '+m[1]+' 次基线运行';
else if((m=s.match(/^(\d+) run\(s\) are in this instrument's history\. Until a chart has its baseline it can raise no alarm\.$/)))out='该仪器历史包含 '+m[1]+' 次运行。基线未建立时，不作控制图报警判定。';
else if((m=s.match(/^(.+) · (\d+) run\(s\) · chart gallery$/)))out=m[1]+' · '+m[2]+' 次运行 · 图表库';
else if((m=s.match(/^(\d+) stored results · (\d+) curves decoded$/)))out=m[1]+' 条保存结果 · '+m[2]+' 条已解码曲线';
else if((m=s.match(/^([\dx]+) plate · (\d+) cycles · (\d+) curves$/)))out=m[1]+' 孔板 · '+m[2]+' 个循环 · '+m[3]+' 条曲线';
else if((m=s.match(/^(\d+) target rule\(s\) · (\d+) control\(s\) · (\d+) run rule\(s\)$/)))out=m[1]+' 条靶标规则 · '+m[2]+' 项质控 · '+m[3]+' 条运行规则';
else if((m=s.match(/^(\d+) chart\(s\) · (\d+) outside limits · (\d+) to watch$/)))out=m[1]+' 张图 · '+m[2]+' 项超限 · '+m[3]+' 项待关注';
else if((m=s.match(/^(\d+) instrument\(s\) in the loaded history$/)))out='已加载历史包含 '+m[1]+' 台仪器';
else if((m=s.match(/^(\d+) chart\(s\) have a point outside a control or specification limit\.$/)))out=m[1]+' 张图存在超出控制限或规格限的点。';
else if((m=s.match(/^(\d+) chart\(s\) show a pattern inside the limits\.$/)))out=m[1]+' 张图存在限内异常模式。';
else if((m=s.match(/^(\d+) runs$/)))out=m[1]+' 次运行';
return out===undefined?next(value):raw.replace(s,out);
}