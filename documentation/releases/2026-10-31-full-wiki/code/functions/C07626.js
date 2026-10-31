a=>({name:a.name,short_name:a.shortName,kind:a.kindLabel||a.kind,
    class:a.cls,uid:a.uid,subset:a.subsetName,calculation_state:a.calcState,channel_index:a.channelIdx,
    channel_name:a.channelName,filter:a.filterComb,created:a.created,modified:a.modified,
    created_by:a.createdBy,modified_by:a.modifiedBy,results:a.nResults,
    standard_curve_source:a.stdCurve?a.stdCurve.source:"",slope:a.stdCurve?a.stdCurve.slope:"",
    intercept:a.stdCurve?a.stdCurve.yIntercept:"",efficiency:a.stdCurve?a.stdCurve.efficiency:"",
    fit_error:a.stdCurve?a.stdCurve.fitError:"",colour_compensation:a.cccEnabled?"applied":"not applied"})