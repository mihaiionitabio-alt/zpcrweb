function zhManualContext(value){
 const raw=String(value??''),s=raw.trim();let m,out;
 if((m=s.match(/^(.+) · all loaded runs$/)))out=zhPhrase(m[1])+' · 所有已加载运行';
 else if((m=s.match(/^(\d+) selected · (\d+) figure\(s\) · (\d+) table\(s\)$/)))out='已选 '+m[1]+' 项 · '+m[2]+' 张图 · '+m[3]+' 个表';
 else if((m=s.match(/^files (\d+) · results (\d+) · selected (\d+) · profile (.+)$/)))out='文件 '+m[1]+' · 结果 '+m[2]+' · 已选 '+m[3]+' · 规程 '+m[4];
 else if((m=s.match(/^(\d+) (runs|results)$/)))out=m[1]+(m[2]==='runs'?' 次运行':' 条结果');
 else if((m=s.match(/^(\d+) · key$/)))out=m[1]+' · 快捷键';
 else if((m=s.match(/^Reset view · (\d+)%$/)))out='重置视图 · '+m[1]+'%';
 else if((m=s.match(/^(Raw fluorescence · A1|Optical reference row|Stored dark mean|Stored dark SD|Stored dark max minus min|Stored temperature fields|Temperature fields at reads|LED DAC setting|Read intervals|Ordered block-temperature increments|Reference versus stored factory value|Processed amplification|Vendor Cq by well|Vendor Cq plate heat map|Exported melt signal)( \| .+)$/)))out=(ZH_TERMS[m[1]]||m[1])+m[2];
 else if((m=s.match(/^(Nearly constant block temperature|Observed heating|Observed cooling|Changing block temperature) · (.+) °C · ([0-9/]+) reads(\/run)?$/)))out=ZH_TERMS[m[1]]+' · '+m[2]+' °C · '+m[3]+(m[4]?' 次读板／运行':' 次读板');
 else if((m=s.match(/^(.+) · group (\d+) · P ([a-f0-9]{12}) · (.+)$/)))out=m[1]+' · 采集组 '+m[2]+' · P '+m[3]+' · '+zhPhrase(m[4]);
 else if((m=s.match(/^(.+) \| Protocol ([a-f0-9]+) \| Acquisition group (\d+)$/)))out=m[1]+' | 实验程序 '+m[2]+' | 采集组 '+m[3];
 else if((m=s.match(/^Raw Ch (\d+)$/)))out='原始通道 '+m[1];
 else if((m=s.match(/^Acquisition group (\d+): stored file ID, not a PCR cycle number$/)))out='采集组 '+m[1]+'：文件中保存的编号，不是 PCR 循环数';
 else if((m=s.match(/^Across-run Cq comparison - (C\d+) - (.+)$/)))out='跨运行 Cq 比较－'+m[1]+'－'+m[2];
 else if((m=s.match(/^(C\d+) - (.+) - (Stored vendor Cq|Independently calculated PCRD Cq)$/)))out=m[1]+'－'+m[2]+'－'+ZH_TERMS[m[3]];
 else if((m=s.match(/^(\d+) loaded analysis\/run views\. Counts respect sample selection; stored and independent Cq are separate\. Complete filenames and coverage appear in the report\.$/)))out=m[1]+' 个已加载分析／运行视图。按所选样本统计；保存的 Cq 与独立计算的 Cq 分开计数。报告保留完整文件名与覆盖情况。';
 else if((m=s.match(/^(\d+) statistics rows across (\d+) separate cohorts\. Targets, protocols, instrument identities, channels, acquisition groups and roles stay separate\. Full cohort identities are included in the report\.$/)))out=m[2]+' 个独立分组，共 '+m[1]+' 行统计。靶标、实验程序、仪器身份、通道、采集组和样本角色分别统计。报告保留完整分组信息。';
 else if((m=s.match(/^(.+) \| SN (.+) \| (.+) \| (\d+) runs; (\d+) valid selected Cq results\. Protocol, acquisition and role separation is retained\. Full cohort\/source identities appear in the report\.$/)))out=m[1]+' | SN '+m[2]+' | '+m[3].replace(/ \/ raw channel (\d+)$/,'／原始通道 $1')+' | '+m[4]+' 次运行；'+m[5]+' 个所选有效 Cq。实验程序、采集组及角色保持分离；报告保留完整分组和来源信息。';

 if(out===undefined)return null;const at=raw.indexOf(s);return raw.slice(0,at)+out+raw.slice(at+s.length);
}