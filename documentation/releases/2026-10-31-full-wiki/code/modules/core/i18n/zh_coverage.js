/* UI-only coverage review. Stored names, source fields, commands and raw exports are not rewritten. */
Object.assign(ZH_TERMS,{
'Review samples before analysis (optional)':'分析前审核样本（可选）','All samples included':'已纳入全部样本','Group by':'分组依据','Select all matching':'选中全部匹配项','Unselect all matching':'取消全部匹配项','Bulk actions include matching samples on all pages.':'批量操作适用于所有页面的匹配样本。','Learn sample-name patterns (optional)':'学习样本名称模式（可选）','Group unusual names':'将异常名称分组','Learn from':'学习来源','Keep common patterns at':'常见模式保留阈值','Name review':'名称审核','Include':'纳入','Name-pattern review':'名称模式审核','Previous':'上一页','Next':'下一页','Cancel edits':'取消编辑','Download applied selection (CSV)':'下载已应用的选择（CSV）',
'Uncheck a sample to exclude all its replicate wells and targets in that experiment. Raw files and instrument hardware charts stay unchanged. Edits take effect when you press Apply selection and analyse.':'取消选中样本将排除该实验中此样本的全部重复孔和靶标。点击“应用选择并分析”后生效。原始文件和硬件图表不变。',
'Drop the files. The files are decoded locally and their stored values are preserved.':'在本机读取文件，保留原始保存值。','Pick or open the laboratory profile; outcomes and run acceptance follow it.':'选择实验室规程，用于运行验收和结果判定。','Review run acceptance and sample interpretations produced by the active SOP.':'审核当前 SOP 的运行验收和样本判定。','Hardware, software, method and operator control charts per instrument.':'按仪器查看硬件、软件、方法和操作人员控制图。','6 · Review':'6 · 审核','File, result, timeline and interpretation findings, plate map, controls, curves and instrument records.':'审核文件、结果、时间线、板图、质控、曲线和仪器记录。',
'A pasted table can be tidied and downloaded again, but it carries no fluorescence, so the curve-based exports need an .ixo file. Paste or upload a table with a sample column and a Cq column — the header names are matched loosely, so exports from most instruments work as they are. A well column is used if present.':'粘贴或上传含样本列和 Cq 列的表格，可选孔位列。表格不含荧光曲线，不能用于曲线导出。',
'Interactive':'交互操作','Local diagnostics':'本机诊断','Read-only operating evidence for support and review. It contains lifecycle state, limits, timings, file names and error text; it does not contain measurements, Cq values or calls.':'只读诊断：运行状态、耗时、文件名和错误信息；不含测量值、Cq 或结果判定。','Refresh diagnostics':'刷新诊断','Save diagnostics (JSON)':'保存诊断（JSON）','Recent notices and faults':'近期提示与故障','Ready — no files read':'就绪－尚未读取文件','no faults':'无故障','Stop':'停止',
'profile not applicable':'规程不适用','Profile not applicable':'规程不适用','Worst outcome (when action is needed)':'需处理时的最严重结果','Action needed':'所需处理','review-only; no release decision':'仅供审核；不作放行决定','not stated':'未说明','SC-06 container checksum differences stay in':'SC-06 文件容器校验值差异保留在','and are review-only; they do not reject the assay run.':'仅供审核，不据此拒收实验运行。',
'0 · Method, procedure and interpretation':'0 · 方法、步骤与结果判定','Method':'方法','Scope':'适用范围','Applicable platforms':'适用平台','Run-name rule':'运行名称规则','Taxon-specific DNA / extraction references':'物种特异性 DNA／提取参照','Correlation:':'关联规则：','Purpose:':'目的：','Procedure':'操作步骤','Interpretation principles':'判定原则','Decision rules':'判定规则','action:':'处理：','outcome:':'结果：','Reporting:':'报告：',
'A target result is correlated with the valid taxon reference detected for the sample; an alternate undeclared species reference is not treated as a failed sample control.':'将靶标结果与该样本有效的物种参照关联；未声明的其他物种参照缺失不视为样本质控失败。','The method block controls applicability. A run outside this scope is reported as':'按方法适用范围判断；超出范围的运行标记为','; its stored Cq values, calls and curves remain available.':'；保存的 Cq、判定和曲线仍可查看。','Screen extracted plant DNA for 35S and T-NOS markers with HMG or LEC as the taxon reference.':'筛查植物 DNA 中的 35S 和 T-NOS 标记，以 HMG 或 LEC 为物种参照。',
'— Zea mays; primers hmgA F + hmgA R; probe hmgA; taxon-specific DNA / extraction verification':'— Zea mays（玉米）；引物 hmgA F + hmgA R；探针 hmgA；物种特异性 DNA／提取验证','— Glycine max; primers Le1 F + Le1 R; probe Le1; taxon-specific DNA / extraction verification':'— Glycine max（大豆）；引物 Le1 F + Le1 R；探针 Le1；物种特异性 DNA／提取验证',
'P01 Sample identity and extraction linkage':'P01 样本身份与提取记录关联','Keep the SC_ sample identifier, material code, aliquot or dilution suffix, and extraction date together. Parse DD.MM.YYYY strictly and flag a date later than the run date.':'保留 SC_ 样本标识、材料编码、分装／稀释后缀和提取日期。按 DD.MM.YYYY 解析日期；晚于运行日期时提示。','Acceptance: No silent renaming; unresolved dates remain unresolved.':'验收：不自动改名；无法确认的日期保持未确认。','P02 Plate and control placement':'P02 微孔板与质控设置','Use two technical replicates for samples and LOD controls. Use one well for NTC, matrix negatives and process blanks unless the approved procedure specifies a periodic environmental blank.':'样本与检出限质控设两个技术重复孔；NTC、基质阴性和过程空白设单孔。经批准规程另有环境空白要求时按规程执行。','Acceptance: Required controls are present before sample calls are issued.':'验收：作出样本判定前，确认所需质控齐全。','P03 Amplification and analysis':'P03 扩增与分析','Use the instrument\'s declared amplification analysis and preserve the original Cq, call, curve and analysis status. A curve without a same-channel result is evidence for review, not a replacement Cq.':'保留仪器声明的分析方法及原始 Cq、判定、曲线和分析状态。同通道无结果的曲线仅供审核，不用于替代 Cq。','Acceptance: Amplification cycles are evaluated separately from melt acquisitions.':'验收：扩增循环与熔解采集分别评估。','P04 Control review':'P04 质控审核','Check LOD controls against their target-specific Cq windows, use hmgA (HMG) for Zea mays and Le1 (LEC) for Glycine max as taxon-specific DNA / extraction references, and check negative controls for absence of target amplification.':'按各靶标 Cq 窗口审核检出限质控。玉米用 hmgA（HMG）、大豆用 Le1（LEC）作 DNA／提取参照；检查阴性质控是否无靶标扩增。','Acceptance: A failed control changes the run status according to the rule action.':'验收：质控失败时，按规则处理运行状态。','P05 Sample interpretation':'P05 样本结果判定','Interpret a marker only when the target result and its required reference/control evidence meet this profile. Retain inconclusive or repeat outcomes when replicate or reference evidence is incomplete.':'仅在靶标及所需参照／质控符合本规程时判定标记。重复孔或参照证据不全时保留“无法判定”或“重新检测”。','Acceptance: Every outcome names the rule and retains the stored call.':'验收：每项判定注明规则，并保留原始保存判定。','P06 Reporting and traceability':'P06 报告与追溯','Review the generated sample report against the loaded experiment, record the profile name, version and SHA-256, and release only the report belonging to that analysis.':'对照实验审核样本报告，记录规程名称、版本和 SHA-256，确认报告对应本次分析。','Acceptance: No result is reported without an experiment and profile identity.':'验收：报告结果须关联实验及规程身份。',
'HMG/hmgA (hmgA F + hmgA R with hmgA probe) verifies Zea mays DNA; Le1/LEC (Le1 F + Le1 R with Le1 probe) verifies Glycine max DNA. These are taxon/extraction references, not GMO targets.':'HMG/hmgA 验证玉米 DNA；Le1/LEC 验证大豆 DNA。它们是物种／提取参照，不是转基因靶标。','A detected 35S or T-NOS marker is reportable only when the required taxon reference is detected and the run controls pass.':'所需物种参照检出且运行质控通过后，才能报告检出的 35S 或 T-NOS 标记。','A negative marker with a failed or shifted reference is not reported as negative; it is invalid or inconclusive according to the applicable rule.':'参照失败或偏移时，不将未检出的标记直接报告为阴性；按规则标记无效或无法判定。','A late signal, discordant replicate or Cq outside a control window is retained and reported with its reason.':'保留晚期信号、重复孔不一致或超出质控窗口的 Cq，并注明原因。','The stored Cq values, calls and fluorescence traces are never changed by this profile.':'本规程不改变保存的 Cq、判定或荧光曲线。',
'— when 35S or T-NOS detected within the target Cq cut-off and required reference detected;':'— 35S 或 T-NOS 在靶标 Cq 截止值内检出，且所需参照检出；','report detected for that marker;':'报告该标记检出；','— when marker not detected and the required HMG or LEC reference is valid;':'— 标记未检出且所需 HMG 或 LEC 参照有效；','report not detected for that marker;':'报告该标记未检出；','— when marker replicates disagree, are late, or exceed the validated Cq window;':'— 标记重复孔不一致、晚期扩增或超出已验证 Cq 窗口；','retain the evidence and request repeat or review;':'保留证据，要求重新检测或审核；','— when negative control amplifies in a screening target;':'— 阴性质控出现筛查靶标扩增；','do not issue a sample call; reject or review the run;':'不作出样本判定；拒收或审核该运行；','— when run is not an SC_ experiment or required method data are unavailable;':'— 非 SC_ 实验或缺少所需方法数据；','do not apply this profile;':'不应用本规程；','rule ID included; reason included; stored call included.':'包含规则编号、原因和原始保存判定。',
'named on every report this page builds':'显示在每份报告中','the person doing the analysis':'执行分析的人员','Min replicates / control':'每种质控的最少重复孔数','Purpose':'目的','Material':'材料','Fixed IC reference Cq (longitudinal monitoring)':'固定内部质控参照 Cq（纵向监测）','Colour compensation when multiple channels are active':'多通道工作时的颜色补偿','Set to Do not check for simplex assays; use Flag for review only when a validated multiplex method requires it.':'单重检测可设为不检查；仅当已验证多重方法要求时标记待审核。','Taxon reference correlation for target calls':'靶标判定的物种参照关联','Use Any valid taxon reference when each sample is run with its species-specific reference gene; an alternate absent species reference is not an invalid result.':'各样本使用其物种特异性参照基因时，选择任一有效物种参照；其他物种参照缺失不等于结果无效。','Control pass':'质控通过',
'No control-chart alarm points for this instrument.':'此仪器无控制图报警点。','Temperature-log duration':'温度日志时长','Total run minus temperature-log duration':'总运行时长减温度日志时长','seconds':'秒','file':'文件','run':'运行','analysis':'分析','change / save':'修改／保存','calibration':'校准','Experiment created':'实验创建','Experiment last modified':'实验最后修改','Run ended':'运行结束','Analysis created':'分析创建','Analysis modified':'分析修改','Hours from run start':'距运行开始的小时数','Software version':'软件版本','Fluorescence scaling factor':'荧光缩放系数','Source UID':'源 UID','Source CRC-32':'源 CRC-32','Source SHA-256':'源 SHA-256','Container checksum':'文件容器校验值','SHA-256 of the unmodified source .ixo bytes':'未修改的原始 .ixo 字节的 SHA-256',
'Rising curves without result':'无结果的上升曲线','Problems across selected experiments':'所选实验的问题汇总','Choose loaded experiments to group their findings by category. The curve view reconstructs the stored cycle-by-cycle fluorescence so late rises, missing results and abnormal shapes are visible together.':'按类别汇总所选实验的问题，并显示保存的逐循环荧光曲线。','Graph analysis and review':'曲线分析与审核','Numeric review findings for the selected amplification-curve context. These findings preserve the stored instrument values and support review under the active SOP.':'审核所选扩增曲线；保留仪器保存值，按当前 SOP 评估。','Rising curves without a result in their own channel':'同通道无结果的上升曲线','Download rising-curve review (CSV)':'下载上升曲线审核（CSV）','Save combined rising curves (PNG)':'保存合并的上升曲线（PNG）','unique structural errors':'独立结构错误','unique review findings':'独立审核发现','runs affected':'受影响运行','rising curves with no result in their own channel':'同通道无结果的上升曲线','Review findings are available.':'有待审核发现。','Open rising-curve review':'打开上升曲线审核','Problem category':'问题类别','Select all experiments':'选中全部实验','Clear experiments':'取消全部实验','Download grouped problems (CSV)':'下载分类问题（CSV）','Amplification / curve shape':'扩增／曲线形态','SOP / result interpretation':'SOP／结果判定','Category':'类别','Problem':'问题','SC sample identifier format — not met (review)':'SC 样本标识格式不符（待审核）','Reconstructed problem curves':'问题曲线重建','error-level curve':'错误级曲线','review-level curve':'审核级曲线','stored fluorescence by cycle; endpoint marker shows the final cycle':'逐循环保存的荧光；终点标记表示最后循环','Reset view':'重置视图','Hover for values · wheel zooms · drag pans':'悬停查看数值 · 滚轮缩放 · 拖动平移',
'Applied sample selection (CSV)':'已应用的样本选择（CSV）','Included and excluded samples per experiment; raw-file and hardware data are unchanged.':'列出各实验纳入与排除的样本；原始文件和硬件数据不变。','Item':'项目','Lifecycle phase':'运行阶段','ready':'就绪','Open view':'当前视图','Import generation':'导入批次','Runs loaded':'已加载运行','Files staged':'暂存文件','History rows':'历史记录行数','Recorded faults':'已记录故障','Last fault':'最近故障','No notices or faults recorded.':'无提示或故障记录。','Fits every curve with qpcR, writes per-well efficiency and cpD2, and compares them with the Cq the instrument stored.':'用 qpcR 拟合曲线，输出每孔扩增效率与 cpD2，并与仪器保存的 Cq 比较。','Runs LinRegPCR through rdmlpython on the exported RDML and writes the per-well efficiencies and starting concentrations.':'通过 rdmlpython 对导出的 RDML 运行 LinRegPCR，输出各孔扩增效率与起始浓度。',
'Download file-integrity list (CSV)':'下载文件完整性清单（CSV）','file integrity':'文件完整性','Check':'检查项目','Object stream checksum':'对象流校验值','Expected':'预期值','Observed':'观察值','The file content differs from the sealed object stream.':'文件内容与封存对象流的校验记录不一致。','Source provenance':'来源追溯','0 or Escape · close':'0 或 Escape · 关闭',
'Not detected':'未检出','Detected':'检出','Repeat analysis':'重新检测','Repeat':'重新检测','Inconclusive':'无法判定','Taxon reference':'物种参照','Endogenous reference gene':'内标准基因',
'TREND':'趋势','CUSUM':'累积和','XBARS':'均值－标准差','EWMA':'指数加权移动平均','funnel':'漏斗图'
});
/* Exact templates, not arbitrary English-word substitutions in source identities. */
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
MISSY_HOOKS.use('i18n.phrase','i18n/coverage-zh',110,next=>function(value){const result=zhCoverageContext(value);return result===null?next(value):result;});
Object.assign(ZH_TERMS,{
'Laboratory default for SC_ experiments. Runs are simplex, so colour compensation is not required. Review-only until the approved SOP owner confirms acceptance decisions and the comparison direction in section 6.2 c5.':'SC_ 实验的实验室默认规程。单重检测不要求颜色补偿。SOP 负责人确认验收判定及第 6.2 c5 节比较方向前，仅供审核。',
'Each control chart is configured on its own page in the Control panel (chart type, baseline runs, specification limits, run rules, alarm action). Those settings are stored in this profile under "controlCharts" and change its SHA-256. Customised charts: none (defaults).':'各控制图在控制面板中单独配置类型、基线运行、规格限、运行规则和报警处理。设置保存在规程的 controlCharts 字段中，并改变其 SHA-256。当前使用默认设置。',
'quantification results present':'包含定量结果','per-analysis result objects':'各分析的结果对象','Positive calibrator, Unknown, Negative control':'阳性校准品、未知样本、阴性质控','QuantSampleTypeProperty, refined by the name rules':'QuantSampleTypeProperty，结合名称规则细化','the file marks no target as dtTarget or dtReference':'文件未将任何靶标标记为 dtTarget 或 dtReference','no standard carries a concentration; efficiency is assumed, not fitted':'标准品无浓度记录；扩增效率采用设定值，未经拟合','analysis subset names':'分析子集名称','AcquisitionStore THTCFloAcquisition ScalingFactor (raw counts are preserved)':'AcquisitionStore THTCFloAcquisition ScalingFactor（保留原始计数）','trailing line after </objectstream>: MD5 of the object stream, byte-swapped words':'</objectstream> 后的末行：对象流 MD5，按字交换字节顺序','objectstream attributes':'objectstream 属性','GenSampleEditName versus the analysis result lists':'GenSampleEditName 与分析结果清单比较',
'Negative controls by process stage':'按过程阶段显示阴性质控','reaction blank':'反应空白','event':'事件','time':'时间','hours_from_run_start':'距运行开始小时数','kind':'类型','read_from':'读取来源','edit':'编辑','run Created':'运行 Created','experiment Created':'实验 Created','run StartTime':'运行 StartTime','run EndTime':'运行 EndTime','analysis Created':'分析 Created','analysis LastModified':'分析 LastModified','experiment LastModified':'实验 LastModified','export':'导出',
'QuantStudio export layout (TXT)':'QuantStudio 导出格式（TXT）','QuantStudio export workbook (XLSX)':'QuantStudio 导出工作簿（XLSX）','Relative quantification (CSV)':'相对定量（CSV）','Multicomponent and raw filter data (CSV)':'多组分与原始滤光片数据（CSV）'
});
function zhCoverageExtra(value){const raw=String(value??''),s=raw.trim();let m,out;
 if((m=s.match(/^(\d+) analysis object\(s\) in the file$/)))out=`文件含 ${m[1]} 个分析对象`;
 else if((m=s.match(/^(\d+) source bytes$/)))out=`源文件 ${m[1]} 字节`;
 else if((m=s.match(/^([\d.]+) (minutes|seconds)$/)))out=m[1]+(m[2]==='minutes'?' 分钟':' 秒');
 else if((m=s.match(/^none on this plate \((\d+) efficiency-based, no line to read\)$/)))out=`此板无拟合曲线（${m[1]} 项使用设定效率）`;
 else if((m=s.match(/^container checksum MISMATCH (.+)$/)))out='文件容器校验值不一致 '+m[1];
 else if((m=s.match(/^signature IXOS, version (\d+)$/)))out='签名 IXOS，版本 '+m[1];
 else if((m=s.match(/^named (\d+), carrying a result (\d+)$/)))out=`${m[1]} 个已命名孔，${m[2]} 个含结果`;
 else if((m=s.match(/^Negative controls by process stage · (.+)$/)))out='按过程阶段显示阴性质控 · '+zhPhrase(m[1]);
 else if((m=s.match(/^(\d+) sample name\(s\) do not match (.+)$/)))out=`${m[1]} 个样本名称不符合 ${m[2]}`;
 else if((m=s.match(/^(.+): replicate SD ([\d.]+) > ([\d.]+)$/)))out=m[1]+'：重复孔标准差 '+m[2]+' > '+m[3];
 else if((m=s.match(/^(.+); amplitude ([\d.-]+); terminal change ([\d.-]+)$/)))out=m[1]+'；幅度 '+m[2]+'；终末变化 '+m[3];
 else if((m=s.match(/^Not offered for this experiment, because it holds no such data:\s+([\s\S]+)\.$/)))out='本实验无相应数据，未提供：'+m[1].split(', ').map(zhPhrase).join('、')+'。';
 if(out===undefined)return null;return raw.replace(s,out);}
MISSY_HOOKS.use('i18n.phrase','i18n/coverage-extra',111,next=>function(value){const result=zhCoverageExtra(value);return result===null?next(value):result;});
Object.assign(ZH_TERMS,{'Load experiment files to begin.':'请先加载实验文件。','GPL-3.0 · Attribution and source / 许可与源代码':'GPL-3.0 · 署名与源代码','memory —':'内存 —','export drawn in —':'导出绘制耗时 —'});
Object.assign(ZH_TERMS,{
'Melting peaks (CSV)':'熔解峰（CSV）',
'Header plus Sample Setup, Raw Data, Amplification Data, Multicomponent Data, analysis summaries and Results as tab-delimited sections (MAN0010409, chapter 3), with the columns and row order of the software\'s own export. For LIS/LIMS parsers that expect that layout.':'按 QuantStudio 导出布局生成制表符分隔文本，包含样本设置、原始数据、扩增、多组分、分析摘要和结果。适用于要求此布局的 LIS／LIMS。',
'The same sheets, columns and row order as the QuantStudio software\'s Excel export (Sample Setup, Raw Data, Amplification Data, Multicomponent Data, analysis summaries, Results, Reagent Information), rebuilt from the .eds using the export configuration saved inside it.':'按 .eds 中保存的导出配置重建 QuantStudio Excel 工作簿，保留工作表、列及行顺序。',
'Stored relative-quantification results: ΔΔCt summaries with RQ and confidence limits from QuantStudio, pairing ratios from LightCycler.':'保存的相对定量结果：QuantStudio 的 ΔΔCt、RQ 与置信限，或 LightCycler 的配对比值。',
'QuantStudio only: per-dye multicomponent signal and every filter-set reading, one row per named well and cycle — the data under the stored Rn.':'仅适用于 QuantStudio：各染料多组分信号与滤光片组读数；每个命名孔、每个循环一行。',
'One row per stored peak with temperature, area, width, height, shoulder, raw call code and manual-edit flag. Wells without a peak remain as one blank row.':'每个保存的熔解峰一行，含温度、面积、峰宽、峰高、肩峰、原始判定码和人工编辑标记；无峰孔保留空行。'
});
/* Console captions are UI text; DOM selection uses data-console-field, never translated labels. */
Object.assign(ZH_TERMS,{
'Open a graph to inspect its run / acquisition':'打开图表以查看对应运行／采集','Open a graph to select a measurement':'打开图表以选择测量项目','Selected run / acquisition':'所选运行／采集','runs ·':'次运行 ·','results · profile':'条结果 · 规程','Chart type':'控制图类型','Individuals (I)':'单值图（I）','Run order':'运行顺序','Run date':'运行日期','X axis':'X 轴','Light':'浅色','Dark':'深色','Light theme':'浅色主题','Dark theme':'深色主题','Hide the chart':'隐藏图表','Show the chart':'显示图表','No data loaded':'未加载数据','no data loaded':'未加载数据','Last-N raw endpoint window; enabled where supported':'最后 N 个原始读数；仅在支持时可用'
});
MISSY_HOOKS.use('i18n.phrase','i18n/console-captions',120,next=>function(value){const raw=String(value??''),s=raw.trim();let m,out;
if((m=s.match(/^(\d+)\s*·\s*key$/)))out=m[1]+' · 快捷键';
else if((m=s.match(/^Chart type · (.+)$/)))out='控制图类型 · '+zhPhrase(m[1]);
else if((m=s.match(/^X axis · (.+)$/)))out='X 轴 · '+zhPhrase(m[1]);
else if((m=s.match(/^Next run · (.+)$/)))out='下一运行 · '+m[1];
else if((m=s.match(/^press (\d+)$/)))out='按 '+m[1];
else if((m=s.match(/^(\d+) · select( · in use)?$/)))out=m[1]+' · 选择'+(m[2]?' · 当前使用':'');
else if((m=s.match(/^(Hide header \/ controls|Show header \/ controls) \(H\)$/)))out=zhPhrase(m[1])+'（H）';
if(out!==undefined)return raw.replace(s,out);return next(value);
});
MISSY_HOOKS.use('mgRender','i18n/console-final-text',1000,next=>function(){const result=next();if(UI_LANG==='zh')localizeDOM(document.getElementById('mg'),true);return result;});

Object.assign(ZH_TERMS,{'Previous chart':'上一图表','Next chart':'下一图表','Close chart':'关闭图表','Trend / forecast':'趋势／预测','Date':'日期','Cumulative hours':'累计小时数','Block cycles':'模块循环数','p-chart':'p 控制图','u-chart':'u 控制图','c-chart':'c 控制图','Funnel':'漏斗图','Open the control panel on the page':'在页面中打开控制面板','outside limits':'超出控制限','pattern, in limits':'限内异常模式','centre / fitted line':'中心线／拟合线','control limits':'控制限','Run (in date order)':'运行（按日期排序）'});
MISSY_HOOKS.use('i18n.phrase','i18n/console-chart-labels',121,next=>function(value){const raw=String(value??''),s=raw.trim();let m,out;
if((m=s.match(/^([A-Z]-[A-Z]\d+[a-z]?) (.+)$/))){const translated=zhPhrase(m[2]);if(translated!==m[2])out=m[1]+' '+translated;}
else if((m=s.match(/^(lower|upper) spec ([-+\d.eE]+)( — (below|above) this scale)?$/)))out=(m[1]==='lower'?'规格下限 ':'规格上限 ')+m[2]+(m[3]?' — '+(m[4]==='below'?'低于当前坐标范围':'高于当前坐标范围'):'');
return out===undefined?next(value):raw.replace(s,out);
});

/* Concise mode controls; command syntax and source identifiers are literal. */
Object.assign(ZH_TERMS,{'results':'结果','name':'名称','version':'版本','laboratory':'实验室','analyst':'分析人员','checksum':'校验和','loaded runs:':'已加载运行：','Control charts · hardware':'控制图 · 硬件','Control charts · software':'控制图 · 软件','Control charts · method':'控制图 · 方法','Control charts · operator':'控制图 · 操作人员','IC shift from fixed reference':'内部质控相对固定参照的偏移','standard figures: every compatible loaded run, separately; tables: all loaded data':'标准图：分别绘制各兼容运行；表格：所有已加载数据','script finished':'脚本执行完毕','selection emptied':'已清空选择','building the report…':'正在生成报告…','building the archive…':'正在生成压缩包…','(nothing)':'（无）','(not available yet)':'（尚不可用）','(cleared)':'（已清除）','(default)':'（默认）','error:':'错误：'});
MISSY_HOOKS.use('i18n.phrase','i18n/command-responses',125,next=>function(value){const raw=String(value??''),s=raw.trim();let m,out;
if((m=s.match(/^(\d+) selected:$/)))out='已选 '+m[1]+' 项：';
else if((m=s.match(/^(\d+) item\(s\):$/)))out=m[1]+' 项：';
else if((m=s.match(/^selected (\d+): (.+)$/)))out='已选择 '+m[1]+' 项：'+m[2];
else if((m=s.match(/^deselected (\d+)$/)))out='已取消选择 '+m[1]+' 项';
else if((m=s.match(/^selection is now (\d+) item\(s\)$/)))out='当前已选 '+m[1]+' 项';
else if((m=s.match(/^options (updated|reset) for (\d+) item\(s\)$/)))out='已'+(m[1]==='updated'?'更新':'重置')+' '+m[2]+' 项的选项';
else if((m=s.match(/^running (\d+) line\(s\) of script$/)))out='正在执行 '+m[1]+' 行脚本';
else if((m=s.match(/^report written, ([\d,]+) bytes$/)))out='报告已生成，'+m[1]+' 字节';
else if((m=s.match(/^archive written, (\d+) entries$/)))out='压缩包已生成，'+m[1]+' 项';
else if((m=s.match(/^error: (.+)$/)))out='错误：'+zhPhrase(m[1]);
else if((m=s.match(/^(.+) does not accept option (.+)$/)))out=m[1]+' 不支持选项 '+m[2];
else if((m=s.match(/^(laboratory|analysis by|report title): (.*)$/)))out=({'laboratory':'实验室','analysis by':'分析人员','report title':'报告标题'})[m[1]]+'：'+m[2];
else if((m=s.match(/^standard figures: (.+); tables still cover all loaded data$/)))out='标准图：'+m[1]+'；表格仍涵盖所有已加载数据';
else if((m=s.match(/^nothing matches (.+)$/)))out='无匹配项：'+m[1];
else if((m=s.match(/^unknown command: (.+?)   \(help lists them\)$/)))out='未知命令：'+m[1];
return out===undefined?next(value):raw.replace(s,out);
});

/* Chart variants retain literal channel identifiers after a translated catalogue title. */
Object.assign(ZH_TERMS,{
'Ambient temperature field — quantised/inferred encoding':'环境温度字段－量化／推定编码',
'Detector dark reading — within-run change':'探测器暗读数－运行内变化',
'Optical reference row — within-run change':'光学参照行－运行内变化',
'Optical reference versus stored factory value':'光学参照与保存的出厂值比较',
'LED DAC setting — configuration history':'LED DAC 设置－配置历史',
'Dark-reading SD — maximum within acquisition step':'暗读数标准差－采集步骤内最大值',
'Dark-reading min–max spread — maximum within acquisition step':'暗读数极差－采集步骤内最大值',
'Raw early-cycle linear slope':'原始早期循环线性斜率',
'Raw early-cycle linear-fit residual RMS':'原始早期循环线性拟合残差均方根',
'Ordered block-temperature non-increasing transitions':'按采集顺序的模块温度非升温转换',
'Ordered block-temperature absolute increment — maximum':'按采集顺序的模块温度绝对增量－最大值',
'Raw endpoint — last-N-read range':'原始终点－末 N 个读数的极差'
});
MISSY_HOOKS.use('i18n.phrase','i18n/catalogue-channel-variants',129,next=>function(value){
 const raw=String(value??''),s=raw.trim();
 const def=CC_CHARTS.find(c=>s.startsWith(c.title+' · '));
 if(def){const title=zhPhrase(def.title);if(title!==def.title)return raw.replace(s,title+s.slice(def.title.length));}
 return next(value);
});

/* Console overview cards use dynamic counts, separately from graph captions. */
Object.assign(ZH_TERMS,{
'Attention':'待关注','Charts still collecting a baseline':'仍在积累基线的控制图','no limits yet':'尚无控制限','BASE':'基线',
'Data available; this chart is still building its baseline.':'已有数据，仍在积累基线。','Files read into this session':'本次会话已读取的文件','files read':'已读取文件','stored results':'保存结果','Curves decoded':'已解码曲线','Melting results':'熔解结果','Instruments':'仪器','Operators':'操作人员','Active profile':'当前规程','Software':'软件','Run minutes':'运行分钟数','Channels':'通道','Bytes':'字节数',
'Decoded file metadata and stored results are ready. Open File integrity for any file-integrity mismatch.':'文件元数据与保存结果已就绪。','File decoded; stored values are ready for review.':'文件已解码；保存值可供审核。',
'Every outcome on this page is produced by this profile. Stored Cq values, calls and fluorescence are never changed.':'本页判定来自当前规程；保存的 Cq、判定和荧光值不变。','profile':'规程','target rule':'靶标规则','control':'质控','replicates and control':'重复孔与质控','run acceptance':'运行验收','rules':'规则','Replicates and internal control':'重复孔与内部质控','Run acceptance rules':'运行验收规则','Results under this profile':'当前规程下的结果','interpreted results':'已判定结果','No instrument history yet':'暂无仪器历史','runs in this history':'历史运行数','Every chart with limits is in control on the latest run.':'最近一次运行中，所有已有控制限的图均受控。','Collecting a baseline':'积累基线中','Baseline needed':'所需基线','Outside limits':'超出控制限','To watch':'待关注','No chart is outside a limit':'无控制图超出限值','All checks passed':'所有检查通过',
'Nothing is outside a control or specification limit. Use the top row to read any part of the data set.':'无数据超出控制限或规格限。','Every chart with limits is in control and no error-level finding is open. Use the top row to read any part of the data set.':'所有已有控制限的图均受控，且无未处理的错误级发现。','In control. Select Show chart to inspect the trend and limits.':'受控。','No experiment files are loaded':'尚未加载实验文件','Files staged, ready to read':'文件已暂存，可读取','Controls missing':'缺少质控','Controls failing':'质控失败','Minimum replicates':'最少重复孔数','Positive replicates':'阳性重复孔数','Runs evaluated':'已评估运行数','Name':'名称','Author':'作者','Effective':'生效日期','Locked':'已锁定','Samples':'样本','Need action':'需处理','mean Cq':'平均 Cq','Standards':'标准品'
});
MISSY_HOOKS.use('i18n.phrase','i18n/console-summary-counts',130,next=>function(value){const raw=String(value??''),s=raw.trim();let m,out;
if((m=s.match(/^(.+?)\s*·\s*item (\d+) of (\d+)\s*·\s*(\d+) outside limits\s*·\s*(\d+) to watch$/)))out=zhPhrase(m[1])+' · 第 '+m[2]+' / '+m[3]+' 项 · '+m[4]+' 项超限 · '+m[5]+' 项待关注';
else if((m=s.match(/^of (\d+)$/)))out='／共 '+m[1]+' 项';
else if((m=s.match(/^a chart needs (\d+) runs before it has limits$/)))out='建立控制限需要 '+m[1]+' 次基线运行';
else if((m=s.match(/^(\d+) run\(s\) are in this instrument's history\. Until a chart has its baseline it can raise no alarm\.$/)))out='该仪器历史包含 '+m[1]+' 次运行。基线未建立时，不作控制图报警判定。';
else if((m=s.match(/^(.+) · (\d+) run\(s\) · chart gallery$/)))out=m[1]+' · '+m[2]+' 次运行 · 图表库';
else if((m=s.match(/^(\d+) stored results · (\d+) curves decoded$/)))out=m[1]+' 条保存结果 · '+m[2]+' 条已解码曲线';
else if((m=s.match(/^([\dx]+) plate · (\d+) cycles · (\d+) curves$/)))out=m[1]+' 孔板 · '+m[2]+' 个循环 · '+m[3]+' 条曲线';
else if((m=s.match(/^(\d+) target rule\(s\) · (\d+) control\(s\) · (\d+) run rule\(s\)$/)))out=m[1]+' 条靶标规则 · '+m[2]+' 项质控 · '+m[3]+' 条运行规则';
else if((m=s.match(/^(\d+) chart\(s\) · (\d+) outside limits · (\d+) to watch$/)))out=m[1]+' 张图 · '+m[2]+' 项超限 · '+m[3]+' 项待关注';
else if((m=s.match(/^(\d+) instrument\(s\) in the loaded history$/)))out='已加载历史包含 '+m[1]+' 台仪器';
else if((m=s.match(/^(\d+) chart\(s\) have a point outside a control or specification limit\.$/)))out=m[1]+' 张图存在超出控制限或规格限的点。';
else if((m=s.match(/^(\d+) chart\(s\) show a pattern inside the limits\.$/)))out=m[1]+' 张图存在限内异常模式。';
else if((m=s.match(/^(\d+) runs$/)))out=m[1]+' 次运行';
return out===undefined?next(value):raw.replace(s,out);
});
Object.assign(ZH_TERMS,{
'Every other target':'其他所有靶标','required per run':'每次运行所需数量','If this control fails the run is flagged for review.':'此质控失败时，运行标记为待审核。','If this control fails the run is rejected.':'此质控失败时，拒收运行。','Match':'匹配规则','Matched by':'匹配方式','negative':'阴性','positive':'阳性','reference':'参照','target':'靶标','Cq window':'Cq 窗口','Minimum per run':'每次运行最少数量','On failure':'失败时处理','Partial outcome':'部分阳性时的判定','SD outcome':'标准差超限时的判定','IC reference Cq':'内部质控参照 Cq','IC maximum shift':'内部质控最大偏移','IC shift outcome':'内部质控偏移时的判定','IC missing outcome':'内部质控缺失时的判定','maximum Cq SD':'最大 Cq 标准差','Late signal from':'晚期信号起点','Late outcome':'晚期信号判定','Controls missing':'缺少质控','Controls failing':'质控失败','Efficiency window':'扩增效率窗口','NTC gap':'无模板对照间隔','Edit delay (hours)':'编辑延迟（小时）','Zone spread limit':'温区温差限值','Instrument run state':'仪器运行状态','reject':'拒收','criterion on the data':'数据判定标准','Profile is a review scaffold':'规程仅作审核框架','every run met it':'所有运行均符合','applied to every loaded run':'应用于所有已加载运行','These decide whether a whole run is accepted, reviewed or rejected before any sample is reported.':'报告样本前，按规则判断整次运行通过、待审核或拒收。','Informational: laboratory approval and assay-specific sample interpretation are not configured.':'提示：尚未配置实验室批准与检测专属的样本判定。','SC sample identifier format':'SC 样本标识格式','Edited within the allowed window':'在允许时间窗内编辑','Quality and forensic review':'质量与取证审核','grouped problems':'问题分组','Problems grouped by category':'按类别汇总的问题','finding(s)':'项发现','finding':'发现','Recovery':'恢复','Analysis membership':'分析归属','Stored call':'保存判定','Timeline':'时间线','downloads':'下载','download':'下载','Formats this data set can produce':'当前数据可导出的格式','formats':'种格式','format':'种格式','every format is available':'所有格式均可用','Format':'格式','Runs included':'包含运行数','Sample names':'样本名称','as set by the pseudonymisation switch':'按假名化开关设置','File-integrity mismatches':'文件完整性不一致','mismatches':'项不一致','mismatch':'不一致','Each mismatch is listed below. Stored values are unchanged.':'下列为校验差异；保存值不变。','No verified ZPCR acquisitions':'无经验证的 ZPCR 采集','• Raw files remain available. • Completion / identity evidence required for comparisons.':'原始文件仍可用；比较需要完成状态与身份依据。','No run to draw':'无可绘制的运行','all loaded runs':'所有已加载运行','one run':'单次运行','every loaded run':'所有已加载运行','Group':'分组','Drawn from':'数据来源','Options':'选项','Graphs':'图表','graphs':'张图','Open the graphs view on the page':'打开页面图表','Download this file':'下载文件','Show every item':'显示所有项目','Show chart':'显示图表','Download':'下载','Sample comparison':'样本比较','Files staged, ready to read':'文件已暂存，可读取','The files passed intake. Read them to decode runs and build the views.':'文件已暂存。','Drop .ixo, .eds, .edt or .zip files on the load view to begin.':'尚未加载文件。','The graphs are drawn from one decoded run at a time. Load an experiment file first.':'请先加载实验文件。','Each graph below is drawn here with the limits of the active profile. Use Next run to change the experiment.':'按当前规程绘图。','Select a format below and press Download. Sample names follow the pseudonymisation switch on the page.':'样本名称按假名化开关设置。','Nothing is loaded yet, so no download can be produced.':'尚未加载数据。','The page can reconstruct the stored fluorescence curves for the amplification-related rows.':'扩增相关发现可查看保存的荧光曲线。','Control charts are built from the numbers the instrument writes into its own files. Read a run, or import a stored history.':'控制图使用仪器文件中的记录数据。'
});
MISSY_HOOKS.use('i18n.phrase','i18n/console-card-details',131,next=>function(value){const raw=String(value??''),s=raw.trim();let m,out;
if((m=s.match(/^at least (\d+) replicate\(s\), (\d+) of them positive$/)))out='至少 '+m[1]+' 个重复孔，其中 '+m[2]+' 个阳性';
else if((m=s.match(/^A signal later than the cut-off is called negative\. A late signal is reported as (.+)\.$/)))out='超过截止值的信号判为阴性；晚期信号标记为'+zhPhrase(m[1])+'。';
else if((m=s.match(/^rule (\d+) of (\d+); the first matching rule wins$/)))out='第 '+m[1]+' / '+m[2]+' 条规则；采用首个匹配规则';
else if((m=s.match(/^kind (\w+)( · late signal beyond Cq (.+?))?( · minimum quantity (.+))?$/)))out='类型：'+zhPhrase(m[1])+(m[3]?' · 晚期信号 Cq > '+m[3]:'')+(m[5]?' · 最低含量 '+m[5]:'');
else if((m=s.match(/^expected (\w+) · matched by (.+)$/)))out='预期：'+zhPhrase(m[1])+' · 匹配字段：'+zhPhrase(m[2]);
else if((m=s.match(/^matches (.+) on targets (.+)$/)))out='匹配 '+m[1]+'；靶标 '+m[2];
else if((m=s.match(/^A spread above the limit is reported as (.+); a partly positive replicate set as (.+)\.$/)))out='离散度超限：'+zhPhrase(m[1])+'；部分重复孔阳性：'+zhPhrase(m[2])+'。';
else if((m=s.match(/^internal control shift limit (.+) Cq$/)))out='内部质控偏移限值 '+m[1]+' Cq';
else if((m=s.match(/^controls failing: (.+)$/)))out='质控失败时：'+zhPhrase(m[1]);
else if((m=s.match(/^of (\d+) run\(s\) (met|read)$/)))out='／共 '+m[1]+' 次运行'+(m[2]==='met'?'符合':'已读取');
else if((m=s.match(/^(\d+) for review$/)))out=m[1]+' 项待审核';
else if((m=s.match(/^(\d+) rejected(, (\d+) for review)?$/)))out=m[1]+' 项拒收'+(m[3]?'，'+m[3]+' 项待审核':'');
else if((m=s.match(/^Control result — (.+)$/)))out='质控结果－'+m[1];
else if((m=s.match(/^(\d+) control result\(s\) accepted$/)))out=m[1]+' 项质控结果通过';
else if((m=s.match(/^(pass|review|reject|n\/a) — (.+)$/)))out=({'pass':'通过','review':'待审核','reject':'拒收','n/a':'不适用'})[m[1]]+'－'+zhPhrase(m[2]);
else if((m=s.match(/^last change (.+) — (.+) h after the run ended \(SOP ≤ (.+) h\)$/)))out='最后修改 '+m[1]+'－运行结束后 '+m[2]+' 小时（SOP ≤ '+m[3]+' 小时）';
else if((m=s.match(/^Last recorded change (.+) h after the run ended$/)))out='最后记录的修改在运行结束后 '+m[1]+' 小时';
else if((m=s.match(/^(\d+) sample name\(s\) match the SC_ identifier rule$/)))out=m[1]+' 个样本名称符合 SC_ 标识规则';
else if((m=s.match(/^(\d+) run\(s\) · (\d+) rejected · (\d+) result\(s\) need action$/)))out=m[1]+' 次运行 · '+m[2]+' 次拒收 · '+m[3]+' 项结果需处理';
else if((m=s.match(/^(\d+) result\(s\) need an action before the report can be signed\.$/)))out='报告签署前，'+m[1]+' 项结果需处理。';
else if((m=s.match(/^(\d+) target\(s\) · (\d+) sample\(s\)$/)))out=m[1]+' 个靶标 · '+m[2]+' 个样本';
else if((m=s.match(/^(\d+) result\(s\) · (\d+) with a Cq · (\d+) need action$/)))out=m[1]+' 项结果 · '+m[2]+' 项有 Cq · '+m[3]+' 项需处理';
else if((m=s.match(/^Cq from (.+) to (.+) across (\d+) sample\(s\)\.$/)))out=m[3]+' 个样本的 Cq 范围 '+m[1]+'–'+m[2]+'。';
else if((m=s.match(/^Graphs for (.+)$/)))out='运行图表：'+m[1];
else if((m=s.match(/^run (\d+) of (\d+) · (\d+) group\(s\)$/)))out='第 '+m[1]+' / '+m[2]+' 次运行 · '+m[3]+' 个分组';
else if((m=s.match(/^graph (\d+) of (\d+) · drawn with (.+)$/)))out='第 '+m[1]+' / '+m[2]+' 张图 · 规程 '+m[3];
else if((m=s.match(/^download (\d+) of (\d+)$/)))out='第 '+m[1]+' / '+m[2]+' 项下载';
else if((m=s.match(/^(\d+) format\(s\) need data this experiment does not hold$/)))out=m[1]+' 种格式所需数据在本实验中不可用';
else if((m=s.match(/^not available: (.+)$/)))out='不可用：'+m[1].split(', ').map(zhPhrase).join('、');
else if((m=s.match(/^(\d+) file\(s\) examined$/)))out='已检查 '+m[1]+' 个文件';
else if((m=s.match(/^(expected|observed) (\$[A-Fa-f\d-]+)$/)))out=(m[1]==='expected'?'预期 ':'观察值 ')+m[2];
else if((m=s.match(/^Object stream checksum: (.+)$/)))out='对象流校验和：'+m[1];
else if((m=s.match(/^(\d+) error · (\d+) review( · (\d+) area\(s\))?( · expected: none)?$/)))out=m[1]+' 项错误 · '+m[2]+' 项待审核'+(m[4]?' · '+m[4]+' 个领域':'')+(m[5]?' · 预期无异常':'');
else if((m=s.match(/^(\d+) finding\(s\) are for review; none is error level\.$/)))out=m[1]+' 项发现待审核；无错误级发现。';
else if((m=s.match(/^(\d+) category\(ies\) · (\d+) experiment\(s\)$/)))out=m[1]+' 个类别 · '+m[2]+' 个实验';
else if((m=s.match(/^(\d+) finding\(s\) · (\d+) error · (\d+) experiment\(s\)$/)))out=m[1]+' 项发现 · '+m[2]+' 项错误 · '+m[3]+' 个实验';
return out===undefined?next(value):raw.replace(s,out);
});
Object.assign(ZH_TERMS,{'Lowest Cq':'最低 Cq','Highest Cq':'最高 Cq','Platform':'平台','Run start':'运行开始','Run end':'运行结束','Hours end to change':'运行结束至修改的小时数','Accepted under this profile.':'符合当前规程。','Charts':'图表','In control':'受控','control chart':'控制图','Chart':'图表','Variant':'通道／分组','Latest value':'最近值','Centre line':'中心线','Lower limit':'下限','Upper limit':'上限','Specification':'规格限','Runs in chart':'图中运行数','unknown date':'日期未知','negative matrix control':'基质阴性质控','extraction process blank':'提取过程空白','grinding/environment blank':'研磨／环境空白','fluorescence':'荧光','reference counts':'参照计数','% change in the run':'运行内变化百分比','°C from setpoint':'相对设定值的温差 °C','log10 hours':'log10 小时','findings':'项发现','events':'个事件','share of results':'结果比例','share of NTC wells':'无模板对照孔比例','share of settings':'设置比例','share of wells':'孔比例','share of intervals':'间隔比例','share of readings':'读数比例','Control extraction batches':'质控提取批次','Control extract age versus Cq':'质控提取后时间与 Cq','Control Cq versus cooling rate':'质控 Cq 与降温速率','Run history':'运行历史','Fluorescence':'荧光','Plate':'微孔板','Across runs':'跨运行','Overall summary and comparisons':'总体统计与比较','Analysis membership':'分析归属','Recovery':'恢复','QC':'质控','Stored call':'保存判定','Timeline':'时间线'});
MISSY_HOOKS.use('i18n.phrase','i18n/console-unit-details',132,next=>function(value){const complete=next(value);if(complete!==String(value??''))return complete;const raw=String(value??''),s=raw.trim();let m,out;
if((m=s.match(/^(.+) · (\d+) run\(s\) in this chart · last run (.+)$/)))out=m[1]+' · 图中 '+m[2]+' 次运行 · 最近运行 '+zhPhrase(m[3]);
else if((m=s.match(/^([-\d.]+) (fluorescence|reference counts|% change in the run|°C from setpoint|log10 hours|findings|events|share of results|share of NTC wells|share of settings|share of wells|share of intervals|share of readings)$/)))out=m[1]+' '+zhPhrase(m[2]);
else if((m=s.match(/^(\d+) result\(s\) · (\d+) with a Cq$/)))out=m[1]+' 项结果 · '+m[2]+' 项有 Cq';
else if((m=s.match(/^(\d+) negative · (\d+) inconclusive · (\d+) repeat · (\d+) invalid$/)))out=m[1]+' 项阴性 · '+m[2]+' 项无法判定 · '+m[3]+' 项重新检测 · '+m[4]+' 项无效';
else if((m=s.match(/^For review: (.+)$/)))out='待审核：'+m[1].split('; ').map(zhPhrase).join('；');
else if((m=s.match(/^(.+): (\d+) replicate\(s\), SOP requires (\d+)$/)))out=m[1]+'：'+m[2]+' 个重复孔，SOP 要求 '+m[3]+' 个';
else if((m=s.match(/^(.+): detected in (\d+)\/(\d+) replicates, SOP requires (\d+)$/)))out=m[1]+'：'+m[3]+' 个重复孔中 '+m[2]+' 个检出，SOP 要求 '+m[4]+' 个';
else if(s.includes(' · ')){const parts=s.split(' · '),translated=parts.map(zhPhrase);if(translated.some((x,i)=>x!==parts[i]))out=translated.join(' · ');}
else if(s.includes(', ')){const parts=s.split(', ');if(parts.every(x=>ROLES.includes(x)))out=parts.map(zhPhrase).join('、');}
return out===undefined?complete:raw.replace(s,out);
});
MISSY_HOOKS.use('i18n.phrase','i18n/console-reason-details',133,next=>function(value){const complete=next(value);if(complete!==String(value??''))return complete;const raw=String(value??''),s=raw.trim();let m,out;
if((m=s.match(/^Repeat analysis — replicate SD (.+) > (.+)$/)))out='重新检测－重复孔标准差 '+m[1]+' > '+m[2];
else if(s.includes('; ')){const parts=s.split('; '),translated=parts.map(zhPhrase);if(translated.some((x,i)=>x!==parts[i]))out=translated.join('；');}
return out===undefined?complete:raw.replace(s,out);
});
/* Source identities are literal even when a sample is named e.g. "Unknown". */
MISSY_HOOKS.use('mgRender','i18n/console-source-identities',999,next=>function(){const result=next(),identities=new Set([SOP.name]);for(const run of RUNS){for(const value of [run.file,runName(run),run.meta?.sourceSHA256,run.meta?.InstrumentID,run.meta?.SerialNumber])if(value)identities.add(String(value));for(const w of run.wells||[]){for(const key of ['sample','target'])if(w[key])identities.add(String(w[key]));if(w.sample&&w.target)identities.add(w.sample+' · '+w.target);}}for(const el of document.querySelectorAll('#mg-title,#mg-evidence,#mg-limits,#mg-rows .r>b,#mg-rows .r>span'))el.toggleAttribute('data-i18n-skip',identities.has(el.textContent.trim()));return result;});

Object.assign(ZH_TERMS,{'No Cq was stored for this target.':'此靶标无保存的 Cq。','Open File integrity on the page':'打开页面文件完整性','Open the formats view on the page':'打开页面开放格式','Open the results view on the page':'打开页面结果','Show details':'显示详情','Hide details':'隐藏详情','Open the load view on the page':'打开页面加载文件'});
MISSY_HOOKS.use('i18n.phrase','i18n/console-download-button',134,next=>function(value){const s=String(value??'');const m=s.match(/^Download (.+)$/);return m?'下载 '+zhPhrase(m[1]):next(value);});

Object.assign(ZH_TERMS,{'Open the SOP view on the page':'打开页面 SOP','Open the review view on the page':'打开页面审核','Draw the graph':'显示图表'});
/* Full known phrases win over partial dynamic patterns. */
MISSY_HOOKS.use('i18n.phrase','i18n/exact-phrase-priority',135,next=>function(value){const raw=String(value??''),s=raw.trim();return Object.prototype.hasOwnProperty.call(ZH_TERMS,s)?raw.replace(s,ZH_TERMS[s]):next(value);});
