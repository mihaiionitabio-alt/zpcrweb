/* Terminology reviewed in Roche PRO Chinese manuals: ch_1 pp. 81-85,
 * 138-140, 154-155, 208-212, 219-220, 368-370; ch_2 pp. 109-111,
 * 215-223, 228-231; ch_3_qc pp. 11-12, 16, 19.
 * Display wording only. No PRO algorithms, limits, flags or workflow rules
 * are transferred to other instruments. Stored method names remain intact.
 */
const ZH_MANUAL_TERMS={
 'Sample':'样本','Sample name':'样本名称','Sample ID':'样本 ID','Sample role':'样本角色','Sample roles':'样本角色',
 'All samples':'全部样本','Choose samples for analysis':'选择用于分析的样本','Edit sample selection':'编辑样本选择','Choose individual samples / wells':'选择单个样本／孔位',
 'Apply sample selection and analyse':'应用样本选择并分析','Apply selection and analyse':'应用选择并分析','Download sample selection CSV':'下载样本选择 CSV',
 'Well position':'孔位置','Well':'孔位','Wells':'孔位','Plate setup':'微孔板设置','Plate map':'微孔板布局','Plate heat map':'微孔板热图','Plate ID':'微孔板 ID',
 'Target':'靶标','Target name':'靶标名称','Target / dye / filter':'靶标／染料／滤光片','Target results':'靶标结果',
 'Quantitation standard':'定量标准品','Quantification standard':'定量标准品','Run calibrator':'运行校准品','Melting standard':'解链标准品',
 'No template control':'无模板质控（NTC）','No-template control':'无模板质控（NTC）','Positive template control':'阳性模板质控（PTC）','Negative process control':'阴性过程质控（NPC）','Positive process control':'阳性过程质控（PPC）',
 'Internal control':'内部质控（IC）','Endogenous control':'内源参照（内参）','Reference gene':'参照基因（内参基因）',
 'Quantification cycle':'定量循环（Cq）','Cq calling':'Cq 判定方法','Cq calling method':'Cq 判定方法','Cq threshold':'Cq 阈值','Crossing point':'交叉点（Cp）',
 'Absolute quantification':'绝对定量','Relative quantification':'相对定量','Qualitative analysis':'定性分析','Genotyping':'基因分型','Endpoint genotyping':'终点法基因分型',
 'Amplification curves':'扩增曲线','Amplification curve':'扩增曲线','Fluorescence history':'荧光历史记录','Fluorescence':'荧光','Fluorescence intensity':'荧光强度',
 'Raw fluorescence':'原始荧光','Raw instrument units':'仪器原始单位','Background fluorescence':'背景荧光','Endpoint fluorescence':'终点荧光','End-point fluorescence':'终点荧光',
 'Baseline':'基线','Baseline subtracted':'基线扣除','Baseline divided':'基线相除归一化','Baseline subtraction':'基线扣除','Normalization':'归一化',
 'Threshold':'阈值','Slope':'斜率','Standard curve':'标准曲线','Standard curves':'标准曲线','Efficiency':'扩增效率','Residuals':'残差','Concentration':'浓度',
 'Melting curves':'熔解曲线（解链曲线）','Melting curve':'熔解曲线（解链曲线）','Melting peaks':'熔解峰（解链峰）','Melting peak':'熔解峰（解链峰）','Melting temperature':'解链温度（Tm）',
 'Normalized melting curves':'归一化熔解曲线','Normalized melting peaks':'归一化熔解峰','High resolution melting':'高分辨率熔解（HRM）','High-resolution melting':'高分辨率熔解（HRM）','Difference plots':'差异图',
 'Colour compensation':'颜色补偿','Color compensation':'颜色补偿','Detection format':'检测格式','Fluorescence channel':'荧光通道','Fluorescence channels':'荧光通道',
 'Acquisition':'数据采集','Acquisition group':'采集组','Read order within step':'当前采集组内的读数顺序','Read number within this acquisition group':'当前采集组内的读数编号',
 'Cycle':'循环','Cycles':'循环数','Cq (cycles)':'Cq（循环数）','Temperature (°C)':'温度（°C）','Temperature [°C]':'温度（°C）','Block temperature':'模块温度','Heated cover':'热盖',
 'Run profile':'运行配置文件','Thermal program':'热循环程序','Protocol':'实验程序','Protocol fingerprint':'实验程序指纹','Analysis settings':'分析设置','Analysis package':'分析包',
 'Initial result':'初始结果','Final result':'最终结果','Result status':'结果状态','Flags':'标记','Flag codes':'标记代码','Result review':'结果审核','Quality review':'质量审核',
 'Quality control':'质量控制','QC results':'质控结果','Acceptance limits':'验收限值','Control limits':'统计控制限','Lower control limit':'控制下限','Upper control limit':'控制上限',
 'Replicates':'重复孔','Replicate groups':'重复孔组','Replicate spread':'重复孔离散度','Standard deviation':'标准差','Median':'中位数','Mean':'均值','Range':'范围','Outliers':'异常值',
 'Stored vendor Cq':'仪器软件保存的 Cq','Independently calculated PCRD Cq':'独立计算的 PCRD Cq','Independently calculated':'独立计算值','Not recorded':'未记录','Not available':'不可用',
 'Overall summary and comparisons':'总体统计与跨运行比较','Overall coverage - all loaded runs':'总体覆盖情况－所有已加载运行','Overall Cq statistics - separated compatible cohorts':'总体 Cq 统计－兼容分组分别统计',
 'Preview graph':'预览图表','Browse graphs':'浏览图表','Measurement':'测量项目','Endpoint N':'终点窗口 N','Apply N':'应用 N','Run commands':'运行命令','Build':'生成',
 'Previous graph':'上一张图','Next graph':'下一张图','Close graph':'关闭图表','Next run':'下一次运行','Hide header / controls':'隐藏标题和控件','Show header / controls':'显示标题和控件',
 'Overview + comparisons':'总体统计与跨运行比较','Research Use Only':'仅供研究使用','Full acquisition records (CSV)':'完整采集记录（CSV）',
 'Loaded run; full filenames in the source manifest':'已加载运行；完整文件名见源文件清单',
 'Raw channels compared. No control limits or single-point control charts.':'比较原始通道；不设置统计控制限，不生成单点控制图。',
 'Stored vendor results are kept unchanged. Statistics and diagnostic plots are independently derived by MISSY and are descriptive. Research Use Only. Not validated for clinical or instrument qualification decisions. This report does not replace the vendor QC report or validated laboratory procedures.':'仪器软件保存的结果保持不变。统计和诊断图由 MISSY 独立生成，仅作描述性分析。仅供研究使用；未经临床或仪器性能确认用途验证，不能替代厂商质控报告或经验证的实验室规程。'
};
Object.assign(ZH_TERMS,ZH_MANUAL_TERMS);
for(const key of Object.keys(ZH_TERMS))ZH_TERMS[key]=ZH_TERMS[key].replaceAll('样品','样本');
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
MISSY_HOOKS.use('i18n.phrase','i18n/manual-reviewed-zh',100,next=>function(value){const translated=zhManualContext(value);return translated===null?next(value):translated;});
/* Interface labels accompanying the reviewed scientific terminology. */
Object.assign(ZH_TERMS,{
 'Laboratory':'实验室','laboratory name':'实验室名称','Analysis by':'分析人员','who is doing the analysis':'分析人员姓名','Report title':'报告标题','left empty, the page names it':'留空则自动生成标题',
 'Run for run-level figures':'单次运行图的运行选择','What to produce':'生成内容','A PDF report':'PDF 报告','An archive of the files':'文件压缩包','Both':'两者均生成',
 'Download the selection as CSV':'下载所选项目 CSV','Open grouped problem overview':'打开分类问题概览','Load a selection CSV':'加载选择 CSV','Tables':'表格','all':'全选',
 'Assisted mode — choose what goes into the report':'辅助模式－选择报告内容','Assisted mode':'辅助模式','Command mode':'命令模式','Console mode':'控制台模式','File integrity':'文件完整性','8 · File integrity':'8 · 文件完整性',
 'Script':'脚本','Report script':'报告脚本','Run':'运行','Clear':'清空','Ready':'就绪','Save status report':'保存状态报告','Details':'详细信息',
 'Zoom out':'缩小','Zoom in':'放大','Pan left':'向左平移','Pan right':'向右平移','Pan up':'向上平移','Pan down':'向下平移','Light theme':'浅色主题','Dark theme':'深色主题','Return to the page':'返回页面',
 'Paste a procedure, one command per line. Lines starting with # are notes.':'粘贴脚本，每行一条命令；以 # 开头的行为注释。',
 'Command mode. Type help for the list of commands.':'命令模式。输入 help 查看命令列表。','A procedure can be pasted as a script: press Script, paste, then Run.':'点击“脚本”，粘贴命令后点击“运行”。脚本命令保持英文。',
 'Stored Cq values':'保存的 Cq 值','Experiment settings':'实验设置','Runs and quality control':'运行与质量控制','Forensic findings':'取证发现','Control chart points':'控制图数据点','Profile answers':'规程判定结果','Experiment metadata':'实验元数据',
 'Rising curves without a channel result':'没有通道结果的上升曲线','SOP criteria':'SOP 判定标准','SOP run decisions':'SOP 运行判定',
 'One row per stored result with well, sample, target, role and call.':'每条保存结果一行，包含孔位、样本、靶标、角色和判定。','Every setting read out of the container, with the property it came from.':'文件容器中的全部已读取设置及其来源属性。',
 'The plate as the file describes it: position, sample, target and role.':'按文件记录呈现微孔板：孔位置、样本、靶标和角色。','Per target and group: counts, mean Cq, spread and detection.':'按靶标和分组统计数量、Cq 均值、离散度及检出情况。',
 'One row per run with its profile answer and the reason behind it.':'每次运行一行，包含规程判定及其依据。','Every finding with its area, severity and the evidence behind it.':'逐条列出问题领域、严重程度及证据。',
 'The plotted points of the control series with their limits.':'控制序列的绘图数据点及其控制限。','The fluorescence of every well, one row per cycle.':'各孔的荧光数据，每个循环一行。',
 'What the laboratory profile concluded for every sample.':'实验室规程对各样本的判定。','Metadata fields read from every loaded experiment.':'从每个已加载实验中读取的元数据。','Paired sample comparison rows for the first two loaded runs.':'前两次已加载运行的配对样本比较数据。',
 'Curve events retained for review when the same channel has no stored result.':'同一通道没有保存结果时，保留曲线事件供审核。','One row per evaluated profile criterion.':'每条已评估规程标准一行。','One row per run with profile status and counts.':'每次运行一行，包含规程状态和计数。',
 'Descriptive control overview. Solid band: configured SOP range. No pooled statistical limits; use extraction-batch charts for comparable groups.':'描述性质控概览。实色区域表示已配置的 SOP 范围，不计算混合统计控制限；可比较分组请查看提取批次图。',
 'Overall summary and compatible cross-run comparisons added to report selection.':'已将总体统计及兼容分组的跨运行比较加入报告选择。',
 'the laboratory name for the report and the profile':'报告和规程所用的实验室名称','the report title':'报告标题','build the report and download it':'生成并下载报告','build the archive and download it':'生成并下载压缩包','download the selection as a CSV':'将选择下载为 CSV',
 'add overall counts, separated cohort statistics and cross-run comparisons':'加入总体计数、分组统计和跨运行比较','the loaded runs and their numbers':'已加载运行及其编号','leave command mode':'退出命令模式','what is selected now':'当前所选项目','empty the selection':'清空选择',
 'all loaded runs':'所有已加载运行'
});
/* Skip identity-bearing data cells: translating a sample named "Standard"
 * must not turn that sample name into the role label 标准品. */
function zhProtectSourceText(root){
 const headings=new Set(['Sample','Sample name','Sample ID','sample','sample_name','sampleId','Target','Target name','target','File','Filename','filename','file','Experiment','experiment','Well','Wells','well','Date','date','SN','SHA-256','sha256','source_sha256','Run','Name','Channel','Instrument','Instrument SN','Serial number','SerialNumber','InstrumentID','Protocol','Analysis']);
 const tables=[...(root?.matches?.('table')?[root]:[]),...(root?.querySelectorAll?.('table')||[])];
 for(const table of tables){const header=table.querySelector('thead tr')||table.querySelector('tr:has(th)');if(!header)continue;const cells=[...header.children],indexes=cells.map((cell,i)=>{let original='';const walker=document.createTreeWalker(cell,NodeFilter.SHOW_TEXT);let n;while((n=walker.nextNode()))original+=I18N_ORIGINAL_TEXT.get(n)??n.nodeValue;return headings.has(original.trim())?i:-1;}).filter(i=>i>=0);if(!indexes.length)continue;for(const row of table.querySelectorAll('tr')){if(row===header)continue;for(const i of indexes){const td=row.children[i];if(td?.tagName==='TD'&&!td.hasAttribute('colspan'))td.setAttribute('data-i18n-skip','');}}}
}
/* Bio-Rad CFX Opus Dx manual 10000134783 (May 2022, software 2.3):
 * printed pp. 22-23, 52, 67, 77-78, 84-93, 107-109, 139.
 * Hardware/protocol vocabulary only, not CFX Maestro result algorithms.
 * Handbook terminology: sections 1.4, 1.7, 1.9, 4.3, 5.2.
 */
Object.assign(ZH_TERMS,{
 'Ramp rate':'升降温速率','Heating rate':'升温速率','Cooling rate':'降温速率','Temperature gradient':'温度梯度','Hold time':'保持时间','Target temperature':'目标温度','Temperature increment':'温度增量',
 'Read plate':'读板','Plate read':'读板','Plate reads':'读板次数','Sample volume':'样本体积','Lid temperature':'热盖温度','Heated lid':'热盖','Sample temperature':'样本温度','Block mode':'模块模式','Calculated mode':'计算模式','Scan mode':'扫描模式','Run status':'运行状态','System logs':'系统日志','Data file':'数据文件',
 'Raw fluorescence · A1':'原始荧光 · A1','Optical reference row':'光学参考行','Stored dark mean':'保存的暗信号均值','Stored dark SD':'保存的暗信号标准差','Stored dark max minus min':'保存的暗信号极差',
 'LED DAC setting':'LED DAC 设置值','Configuration setting; not measured mA':'配置设置值；不是实测毫安值','Raw detector counts':'原始探测器计数','Dark change from first read':'相对首个读数的暗信号变化','Reference change from first read':'相对首个读数的参考信号变化',
 'Temperature fields at reads':'读板时保存的温度字段','Stored temperature fields':'保存的温度字段','Sample field':'样本温度字段','Lid':'热盖','Block':'模块','Ambient':'环境','Shuttle':'移动机构',
 'Read intervals':'读板时间间隔','Ordered block-temperature increments':'按读板顺序的模块温度变化量','Reference versus stored factory value':'参考值与保存的出厂值比较',
 'Raw counts; not temporal detector-noise SD':'原始计数；不是时间序列探测器噪声标准差','Raw counts; maxima depend on read count':'原始计数；最大值受读数数量影响','Seconds; timestamp resolution 1 s':'秒；时间戳分辨率为 1 秒',
 'Raw optical-channel legend (not dye identities)':'原始光学通道图例（不代表染料身份）','Temperature-field legend':'温度字段图例','Run legend':'运行图例',
 'Processed amplification':'处理后的扩增曲线','Vendor Cq by well':'按孔显示的仪器软件 Cq','Vendor Cq plate heat map':'仪器软件 Cq 微孔板热图','Exported melt signal':'导出的熔解信号',
 'Passive reference dye':'被动参比染料','Reporter dye':'报告染料','Normalized reporter signal (Rn)':'归一化报告荧光信号（Rn）','Baseline-corrected normalized reporter signal (ΔRn)':'基线校正后的归一化报告荧光信号（ΔRn）',
 'PCR efficiency':'PCR 扩增效率','Amplification efficiency':'扩增效率','Coefficient of determination (R²)':'决定系数（R²）','Repeatability':'重复性','Precision':'精密度','Accuracy':'准确度',
 'Internal-control/reference Cq per sample':'各样本内部质控／参照靶标 Cq','End-point fluorescence versus stored Cq':'终点荧光与保存的 Cq 比较',
 'Cq for targets marked as internal control or reference in the SOP. Lines show each target median and the configured maximum positive Cq shift. An elevated Cq is a review flag, not proof of inhibition: input amount, reference stability and assay effects require separate evaluation.':'显示 SOP 中标记为内部质控或参照的靶标 Cq。线条表示各靶标中位数及配置的最大正向 Cq 偏移。Cq 升高是审核提示，不能单凭此图判定抑制；需另行评估输入量、参照稳定性和检测影响。',
 'End-point fluorescence, or amplitude above background, plotted against stored Cq. Late or low-plateau signals are shown for review; this plot alone does not establish amplification specificity. Wells without a valid stored Cq are shown at the right edge.':'将终点荧光或高于背景的幅度与保存的 Cq 对照显示。晚期或低平台信号用于审核，不能仅凭此图确认扩增特异性。没有有效保存 Cq 的孔显示于右侧边缘。'
});
Object.assign(ZH_TERMS,{
 'Nearly constant block temperature':'模块温度近似恒定','Observed heating':'观察到的升温过程','Observed cooling':'观察到的降温过程','Changing block temperature':'模块温度变化','Block-temperature pattern unavailable':'模块温度变化模式不可用',
 'Stored read order within acquisition group':'采集组内保存的读板顺序','°C; sample-temperature field may be a setpoint':'°C；样本温度字段可能为设定值','°C; inferred field meanings / ambient caveats':'°C；字段含义为推断，环境温度需审慎解释',
 'R1: solid / opaque · zero values do not prove inactivity':'R1：实线／不透明；零值不能证明通道未工作','R1: solid / opaque · R2: dashed / translucent · zero values do not prove inactivity':'R1：实线／不透明；R2：虚线／半透明；零值不能证明通道未工作',
 'R1: solid / opaque':'R1：实线／不透明','R1: solid / opaque · R2: dashed / translucent':'R1：实线／不透明；R2：虚线／半透明'
});
/* LC480-specific primary references supplied later in the review:
 * LC480 operating manual software 1.0 (Traditional Chinese), PDF pp. 145-148,
 * 152-154, 167; LC480 II brochure/workflow PDF W020190620571713272282,
 * PDF pp. 13, 15, 18-20; LC480 quick guide V2.0, PDF pp. 11-15.
 * Historical terminology, not a verified acceptance profile/version match.
 */
Object.assign(ZH_TERMS,{
 'Crossing point (Cp)':'交叉点（Cp）','Stored crossing point':'保存的交叉点（Cp）','Second derivative maximum':'最大二阶导数法','Maximum second derivative':'最大二阶导数法','Fit points method':'点拟合法',
 'Filter combination':'滤光片组合','Filter combinations':'滤光片组合','Subset':'样本亚组','In-run standard curve':'运行内标准曲线','External standard curve':'外部标准曲线',
 'Melting temperature':'熔解温度（Tm）','Tm calling':'Tm 峰值判定','Melting curve genotyping':'熔解曲线法基因分型'
});
