/* Shared graph viewport for Console, Command and Assisted previews. */
let GRAPH_CHROME_HIDDEN=false;
const graphToggle=document.createElement('button');graphToggle.id='mg-chrome-toggle';graphToggle.type='button';graphToggle.hidden=true;document.getElementById('mg').append(graphToggle);
function graphChromePaint(){const root=document.getElementById('mg'),active=MG.open&&root.classList.contains('charting');root.classList.toggle('mg-focus',active&&GRAPH_CHROME_HIDDEN);graphToggle.hidden=!active;graphToggle.textContent=GRAPH_CHROME_HIDDEN?'Show header / controls':'Hide header / controls';graphToggle.title=graphToggle.textContent+' (H)';graphToggle.setAttribute('aria-expanded',String(!GRAPH_CHROME_HIDDEN));graphToggle.setAttribute('aria-controls','mg-top mg-actions');}
graphToggle.onclick=()=>{GRAPH_CHROME_HIDDEN=!GRAPH_CHROME_HIDDEN;graphChromePaint();};
MISSY_HOOKS.use("mgRender","core/biorad/graph_viewport.js:49",49, next => function(){next();graphChromePaint();if(!document.getElementById('mg').classList.contains('charting'))return;const labels={'previous':'‹ Prev','next':'Next ›','chart previous':'‹ Prev','chart next':'Next ›','chart close':'Close graph','zoom out':'−','zoom in':'+','zoom reset':'Reset '+Math.round((MG.zoom||1)*100)+'%','pan left':'←','pan right':'→','pan up':'↑','pan down':'↓','theme light':'Light','theme dark':'Dark','exit':'Return'};for(const b of document.querySelectorAll('#mg-actions button[data-cmd]')){const cmd=b.dataset.cmd,label=b.querySelector('.l');if(!b.dataset.graphOriginalLabel)b.dataset.graphOriginalLabel=label?.textContent||b.textContent;b.setAttribute('aria-label',b.dataset.graphOriginalLabel);b.title=b.dataset.graphOriginalLabel;if(labels[cmd]&&label)label.textContent=labels[cmd];}});
document.addEventListener('keydown',e=>{if(!MG.open||!document.getElementById('mg').classList.contains('charting')||e.ctrlKey||e.altKey||e.metaKey||e.target.closest?.('input,textarea,select,[contenteditable="true"]'))return;if(e.key.toLowerCase()==='h'){e.preventDefault();GRAPH_CHROME_HIDDEN=!GRAPH_CHROME_HIDDEN;graphChromePaint();}});
const graphViewportStyle=document.createElement('style');graphViewportStyle.textContent=`
#mg.charting{height:100dvh;min-height:0}
#mg.charting #mg-top{padding:5px 195px 5px 10px;gap:4px}
#mg.charting #mg-mode,#mg.charting #mg-facts,#mg.charting #mg-nav>button{display:none!important}
#mg.charting #mg-nav{display:grid!important;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:6px;padding:0}
#mg.charting #zc-single-picker{grid-column:1;grid-row:1;padding:0!important}
#mg.charting #zpcr-console-endpoint{grid-column:2;grid-row:1;margin:0!important;padding:3px!important}
#mg.charting #mg-body{flex:1 1 0;min-height:0}
#mg.charting #mg-card{min-height:0}
#mg.charting #mg-chart{padding:3px!important;min-height:0}
#mg.charting #mg-chart-stage{height:100%;min-height:0}
#mg.charting #mg-gcap{font-size:13px;padding:2px 0 3px}
#mg.charting #mg-actions{flex:0 0 auto;flex-wrap:nowrap;gap:5px;padding:5px 8px;overflow-x:auto;border-top:1px solid #28394d;align-items:center}
#mg.charting #mg-actions .mg-act{flex:0 0 auto;min-width:32px;min-height:32px;height:32px;display:inline-flex;flex-direction:row;align-items:center;justify-content:center;gap:0;padding:0 10px;border-width:1px;border-radius:5px;white-space:nowrap}
#mg.charting #mg-actions .mg-act .k{display:none}
#mg.charting #mg-actions .mg-act .l{font-size:13px;font-weight:600;line-height:1}
#mg.charting #mg-statusbar{min-height:21px;padding:2px 10px;font-size:11px}
#mg-chrome-toggle{position:absolute;right:8px;top:8px;z-index:30;background:#132235;color:#e7edf5;border:1px solid #58718b;border-radius:6px;padding:7px 10px;font:13px Arial,sans-serif;cursor:pointer}
#mg-chrome-toggle[hidden]{display:none}
#mg.mg-focus #mg-top,#mg.mg-focus #mg-actions,#mg.mg-focus #mg-gcap{display:none!important}
#mg.mg-focus #mg-statusbar{position:absolute;left:7px;bottom:4px;z-index:15;min-height:19px;padding:2px 5px;border:0;border-radius:4px;background:rgba(8,12,20,.85);pointer-events:none}
@media(max-width:900px){#mg.charting #mg-top{padding:42px 8px 5px}#mg.charting #mg-nav{grid-template-columns:1fr}#mg.charting #zpcr-console-endpoint{grid-column:1;grid-row:2}#mg.charting #zc-single-picker{grid-template-columns:1fr}#mg-chrome-toggle{font-size:12px;padding:6px 8px}}
`;
document.head.append(graphViewportStyle);
MISSY_HOOKS.use("zpcrPaint","core/biorad/graph_viewport.js:50",50, next => function(){next();zpcrNav.textContent='9 · ZPCR data / exports';});
zpcrNav.textContent='9 · ZPCR data / exports';
