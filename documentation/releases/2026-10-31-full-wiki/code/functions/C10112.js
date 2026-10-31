(label,path,type='text',opts=[])=>{const v=get(path),key='experiment_analysis.'+path;let input;
  if(type==='select')input=`<select data-experiment-path="${key}">${opts.map(x=>`<option value="${esc(x)}"${String(v)===String(x)?' selected':''}>${esc(ui(EXPERIMENT_OPTION_LABELS[x]||x))}</option>`).join('')}</select>`;
  else input=`<input data-experiment-path="${key}" type="${type}"${type==='checkbox'?(v?' checked':''):` value="${esc(v??'')}"`}${type==='number'?' step="any"':''}>`;
  return `<label class="sop-field"><span>${esc(ui(label))}</span>${input}</label>`;
 }