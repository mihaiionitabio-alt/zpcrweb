()=>{
 const bar=document.querySelector('#statusbar .sb-right'),friends=document.querySelector('.cute-friends'),profile=document.getElementById('console-profile');if(!bar||!friends)return;
 if(profile){profile.id='console-profile';bar.prepend(profile);}
 const group=document.createElement('span');group.id='missy-animal-menu';const toggle=document.createElement('button');toggle.id='missy-animal-menu-toggle';toggle.type='button';toggle.setAttribute('aria-controls','missy-animal-menu-items');toggle.setAttribute('aria-expanded','false');toggle.setAttribute('data-i18n-skip','');
 friends.id='missy-animal-menu-items';friends.hidden=true;friends.setAttribute('role','group');
 const label=()=>{const zh=document.body.classList.contains('lang-zh'),name=zh?'动物快捷方式':'Animal shortcuts';toggle.textContent=(friends.hidden?'▸ ':'◂ ')+name;friends.setAttribute('aria-label',name);};
 const open=value=>{friends.hidden=!value;toggle.setAttribute('aria-expanded',String(value));label();};toggle.onclick=()=>open(friends.hidden);group.append(toggle,friends);bar.insertBefore(group,document.getElementById('missy-command-menu'));
 group.addEventListener('keydown',e=>{if(e.key==='Escape'&&!friends.hidden){e.preventDefault();e.stopPropagation();open(false);toggle.focus();}});new MutationObserver(label).observe(document.body,{attributes:true,attributeFilter:['class']});label();
 }