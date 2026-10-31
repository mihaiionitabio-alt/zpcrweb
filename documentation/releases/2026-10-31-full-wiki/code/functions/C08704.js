function zpcrExpectedReads(text){
 const tokens=String(text||'').split(';').map(s=>s.trim()).filter(Boolean),steps=[];
 const modifiers=new Set(['METHOD','HOTLID','VOLUME','INC','RATE','EXT','BEEP']);
 for(const token of tokens){const op=token.split(/\s+/)[0].toUpperCase();if(modifiers.has(op))continue;if(!['TEMP','GRAD','PLATEREAD','GOTO','END'].includes(op))return {supported:false,reason:'Unsupported protocol directive '+op};steps.push({op,token});}
 if(!steps.length||steps.at(-1).op!=='END')return {supported:false,reason:'Missing terminal END directive'};
 const loops=[];for(let i=0;i<steps.length;i++)if(steps[i].op==='GOTO'){const m=/^GOTO\s+(\d+)\s*,\s*(\d+)$/i.exec(steps[i].token);if(!m||+m[1]<1||+m[1]>i||+m[2]>10000)return {supported:false,reason:'Unsupported GOTO bounds'};steps[i].target=+m[1]-1;steps[i].repeat=+m[2];loops.push([+m[1]-1,i]);}
 for(let i=0;i<loops.length;i++)for(let j=i+1;j<loops.length;j++)if(loops[i][0]<=loops[j][1]&&loops[j][0]<=loops[i][1])return {supported:false,reason:'Overlapping/nested loops require additional validation'};
 let pc=0,visits=0;const counters={},groups=[];
 while(pc<steps.length&&visits++<200000){const s=steps[pc];if(s.op==='END')return {supported:true,total:groups.reduce((n,g)=>n+g.count,0),groups};if(s.op==='PLATEREAD'){const last=groups.at(-1);if(last?.instruction===pc+1)last.count++;else groups.push({instruction:pc+1,count:1});}
 if(s.op==='GOTO'){const done=counters[pc]||0;if(done<s.repeat){counters[pc]=done+1;pc=s.target;continue;}}pc++;}
 return {supported:false,reason:'Protocol expansion limit'};
}