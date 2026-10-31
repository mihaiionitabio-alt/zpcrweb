/* Footer disclosure only: move existing buttons, preserving their handlers. */
(()=>{document.addEventListener('DOMContentLoaded',()=>{
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
 },{once:true});})();
/* Existing animal nodes and SOP indicator are relocated without changing actions. */
(()=>{document.addEventListener('DOMContentLoaded',()=>{
 const bar=document.querySelector('#statusbar .sb-right'),friends=document.querySelector('.cute-friends'),profile=document.getElementById('console-profile');if(!bar||!friends)return;
 if(profile){profile.id='console-profile';bar.prepend(profile);}
 const group=document.createElement('span');group.id='missy-animal-menu';const toggle=document.createElement('button');toggle.id='missy-animal-menu-toggle';toggle.type='button';toggle.setAttribute('aria-controls','missy-animal-menu-items');toggle.setAttribute('aria-expanded','false');toggle.setAttribute('data-i18n-skip','');
 friends.id='missy-animal-menu-items';friends.hidden=true;friends.setAttribute('role','group');
 const label=()=>{const zh=document.body.classList.contains('lang-zh'),name=zh?'动物快捷方式':'Animal shortcuts';toggle.textContent=(friends.hidden?'▸ ':'◂ ')+name;friends.setAttribute('aria-label',name);};
 const open=value=>{friends.hidden=!value;toggle.setAttribute('aria-expanded',String(value));label();};toggle.onclick=()=>open(friends.hidden);group.append(toggle,friends);bar.insertBefore(group,document.getElementById('missy-command-menu'));
 group.addEventListener('keydown',e=>{if(e.key==='Escape'&&!friends.hidden){e.preventDefault();e.stopPropagation();open(false);toggle.focus();}});new MutationObserver(label).observe(document.body,{attributes:true,attributeFilter:['class']});label();
 },{once:true});})();
/* Sound disclosure relocates controls only; the looping audio engine is untouched. */
(()=>{document.addEventListener('DOMContentLoaded',()=>{
 const home=document.querySelector('#statusbar .sb-right'),dock=document.getElementById('missy-sound-dock'),sound=window.MISSY_COMPUTER_SOUND;if(!home||!dock||document.getElementById('missy-sound-menu'))return;
 const group=document.createElement('span');group.id='missy-sound-menu';group.setAttribute('data-i18n-skip','');const toggle=document.createElement('button');toggle.id='missy-sound-menu-toggle';toggle.type='button';toggle.setAttribute('aria-controls','missy-sound-dock');toggle.setAttribute('aria-expanded','false');dock.hidden=true;dock.setAttribute('role','group');
 const stop=document.createElement('button');stop.id='missy-footer-alert-stop';stop.type='button';stop.onclick=()=>sound.stopAlert();
 const master=document.getElementById('missy-startup-sound');if(master)dock.append(master);group.append(toggle,dock,stop);home.append(group);
 const label=()=>{const zh=document.body.classList.contains('lang-zh'),name=zh?'声音':'Sounds';toggle.textContent=(dock.hidden?'▸ ':'◂ ')+name;dock.setAttribute('aria-label',name);stop.textContent=zh?'■ 停止警报':'■ Stop alert';stop.hidden=!sound.alerting;};
 const open=value=>{dock.hidden=!value;toggle.setAttribute('aria-expanded',String(value));label();};toggle.onclick=()=>open(dock.hidden);group.addEventListener('keydown',e=>{if(e.key==='Escape'&&!dock.hidden){e.preventDefault();e.stopPropagation();open(false);toggle.focus();}});
 const modes=['mg','cmdm','astm'].map(id=>document.getElementById(id)).filter(Boolean),footers=new Map();for(const mode of modes){if(mode.id==='mg'){footers.set(mode,document.getElementById('mg-statusbar'));continue;}const footer=document.createElement('div');footer.className='missy-mode-sound-footer';mode.append(footer);footers.set(mode,footer);}
 const locate=()=>{const active=[...modes].reverse().find(e=>e.classList.contains('on')),host=active?footers.get(active):home;if(host&&group.parentElement!==host)host.append(group);};
 for(const mode of modes)new MutationObserver(locate).observe(mode,{attributes:true,attributeFilter:['class']});new MutationObserver(label).observe(document.body,{attributes:true,attributeFilter:['class']});document.addEventListener('missy-sound-state',label);label();locate();
 },{once:true});})();
