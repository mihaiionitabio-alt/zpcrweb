function play(text,nextKind,keepAck=false){const src=bank[text];if(!src)return false;
  if(keepAck&&active&&kind==='voiceAcknowledge'){queued={text,nextKind};return true;}
  stop();const token=epoch;const audio=new Audio(src);active=audio;kind=nextKind;audio.volume=.8;
  const done=()=>{if(token!==epoch)return;active=null;kind='';const next=queued;queued=null;if(next){if(next.callback)next.callback();else play(next.text,next.nextKind);}};
  audio.onended=done;audio.onerror=()=>{if(token!==epoch)return;done();if(nextKind==='voiceAnswer')document.dispatchEvent(new Event('missy-speech-error'));else document.dispatchEvent(new CustomEvent('missy-calm-playback-blocked',{detail:{kind:nextKind}}));};
  audio.play().catch(()=>{if(token!==epoch)return;done();if(nextKind==='voiceAnswer')document.dispatchEvent(new Event('missy-speech-error'));else document.dispatchEvent(new CustomEvent('missy-calm-playback-blocked',{detail:{kind:nextKind}}));});return true;
 }