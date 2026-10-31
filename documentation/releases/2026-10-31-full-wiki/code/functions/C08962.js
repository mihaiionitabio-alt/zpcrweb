function(){

 const style=next();

 return {...style,wrapTitle:true,colour:bold=>bold?[.06,.18,.30]:[.15,.19,.24],

 header(d,text){if(zpcrReportLogo){const j=zpcrReportLogo;d.image(j.bytes,120,40,j.w,j.h);}else text('MISSY  |  RUO  |  NOT VALIDATED',10,true,0,[.06,.18,.30]);d.rule();d.gap(5);},

 paragraphLines(s){if(String(s).includes('ZPCR hardware fields are decoded')||String(s).includes('The page recomputes nothing.'))s='• Research Use Only.\n• Not validated for clinical or instrument qualification decisions.\n• Does not replace vendor QC certification or laboratory validation.';return String(s).split('\n').map(line=>line.replace(/^• /,'- '));}};

}