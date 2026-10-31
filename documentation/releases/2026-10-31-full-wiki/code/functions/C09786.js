function mascotGo(id){
 if(id.startsWith('graph:')){const target=id.slice(6),item=selCatalogue().find(x=>x.id===target);if(!item||!reportItemVisible(item)){MASCOT_OPEN_SETTINGS('Load the matching files to open this graph.');return;}GRAPH_CHROME_HIDDEN=true;unifiedBrowse(target);return;}
 mgClose();cmdClose();astClose();
 if(id==='section:license'){document.getElementById('missy-public-license').open=true;document.getElementById('missy-public-license').querySelector('summary').focus();}
 else if(id.startsWith('page:')){showTab(id.slice(5));window.scrollTo({top:0,behavior:'smooth'});}
 else if(id==='mode:command')cmdOpen();else if(id==='mode:assisted')astOpen();else if(id==='mode:console')mgOpen();
}