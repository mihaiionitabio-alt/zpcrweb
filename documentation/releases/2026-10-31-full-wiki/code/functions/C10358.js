function detail(f,localized){
  const choose=(en,zh)=>localized?text(en,zh):en;
  if(f.code==='results'){
   const c=JSON.parse(f.detail);return choose('Amplification ','扩增 ')+c.amplification+choose('; melting ','；熔解 ')+c.melting+choose('; relative ','；相对定量 ')+c.relative+choose('; genotype ','；基因分型 ')+c.genotype+choose('; other ','；其他 ')+c.other;
  }
  if(f.detail==='native_mean_sd_min_max')return choose('Native mean, SD, minimum and maximum; contributing count not established.','原始均值、标准差、最小值和最大值；未确定构成该读数的测量次数。');
  if(f.detail.startsWith('native_component_count:'))return f.detail.split(':')[1]+choose(' native components; missing components are not zero.',' 个原始组分；缺失组分不等于零。');
  if(f.detail==='decoded_temperature_fields_or_diagnostics')return choose('Temperature fields or derived diagnostics are present; measurement basis remains source-specific.','已提供温度字段或派生诊断值；测量依据以源文件为准。');
  if(f.detail==='decoded_optical_fields')return choose('Acquisition, dark/reference or optical-setting fields are present; calibration validity is not established.','已提供采集、暗信号／参比或光学设置字段；尚不能据此确认校准有效性。');
  if(f.code==='limits')return ({
   locked:choose('No decoded measurements; access credentials are not included.','未解码测量数据；不包含访问凭据。'),
   template:choose('Setup only; no completed acquisition is implied.','仅有设置；不表示已完成数据采集。'),
   zpcr:choose('Raw acquisitions; an optical channel does not establish dye or sample identity.','原始采集数据；光学通道不能据此确定染料或样本标识。'),
   pcrd:choose('Raw acquisitions; independently calculated Cq/Tm belong to a separate method.','原始采集数据；独立计算的 Cq／Tm 属于另一分析方法。'),
   exchange:choose('Exchange-file evidence; no new inference about the analysis producer is applied.','交换文件中的记录；不对分析结果的生成方作新的推断。'),
   native:choose('Stored native results and decoded fields; complete numeric precision and processing history may be unavailable.','保存的原始结果及已解码字段；完整数值精度和处理历史可能未提供。')
  })[f.detail];
  return f.detail;
 }