r=>"<tr>"+cols.map(c=>{
    const v=r[c.key];
    return `<td class="${c.n?"n":""}">${c.html?(v==null?"":v):esc(v==null?"":v)}</td>`;
  }).join("")+"</tr>"