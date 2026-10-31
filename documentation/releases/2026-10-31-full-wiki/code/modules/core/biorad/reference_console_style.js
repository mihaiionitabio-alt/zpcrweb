/* Preserve the original MISSY Console design. ZPCR contributes data, not a theme. */
graphViewportStyle.remove();unifiedStyle.remove();
MISSY_HOOKS.use("mgRender","core/biorad/reference_console_style.js:59",59, next => function(){next();for(const b of document.querySelectorAll('#mg-actions .mg-act')){const label=b.querySelector('.l');if(label&&b.dataset.graphOriginalLabel)label.textContent=b.dataset.graphOriginalLabel;b.querySelector('.k')?.removeAttribute('aria-hidden');}const actions=document.getElementById('mg-actions');actions.style.setProperty('--mg-action-columns',String(Math.ceil(actions.querySelectorAll('.mg-act').length/2)||1));});
/* Presentation CSS is embedded in the initial style block. */
