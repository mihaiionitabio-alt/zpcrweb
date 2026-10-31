/* Terminology review R2, checked against local GB GMO texts and Roche zh-CN sources.
 * Display wording only; no changes to stored identities, roles, outcomes or calculations.
 * Keep 熔解 (Simplified Roche); do not substitute Taiwan-manual 溶解.
 */
Object.assign(ZH_TERMS,{
'Target':'靶标','Targets':'靶标','Analysis / target':'分析／靶标','Target / reference roles':'靶标／参照角色','Declared targets':'已声明靶标','Target names':'靶标名称',
'Inconclusive':'无法判定','Uncertain':'不确定','Control charts':'控制图','Repeat':'复测','Repeat analysis':'复测','Resolved role':'识别出的角色','Stored call':'保存的判定','Well':'孔','Wells':'孔','Plate setup':'多孔板设置',
'Uniformity calibration: edge-to-centre ratio':'均一性校准：边缘与中心之比','Xenon lamp intensity (reference channel)':'光源强度（参考通道）','Lamp reference channel (stability)':'光源参照通道（稳定性）','Lamp drift within a run':'运行内的光源强度漂移','Endogenous control':'内标准基因','Internal control':'内部对照','4 · Replicates and internal control':'4 · 重复孔与内部对照','LOD control':'检出限质控品','Download pseudonym mapping (CSV)':'下载假名映射表（CSV）','Tm Calling':'Tm Calling',
'Learned name pattern':'已学习的名称模式','Included':'已包含','Each experiment separately':'每个实验单独处理','All loaded experiments':'所有已加载的实验','10% of names (fewer suggestions)':'名称的 10%（建议较少）','15% of names (balanced)':'名称的 15%（平衡）','25% of names (more suggestions)':'名称的 25%（建议较多）','All names':'全部名称','Unusual names only':'仅异常名称','Common names only':'仅常见名称','Controls / standards':'对照／标准品','Root names (descriptive pooling only)':'词根名称（仅用于描述性归并）','All rising curves':'所有上升曲线','Review only':'仅供复核','Review status':'待复核','Replicate groups to review':'需复核的重复孔组',
'Sample, experiment, date or target':'样本、实验、日期或靶标','Microgravity console':'控制台','Page tabs':'页面标签页','command':'命令','Language and website downloads':'语言与网页下载',
'Drop .ixo, .eds, .edt, .rdml, .zpcr, .pcrd or .zip here':'将 .ixo、.eds、.edt、.rdml、.zpcr、.pcrd 或 .zip 拖到这里',
'Missy, RUO - A single-file offline HTML page for .ixo, .eds/.edt, .rdml, .zpcr and .pcrd experiment runs':'Missy（仅供研究使用）：支持 .ixo、.eds/.edt、.rdml、.zpcr 和 .pcrd 的单文件离线 HTML 页面',
'Quantification cycle terminology':'定量循环术语'
});
function zhReviewedWording(text){return String(text).replaceAll('均匀性','均一性').replaceAll('待审核','待复核').replaceAll('重新检测','复测').replaceAll('重复检测','复测').replaceAll('质控图','控制图').replaceAll('假名对照表','假名映射表').replaceAll('熔解温度调用','熔解温度判定');}
for(const key of Object.keys(ZH_TERMS)){let text=ZH_TERMS[key];if(typeof text!=='string')continue;text=zhReviewedWording(text);if(/target/i.test(key))text=text.replaceAll('目标','靶标');if(/internal.control|^IC\b/i.test(key))text=text.replaceAll('内控','内部对照').replaceAll('内部质控','内部对照');ZH_TERMS[key]=text;}
MISSY_HOOKS.use('i18n.phrase','i18n/review-r2-wording',140,next=>function(value){const out=next(value);return out===String(value??'')?out:zhReviewedWording(out);});
document.addEventListener('DOMContentLoaded',()=>{const legal=document.getElementById('missy-public-license');if(!legal)return;const box=document.createElement('details');box.id='missy-cq-glossary';box.innerHTML='<summary>Quantification cycle terminology</summary><p class="missy-license-en">Cq is MISSY’s common quantification-cycle label. Roche uses Cp (Crossing Point); the cited GB standards use Ct. Stored Cp/Ct and independently calculated Cq retain their stated source and method; the label does not make their algorithms equivalent.</p><p class="missy-license-zh">Cq 为 MISSY 使用的通用定量循环符号；罗氏软件记为 Cp 值（交叉点），所引 GB 标准记为 Ct 值。保存的 Cp／Ct 与独立计算的 Cq 保留各自来源和方法；统一符号不表示算法相同。内标准基因与外加内部对照分别保留，不根据名称推定其作用。</p>';legal.append(box);});
/* The same RefValue field appears across LC480 generations; it is not a lamp-life assay. */
CC_BY_ID.lamp_ref.idea='The reference-channel reading monitors excitation-source stability. The light-source technology and service criteria depend on the instrument generation; do not infer xenon-lamp life or absolute intensity from this field.';
CC_BY_ID.lamp_ref.reading='Compare matching instrument, protocol and filter-pair histories. A change requires review of the optical path, reference sensor and instrument service records; it does not identify a component fault by itself.';
Object.assign(ZH_TERMS,{
'The reference-channel reading monitors excitation-source stability. The light-source technology and service criteria depend on the instrument generation; do not infer xenon-lamp life or absolute intensity from this field.':'参照通道读数用于观察激发光源的稳定性。光源技术和维护标准取决于仪器代际；不能据此推断氙灯寿命或绝对光强。',
'Compare matching instrument, protocol and filter-pair histories. A change requires review of the optical path, reference sensor and instrument service records; it does not identify a component fault by itself.':'比较同一仪器、程序和滤光片组的历史记录。变化时需复核光路、参照传感器及维护记录；不能仅据此定位部件故障。',
'The instrument measures the lamp through a reference channel. The first reading of each run tracks lamp ageing (manual: warning at 50 %, lifetime ≈ 500 h).':'参照通道反映光源读数。50% 警告与约 500 小时寿命仅是第一代 LC480 氙灯的手册规则，不适用于 LC480 II 固态光源，也不能从补偿后的参照读数推定剩余寿命。',
'The fitted line predicts when 50 % of the starting value is reached — order the lamp before that. A point far below the line is a sudden lamp or light-guide fault.':'趋势线为描述性拟合，不能据此预测光源寿命或诊断部件故障。'
});
Object.assign(ZH_TERMS,{'Load experiment files to check their integrity.':'请加载实验文件以检查完整性。','Mismatches will appear here one under another when a file fails a stored checksum or archive-integrity comparison.':'校验和或文件容器完整性检查不一致时，将在此逐项列出。'});
Object.assign(ZH_TERMS,{'Load two or more experiments to compare grouped problems.':'请加载至少两个实验以比较问题分组。','idle':'未开始'});
