key=>{const m=text.match(new RegExp("\\["+key+"\\][\\s\\S]*?x1-m1=<<eof\\r?\\n([\\s\\S]*?)\\r?\\neof"));
    return m?m[1].trim().split(/\r?\n/).map(r=>r.split(",").map(Number)):null;}