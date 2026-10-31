function zhCoverageContext(value){
 const raw=String(value??''),s=raw.trim();let m,out;
 if((m=s.match(/^(\d+) run\(s\) · (\d+) result\(s\) · (\d+) instrument group\(s\)$/)))out=`${m[1]} 次运行 · ${m[2]} 条结果 · ${m[3]} 个仪器分组`;
 else if((m=s.match(/^(\d+) run\(s\), (\d+) stored result\(s\)$/)))out=`${m[1]} 次运行，${m[2]} 条保存结果`;
 else if((m=s.match(/^(\d+) file\(s\) staged, (.+) held$/)))out=`${m[1]} 个暂存文件，占用 ${m[2]}`;
 else if((m=s.match(/^memory (.+)$/)))out='内存 '+m[1];
 else if((m=s.match(/^(load|sop|results|panel|graphs|review|export|integrity) drawn in (.+)$/)))out=({load:'加载',sop:'SOP',results:'结果',panel:'控制面板',graphs:'图表',review:'审核',export:'导出',integrity:'完整性'})[m[1]]+' 绘制耗时 '+m[2];
 else if((m=s.match(/^collecting baseline: (\d+) of (\d+) runs — exploratory only$/)))out=`基线收集中：${m[1]}／${m[2]} 次运行；仅供探索`;
 else if((m=s.match(/^SOP: (.+) · active$/)))out='SOP：'+m[1]+' · 已启用';
 else if((m=s.match(/^(Run created|Experiment created|Run started|Run ended|Experiment last modified)(: .+)$/)))out=zhPhrase(m[1])+m[2];
 else if((m=s.match(/^(Analysis created|Analysis modified)( — .+)$/)))out=zhPhrase(m[1])+m[2];
 else if((m=s.match(/^Hours from run start (\(.+\))$/)))out='距运行开始的小时数 '+m[1];
 else if((m=s.match(/^(\d+) file-integrity mismatch\(es\) found\.$/)))out=`发现 ${m[1]} 处文件完整性差异。`;
 else if((m=s.match(/^(\d+) file\(s\) examined\.$/)))out=`已检查 ${m[1]} 个文件。`;
 else if((m=s.match(/^(\d+) error · (\d+) review · (\d+) experiment\(s\)$/)))out=`${m[1]} 项错误 · ${m[2]} 项审核 · ${m[3]} 个实验`;
 else if((m=s.match(/^(\d+) result\(s\) need action \(Repeat\)$/)))out=`${m[1]} 条结果需重新检测`;
 else if((m=s.match(/^(\d+) result\(s\) need action: (\d+) Repeat analysis\. (\d+) are taxon-reference checks; they are shown for review and do not by themselves change the GMO target outcome\.$/)))out=`${m[1]} 条结果需处理：${m[2]} 条需重新检测。${m[3]} 条为物种参照检查，仅供审核，不单独改变转基因靶标判定。`;
 else if((m=s.match(/^(.+) · group (\d+) · (Nearly constant block temperature|Observed heating|Observed cooling|Changing block temperature)(.+)$/)))out=m[1]+' · 采集组 '+m[2]+' · '+zhPhrase(m[3]+m[4]);
 else if((m=s.match(/^(.*?)(?: taxon reference \((Zea mays|Glycine max)\))?: (Not detected|Detected|Repeat analysis)(; .+)?$/))){out=m[1]+(m[2]?' 物种参照（'+m[2]+'）':'')+'：'+zhPhrase(m[3])+(m[4]?'; '+zhPhrase(m[4].slice(2)):'');}
 else if((m=s.match(/^(.+?) (not detected|detected) \((.+?)\)( .+)?$/))){let detail=m[3];if(/^(\d+) replicates; Cq cut-off ([\d.]+)$/.test(detail))detail=detail.replace(/^(\d+) replicates; Cq cut-off ([\d.]+)$/,'$1 个重复孔；Cq 截止值 $2');else if(/^mean Cq ([\d.]+); (\d+)\/(\d+) replicates$/.test(detail))detail=detail.replace(/^mean Cq ([\d.]+); (\d+)\/(\d+) replicates$/,'平均 Cq $1；$2／$3 个重复孔');else return null;out=m[1].replace(/ taxon reference \((Zea mays|Glycine max)\)$/,' 物种参照（$1）')+' '+(m[2]==='detected'?'检出':'未检出')+'（'+detail+'）'+(m[4]? ' '+zhPhrase(m[4].slice(1)):'');}
 else if((m=s.match(/^(.+): repeat — (.+)$/))){const reason=m[2];let z;if((m=reason.match(/^replicate SD ([\d.]+) > ([\d.]+)$/)))z=`重复孔标准差 ${m[1]} > ${m[2]}`;else if((m=reason.match(/^(\d+) replicate\(s\), SOP requires (\d+)$/)))z=`${m[1]} 个重复孔，SOP 要求 ${m[2]} 个`;else if((m=reason.match(/^detected in (\d+)\/(\d+) replicates, SOP requires (\d+)( .+)?$/)))z=`${m[1]}／${m[2]} 个重复孔检出，SOP 要求 ${m[3]} 个`+(m[4]?' '+zhPhrase(m[4].slice(1)):'');if(z)out=s.slice(0,s.indexOf(': repeat — ')).replace(/ taxon reference \((Zea mays|Glycine max)\)$/,' 物种参照（$1）')+'：重新检测－'+z;}
 else if((m=s.match(/^(.*?)([A-P]\d{1,2}: )?([\w-]+) has a rising curve that belongs to no analysis \(no stored result of any kind at this position\)$/)))out=m[1]+(m[2]||'')+m[3]+' 有上升曲线，但未关联任何分析，且该孔位无保存结果';
 else if((m=s.match(/^(Late rising trace with a stored answer|High raw baseline relative to wells on the same channel) for (.+)$/)))out=(m[1].startsWith('Late')?'已有保存结果的晚期上升曲线':'相对同通道其他孔偏高的原始基线')+'：'+m[2];
 else if((m=s.match(/^baseline (.+); ground-noise SD (.+); late change (.+); terminal change (.+); peak slope (.+) at cycle (\d+)$/)))out=`基线 ${m[1]}；背景噪声标准差 ${m[2]}；晚期变化 ${m[3]}；终末变化 ${m[4]}；最大斜率 ${m[5]}（循环 ${m[6]}）`;
 else if((m=s.match(/^(\d+) finding\(s\) shown for (\d+) selected experiment\(s\)\..+$/)))out=`${m[2]} 个所选实验，共 ${m[1]} 项发现。曲线使用保存的逐循环荧光；红色为错误，琥珀色为待审核。`;
 else if((m=s.match(/^(\d+) raw event\(s\) from the file, timeline, result and profile scans collapse to (\d+) distinct finding\(s\) across (\d+) run\(s\)\..+$/)))out=`${m[3]} 次运行的 ${m[1]} 条原始事件汇总为 ${m[2]} 项独立发现。仅此摘要去重；日志与导出保留全部事件。`;
 else if((m=s.match(/^(\d+) problem curve\(s\) drawn \(up to (\d+) shown\);.+$/)))out=`已绘制 ${m[1]} 条问题曲线，最多显示 ${m[2]} 条。悬停查看数值，滚轮缩放，拖动平移。表格与 CSV 保留全部发现。`;
 if(out===undefined)return null;return raw.replace(s,out);
}