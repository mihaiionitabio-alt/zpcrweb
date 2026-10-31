function explanation(method,localized){
  const pick=(en,zh)=>localized?t(en,zh):en;
  const m={
   display_only:pick('Version of this MISSY display; not the instrument analysis algorithm.','此 MISSY 显示版本；不代表仪器分析算法版本。'),
   model_only:pick('Existing reader model; not MISSY standard conformance.','已有读取器模型；不代表符合 MISSY 标准。'),
   source_sha256:pick('SHA-256 of original source bytes. Identifies bytes; does not authenticate their origin.','源文件字节的 SHA-256。用于标识字节内容；不能认证其来源。'),
   crc_flag:pick('Existing reader CRC flag only; consult the original integrity view for coverage. False does not alone establish corruption.','仅显示已有读取器的 CRC 标志；检查范围请查看原完整性视图。否值本身不能证明文件损坏。'),
   eds_crc:pick('Existing EDS all-entry CRC flag; no new archive check is performed.','已有 EDS 全部条目的 CRC 标志；此处不执行新的压缩包检查。'),
   crc_unknown:pick('No CRC coverage is inferred from the filename or source hash.','不根据文件名或源文件哈希推断 CRC 检查范围。'),
   ixo_object:pick('Stored IXO object-stream checksum versus existing computed checksum; not a signature.','保存的 IXO 对象流校验值与已有计算值的比较；不属于数字签名。'),
   eds_object:pick('Existing EDS stored/computed archive-member checksum comparison; not a signature.','已有 EDS 压缩包成员校验值的保存值与计算值比较；不属于数字签名。'),
   pcrd_protocol_utf8:pick('PCRD: SHA-256 of UTF-8 decoded protocolText. Format-specific; not a universal protocol identity.','PCRD：解码后 protocolText 的 UTF-8 字节的 SHA-256。仅适用于该格式；不是通用协议标识。'),
   cfx_protocol_xml_utf8:pick('CFX RDML: SHA-256 of UTF-8 decoded protocolXML. Serialization-specific, not XML canonicalization.','CFX RDML：解码后 protocolXML 的 UTF-8 字节的 SHA-256。取决于序列化形式；未进行 XML 规范化。'),
   zpcr_member_frame_v1:pick('ZPCR native method: SHA-256 of little-endian uint32 read count, then ordered raw members each framed by little-endian uint32 byte length. Filenames excluded.','ZPCR 原始方法：按小端 uint32 编码读取次数，再按顺序对每个原始成员写入小端 uint32 字节长度及其字节，计算 SHA-256。不包含文件名。'),
   pcrd_native_json_v1:pick('PCRD native method: SHA-256 of UTF-8 JSON.stringify([rows, cols, channels, reads.map(r => [r.step, r.cycle, r.originalData, r.originalDark])]).','PCRD 原始方法：对 UTF-8 编码的 JSON.stringify([rows, cols, channels, reads.map(r => [r.step, r.cycle, r.originalData, r.originalDark])]) 计算 SHA-256。'),
   count_not_validity:pick('PCRD decoded calibrationCollection/CalibrationData count only. Zero does not mean uncalibrated; a positive count does not establish validity, expiry or traceability.','仅为 PCRD 解码后 calibrationCollection/CalibrationData 的记录数。零不表示未校准；非零也不能证明校准有效性、有效期或溯源性。'),
   audit_unknown:pick('No authenticated audit history is exposed by this inventory. Instrument logs are not treated as authenticated audit records.','此清单未提供经过身份认证的审计历史。不将仪器日志视为经过身份认证的审计记录。')
  };
  return m[method]||'';
 }