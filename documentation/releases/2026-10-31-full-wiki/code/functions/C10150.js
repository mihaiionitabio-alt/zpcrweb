()=>{
 const legal=document.getElementById('missy-public-license');if(!legal)return;
 const box=document.createElement('p');box.id='release-file-checksum';box.style.cssText='overflow-wrap:anywhere;white-space:normal';box.setAttribute('data-i18n-skip','');legal.insertBefore(box,legal.children[1]);
 let state='idle',digest='',version='',checked='';
 const render=()=>{const zh=UI_LANG==='zh';box.textContent=state==='done'?(zh?'服务器 HTML 完整文件 SHA-256：':'Served HTML full-file SHA-256: ')+digest+' · '+version+' · '+checked+(zh?'。按需获取并计算；不是配置文件哈希，也不是独立的来源真实性证明。':' · Retrieved and calculated on demand; not a profile hash or independent proof of origin.'):state==='loading'?(zh?'正在获取发布文件并计算 SHA-256…':'Retrieving release bytes and calculating SHA-256…'):state==='error'?(zh?'无法验证服务器文件；未显示校验值。':'Could not verify the served file; no checksum displayed.'):location.protocol==='file:'?(zh?'本地 HTML：浏览器无法自动重新读取文件字节；请使用系统 SHA-256 工具校验实际文件。':'Local HTML: the browser cannot automatically reread file bytes; use a system SHA-256 tool on the actual file.'):(zh?'展开许可说明以计算服务器 HTML 完整文件 SHA-256。':'Expand the licence panel to calculate the served HTML full-file SHA-256.');};
 legal.addEventListener('toggle',async()=>{if(!legal.open||state!=='idle'||!/^https?:$/.test(location.protocol))return;state='loading';render();try{
  const url=new URL(location.href);url.hash='';url.searchParams.set('_checksum_check',Date.now());
  const response=await fetch(url,{cache:'no-store'});if(!response.ok)throw Error('HTTP');const bytes=new Uint8Array(await response.arrayBuffer());
  const text=new TextDecoder().decode(bytes);version=text.match(/<meta name="software-version" content="([^"]+)">/)?.[1]||'';
  if(!version||version!==document.querySelector('meta[name=software-version]')?.content)throw Error('Release changed; reload first');
  const hash=await crypto.subtle.digest('SHA-256',bytes);digest=Array.from(new Uint8Array(hash),x=>x.toString(16).padStart(2,'0')).join('');checked=new Date().toISOString();state='done';
 }catch(e){state='error';}render();});
 new MutationObserver(render).observe(document.body,{attributes:true,attributeFilter:['class']});render();
}