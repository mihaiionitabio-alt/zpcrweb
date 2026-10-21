/* ============================================================
   Missy-LC: stand-ins for the readers left out of this build
   ------------------------------------------------------------
   This build reads LightCycler .ixo files only. The QuantStudio
   (.eds/.edt) and RDML readers are not included. The core still
   names a few of their functions; every call site is either guarded
   by run.eds / a file kind that this build never produces, or expects
   an empty result for non-QuantStudio runs. The stand-ins below give
   exactly that empty result, or a clear "not in this build" error when
   such a file is offered.

   The .ixo checksum needs MD5. In the full build MD5 lives inside the
   QuantStudio module; here the same source file is included into a
   minimal EDS object, so there is still only one copy of MD5.
   ============================================================ */
const MISSY_BUILD_EXCLUDES="QuantStudio .eds/.edt and RDML files are not read by this build (Missy-LC). Use the Missy-all build for them.";
const EDS=(()=>{
const hex=u8=>Array.from(u8,b=>b.toString(16).padStart(2,"0")).join("");
//#include core/md5.js
const absent=()=>{throw new Error(MISSY_BUILD_EXCLUDES);};
return {MD5,parseEds:absent,qsExport:absent,qsTables:absent,qsInstrument:absent,studyRows:absent,
  flagName:c=>String(c),FLAGS:{},dt:()=>""};
})();

/* QuantStudio reader */
const QS_DYE_FILTER={};
function isEdsName(name){return /\.(eds|edt)$/i.test(name||"");}
async function decodeEds(){throw new Error(MISSY_BUILD_EXCLUDES);}
function edsEvents(){}
function edsRecordTables(){return {};}
function drawTemperatureTrace(){}
function edsDerived(){}
function edsSignalRows(){return [];}
function qsWorkbook(){throw new Error(MISSY_BUILD_EXCLUDES);}
function ccQsLog(){return null;}

/* RDML reader */
async function rdmlEntries(){throw new Error(MISSY_BUILD_EXCLUDES);}
function rdmlIsContainer(){return false;}
function rdmlParse(){throw new Error(MISSY_BUILD_EXCLUDES);}
