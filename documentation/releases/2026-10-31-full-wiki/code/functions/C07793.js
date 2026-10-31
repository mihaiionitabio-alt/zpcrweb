h=>{const y=Y(h.y);if(!Number.isFinite(y))return;ctx.save();ctx.strokeStyle=h.colour;ctx.setLineDash([6,4]);
    ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(L,y);ctx.lineTo(W-R,y);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle=h.colour;
    ctx.textAlign="left";ctx.fillText(h.label,L+6,y-4);ctx.restore();}