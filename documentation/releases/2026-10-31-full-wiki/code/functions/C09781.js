function mascotDestinations(){return [
 ...[['load','Load files'],['sop','SOP'],['results','Results'],['panel','Control panel'],['graphs','Graphs'],['review','Quality & forensic review'],['export','Open formats'],['integrity','File integrity']].map(([id,label])=>({id:'page:'+id,label:ui(label)})),
 {id:'section:license',label:ui('GPL · Source')},
 ...[['command','Command mode'],['assisted','Assisted mode'],['console','Console mode']].map(([id,label])=>({id:'mode:'+id,label:ui(label)})),
 ...(APP_STATE.phase==='ready'?selCatalogue():[]).filter(x=>x.kind==='image'&&reportItemVisible(x)).map(x=>({id:'graph:'+x.id,label:(x.id.startsWith('cc:')?(CC_BY_ID[x.id.slice(3)]?.code+' · '):'')+ui(x.title),group:x.id.startsWith('cc:')?ui('Control charts'):ui('Graphs')}))
];}