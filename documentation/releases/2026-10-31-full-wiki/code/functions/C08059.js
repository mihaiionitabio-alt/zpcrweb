data=>{
          const tarId=rdmlAttrId(data,"tar");
          const tgt=targets.get(tarId)||{id:tarId,type:"toi",dye:"dye",channel:0};
          const ch=tgt.channel;
          plate[pos].channels[ch]={sampleType:smp.type,targetName:tarId,
            targetType:tgt.type==="ref"?"dtReference":"dtTarget"};

          /* amplification: order by cycle, do not assume the file is sorted */
          const adp=rdmlKids(data,"adp").map(a=>[rdmlNum(a,"cyc"),rdmlNum(a,"fluor")])
            .filter(([c,f])=>c!==null&&f!==null).sort((a,b)=>a[0]-b[0]);
          const curve=adp.map(([,f])=>f);
          if(curve.length){anyAdp=true;maxCycle=Math.max(maxCycle,adp[adp.length-1][0]);
            allCurves[`${ch}|${pos}`]={channel:ch,pos,curve,amplitude:Math.max(...curve)-Math.min(...curve)};}

          /* melting */
          const mdp=rdmlKids(data,"mdp").map(m=>[rdmlNum(m,"tmp"),rdmlNum(m,"fluor")])
            .filter(([t,f])=>t!==null&&f!==null).sort((a,b)=>a[0]-b[0]);
          if(mdp.length){anyMdp=true;maxMelt=Math.max(maxMelt,mdp.length);}

          let cq=rdmlNum(data,"cq");
          const ampEffMet=rdmlText(data,"ampEffMet");
          /* A vendor export writes "no crossing" as a Cq equal to the cycle count: measured on
             CORPUS-RDML-1.rdml, 158 of 192 rows carry cq = 40.0 on a 40-cycle run, while the
             .eds for the same run reports those wells as undetermined. Reading them as a crossing
             at the cut-off would turn 82 % of that file into late detections. A re-analysis file
             does not do this (example_3_linregpcr: 0 of 90 at the ceiling, maximum 34), so the
             rule is applied only where there is no N0 and no efficiency to contradict it. */
          let cqCeiling=false;
          if(cq!==null&&Number.isFinite(maxCycleSeen)&&maxCycleSeen>0
             &&Math.abs(cq-maxCycleSeen)<1e-9
             &&rdmlNum(data,"N0")===null&&rdmlNum(data,"ampEff")===null){cqCeiling=true;cq=null;}
          if(cq!==null)anyCq=true;
          if(cqCeiling)ceilingRows++;
          if(ampEffMet)methods.add(ampEffMet);

          const excl=rdmlText(data,"excl"),note=rdmlText(data,"note");
          const w={
            kind:"quant",well:posToWell(pos,cols),pos,row:Math.floor(pos/cols),col:pos%cols,
            sample:smp.id,sampleId:"",notes:smp.description||"",
            target:tarId,analysis:`RDML — ${tarId}`,analysisShort:tarId,analysisUid:"rdml:"+tarId,
            analysisKind:"absquant",analysisGroup:"",analysisGroupName:"",
            channel:ch,filterName:tgt.dye||("channel "+ch),filterComb:"",
            instrType:smp.type,instrRole:role,givenConc:"",targetName:tarId,
            targetType:tgt.type==="ref"?"dtReference":"dtTarget",subsetsOfWell:[],
            IsIncluded:excl?"false":"true",manual:"",warnCodes:excl?"excl":"",warnDesc:excl||"",
            /* A Cq in an RDML file is the analysis of whoever wrote the file. It is stored,
               but never as though the instrument had reported it: cqSource says whose it is. */
            CpRaw:cq,Cp:cq,cqSource:ampEffMet||cqMethod||"RDML file",
            callCode:cq===null?0:1,call:cq===null?"Not analysed":"Analysed",
            curve,CpUncertain:"",
            CpState:cq===null?"Undetermined":"",CrossingPointStatus:cq===null?"Undetermined":"",
            cqAtCycleCeiling:cqCeiling,
            CalcConc:"",ConcStatus:"",StandardConc:"",CalcConcUnc:"",
            rdml:{N0:rdmlNum(data,"N0"),ampEff:rdmlNum(data,"ampEff"),ampEffSE:rdmlNum(data,"ampEffSE"),
                  ampEffMet,bgFluor:rdmlNum(data,"bgFluor"),quantFluor:rdmlNum(data,"quantFluor"),
                  meltTemp:rdmlNum(data,"meltTemp"),excl,note,melt:mdp}
          };
          wells.push(w);
          if(mdp.length)tmWells.push({kind:"tm",well:w.well,pos,channel:ch,sample:smp.id,target:tarId,
            analysis:w.analysis,analysisUid:w.analysisUid,role,melt:mdp,
            Tm:rdmlNum(data,"meltTemp"),curve:mdp.map(([,f])=>f),temps:mdp.map(([t])=>t)});
        }