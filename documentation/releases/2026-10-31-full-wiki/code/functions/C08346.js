function modesInit(){
  const c=document.getElementById("sb-command");if(c)c.onclick=cmdToggle;
  const a=document.getElementById("sb-assist");if(a)a.onclick=astToggle;
  cmdInit();astInit();
}