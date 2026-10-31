e=>{
    if(UI_LANG!=="zh")return;
    const button=e.target.closest("button[data-tab],button[data-review]");
    if(button)showCuteToast(`已打开：${button.textContent.trim()} 🌸`);
  }