function executeVoiceIntent(intent){
  if(typeof intent==='string'){const result=answer(intent);window.MISSY_NAVIGATION_TONES?.queue();return result;}
  const n=Number(intent);if(!Number.isInteger(n)||n<0||n>15)return false;
  if(!command(String(n)))return false;
  return answer('q:where',{en:'Control '+n+'.',zh:'控件 '+n+'。'});
 }