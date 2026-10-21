/* ============================================================
   K. Test surface
   The automated harness drives the page through this object rather than by
   reaching into module scope, so a rename inside the page shows up as one
   clear failure instead of a dozen undefined-is-not-a-function errors.
   ============================================================ */
window.__qc={
  MG, mgOpen, mgClose, mgCommand, mgBuildQueue, MG_COMMANDS,
  APP_LIMITS, APP_STATE, appDiagnostics, setPhase, validateRunBoundary, validateHistoryBoundary, APP_STATS, appStatusSnapshot, appStatusReport, appCancel, renderConsoleIdentity, CONSOLE_DICT,
  CC_CHARTS, CC_LIMIT_TEXT, ccAlarmDir, CC_STATE, ccRowsFromRuns, ccAllRows, ccRowsFor, ccCompute, ccStatus, ccEvents, ccImport, ccHistoryJSON, renderPanel,
  ccIxoTemperatureLog, ccThermalSteps, ccQsLog, ccStatic, ccDynamic, ccI, ccTrend, ccP, ccXbarS, ccFunnel,
  SOP_PRESETS, sopNormalise, sopHash, sopJSON, sopEvaluateAll, sopInterpretationRows, sopSampleRows, sopCriteriaRows, sopRunRows,
  sopStdCurves, runTimeline, runTimes, extraForensicEvents, sopEvents, GRAPHS, renderGraphs, renderSop, renderResults, renderTab, markDirty,
  get sop(){return SOP;}, set sop(v){SOP=sopNormalise(v);sopChanged();},
  decodeIxo, decodeEds, ixoIntegrity, EDS, reviewForensicEvents, rqRows, instrumentRecordTables, integrityLabel, decodeAcq, readZip, makeStoredZip,
  makeRDMLXML, makeRDML, makeQpcrWide, makeQpcrWideTables,makeBaselineCSV,makeRDES,makeRDESTables,
  dyeChemistryOf, rdmlSampleType,
  parseCqTable, CSV_EXAMPLE, acceptPasted,
  assignRoles, roleFromName,
  SAMPLE_TYPE_LABEL,
  allWellRows, tmRows, metaRows, uniqueCurveCount, acquiredCurveCount, toCSV, exportCatalogue,
  derivedSettings, renderDerived,
  plateMapRows, sampleComparisonRows, reviewStatisticsRows, replicateReviewRows,
  analysisChoices, selectedWells, physicalCurveRows, curveRowsSelected,
  orphanCurveCandidates, reviewOrphanWells, reviewForensicEvents, reviewRunRows,
  stripLotDate, controlRootName, controlRootKey, controlCategory, detectedControlRoots,
  westgardReview, reviewControlSeries,
  instrumentRecordTables, renderQualityReview, showReviewSheet,
  ui, zhPhrase, setLanguage, websiteSource, makeWebsiteArchive,
  rScript, pyScript, bundleReadme,
  machineMetadataDocument, machineMetadataJSON, renderMachineMetadata, renderDiagnostics, sha256Hex,
  fitLin, mean, sd, cv, efficiencyFromSlope,
  refreshAll, renderExports, showTab,
  set runs(v){RUNS=v;SOP_CACHE=null;invalidateAnalysisCaches();}, get runs(){return RUNS;},
  set pasted(v){PASTED=v;}, get pasted(){return PASTED;},
  get language(){return UI_LANG;}
};

