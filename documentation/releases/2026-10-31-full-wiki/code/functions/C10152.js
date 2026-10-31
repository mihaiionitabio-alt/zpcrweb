async()=>{if(!legal.open||state!=='idle'||!/^https?:$/.test(location.protocol))return;state='loading';render();try{
  const url=new URL(location.href);url.hash='';url.searchParams.set('_checksum_check',Date.now());
  const response=await fetch(url,{cache:'no-store'});if(!response.ok)throw Error('HTTP');const bytes=new Uint8Array(await response.arrayBuffer());
  const text=new TextDecoder().decode(bytes);version=text.match(/<meta name="software-version" content="([^"]+)">/)?.[1]||'';
  if(!version||version!==document.querySelector('meta[name=software-version]')?.content)throw Error('Release changed; reload first');
  const hash=await crypto.subtle.digest('SHA-256',bytes);digest=Array.from(new Uint8Array(hash),x=>x.toString(16).padStart(2,'0')).join('');checked=new Date().toISOString();state='done';
 }catch(e){state='error';}render();}