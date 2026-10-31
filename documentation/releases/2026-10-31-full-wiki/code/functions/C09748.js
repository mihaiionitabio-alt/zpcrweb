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