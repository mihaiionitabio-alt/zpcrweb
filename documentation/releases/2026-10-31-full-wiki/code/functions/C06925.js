k=>{const p=k.split(" | ");if(p.length<2)return null;const target=p[0],label=p[1].trim().toUpperCase();
    const dm=label.match(/(?<!\d)(\d{1,2})\.(\d{1,2})\.(\d+)(?![\d.])/),mat=(label.match(/^[0-9]{3}[A-Z]{1,2}/)||[label.replace(/\d{1,2}\.\d{1,2}\.\d+/,"").trim().split(" ")[0]])[0];
    let ex="date not recorded";if(dm){const d=+dm[1],mo=+dm[2],y=+dm[3],t=new Date(Date.UTC(y,mo-1,d));
      ex=dm[3].length===4&&t.getUTCDate()===d&&t.getUTCMonth()===mo-1?"extracted "+t.toISOString().slice(0,10):"date unresolved";}
    const q=label.replace(/(?<!\d)\d{1,2}\.\d{1,2}\.\d+(?![\d.])/,"").replace(mat,"").replace(/\s+/g," ").trim();
    return {series:`${ccCanonTarget(target)} | ${mat}`,extract:ex+(q?" · "+q:"")};}