function(text){
 if(maraProfileActive()&&(/The page recomputes nothing.|Stored vendor results are kept unchanged./.test(String(text))))text=ui('MARA results are calculated by MISSY from stored Cq values and explicit method inputs. Stored measurements are unchanged. Laboratory approval is separate from automatic calculation.');
 return next(text);
}