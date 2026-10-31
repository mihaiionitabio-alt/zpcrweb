function(value){const raw=String(value??''),s=raw.trim();let m,out;
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
}