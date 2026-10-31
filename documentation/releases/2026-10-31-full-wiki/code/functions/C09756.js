function(value){const raw=String(value??''),s=raw.trim();let m,out;
if((m=s.match(/^([A-Z]-[A-Z]\d+[a-z]?) (.+)$/))){const translated=zhPhrase(m[2]);if(translated!==m[2])out=m[1]+' '+translated;}
else if((m=s.match(/^(lower|upper) spec ([-+\d.eE]+)( — (below|above) this scale)?$/)))out=(m[1]==='lower'?'规格下限 ':'规格上限 ')+m[2]+(m[3]?' — '+(m[4]==='below'?'低于当前坐标范围':'高于当前坐标范围'):'');
return out===undefined?next(value):raw.replace(s,out);
}