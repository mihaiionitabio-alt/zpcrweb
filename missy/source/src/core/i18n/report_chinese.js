function pdfUnicodeNeeded(s){return UI_LANG==='zh'||/[^\u0000-\u00ff\u2010-\u2027]/.test(String(s));}
function pdfUnicodeHex(s){let hex='';for(let i=0;i<String(s).length;i++)hex+=String(s).charCodeAt(i).toString(16).padStart(4,'0');return hex;}
function pdfUnicodeWidth(s,size){let n=0;for(const ch of String(s))n+=MISSY_PDF_FONT.widths[ch.codePointAt(0)]??1000;return n*size/1000;}
function pdfFontBytes(s){return Uint8Array.from(atob(s),c=>c.charCodeAt(0));}
let PDF_UNICODE_OBJECTS=null;
function pdfUnicodeObjects(){if(PDF_UNICODE_OBJECTS)return PDF_UNICODE_OBJECTS;const f=MISSY_PDF_FONT,font=pdfFontBytes(f.compressedFont),map=pdfFontBytes(f.compressedMap),cmap=new TextEncoder().encode('/CIDInit /ProcSet findresource begin\n12 dict begin\nbegincmap\n/CIDSystemInfo << /Registry (Adobe) /Ordering (UCS) /Supplement 0 >> def\n/CMapName /MISSY-Unicode def\n/CMapType 2 def\n1 begincodespacerange\n<0000> <FFFF>\nendcodespacerange\n1 beginbfrange\n<0000> <FFFF> <0000>\nendbfrange\nendcmap\nCMapName currentdict /CMap defineresource pop\nend end');
return PDF_UNICODE_OBJECTS=[
'<< /Type /Font /Subtype /Type0 /BaseFont /MISSYPDFSans /Encoding /Identity-H /DescendantFonts [6 0 R] /ToUnicode 10 0 R >>',
'<< /Type /Font /Subtype /CIDFontType2 /BaseFont /MISSYPDFSans /CIDSystemInfo << /Registry (Adobe) /Ordering (Identity) /Supplement 0 >> /FontDescriptor 7 0 R /DW 1000 /W [0 ['+f.widths.join(' ')+']] /CIDToGIDMap 9 0 R >>',
'<< /Type /FontDescriptor /FontName /MISSYPDFSans /Flags 4 /FontBBox [-1000 -1100 3000 2000] /ItalicAngle 0 /Ascent '+f.ascent+' /Descent '+f.descent+' /CapHeight 733 /StemV 80 /FontFile2 8 0 R >>',
{dict:'<< /Length '+font.length+' /Length1 '+f.fontBytes+' /Filter /FlateDecode >>',stream:font},
{dict:'<< /Length '+map.length+' /Filter /FlateDecode >>',stream:map},
{dict:'<< /Length '+cmap.length+' >>',stream:cmap}];}
const REPORT_LITERAL_COLUMNS=new Set(['filename','file','source','source_file','source_filename','sha256','source_sha256','sourceSHA256','checksum','protocol_sha256','acquisition_sha256','analysis','analysis_name','sample','sample_name','sampleId','target','target_name','gene','dye','channel','instrument','instrument_sn','instrument_id','serial','serial_number','SN','well','position','date','time','experiment','run','run_name','profile','profile_name','command','script','read_from','protocol','format']);
function reportTableValue(column,value){const s=String(value??'');return (REPORT_LITERAL_COLUMNS.has(String(column))||REPORT_LITERAL_COLUMNS.has(String(column).toLowerCase()))||/(?:sha256|checksum|filename|sample.?name|serial.?number|protocol.?hash)/i.test(column)?s:reportDisplay(s);}
function reportDisplay(value){const s=String(value??'');if(UI_LANG!=='zh')return s;
 const trimmed=s.trim();if(trimmed&&trimmed!==s)return s.replace(trimmed,reportDisplay(trimmed));
 if(s.includes('\n'))return s.split('\n').map(reportDisplay).join('\n');
 const match=s.match(/^(\s*(?:[•-]|\d+\.)\s+)([\s\S]*)$/);if(match)return match[1]+reportDisplay(match[2]);
 let suffix=s.match(/^(.+?)(\s+\[[^\]]+\])$/);if(suffix)return reportDisplay(suffix[1])+suffix[2];
 let out=zhPhrase(s);if(out!==s)return out;
 if(s.includes(' | '))return s.split(' | ').map(x=>zhPhrase(x)).join(' | ');
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
function reportSvg(svg){if(UI_LANG!=='zh')return svg;const identities=new Set();for(const r of RUNS){for(const x of [r.file,r.meta?.sourceSHA256,r.meta?.InstrumentID,r.meta?.SerialNumber,r.meta?.name])if(x)identities.add(String(x));for(const w of [...(r.wells||[]),...(r.pcrd?.layout||[]),...(r.zpcr?.layout||[])])for(const k of ['sample','target','well'])if(w[k])identities.add(String(w[k]));}const xml=new DOMParser().parseFromString(svg,'image/svg+xml');for(const el of xml.querySelectorAll('text,tspan,title,desc')){if(el.children.length||el.closest('[data-i18n-skip]')||identities.has(el.textContent.trim()))continue;el.textContent=reportDisplay(el.textContent);}return new XMLSerializer().serializeToString(xml.documentElement);}
Object.assign(ZH_TERMS,{
'Selected results':'所选结果','Profile checksum':'规程校验值','Built':'生成时间','Figure coverage':'图表覆盖范围','Table coverage':'表格覆盖范围','Items selected':'已选项目','Contents':'目录','No rows.':'无数据行。','Numbers behind this figure':'本图数据',
'All loaded runs; separate figures for each compatible run':'所有已加载运行；各兼容运行分别绘图','All loaded data; analytical tables respect sample exclusions. Raw and hardware evidence retain their original scope.':'涵盖所有已加载数据。分析表按样本排除选择统计；原始数据与硬件证据保留原始范围。',
'Stored vendor results are kept unchanged. Statistics and diagnostic plots are independently derived by MISSY and are descriptive. Research Use Only. Not validated for clinical or instrument qualification decisions. This report does not replace the vendor QC report or validated laboratory procedures.':'保留仪器软件保存的原始结果。统计与诊断图由 MISSY 独立计算，仅作描述性分析。仅供研究使用，未经临床或仪器资格确认用途验证。本报告不能替代厂商质控报告或经验证的实验室规程。',
'Full source inventory for every loaded format.':'所有已加载文件的完整来源清单。','File':'文件','Source SHA-256':'源 SHA-256','Acquisition SHA-256':'采集数据 SHA-256','Protocol SHA-256':'实验程序 SHA-256','Endpoint N':'终点窗口 N',
'filename':'文件名','sha256':'SHA-256','bytes':'字节数','format':'格式','target':'靶标','sample':'样本','well':'孔位','role':'角色','cq':'Cq','value':'数值','mean':'均值','sd':'标准差','median':'中位数','min':'最小值','max':'最大值','n':'数量','count':'数量','range':'极差','protocol':'实验程序','analysis':'分析','channel':'通道','experiment':'实验','run':'运行','date':'日期','time':'时间',
'Research Use Only.':'仅供研究使用。','Not validated for clinical or instrument qualification decisions.':'未经临床或仪器资格确认用途验证。','Does not replace vendor QC certification or laboratory validation.':'不能替代厂商质控认证或实验室方法验证。','No vendor acceptance limits.':'无厂商验收限值。'
});
Object.assign(ZH_TERMS,{
'Preferred modular source (GitHub; internet needed)':'模块化源代码（GitHub；需要网络）','Forget PCRD password':'清除 PCRD 密码','Download HTML source':'下载 HTML 源代码','GNU GPL version 3 — English original':'GNU GPL 第三版－英文原文',
'file':'文件','acquisition_group':'采集组','source_sha256':'源 SHA-256','source_bytes':'源字节数','protocol_sha256':'实验程序 SHA-256','acquisition_sha256':'采集数据 SHA-256'
});
Object.assign(ZH_TERMS,{
'Overall coverage - all loaded runs':'总体覆盖情况－所有已加载运行','Overall Cq statistics - separated compatible cohorts':'总体 Cq 统计－兼容分组分别统计','All loaded source files and checksums':'所有已加载源文件及校验和',
'Descriptive counts across all loaded run records (analysis views may share a source). Analytical results respect sample selection. Stored and independently calculated Cq are counted separately. Raw-only files have no stored analytical calls. No grand Cq mean is calculated across different targets, protocols, channels, roles or instruments.':'对所有已加载运行作描述性计数，多个分析视图可能来自同一文件。按样本选择统计分析结果；保存的 Cq 与独立计算的 Cq 分开计数。仅含原始数据的文件无保存判定。不同靶标、程序、通道、角色或仪器之间不计算合并 Cq 均值。',
'Per-result descriptive statistics, separated by source format, instrument identity, decoded protocol fingerprint, target, channel, result basis and role. Sample sizes can differ between runs. A shared label/fingerprint does not verify assay equivalence. SD requires at least two values. Missing instrument/protocol identity or an unnamed PCRD target isolates the source instead of pooling it. PCRD acquisition groups and stored targets remain separate; a dye is not a target identity.':'按格式、仪器身份、实验程序指纹、靶标、通道、结果来源和角色分别作描述性统计。各运行样本量可不同；标签或指纹相同不证明检测等效。标准差至少需要两个值。仪器／程序身份缺失或 PCRD 靶标未命名时按源文件隔离，不合并。PCRD 采集组与保存靶标分别统计，染料不等于靶标身份。',
'All selected valid Cq results in this cohort are plotted. Small dots: wells; large dots: per-run/role median. Horizontal jitter only separates overlapping dots. Roles remain separate. No control limits or vendor acceptance are inferred. Biological sample composition can differ; this is descriptive comparison, not proof of QC drift.':'绘制本分组所选有效 Cq。小点为孔，大点为各运行／角色中位数；水平偏移仅用于分开重叠点。角色保持分离，不推定控制限或厂商验收结果。样本组成可不同；本图仅作描述性比较，不能证明质控漂移。',
'Protocol fingerprint':'实验程序指纹','Source':'来源','basis':'结果来源','cohort':'分组','instrument_id':'仪器标识','instrument_sn':'仪器序列号','protocol_id':'实验程序标识','run_count':'运行数','selected_results':'所选结果数','valid_cq':'有效 Cq 数','excluded':'已排除','outcome':'结果判定','status':'状态','end_fluorescence':'终点荧光','background':'背景','amplitude':'幅度','reader':'读取格式','source_files':'源文件数','stored_results':'保存结果数','stored_valid_cq':'保存的有效 Cq 数','without_cq':'无有效 Cq 数','independent_cq':'独立计算 Cq 数',
'Named, no result':'已命名，无结果','In analysis':'已纳入分析','Not analysed':'未分析','Excluded':'已排除','Omitted':'已忽略','No result':'无结果','Empty':'空孔','Unknown':'未知样本'
});
MISSY_HOOKS.use('i18n.phrase','i18n/report-counts',115,next=>function(value){const s=String(value??'');let m;if((m=s.match(/^Totals: (\d+) run records; (\d+) source files; (\d+) selected stored result records; (\d+) valid stored Cq; (\d+) stored records without valid Cq; (\d+) excluded records; (\d+) independently calculated Cq\.$/)))return `合计：${m[1]} 条运行记录；${m[2]} 个源文件；${m[3]} 条所选保存结果；${m[4]} 个有效保存 Cq；${m[5]} 条无有效 Cq 的保存结果；${m[6]} 条已排除记录；${m[7]} 个独立计算 Cq。`;if((m=s.match(/^(channel|analysis) (.+)$/)))return (m[1]==='channel'?'通道 ':'分析 ')+m[2];return next(value);});
Object.assign(ZH_TERMS,{
'ZPCR source files and hardware-method provenance':'ZPCR 源文件与硬件方法追溯','PCRD source files and verification':'PCRD 源文件与验证','CFX RDML source files, original PCRD checksums and processing':'CFX RDML 源文件、原始 PCRD 校验值及处理记录',
'Stored PCRD acquisition values; no vendor Cq/Tm calls or qualification verdict. Missing tuple fields remain unavailable. Sample assignments are stored plate metadata. Calibration presence does not establish validity. Research Use Only; cannot replace vendor QC.':'PCRD 保存的采集值，不含厂商 Cq／Tm 判定或资格确认结论。缺失字段保持不可用；样本分配来自保存的板设置。存在校准记录不证明校准有效。仅供研究使用，不能替代厂商质控。',
'Vendor-processed CFX RDML; not raw detector counts.':'CFX RDML 为厂商软件处理后的数据，不是原始探测器计数。','SN / geometry / dye / protocol / analysis view kept separate.':'序列号、板规格、染料、实验程序与分析视图分别保留。','No vendor acceptance limits inferred; no raw hardware diagnostics in RDML.':'不推定厂商验收限值；RDML 不含原始硬件诊断。','Curve colours identify plate rows; individual wells appear on hover.':'曲线颜色区分微孔板行；悬停可查看单孔。','Export-only aliases identify blank or role-conflicting sample IDs; biological identities are not inferred.':'仅导出用别名标记空白或角色冲突的样本标识，不推断生物学身份。','REVIEW: original PCRD provenance manifest unavailable':'待审核：缺少原始 PCRD 来源清单','Not supplied':'未提供',
'Research Use Only. Independent visualization of a current vendor-software export; does not replace the original vendor qualification report or establish instrument conformity. Original PCRD files unchanged. Quantitation and melt curves exported; derived gene-expression views omitted.':'仅供研究使用。独立显示当前厂商软件导出的数据，不能替代原始厂商资格确认报告，也不能证明仪器符合性。原始 PCRD 文件不变。包含导出的定量与熔解曲线，不含派生基因表达视图。',
'Raw acquisition data; no vendor Cq/Tm calls.':'原始采集数据，不含厂商 Cq／Tm 判定。','Plate names, roles and targets need verified layout provenance.':'板名称、角色和靶标需经核实的板设置来源。','Maestro applies a matching plate file during ZPCR conversion.':'Maestro 转换 ZPCR 时应用匹配的板文件。','Maestro RDML exports include selected baseline processing.':'Maestro 的 RDML 导出包含所选基线处理。','Read steps stay separate; raw channels are not dye identities.':'各读板步骤保持分离；原始通道不代表染料身份。','Cycles 2–6 / 2–10 are descriptive windows, not Maestro baselines.':'循环 2–6／2–10 仅作描述性窗口，不是 Maestro 基线。','Endpoint: last N reads in source order; no smoothing or correction.':'终点窗口为源顺序的最后 N 个读数，不作平滑或校正。','65,000 RFU is a threshold-setting bound, not detector saturation.':'65,000 RFU 是阈值设置边界，不代表探测器饱和。','Recovered exports may duplicate an acquisition; copies count once.':'恢复的导出可能重复同一采集；重复副本仅计一次。','Log/calibration interpretation unavailable without verified decoding.':'未经验证解码，不解释日志或校准记录。','Research Use Only; not validated; does not replace vendor QC.':'仅供研究使用；未经验证；不能替代厂商质控。','Labels describe observed block temperatures, not a verified protocol phase.':'标签描述观察到的模块温度，不代表经核实的程序阶段。','Per-well diagnostics: A1. • No control limits.':'单孔诊断：A1。无控制限。','One completed acquisition contribution':'一项完整采集贡献','Duplicate acquisitions: retained as source evidence, excluded from independent baseline':'重复采集保留为来源证据，不纳入独立基线',
'Container last saved (ZIP entry dates)':'文件容器最后保存时间（ZIP 条目日期）','ZIP central directory — oldest entry':'ZIP 中央目录－最早条目','ZIP central directory — newest entry':'ZIP 中央目录－最新条目',
'selected':'已选结果','stored_Cq':'保存 Cq','no_Cq':'无有效 Cq','indep_Cq':'独立 Cq','raw_reads':'原始读数','source_file':'源文件','samples':'样本数','wells':'孔数','dye':'染料','geometry':'板规格','reader_id':'读取格式','bytes':'字节数','complete':'完整','duplicate':'重复','eligible':'可纳入','reason':'原因','channels':'通道','reads':'读数','start':'开始','end':'结束','acquisition_group':'采集组'
});
MISSY_HOOKS.use('i18n.phrase','i18n/report-evidence',116,next=>function(value){const s=String(value??'');let m;
if((m=s.match(/^Acquisition group (\d+); protocols and geometry kept separate\. Endpoint N=(\d+)$/)))return `采集组 ${m[1]}；实验程序与板规格保持分离。终点窗口 N=${m[2]}`;
if((m=s.match(/^Acquisition group (\d+) is a stored file ID, not a cycle number\.$/)))return `采集组 ${m[1]} 是文件保存编号，不是循环数。`;
if((m=s.match(/^Endpoint N=(\d+) uses the last N exported amplification reads; not a CFX endpoint algorithm\.$/)))return `终点窗口 N=${m[1]} 使用最后 N 个导出的扩增读数，不是 CFX 终点算法。`;
if((m=s.match(/^(RDML SHA-256|PCRD SHA-256|PCRD): (.+)$/)))return m[1]+': '+(m[2]==='Not supplied'?'未提供':m[2]);
if((m=s.match(/^Unverified protocol; source (.+)$/)))return '未经核实的实验程序；来源 '+m[1];
if((m=s.match(/^group (\d+)$/)))return '采集组 '+m[1];
return next(value);});

Object.assign(ZH_TERMS,{'Embedded Chinese font — SIL OFL 1.1':'内嵌中文字体－SIL OFL 1.1'});
Object.assign(ZH_TERMS,{
'Completion supported; QC acceptance REVIEW':'有运行完成证据；质控验收仍待审核','REVIEW: encrypted payload; source inventory only':'待审核：载荷已加密，仅有源文件清单','Unavailable: encrypted':'不可用：已加密','R1: normal completion supported by log and acquisition counts':'R1：日志与采集数量支持正常完成','Range includes BLOCKTEMP=0 sentinels; stored values shown without correction.':'范围包含 BLOCKTEMP=0 哨兵值；显示保存值，不作校正。','Range includes R1/R2; dashes and translucency separate runs.':'范围包含 R1／R2；虚线与透明度用于区分运行。',
'Instrument log start':'仪器日志开始','Instrument log end':'仪器日志结束','Calibration performed':'已执行校准','Calibration expires':'校准到期','Blank, no result':'空白，无结果','physical_wells':'物理孔数','stored_channels':'保存通道数','tuple_width':'元组宽度','endpoint_n':'终点窗口 N','stored_endpoint':'保存的终点值'
});
MISSY_HOOKS.use('i18n.phrase','i18n/report-timeline',117,next=>function(value){const s=String(value??'');let m;if((m=s.match(/^(Calibration performed|Calibration expires)( — .+)$/)))return zhPhrase(m[1])+m[2];return next(value);});
Object.assign(ZH_TERMS,{
'Processed amplification curves':'处理后的扩增曲线','Exported cycle number':'导出的循环数','Exported fluorescence':'导出的荧光','Stored channels are not dye identities; a spatial mean includes all physical wells.':'保存通道不代表染料身份；空间均值包含全部物理孔。','Oldest ZIP entry date':'最早 ZIP 条目日期','instrument':'仪器','declared_file':'声明的文件名','identifier':'标识符','completion':'完成状态','baseline_contribution':'基线贡献','Supported by evidence':'有证据支持','Included once':'仅纳入一次','Excluded duplicate':'排除重复副本'
});
MISSY_HOOKS.use('i18n.phrase','i18n/report-geometry',118,next=>function(value){const s=String(value??'');let m;if((m=s.match(/^Decoded plate layout: (\d+) wells; (\d+) rows x (\d+) columns\.$/)))return `解码的板规格：${m[1]} 孔，${m[2]} 行 × ${m[3]} 列。`;if((m=s.match(/^Plate row ([A-P])$/)))return '板行 '+m[1];return next(value);});
