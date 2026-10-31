/* Presentation-only corrections, informed by the supplied Real-time PCR
 * handbook sections 1.4, 1.7, 1.9, 4.3 and 5.2. Never modifies renderers,
 * measurements, thresholds, stored vendor results or SOP decisions. */
const EN_SCIENTIFIC_PRESENTATION={
 ic:{title:'Internal-control/reference Cq per sample',note:'Cq for targets marked as internal control or reference in the SOP. Lines show each target median and the configured maximum positive Cq shift. An elevated Cq is a review flag, not proof of inhibition: input amount, reference stability and assay effects require separate evaluation.'},
 endpoint:{title:'End-point fluorescence versus stored Cq',note:'End-point fluorescence, or amplitude above background, plotted against stored Cq. Late or low-plateau signals are shown for review; this plot alone does not establish amplification specificity. Wells without a valid stored Cq are shown at the right edge.'}
};
for(const [id,presentation]of Object.entries(EN_SCIENTIFIC_PRESENTATION)){const graph=GRAPHS.find(g=>g.id===id);if(graph)Object.assign(graph,presentation);}
