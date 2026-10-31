()=>{
 /* Presentation CSS is embedded in the initial style block. */
 const select=document.getElementById('sop-preset');
 for(const role of ['screening','identification','quantification']){
  const group=document.createElement('optgroup');group.dataset.maraRole=role;group.label=ui('MARA '+role);
  for(const item of MARA_PROFILE_LIBRARY.filter(x=>x.role===role))group.append(new Option(item.profile.name,item.key));select.append(group);
 }
 const zip=document.createElement('button');zip.type='button';zip.className='ghost';zip.id='mara-download-profiles';zip.textContent='Download all MARA profiles (ZIP)';
 zip.onclick=()=>{const files=MARA_PROFILE_LIBRARY.map(x=>({name:x.key+'.json',data:JSON.stringify(x.profile,null,2)+'\n'}));files.push({name:'STANDARDS_INDEX.md',data:maraStandardsIndex()});files.push({name:'SHA256SUMS.txt',data:'# Exact-file SHA-256 (all bytes, formatting and final newline); NOT the embedded canonical profile sha256.\n'+files.map(x=>sha256Hex(new TextEncoder().encode(x.data))+'  '+x.name).join('\n')+'\n'});download('MARA1012_review_profiles.zip',makeStoredZip(files),'application/zip');};
 document.getElementById('sop-save').after(zip);
 const paint=()=>{for(const group of select.querySelectorAll('[data-mara-role]')){group.label=ui('MARA '+group.dataset.maraRole);for(const option of group.querySelectorAll('option')){option.setAttribute('data-i18n-skip','');option.textContent=ui(MARA_PROFILE_LIBRARY.find(x=>x.key===option.value).profile.name);}}};document.getElementById('language-select')?.addEventListener('change',paint);paint();
}