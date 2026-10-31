function(value){const s=String(value??'');let m;
if((m=s.match(/^Acquisition group (\d+); protocols and geometry kept separate\. Endpoint N=(\d+)$/)))return `采集组 ${m[1]}；实验程序与板规格保持分离。终点窗口 N=${m[2]}`;
if((m=s.match(/^Acquisition group (\d+) is a stored file ID, not a cycle number\.$/)))return `采集组 ${m[1]} 是文件保存编号，不是循环数。`;
if((m=s.match(/^Endpoint N=(\d+) uses the last N exported amplification reads; not a CFX endpoint algorithm\.$/)))return `终点窗口 N=${m[1]} 使用最后 N 个导出的扩增读数，不是 CFX 终点算法。`;
if((m=s.match(/^(RDML SHA-256|PCRD SHA-256|PCRD): (.+)$/)))return m[1]+': '+(m[2]==='Not supplied'?'未提供':m[2]);
if((m=s.match(/^Unverified protocol; source (.+)$/)))return '未经核实的实验程序；来源 '+m[1];
if((m=s.match(/^group (\d+)$/)))return '采集组 '+m[1];
return next(value);}