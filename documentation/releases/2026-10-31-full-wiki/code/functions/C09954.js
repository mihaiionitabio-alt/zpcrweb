function maraGaps(p=SOP){const gaps=(p.implementationReview||Object.keys(MARA_GAPS)).map(k=>MARA_GAPS[k]||k);
 if(p.method?.selected_event==='KJ1003')gaps.push('KJ1003: verify the 19-bp junction sequence');
 if(p.method?.standard_number===16)gaps.push('Select event assay, reference and quantitative control');
 if(p.method?.standard_number===17)gaps.push('Verify portable rapid-PCR workflow and matrix','Select the actual Annex A/B panel; catalogue entries are not a tested panel');if(typeof maraNumericProblems==='function')gaps.push(...maraNumericProblems(p));return gaps;}