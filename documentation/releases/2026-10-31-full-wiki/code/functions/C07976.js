e=>{
    if(UI_LANG!=="zh"||e.target.id==="language-select")return;
    if(e.target.matches("select")){
      const chosen=e.target.selectedOptions&&e.target.selectedOptions[0];
      if(chosen)showCuteToast(`已选择：${chosen.textContent.trim()} ✨`);
    }else if(e.target.matches('input[type="file"]')&&e.target.files&&e.target.files.length)
      showCuteToast(`已选择 ${e.target.files.length} 个文件，马上为你读取！`);
  }