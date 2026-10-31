function setLanguage(lang,announce){
  UI_LANG=lang==="zh"?"zh":"en";document.documentElement.lang=UI_LANG==="zh"?"zh-CN":"en";
  document.body.classList.toggle("lang-zh",UI_LANG==="zh");
  document.title="Missy, RUO - A single-file offline HTML page for .ixo, .eds/.edt, .rdml, .zpcr and .pcrd experiment runs";
  const select=document.querySelector("#language-select");if(select)select.value=UI_LANG;
  try{localStorage.setItem(languageStorageKey(),UI_LANG);}catch{}
  if(typeof refreshAll==="function")refreshAll();
  localizeDOM(document,true);
  if(announce&&UI_LANG==="zh")showCuteToast("中文界面已开启，开始愉快地检查数据吧！");
}