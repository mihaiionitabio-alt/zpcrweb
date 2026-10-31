(){const bits=total*8;const pad=new Uint8Array(((bl<56)?56-bl:120-bl)+8);pad[0]=0x80;
      const dv=new DataView(pad.buffer);dv.setUint32(pad.length-8,bits>>>0,true);dv.setUint32(pad.length-4,Math.floor(bits/2**32),true);
      this.update(pad);const out=new Uint8Array(16),dv2=new DataView(out.buffer);
      [a0,b0,c0,d0].forEach((w,k)=>dv2.setUint32(k*4,w>>>0,true));return hex(out)}