g=>{
    const gi=g.querySelector('[class="GeneInfo"]'),cr2=gi&&gi.querySelector('[class="ChannelRatio"]');
    return {
      name:gi?pv(gi,"RQTargetName"):"",
      type:gi?pv(gi,"RQDataType"):"",
      isTarget:(gi?pv(gi,"RQDataType"):"")==="dtTarget",
      external:gi?pv(gi,"ExternalData")==="1":false,
      ex:cr2?Number(pv(cr2,"NumeratorXWL")):null,em:cr2?Number(pv(cr2,"NumeratorEWL")):null,
      positions:[...g.querySelectorAll('[class="TIntegerList"] > list > prop')].map(x=>Number(x.textContent))
    };
  }