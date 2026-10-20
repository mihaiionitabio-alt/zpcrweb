from pathlib import Path
import re
r=Path(__file__).resolve().parent;s=(r/'index.before.html').read_text(encoding='utf8');reader=(r/'zpcr_reader.js').read_text(encoding='utf8');reader=reader[:reader.index("if (typeof module !== 'undefined'")]+'''return {parseZpcr,zpcrQcMetrics,zpcrWellMean,zpcrWellStats,zpcrStats,zpcrExpectedReads};'''
s=s.replace('accept=".ixo,.eds,.edt,.rdml,.zip"','accept=".ixo,.eds,.edt,.rdml,.zpcr,.zip"')
s=s.replace('    }else if(/\\.ixo$/i.test(f.name)){','    }else if(/\\.zpcr$/i.test(f.name)){\n      accepted.push({name:f.name,path:f.name,bytes,archive:null,zip:null,kind:"zpcr"});\n    }else if(/\\.ixo$/i.test(f.name)){')
s=s.replace('const entries=await readZip(ab,archive,/\\.(ixo|eds|edt)$/i);','''const zprobe=await readZip(ab,archive,/^RunInfo\\.xml$/i);
        if(zprobe.length){accepted.push({name:f.name,path:f.name,bytes,archive:null,zip:null,kind:"zpcr"});continue;}
        const entries=await readZip(ab,archive,/\\.(ixo|eds|edt|rdml|zpcr)$/i);''')
s=s.replace('entries.forEach(e=>{if(isEdsName(e.name))e.kind="eds";});','entries.forEach(e=>{if(isEdsName(e.name))e.kind="eds";else if(/\\.zpcr$/i.test(e.name))e.kind="zpcr";else if(/\\.rdml$/i.test(e.name))e.kind="rdml";});')
s=s.replace('      if(s.kind==="rdml"){','      if(s.kind==="zpcr"){\n        const r=await decodeZpcr(s);validateRunBoundary(r,s.name);RUNS.push(r);\n      }else if(s.kind==="rdml"){')
s=s.replace('not an .ixo, .eds, .edt, .rdml or .zip file','not an .ixo, .eds, .edt, .rdml, .zpcr or .zip file').replace('Drop .ixo, .eds, .edt or .zip here','Drop .ixo, .eds, .edt, .rdml, .zpcr or .zip here')
s=s.replace('finally{appTaskEnd(task);\n    if(APP_STATE.phase===', 'finally{appTaskEnd(task);if(typeof zpcrPaint==="function")zpcrPaint();\n    if(APP_STATE.phase===')
s=s.replace('STAGED=accepted;', 'STAGED=accepted;if(typeof zpcrPanel!=="undefined"){zpcrPanel.hidden=true;zpcrNav.hidden=true;}')
s=s.replace('.rdml experiment runs', '.rdml and .zpcr experiment runs')
# This feature is isolated: existing decoders, chart renderer and evaluation logic stay byte-identical.
addon='\n<script id="missy-zpcr-support">\nconst ZPCR=(()=>{\n'+reader+'\n})();\n'+(r/'zpcr_adapter.js').read_text(encoding='utf8')+'''\nconst zpcrOriginalRead=readStaged;readStaged=async function(...args){try{return await zpcrOriginalRead(...args);}finally{zpcrPaint();}};
const zpcrOriginalIntake=intake;intake=async function(...args){try{return await zpcrOriginalIntake(...args);}finally{zpcrPaint();}};
</script>\n'''
# after all scripts to avoid wrappers being superseded
addon=addon.replace('</script>',(r/'zpcr_control_charts.js').read_text(encoding='utf8')+'\n</script>')
addon=addon.replace('</script>',(r/'zpcr_modes_reports.js').read_text(encoding='utf8')+'\n</script>')
addon=addon.replace('</script>',(r/'zpcr_gates_dark.js').read_text(encoding='utf8')+'\n</script>')
addon=addon.replace('</script>',(r/'zpcr_guide_charts.js').read_text(encoding='utf8')+'\n</script>')
addon=addon.replace('</script>',(r/'zpcr_manual_endpoint.js').read_text(encoding='utf8')+'\n</script>')
addon=addon.replace('</script>',(r/'zpcr_compact_report.js').read_text(encoding='utf8')+'\n</script>')
addon=addon.replace('</script>',(r/'zpcr_comparative_modes.js').read_text(encoding='utf8')+'\n</script>')
addon=addon.replace('</script>',(r/'zpcr_single_measurement.js').read_text(encoding='utf8')+'\n</script>')
addon=addon.replace('</script>',(r/'graph_viewport.js').read_text(encoding='utf8')+'\n</script>')
addon=addon.replace('</script>',(r/'unified_shell.js').read_text(encoding='utf8')+'\n</script>')
addon=addon.replace('</script>',(r/'reference_console_style.js').read_text(encoding='utf8')+'\n</script>')
s=s.replace('accept=".ixo,.eds,.edt,.rdml,.zpcr,.zip"','accept=".ixo,.eds,.edt,.rdml,.zpcr,.pcrd,.zip"')
s=s.replace('    }else if(/\\.zpcr$/i.test(f.name)){','    }else if(/\\.pcrd$/i.test(f.name)){\n      accepted.push({name:f.name,path:f.name,bytes,archive:null,zip:null,kind:"pcrd"});\n    }else if(/\\.zpcr$/i.test(f.name)){')
s=s.replace('      if(s.kind==="zpcr"){','      if(s.kind==="pcrd"){\n        const r=await decodePcrd(s);validateRunBoundary(r,s.name);RUNS.push(r);\n      }else if(s.kind==="zpcr"){')
addon=addon.replace('</script>',(r/'pcrd_support.js').read_text(encoding='utf8')+'\n</script>')
s=s.replace('ixo|eds|edt|rdml|zpcr)', 'ixo|eds|edt|rdml|zpcr|pcrd)')
s=s.replace('else if(/\\.rdml$/i.test(e.name))e.kind="rdml";', 'else if(/\\.rdml$/i.test(e.name))e.kind="rdml";else if(/\\.pcrd$/i.test(e.name))e.kind="pcrd";')
s=s.replace('.rdml, .zpcr or .zip file', '.rdml, .zpcr, .pcrd or .zip file').replace('.rdml, .zpcr or .zip here', '.rdml, .zpcr, .pcrd or .zip here')
s=s.replace('accept=".ixo,.eds,.edt,.rdml,.zpcr,.pcrd,.zip"','accept=".ixo,.eds,.edt,.rdml,.zpcr,.pcrd,.xml,.zip"')
s=s.replace('/\\.pcrd$/i.test(f.name)', '/\\.pcrd(?:\\.xml)?$/i.test(f.name)')
addon=addon.replace('</script>',(r/'cfx_rdml_support.js').read_text(encoding='utf8')+'\n</script>')
addon=addon.replace('</script>',(r/'pcrd_independent.js').read_text(encoding='utf8')+'\n</script>')
s+=addon
# Isolated ZIP-reader naming patch: EDS stays closure-local; archive intake is explicit.
eds_begin=s.index('const EDS=(()=>{')
eds_return=s.index('return {parseEds,MD5,FLAGS,',eds_begin)
eds_end=s.index('})();',eds_return)+5
s=s[:eds_begin]+re.sub(r'\breadZip\b','readEdsZip',s[eds_begin:eds_end])+s[eds_end:]
s=re.sub(r'\breadZip\b','readExperimentArchive',s)
(r/'index.html').write_text(s,encoding='utf8')
print('Built bytes',len(s.encode()))




import html,json
legal=(r/'LICENSE').read_text(encoding='utf8')
notice=(r/'NOTICE.txt').read_text(encoding='utf8')
panel='<details id="missy-public-license" style="margin:16px 16px 100px;padding:12px;border:1px solid #40546c;border-radius:8px"><summary>GPL-3.0 · Attribution and source / 许可与源代码</summary><pre style="white-space:pre-wrap;overflow-wrap:anywhere">'+html.escape(notice)+'</pre><button id="missy-forget-password" type="button">Forget PCRD password / 清除密码</button><button id="missy-source-download" type="button">Download HTML source / 下载源代码</button><details><summary>GNU GPL version 3</summary><pre style="white-space:pre-wrap">'+html.escape(legal)+'</pre></details></details>'
s+=panel
source_snapshot=s
s+='<script>const MISSY_PUBLIC_SOURCE='+json.dumps(source_snapshot).replace('</','<\\/')+';document.getElementById("missy-forget-password").onclick=()=>{pcrdForgetPassword();};document.getElementById("missy-source-download").onclick=()=>{download("MISSY_PUBLIC_source.html", MISSY_PUBLIC_SOURCE,"text/html");};</script>'
(r/'index.html').write_text(s,encoding='utf8')


