async()=>{
    const f=$("#csvfile").files[0];if(!f)return;
    acceptPasted(await f.text(),f.name);
  }