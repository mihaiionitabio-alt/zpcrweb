function(value){const complete=next(value);if(complete!==String(value??''))return complete;const raw=String(value??''),s=raw.trim();let m,out;
if((m=s.match(/^Repeat analysis — replicate SD (.+) > (.+)$/)))out='重新检测－重复孔标准差 '+m[1]+' > '+m[2];
else if(s.includes('; ')){const parts=s.split('; '),translated=parts.map(zhPhrase);if(translated.some((x,i)=>x!==parts[i]))out=translated.join('；');}
return out===undefined?complete:raw.replace(s,out);
}