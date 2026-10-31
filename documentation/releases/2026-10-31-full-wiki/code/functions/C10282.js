function requestEcho(kind){
  const fixed={
   'nav:chart next':['Next chart.','下一张图。'], 'nav:next run':['Next run.','下一个运行。'],
   'nav:zoom in':['Zoom in.','放大。'], 'nav:zoom reset':['Reset view.','重置视图。'],
   'theme:light':['Light chart background.','浅色图表背景。'], 'theme:dark':['Dark chart background.','深色图表背景。'],
   'q:analyse':['Chart review.','图表审核。'], 'q:chartlist':['Chart directory.','图表目录。'],
   'f:report':['Status report.','状态报告。'], 'f:fullreport':['Full status report.','完整状态报告。'],
   'data:results':['Read the results.','读取结果。'], 'data:controls':['Check the controls.','检查对照。'],
   'data:summary':['Run summary.','运行摘要。'], 'data:diagnostic':['Diagnostic review.','诊断审核。'],
   'ship:damage':['Damage report.','问题报告。'], 'ship:security':['Integrity review.','完整性审核。']
  };
  const families={
   'q:where':['Current station.','当前位置。'],'q:help':['Available functions.','可用功能。'],
   'q:profile':['Method identification.','方法标识。'],'q:operator':['Operator record.','操作人员记录。'],
   'q:formats':['Supported inputs.','支持的输入。'],'q:build':['Build identification.','版本标识。'],
   'data:rules':['Method requirements.','方法要求。'],'data:acceptance':['Profile assessment.','配置判定。'],
   'data:applicability':['Method scope check.','方法适用性检查。'],'data:cohort':['Comparison scope.','比较范围。'],
   'data:references':['Reference assignments.','参照设置。'],'data:protocols':['Protocol records.','程序记录。'],
   'data:origin':['Source records.','来源记录。'],'data:exportscope':['Export contents.','导出内容。'],
   'f:clock':['Device clock.','设备时钟。'],'f:uptime':['Session duration.','会话时长。'],
   'f:listfiles':['File directory.','文件目录。'],'f:listsamples':['Sample directory.','样品目录。'],
   'f:memory':['Browser memory report.','浏览器内存报告。']
  };Object.assign(fixed,families);
  if(fixed[kind])return {en:fixed[kind][0],zh:fixed[kind][1]};
  const chart=String(kind).match(/^chart:(\d+)$/);if(chart)return {en:'Display chart '+chart[1]+'.',zh:'显示第 '+chart[1]+' 张图。'};
  return null;
 }