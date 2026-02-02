export const calculateCredibility = (answer: any): number => {
  const CONFIG = {
    baseScore: 100,
    penalties: {
      timeOutsideTab: 40,
      tooFast: 20,
      tooSlow: 10,
      attemptPerExtra: 10,
      clickPerExtra: 2,
      maxClickPenalty: 20,
      fastClicking: 15,
      zoomPenalty: 5,
      dragPerExtra: 5,
      maxDragPenalty: 15,
      longIdlePenalty: 10,
      mediumIdlePenalty: 5,
      tooManyIdles: 10,
      excessiveIdleTime: 15,
    },
    thresholds: {
      minTime: 2000,
      maxTime: 120000,
      timeOutsideTab: 5000,
      maxClicks: 5,
      fastClickInterval: 300,
      maxZooms: 2,
      maxDrags: 3,
      mediumIdle: 5000,
      longIdle: 15000,
      maxIdleCount: 5,
      maxTotalIdleTime: 30000,
    },
  };

  let score = CONFIG.baseScore;

  if (answer?.timeOutsideTab > CONFIG.thresholds.timeOutsideTab)
    score -= CONFIG.penalties.timeOutsideTab;

  if (typeof answer?.timeSpent === "number") {
    if (answer.timeSpent < CONFIG.thresholds.minTime) score -= CONFIG.penalties.tooFast;
    if (answer.timeSpent > CONFIG.thresholds.maxTime) score -= CONFIG.penalties.tooSlow;
  }

  if (typeof answer?.attempts === "number" && answer.attempts > 1) {
    score -= (answer.attempts - 1) * CONFIG.penalties.attemptPerExtra;
  }

  if (typeof answer?.clicks === "number" && answer.clicks > CONFIG.thresholds.maxClicks) {
    score -= Math.min(
      (answer.clicks - CONFIG.thresholds.maxClicks) * CONFIG.penalties.clickPerExtra,
      CONFIG.penalties.maxClickPenalty
    );
  }

  if (Array.isArray(answer?.timeStamps) && answer.timeStamps.length > 1) {
    const avgInterval = answer.timeStamps.reduce((acc: number, val: number) => acc + val, 0) / answer.timeStamps.length;
    if (avgInterval < CONFIG.thresholds.fastClickInterval) score -= CONFIG.penalties.fastClicking;
  }

  if (typeof answer?.zoomIns === "number" && answer.zoomIns > CONFIG.thresholds.maxZooms)
    score -= CONFIG.penalties.zoomPenalty;
  if (typeof answer?.zoomOuts === "number" && answer.zoomOuts > CONFIG.thresholds.maxZooms)
    score -= CONFIG.penalties.zoomPenalty;

  if (typeof answer?.drags === "number" && answer.drags > CONFIG.thresholds.maxDrags)
    score -= Math.min(
      (answer.drags - CONFIG.thresholds.maxDrags) * CONFIG.penalties.dragPerExtra,
      CONFIG.penalties.maxDragPenalty
    );

  if (Array.isArray(answer?.inactivityPeriods) && answer.inactivityPeriods.length > 0) {
    const totalIdle = answer.inactivityPeriods.reduce((sum: number, val: number) => sum + val, 0);
    let mediumCount = 0;
    let longCount = 0;
    for (const idle of answer.inactivityPeriods) {
      if (idle > CONFIG.thresholds.longIdle) longCount++;
      else if (idle > CONFIG.thresholds.mediumIdle) mediumCount++;
    }
    score -= mediumCount * CONFIG.penalties.mediumIdlePenalty;
    score -= longCount * CONFIG.penalties.longIdlePenalty;
    if (answer.inactivityPeriods.length > CONFIG.thresholds.maxIdleCount)
      score -= CONFIG.penalties.tooManyIdles;
    if (totalIdle > CONFIG.thresholds.maxTotalIdleTime)
      score -= CONFIG.penalties.excessiveIdleTime;
  }

  if (score < 0) score = 0;
  if (score > 100) score = 100;
  return Math.round(score);
};