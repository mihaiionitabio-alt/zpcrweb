e=>{bar.classList.toggle("open");
    e.target.setAttribute("aria-expanded",bar.classList.contains("open")?"true":"false");appStatusPaint();}