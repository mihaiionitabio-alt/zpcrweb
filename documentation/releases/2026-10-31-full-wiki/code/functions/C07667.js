(r,i)=>
    `<li class="integrity-record"><div class="integrity-record-head">
       <span class="integrity-index">${i+1}</span>
       <b class="integrity-file" title="${esc(r.file)}">${esc(r.file)}</b>
       <span class="integrity-badge">file integrity</span></div>
     <dl class="integrity-fields">
       <div><dt>Check</dt><dd>${esc(r.type)}</dd></div>
       <div><dt>Expected</dt><dd class="integrity-value">${esc(r.expected)}</dd></div>
       <div><dt>Observed</dt><dd class="integrity-value">${esc(r.actual)}</dd></div>
       <div><dt>Meaning</dt><dd>${esc(r.detail)}</dd></div>
     </dl></li>`