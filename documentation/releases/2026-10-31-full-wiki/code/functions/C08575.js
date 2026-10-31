function mlCanonical(v){
  if(v===null||typeof v!=="object")return JSON.stringify(v===undefined?null:v);
  if(Array.isArray(v))return "["+v.map(mlCanonical).join(",")+"]";
  return "{"+Object.keys(v).sort().map(k=>JSON.stringify(k)+":"+mlCanonical(v[k])).join(",")+"}";
}