s=>samples.set(s.getAttribute("id")||"",{
    id:s.getAttribute("id")||"",type:rdmlText(s,"type")||"unkn",description:rdmlText(s,"description")})