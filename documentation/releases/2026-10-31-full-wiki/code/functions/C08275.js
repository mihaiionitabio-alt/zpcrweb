function selOptionRuleBase(id,key){
  const exact=SEL_OPTION_RULES[id];
  return (exact&&exact[key])||(id.startsWith("cc:")&&SEL_OPTION_RULES["cc:*"][key])||(id.startsWith("data:")&&SEL_OPTION_RULES["data:*"][key])||(id.startsWith("rec:")&&SEL_OPTION_RULES["rec:*"][key])||(id.startsWith("img:")&&(SEL_OPTION_RULES[id]||SEL_OPTION_RULES["img:*"])[key]);
}