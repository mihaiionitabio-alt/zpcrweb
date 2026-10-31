(jpeg,w,h,natW,natH){
      if(!cur)d.page();
      const id=d.images.length+1;d.images.push({jpeg,w:natW,h:natH});
      cur.uses.push(id);
      cur.ops.push(`q ${w.toFixed(2)} 0 0 ${h.toFixed(2)} ${PDF_PAGE.margin} ${(d.y-h).toFixed(2)} cm /Im${id} Do Q`);
      d.y-=h+8;
    }