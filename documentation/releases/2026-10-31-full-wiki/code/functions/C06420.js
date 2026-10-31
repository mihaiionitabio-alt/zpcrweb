({w,s})=>{
      if(!s)return;
      const signalFloor=Math.max(3,Number.isFinite(referenceAmplitude)?referenceAmplitude*.05:0);
      /* Match the forensic rising-curve rule and also catch a monotone terminal rise:
         a late segment can be meaningful even when early baseline noise lowers the whole-run fraction. */
      const wholeRunRise=s.lateDelta>=.45*s.amplitude&&s.risingFraction>=.55;
      const terminalRise=s.terminalDelta>=Math.max(10,.25*s.amplitude)&&s.terminalRisingFraction>=.8;
      const lateRise=s.amplitude>=signalFloor&&(wholeRunRise||terminalRise);
      const highBaseline=Number.isFinite(baselineMedian)&&s.baseline>baselineLimit&&s.baseline-baselineMedian>=10;
      if(!lateRise&&!highBaseline)return;
      const hasAnswer=resultAnswers(w);
      const assessment=lateRise
        ? `Late rising trace${hasAnswer?" with a stored answer":" without a same-channel Cq/no-crossing answer"}`
        : "High raw baseline relative to wells on the same channel";
      out.push({well:w.well||"",sample:w.sample||"",target:w.target||w.analysis||"",channel:w.channel,
        baseline:s.baseline,baseline_sd:s.baselineSd,reference_baseline:baselineMedian,late_delta:s.lateDelta,terminal_delta:s.terminalDelta,amplitude:s.amplitude,curve:w.curve,
        max_slope:s.maxSlope,max_slope_cycle:s.maxSlopeCycle,max_curvature:s.maxCurvature,max_curvature_cycle:s.maxCurvatureCycle,
        rising_fraction:s.risingFraction,terminal_rising_fraction:s.terminalRisingFraction,stored_call:w.call||"",assessment,
        severity:lateRise?"error":"review",lateRise,highBaseline});
    }