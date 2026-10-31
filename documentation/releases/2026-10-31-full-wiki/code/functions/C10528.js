function snapshot(){
  return {build:typeof APP_VERSION==='undefined'?null:APP_VERSION,model:typeof MISSY_MODEL_VERSION==='undefined'?null:MISSY_MODEL_VERSION,
   readers:(typeof MISSY_READERS==='undefined'?[]:MISSY_READERS).map(r=>({reader_id:r.id,adapter_version:r.version,extensions:Array.isArray(r.extensions)?r.extensions.join(', '):''}))};
 }