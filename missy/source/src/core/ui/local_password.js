// Password is scoped to this page session. Never persisted, exported or logged.
let pcrdSessionPassword=null;
function pcrdForgetPassword(){pcrdSessionPassword=null;}
async function pcrdRequestPassword(){
 if(pcrdSessionPassword!==null)return pcrdSessionPassword;
 return new Promise(resolve=>{
 const d=document.createElement('dialog');d.style.cssText='background:#171f2e;color:#e5edf8;border:1px solid #40546c;border-radius:12px;width:min(560px,calc(100vw - 48px));box-sizing:border-box;max-height:90vh;overflow:auto;padding:24px';
 const h=document.createElement('h3');h.textContent='PCRD password / PCRD 密码';
 const p=document.createElement('p');p.textContent='Enter your PCRD password locally. It stays in memory until forgotten or the page closes. No upload or password is included in exports. / 密码仅保存在本页内存中，不上传或导出。';
 const input=document.createElement('input');input.type='password';input.autocomplete='off';input.setAttribute('aria-label','PCRD password');input.style.cssText='box-sizing:border-box;width:100%;padding:10px;margin-bottom:16px';
 const help=document.createElement('div');help.id='pcrd-password-help';help.style.cssText='line-height:1.5;overflow-wrap:anywhere;margin:0 0 16px;padding:12px;border:1px solid #40546c;border-radius:8px';
 const heading=document.createElement('strong');heading.textContent='Need a password? Prefer RDML? / 密码与 RDML 帮助';help.append(heading);
 const list=document.createElement('ul');list.style.cssText='padding-left:20px;margin:8px 0';
 for(const text of [
 'Standard PCRD files usually use a software-level password, not your CFX login or activation key. Ask your instrument administrator or Bio-Rad about authorised access through your licensed CFX installation. MISSY does not supply or recover passwords.',
 'Security Edition files may use a user-specific password. Ask the file owner or administrator.',
 'Without a password: open the original PCRD in licensed CFX software, then use its RDML export command. Menu names vary by CFX version. Include amplification and melt data where available.',
 'Save the exported .rdml file, cancel this prompt, and load the .rdml in MISSY using Load files. Select Read the files / Analyse as usual. Renaming .pcrd to .rdml does not convert it. RDML contains only data included by the exporter.',
 '标准 PCRD 通常使用软件级密码，并非 CFX 登录密码或激活密钥。请向仪器管理员或 Bio-Rad 咨询通过已获许可的 CFX 软件进行授权访问。MISSY 不提供或恢复密码。Security Edition 文件可能需要用户专用密码。',
 '无需密码的替代方法：在已获许可的 CFX 软件中打开 PCRD，导出 RDML（菜单因版本而异；如可用，请包含扩增和熔解数据）。保存 .rdml，取消本对话框，在 MISSY 的“加载文件”中选择该文件并读取分析。修改扩展名不能转换格式；RDML 仅包含导出的数据。'
 ]){const li=document.createElement('li');li.textContent=text;list.append(li);}help.append(list);
 input.setAttribute('aria-describedby',help.id);
 const ok=document.createElement('button');ok.textContent='Unlock / 解锁';const cancel=document.createElement('button');cancel.textContent='Cancel / 取消';cancel.style.marginLeft='10px';
 const finish=v=>{input.value='';d.close();d.remove();resolve(v);};
 ok.onclick=()=>{if(!input.value){input.focus();return;}if([...input.value].some(c=>c.charCodeAt(0)>255)){input.setCustomValidity('Password must use Latin-1 characters');input.reportValidity();return;}pcrdSessionPassword=input.value;finish(pcrdSessionPassword);};
 cancel.onclick=()=>finish(null);d.oncancel=e=>{e.preventDefault();finish(null);};input.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();ok.click();}};
 d.append(h,p,input,help,ok,cancel);document.body.append(d);d.showModal();input.focus();
 });
}
