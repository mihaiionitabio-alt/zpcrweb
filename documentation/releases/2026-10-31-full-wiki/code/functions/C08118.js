p=>{
        const body=enc.encode(p.ops.join("\n"));
        objs.push({dict:`<< /Length ${body.length} >>`,stream:body});
      }