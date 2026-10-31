()=>{document.addEventListener('DOMContentLoaded',()=>{
 const bar=document.querySelector('#statusbar .sb-right');if(!bar||document.getElementById('missy-command-menu'))return;
 const ids=['sb-command','sb-console','sb-assist','sb-save','sb-license','sb-toggle'];
 const buttons=ids.map(id=>document.getElementById(id)).filter(Boolean);if(!buttons.length)return;
 const group=document.createElement('span');group.id='missy-command-menu';
 const toggle=document.createElement('button');toggle.id='missy-command-menu-toggle';toggle.type='button';toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-controls','missy-command-menu-items');toggle.setAttribute('data-i18n-skip','');
 const items=document.createElement('span');items.id='missy-command-menu-items';items.hidden=true;items.setAttribute('role','group');
 const label=()=>{const name=document.body.classList.contains('lang-zh')?'命令':'Commands';toggle.textContent=(items.hidden?'▸ ':'◂ ')+name;items.setAttribute('aria-label',name);};
 const open=value=>{items.hidden=!value;toggle.setAttribute('aria-expanded',String(value));label();};
 toggle.onclick=()=>open(items.hidden);
 bar.insertBefore(group,buttons[0]);group.append(toggle,items);buttons.forEach(b=>items.append(b));
 group.addEventListener('keydown',e=>{if(e.key==='Escape'&&!items.hidden){e.preventDefault();e.stopPropagation();open(false);toggle.focus();}});
 new MutationObserver(label).observe(document.body,{attributes:true,attributeFilter:['class']});label();
 },{once:true});}