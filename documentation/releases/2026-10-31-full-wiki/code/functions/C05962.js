()=>{try{SOP=sopNormalise(JSON.parse($("#sop-json").value));$("#sop-json-msg").textContent="";sopProfileEdited(true);}
    catch(e){$("#sop-json-msg").textContent="Not valid JSON: "+e.message;}}