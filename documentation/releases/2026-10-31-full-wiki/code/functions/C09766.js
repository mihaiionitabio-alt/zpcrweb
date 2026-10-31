next=>function(value){const complete=next(value);if(complete!==String(value??''))return complete;const raw=String(value??''),s=raw.trim();let m,out;
if((m=s.match(/^(.+) · (\d+) run\(s\) in this chart · last run (.+)$/)))out=m[1]+' · 图中 '+m[2]+' 次运行 · 最近运行 '+zhPhrase(m[3]);
else if((m=s.match(/^([-\d.]+) (fluorescence|reference counts|% change in the run|°C from setpoint|log10 hours|findings|events|share of results|share of NTC wells|share of settings|share of wells|share of intervals|share of readings)$/)))out=m[1]+' '+zhPhrase(m[2]);
else if((m=s.match(/^(\d+) result\(s\) · (\d+) with a Cq$/)))out=m[1]+' 项结果 · '+m[2]+' 项有 Cq';
else if((m=s.match(/^(\d+) negative · (\d+) inconclusive · (\d+) repeat · (\d+) invalid$/)))out=m[1]+' 项阴性 · '+m[2]+' 项无法判定 · '+m[3]+' 项重新检测 · '+m[4]+' 项无效';
else if((m=s.match(/^For review: (.+)$/)))out='待审核：'+m[1].split('; ').map(zhPhrase).join('；');
else if((m=s.match(/^(.+): (\d+) replicate\(s\), SOP requires (\d+)$/)))out=m[1]+'：'+m[2]+' 个重复孔，SOP 要求 '+m[3]+' 个';
else if((m=s.match(/^(.+): detected in (\d+)\/(\d+) replicates, SOP requires (\d+)$/)))out=m[1]+'：'+m[3]+' 个重复孔中 '+m[2]+' 个检出，SOP 要求 '+m[4]+' 个';
else if(s.includes(' · ')){const parts=s.split(' · '),translated=parts.map(zhPhrase);if(translated.some((x,i)=>x!==parts[i]))out=translated.join(' · ');}
else if(s.includes(', ')){const parts=s.split(', ');if(parts.every(x=>ROLES.includes(x)))out=parts.map(zhPhrase).join('、');}
return out===undefined?complete:raw.replace(s,out);
}