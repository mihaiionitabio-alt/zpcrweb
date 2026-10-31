async function go(i,{silent=false}={}){
   if(actionBusy||!api||!overlay.isConnected)return;const own=++token;audio?.pause();ended=false;i=Math.max(0,Math.min(api.steps.length-1,i));actionBusy=true;
   try{
    if(i!==index+1){api?.stop();await loadFrame();for(let j=0;j<i;j++)await api.go(j);}
    const descriptor=api.steps[i],clip=MISSY_VOICE_DEMO_AUDIO.steps.find(x=>x.id===i);const begin=performance.now();
    heading.textContent='PART '+descriptor.chapter+'/3 · '+descriptor.title;commandBox.textContent=(descriptor.type==='command'?'Operator: ':'Scripted demo action: ')+descriptor.say;answerBox.textContent='';select.value=String(i);progress.textContent=(i+1)+' / '+api.steps.length+' · '+(MISSY_VOICE_DEMO_AUDIO.durationSeconds?Math.ceil(MISSY_VOICE_DEMO_AUDIO.durationSeconds/60)+' min':'preflight');
    stamp('step-start',i,{say:descriptor.say});actionBusy=false;
    if(!silent){if(!clip)throw Error('Recorded dialogue is not built yet.');if(!await wait(350,own))return;await play(clip.operator,own,'operator',i);if(own!==token)return;}
    actionBusy=true;const step=await api.go(i);if(own!==token)return;index=i;answerBox.textContent=T(step.answer.en,step.answer.zh);
    if(clip&&!window.__MISSY_VOICE_CAPTURE_ONLY&&(clip.say!==step.say||clip.answer.en!==step.answer.en||clip.answer.zh!==step.answer.zh))throw Error('Recorded answer differs from this live demo step. Audio playback stopped.');
    stamp('action-applied',i,{say:step.say,intent:step.intent,answer:step.answer});const link=overlay.querySelector('[data-vd=report]');link.hidden=!api.reportURL;if(api.reportURL){link.href=api.reportURL;link.target='_blank';link.rel='noopener';}actionBusy=false;
    if(silent)return step;
    if(!await wait(250,own))return;await play(clip.missy,own,'missy',i);if(own!==token)return;
    const remain=Math.max(900,clip.durationSeconds*1000-(performance.now()-begin));if(await wait(remain,own)){stamp('step-end',i);if(i<api.steps.length-1&&!paused)void go(i+1);else ended=true;}return step;
   }catch(e){paused=true;answerBox.textContent=e.message;progress.textContent='Paused / 已暂停';stamp('error',i,{message:e.message});}finally{if(own===token)actionBusy=false;}
  }