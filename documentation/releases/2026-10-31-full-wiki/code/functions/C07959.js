()=>{
    const task=intake([...file.files]);
    Promise.resolve(task).finally(()=>{
      if(typeof MG!=="undefined"&&MG.open){mgRefresh();mgRender();}
    });
  }