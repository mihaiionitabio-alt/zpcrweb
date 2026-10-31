function valueText(f,localized){
  const pick=(en,zh)=>localized?t(en,zh):en,v=f.value;
  if(v===null)return '';
  if(v?.code==='boolean')return v.value?pick('True','是'):pick('False','否');
  if(v?.code==='scope')return v.value==='locked'?pick('Source bytes and encrypted inventory only; payload remains locked.','仅有源文件字节和加密文件清单；有效载荷仍处于加密状态。'):pick('Existing reader evidence only. Integrity checks do not authenticate the producer, establish calibration validity or certify a sample result.','仅显示已有读取器记录。完整性检查不能认证生成方、证明校准有效性或认证样本结果。');
  return String(v);
 }