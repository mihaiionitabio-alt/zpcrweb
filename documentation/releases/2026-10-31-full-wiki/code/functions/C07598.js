select=>{
    select.onchange=()=>{
      const key=select.dataset.controlRoot,value=select.value;
      if(value==="auto")delete REVIEW_STATE.controlCategoryOverrides[key];
      else REVIEW_STATE.controlCategoryOverrides[key]=value;
      renderReviewControls();
    };
  }