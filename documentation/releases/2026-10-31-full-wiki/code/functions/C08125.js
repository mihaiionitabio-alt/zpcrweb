function svgToJpeg(svgText,scale){
  return new Promise(resolve=>{
    const m=String(svgText).match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
    const W=m?+m[1]:900,H=m?+m[2]:450,s=scale||2;
    const img=new Image();
    img.onload=()=>{
      const cv=document.createElement("canvas");cv.width=Math.round(W*s);cv.height=Math.round(H*s);
      const ctx=cv.getContext("2d");ctx.fillStyle="#fff";ctx.fillRect(0,0,cv.width,cv.height);
      ctx.drawImage(img,0,0,cv.width,cv.height);
      const url=cv.toDataURL("image/jpeg",0.9),b64=url.slice(url.indexOf(",")+1),bin=atob(b64);
      const bytes=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);
      resolve({bytes,w:cv.width,h:cv.height,natW:W,natH:H});
    };
    img.onerror=()=>resolve(null);
    img.src="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(svgText);
  });
}