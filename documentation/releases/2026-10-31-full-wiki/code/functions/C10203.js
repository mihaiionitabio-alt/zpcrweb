function statusFindings(){const rowCount=RUNS.reduce((n,r)=>n+(r.wells||[]).length,0),faults=APP_STATE.errorLog.length,chart=chartSummary();return [
 {rule:'loaded-record-count',source:'RUNS[].wells',en:RUNS.length+' runs; '+rowCount+' stored result rows.',zh:RUNS.length+' 次运行；'+rowCount+' 行存储结果。'},
 {rule:'active-profile-identity',source:'SOP.name / SOP.version',en:'Active profile '+label(SOP.name,'not named')+', version '+label(SOP.version,'not declared')+'.',zh:'当前配置 '+label(SOP.name,'未命名')+'，版本 '+label(SOP.version,'未声明')+'。'},
 {rule:'recorded-software-fault-count',source:'APP_STATE.errorLog',en:faults+' recorded software faults; these are not sample failures.',zh:'记录软件故障 '+faults+' 个，这不是样品失败数量。'},
 {rule:'current-chart-recorded-assessment',source:'ccCompute: pts / flags / spec / baselineReady, or graph coverage disclosure',en:chart.en,zh:chart.zh},
 {rule:'assessment-coverage',source:'Voice status implementation scope',en:'This report does not perform a new whole-dataset control, checksum, hardware or curve-shape assessment.',zh:'本报告不进行新的全数据集对照、校验和、硬件或曲线形状评估。'}
 ];}