c=>{
    const mine=rows.filter(r=>r.ctrl===c&&c.expect!=="standard");if(!mine.length)return;
    const bad=mine.filter(r=>r.outcome==="Control fail");
    add(`Control result — ${c.name}`,c.onFail||R.controlsFail,!bad.length,bad.length?bad.map(r=>`${r.sample}/${r.target}: ${r.reason}`).join("; "):`${mine.length} control result(s) accepted`);
  }