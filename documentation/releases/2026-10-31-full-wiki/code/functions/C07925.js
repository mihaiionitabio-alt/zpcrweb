async function stageReaderFile(file,bytes,archive=null,path=null){
 const source={name:file.name,path:path||file.name,bytes,archive,zip:null};
 const reader=await detectReader(source);if(!reader)return null;
 return {...source,kind:reader.id};
}