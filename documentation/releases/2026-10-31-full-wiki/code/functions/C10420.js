function snapshot(run,index=0,choice=selections.get(selectionKey(run))||initial()){
  const out={view:index+1,filename:run.file||'',status:'not_exposed',reason:run.pcrdLocked?'locked':run.isTemplate?'template':'no_native',selection:{...choice},entries:[]};
  if(run.pcrdLocked||run.isTemplate)return out;
  const raw=run.zpcr||run.pcrd;if(!Array.isArray(raw?.reads)||!raw.reads.length)return out;
  if(!integer(choice.read,raw.reads.length)){out.reason='invalid_selection';return out;}
  const read=raw.reads[choice.read],width=run.zpcr?4:read.tupleWidth,data=run.zpcr?read.wellData:read.originalData,dark=run.zpcr?read.darkData:read.originalDark;
  if(![read.rows,read.cols,read.channels].every(n=>Number.isSafeInteger(n)&&n>0)||![1,2,4].includes(width)||!array(data)||data.length!==read.rows*read.cols*read.channels*width){out.reason='unsupported_layout';return out;}
  if(!integer(choice.channel,read.channels)||!integer(choice.row,read.rows)||!integer(choice.column,read.cols)){out.reason='invalid_selection';return out;}
  Object.assign(out,{status:'provided',reason:'',format:run.zpcr?'zpcr':'pcrd',read_name:read.name||'',step:read.step??'',cycle:read.cycle??'',read_count:raw.reads.length,rows:read.rows,columns:read.cols,channels:read.channels,width,role:'unknown'});
  const grid=raw.grid||{};
  if(Number.isSafeInteger(grid.sampleRows)&&Number.isSafeInteger(grid.referenceRows)&&grid.sampleRows>=0&&grid.referenceRows>=0&&grid.sampleRows+grid.referenceRows===read.rows)out.role=choice.row<grid.sampleRows?'sample_grid':'reference_grid';
  const base=((choice.channel*read.rows+choice.row)*read.cols+choice.column)*width;
  const push=(kind,source,at,a,k)=>{const value=a?.[at];out.entries.push({kind,source_array:source,source_index:at,component:run.zpcr?['mean','sd','min','max'][k]:'native_'+(k+1),value:numeric(value),state:typeof value!=='number'?'unavailable':Number.isFinite(value)?'finite':'native_nonfinite'});};
  for(let k=0;k<width;k++)push('position',run.zpcr?'wellData':'originalData',base+k,data,k);
  const darkAvailable=array(dark)&&dark.length===read.channels*width;
  for(let k=0;k<width;k++)push('dark',run.zpcr?'darkData':'originalDark',choice.channel*width+k,darkAvailable?dark:null,k);
  return out;
 }