function(value){
 const raw=String(value??''),s=raw.trim();
 const def=CC_CHARTS.find(c=>s.startsWith(c.title+' · '));
 if(def){const title=zhPhrase(def.title);if(title!==def.title)return raw.replace(s,title+s.slice(def.title.length));}
 return next(value);
}