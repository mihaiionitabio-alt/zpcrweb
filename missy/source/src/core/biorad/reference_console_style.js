/* Preserve the original MISSY Console design. ZPCR contributes data, not a theme. */
graphViewportStyle.remove();unifiedStyle.remove();
const referenceConsoleRender=mgRender;mgRender=function(){referenceConsoleRender();for(const b of document.querySelectorAll('#mg-actions .mg-act')){const label=b.querySelector('.l');if(label&&b.dataset.graphOriginalLabel)label.textContent=b.dataset.graphOriginalLabel;b.querySelector('.k')?.removeAttribute('aria-hidden');}const actions=document.getElementById('mg-actions');actions.style.setProperty('--mg-action-columns',String(Math.ceil(actions.querySelectorAll('.mg-act').length/2)||1));};
const referenceConsoleStyle=document.createElement('style');referenceConsoleStyle.textContent=`
#mg.charting #mg-actions{display:grid;grid-template-columns:repeat(var(--mg-action-columns,8),minmax(0,1fr));grid-template-rows:repeat(2,minmax(88px,auto));grid-auto-flow:row;gap:16px;align-items:stretch;flex:0 0 auto}
#mg.charting #mg-actions .mg-act{min-width:0;width:100%;height:100%;box-sizing:border-box}
#mg.charting #mg-actions .mg-act .l{display:block;white-space:normal;overflow-wrap:anywhere;max-width:100%;min-width:0}
@media(max-width:900px){#mg.charting #mg-actions{grid-template-columns:repeat(var(--mg-action-columns,8),minmax(145px,1fr));overflow-x:auto}}
#mg-top,#mg-card,#mg-title,#mg-state,#mg-rows .r{min-width:0}
#mg-gcap{box-sizing:border-box;max-width:100%;white-space:normal;overflow-wrap:anywhere;line-height:1.3}
#mg-chart-stage{min-width:0;max-width:100%}
#mg-title,#mg-state,#mg-rows .r b,#mg-rows .r span{overflow-wrap:anywhere}
#mg-rows .r b,#mg-rows .r span{min-width:0}
#console-selectors{display:grid;grid-template-columns:minmax(180px,1fr) minmax(250px,2fr) 220px;gap:10px;flex:1 1 100%;width:100%}
#console-selectors label{display:flex;gap:7px;align-items:center;color:#cfe0f5;font-size:14px;min-width:0}
#console-selectors select{width:100%;min-width:0;padding:8px;background:#111c2a;color:#dbe5f5;border:1px solid #2b3a4d;border-radius:7px;font:inherit}
#console-selectors input{width:62px;padding:8px;background:#111c2a;color:#dbe5f5;border:1px solid #2b3a4d;border-radius:7px;font:inherit}
#console-selectors button{white-space:nowrap;padding:8px;background:#0b111b;color:#cfe0f5;border:1px solid #2b3a4d;border-radius:7px;font:inherit}
#mg-chrome-toggle{position:absolute;right:8px;top:8px;z-index:30;background:#0b111b;color:#cfe0f5;border:1px solid #2b3a4d;border-radius:7px;padding:8px 12px;font:14px Arial,sans-serif;cursor:pointer}
#mg-chrome-toggle[hidden]{display:none}
#mg.mg-focus #mg-top,#mg.mg-focus #mg-actions,#mg.mg-focus #mg-gcap{display:none!important}
#mg.mg-focus #mg-body,#mg.mg-focus #mg-card,#mg.mg-focus #mg-chart{min-height:0;flex:1}
#mg.mg-focus #mg-chart{padding:3px}
#mg.mg-focus #mg-statusbar{position:absolute;left:7px;bottom:4px;z-index:15;min-height:19px;padding:2px 5px;border:0;border-radius:4px;background:rgba(8,12,20,.85);pointer-events:none}
#assisted-endpoint input{width:70px}#source-provenance pre{font:inherit}
@media(max-width:900px){#console-selectors{grid-template-columns:1fr}}
`;document.head.append(referenceConsoleStyle);
