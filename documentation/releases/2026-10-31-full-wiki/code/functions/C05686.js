(sh,i)=>{
    const rows=sh.rows.map((r,ri)=>`<row r="${ri+1}">${(r||[]).map((v,ci)=>xlsxCell(xlsxCol(ci)+(ri+1),v)).join("")}</row>`).join("");
    files.push({name:`xl/worksheets/sheet${i+1}.xml`,data:`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${rows}</sheetData></worksheet>`});
    wbSheets.push(`<sheet name="${xesc(sh.name.slice(0,31))}" sheetId="${i+1}" r:id="rId${i+1}"/>`);
    rels.push(`<Relationship Id="rId${i+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i+1}.xml"/>`);
  }