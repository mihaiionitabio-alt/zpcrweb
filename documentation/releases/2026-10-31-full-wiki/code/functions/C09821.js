function reportDisplay(value){const s=String(value??'');if(UI_LANG!=='zh')return s;
 const trimmed=s.trim();if(trimmed&&trimmed!==s)return s.replace(trimmed,reportDisplay(trimmed));
 if(s.includes('\n'))return s.split('\n').map(reportDisplay).join('\n');
 const match=s.match(/^(\s*(?:[•-]|\d+\.)\s+)([\s\S]*)$/);if(match)return match[1]+reportDisplay(match[2]);
 let suffix=s.match(/^(.+?)(\s+\[[^\]]+\])$/);if(suffix)return reportDisplay(suffix[1])+suffix[2];
 if(s.includes(' | '))return s.split(' | ').map(reportDisplay).join(' | ');
 let part;if((part=s.match(/^channel (.+)$/)))return '通道 '+reportDisplay(part[1]);
 if((part=s.match(/^analysis (MISSY independent raw-channel Cq\/Tm v1\.0)$/)))return '分析 '+zhPhrase(part[1]);
 let out=zhPhrase(s);if(out!==s)return out;
 let m;if((m=s.match(/^(.+) (\(\d{4}-\d{2}-\d{2} .+\))$/)))return reportDisplay(m[1])+' '+m[2];
 if((m=s.match(/^(.+) — SOP outcome$/)))return m[1]+'－SOP 判定';
 if((m=s.match(/^(File|Source SHA-256|Acquisition SHA-256|Protocol SHA-256|Endpoint N|Source|Protocol fingerprint)(: .+)$/)))return zhPhrase(m[1])+': '+reportDisplay(m[2].slice(2));
 if((m=s.match(/^(\d+)\.\s+(.+?)(\s+\[[^\]]+\])$/)))return m[1]+'. '+reportDisplay(m[2])+m[3];
 if((m=s.match(/^(\d+) rows in total; the first (\d+) are shown\. The archive carries all of them\.$/)))return `共 ${m[1]} 行；显示前 ${m[2]} 行，压缩包保留全部数据。`;
 if((m=s.match(/^(\d+) rows?\.$/)))return m[1]+' 行。';
 if((m=s.match(/^Standard figures: (.+)$/)))return '标准图：'+m[1];
 if((m=s.match(/^(.+) \(continued\)$/)))return reportDisplay(m[1])+'（续）';
 return s;
}