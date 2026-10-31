function(value){const raw=String(value??''),s=raw.trim();let m,out;
if((m=s.match(/^Source quality: (.+)$/)))out='源数据质量：'+zhPhrase(m[1]);
else if((m=s.match(/^Baseline cycles 3-10; channel threshold (.+)$/)))out='基线循环 3–10；通道阈值 '+m[1];
else if((m=s.match(/^Dye (.+) uses stored channelPosition (\d+); temperature axis (.+)$/)))out='染料 '+m[1]+' 使用保存的 channelPosition '+m[2]+'；温度轴 '+zhPhrase(m[3]);
return out===undefined?next(value):raw.replace(s,out);
}