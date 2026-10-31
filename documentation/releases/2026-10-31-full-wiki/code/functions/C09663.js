function(text,...args){
 const command=String(text||'').trim().toLowerCase();
 if(REPORT_PREVIEW_RETURN&&/^(chart close|exit)$/.test(command)){mgClose();return true;}
 if(/^open page |^(load|sop|results|review|panel)$/.test(command))REPORT_PREVIEW_RETURN=null;
 return next(text,...args);
}