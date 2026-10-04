import type {
  TaskDefinition,
  TaskEvidence,
  TaskScoreReport,
  ScoreBreakdown,
  SkillProfile,
  CareerMatch,
  QuestionResult,
} from '../types/careerDiscovery';

/**
 * Calculates a comprehensive vocational evaluation report and numerical marks (0-100)
 * for a single diagnostic task.
 */
export function calculateCareerScore(
  evidence: TaskEvidence,
  task: TaskDefinition,
  inspectedToolIds: Set<string> | string[] = new Set<string>()
): TaskScoreReport {
  const inspectedSet = Array.isArray(inspectedToolIds)
    ? new Set(inspectedToolIds)
    : inspectedToolIds;
  const inspectedCount = inspectedSet.size;

  // Compute duration in seconds
  const durationSec = evidence.completionTime
    ? Math.max(1, Math.round((evidence.completionTime - evidence.startTime) / 1000))
    : Math.max(1, Math.round((Date.now() - evidence.startTime) / 1000));

  // 1. Accuracy Marks (Max: 50 pts)
  let accuracyScore = 10;
  if (evidence.attempts === 1) {
    accuracyScore = 50;
  } else if (evidence.attempts === 2) {
    accuracyScore = 35;
  } else if (evidence.attempts === 3) {
    accuracyScore = 22;
  } else {
    accuracyScore = 10;
  }

  // 2. Speed & Decision Efficiency Marks (Max: 25 pts)
  let speedScore = 5;
  let speedRating: ScoreBreakdown['speedRating'] = 'Extended Session';
  let speedEfficiencyIndex = 40;

  if (durationSec <= 15) {
    speedScore = 25;
    speedRating = 'Lightning Fast';
    speedEfficiencyIndex = 98;
  } else if (durationSec <= 30) {
    speedScore = 20;
    speedRating = 'Optimal Pace';
    speedEfficiencyIndex = 88;
  } else if (durationSec <= 50) {
    speedScore = 15;
    speedRating = 'Methodical & Steady';
    speedEfficiencyIndex = 75;
  } else if (durationSec <= 90) {
    speedScore = 10;
    speedRating = 'Thorough Analysis';
    speedEfficiencyIndex = 60;
  } else {
    speedScore = 5;
    speedRating = 'Extended Session';
    speedEfficiencyIndex = 45;
  }

  // 3. Analytical Rigor & Tool Literacy Marks (Max: 15 pts)
  let analyticalScore = 5;
  if (inspectedCount >= 3) {
    analyticalScore = 15;
  } else if (inspectedCount === 2) {
    analyticalScore = 12;
  } else if (inspectedCount === 1) {
    analyticalScore = 8;
  } else {
    analyticalScore = evidence.attempts === 1 ? 10 : 5;
  }

  // 4. Resilience & Error Recovery Marks (Max: 10 pts)
  let resilienceScore = 10;
  if (evidence.incorrectActions === 0) {
    resilienceScore = 10;
  } else if (evidence.incorrectActions === 1) {
    resilienceScore = 8;
  } else if (evidence.incorrectActions === 2) {
    resilienceScore = 6;
  } else {
    resilienceScore = 4;
  }

  // Total Marks (Max: 100)
  const totalMarks = Math.min(100, Math.max(0, accuracyScore + speedScore + analyticalScore + resilienceScore));
  const percentage = totalMarks;

  // Letter Grade & Title
  let grade: ScoreBreakdown['grade'] = 'C';
  let gradeTitle = 'Foundational Explorer';

  if (totalMarks >= 95) {
    grade = 'A+';
    gradeTitle = 'Master Diagnostic Specialist (Distinction)';
  } else if (totalMarks >= 85) {
    grade = 'A';
    gradeTitle = 'Skilled Vocational Troubleshooter';
  } else if (totalMarks >= 75) {
    grade = 'B+';
    gradeTitle = 'Proficient Technical Practitioner';
  } else if (totalMarks >= 65) {
    grade = 'B';
    gradeTitle = 'Competent Field Trainee';
  } else {
    grade = 'C';
    gradeTitle = 'Foundational Technical Explorer';
  }

  const scoreBreakdown: ScoreBreakdown = {
    accuracyScore,
    speedScore,
    analyticalScore,
    resilienceScore,
    totalMarks,
    percentage,
    grade,
    gradeTitle,
    speedRating,
    speedEfficiencyIndex,
  };

  // Skill Profile Radar (0 - 100)
  const diagnosticReasoning = Math.round(
    Math.min(100, (accuracyScore / 50) * 70 + (evidence.attempts === 1 ? 30 : 15))
  );
  const speedEfficiency = speedEfficiencyIndex;
  const safetyProtocol = Math.round(
    Math.min(100, (resilienceScore / 10) * 50 + (inspectedCount > 0 ? 35 : 20) + (evidence.attempts === 1 ? 15 : 0))
  );
  const toolLiteracy = Math.round(
    Math.min(100, (analyticalScore / 15) * 50 + (accuracyScore / 50) * 50)
  );
  const problemResilience = Math.round(
    Math.min(100, evidence.incorrectActions === 0 ? 100 : Math.max(40, 100 - evidence.incorrectActions * 15))
  );

  const skillProfile: SkillProfile = {
    diagnosticReasoning,
    speedEfficiency,
    safetyProtocol,
    toolLiteracy,
    problemResilience,
  };

  // Personalized Strengths
  const strengths: string[] = [];
  if (accuracyScore >= 45) {
    strengths.push('Pinpoint First-Attempt Accuracy: Identified the correct diagnostic instrument instantly.');
  }
  if (durationSec <= 25) {
    strengths.push(`High Decision Velocity (${durationSec}s): Quick situational comprehension and rapid resolution.`);
  } else if (inspectedCount >= 2) {
    strengths.push(`Methodical Tool Inspection: Inspected ${inspectedCount} tools before finalizing judgment.`);
  }
  if (evidence.incorrectActions === 0) {
    strengths.push('Flawless Safety Execution: Zero unsafe tool actions or trial-and-error mistakes.');
  } else {
    strengths.push('Adaptive Self-Correction: Successfully corrected initial missteps into a valid resolution.');
  }

  // Areas for Growth
  const areasForGrowth: string[] = [];
  if (durationSec > 45) {
    areasForGrowth.push('Accelerate Fault Verification: Practice standardized diagnostic flowcharts to reduce decision time.');
  }
  if (inspectedCount === 0 && evidence.attempts > 1) {
    areasForGrowth.push('Consult Equipment Specifications: Inspect instrument technical roles before attempting repair actions.');
  }
  if (evidence.incorrectActions > 0) {
    areasForGrowth.push('Differentiate Mechanical vs Electrical Tools: Ensure diagnostic meters precede fastening tools.');
  }

  // Recommendations
  const recommendations: string[] = [
    'Explore hands-on multimeter voltage, current, and continuity testing modules in Sambhav Virtual Labs.',
    'Review safety standards (IS 732 / NEC) for residential and commercial circuit maintenance.',
    'Continue advancing through the additional vocational workspace challenges to test diverse competencies.',
  ];

  // Career Fit Recommendations Matrix
  const careerMatches: CareerMatch[] = [
    {
      id: 'path-elec-tech',
      title: 'Electrical Maintenance & Fault Diagnostic Technician',
      matchPercentage: Math.min(99, Math.round(diagnosticReasoning * 0.45 + toolLiteracy * 0.35 + speedEfficiency * 0.2)),
      demandLevel: 'Very High',
      description: 'Performs preventative testing, fault detection, and circuit repairs in commercial buildings and residential infrastructures.',
      rationale: 'Your high diagnostic reasoning and multimeter comprehension match the core competencies of certified electricians.',
      skillsGained: ['Voltage Testing', 'Circuit Continuity', 'IS 732 Compliance', 'Fault Isolation'],
    },
    {
      id: 'path-solar-tech',
      title: 'Solar Photovoltaic (PV) & Renewable Energy Specialist',
      matchPercentage: Math.min(98, Math.round(safetyProtocol * 0.4 + diagnosticReasoning * 0.35 + toolLiteracy * 0.25)),
      demandLevel: 'High',
      description: 'Installs, measures, and maintains DC/AC solar arrays, inverter stations, and battery storage subsystems.',
      rationale: 'Safe handling of electrical potential and instrument literacy are essential for high-voltage solar array commissioning.',
      skillsGained: ['Inverter Testing', 'DC Voltage Measurement', 'Array Troubleshooting', 'Safety Protocols'],
    },
    {
      id: 'path-automation-tech',
      title: 'Industrial Automation & Control Systems Assistant',
      matchPercentage: Math.min(96, Math.round(speedEfficiency * 0.4 + toolLiteracy * 0.35 + problemResilience * 0.25)),
      demandLevel: 'Very High',
      description: 'Maintains automated manufacturing lines, sensor loops, PLC inputs/outputs, and robotic workcells.',
      rationale: 'Rapid troubleshooting and accurate instrument selection directly correlate with reducing industrial assembly downtime.',
      skillsGained: ['Sensor Calibration', 'PLC Loop Checking', 'Electrical Schematics', 'Relay Testing'],
    },
    {
      id: 'path-electronics-repair',
      title: 'Consumer Electronics & Appliance Diagnostic Specialist',
      matchPercentage: Math.min(95, Math.round(toolLiteracy * 0.4 + problemResilience * 0.35 + diagnosticReasoning * 0.25)),
      demandLevel: 'Growing',
      description: 'Diagnoses faulty motherboards, power supplies, motors, and smart home hardware devices.',
      rationale: 'Precision meter measurement and component-level verification form the cornerstone of electronics repair.',
      skillsGained: ['PCB Testing', 'Component Desoldering', 'Oscilloscope/Meter Usage', 'Power Stage Isolation'],
    },
  ];

  const questionResults: QuestionResult[] = [
    {
      taskId: task.id,
      taskTitle: task.title,
      questionNumber: task.questionNumber || 1,
      attempts: evidence.attempts,
      clicksUsed: evidence.clicksUsed || evidence.attempts,
      isCorrect: evidence.correctActions > 0,
      durationSec,
      inspectedToolsCount: inspectedCount,
      marks: totalMarks,
    },
  ];

  return {
    reportId: `REP-${evidence.sessionId.substring(evidence.sessionId.length - 8).toUpperCase()}`,
    sessionId: evidence.sessionId,
    studentId: evidence.studentId,
    taskId: task.id,
    taskTitle: task.title,
    environmentName: task.environmentName,
    timestamp: evidence.completionTime || Date.now(),
    durationSec,
    attempts: evidence.attempts,
    clicksUsed: evidence.clicksUsed || evidence.attempts,
    inspectedToolsCount: inspectedCount,
    scoreBreakdown,
    skillProfile,
    careerMatches,
    strengths,
    areasForGrowth,
    recommendations,
    questionResults,
    totalQuestionsAttempted: 1,
    totalQuestionsCorrect: evidence.correctActions > 0 ? 1 : 0,
  };
}

export interface TaskEvaluationItem {
  evidence: TaskEvidence;
  task: TaskDefinition;
  inspectedToolIds: Set<string> | string[];
}

/**
 * Calculates a cumulative vocational evaluation report across MULTIPLE diagnostic tasks
 * for comprehensive multi-question analysis.
 */
export function calculateMultiTaskCareerScore(
  evaluations: TaskEvaluationItem[],
  studentId: string = 'student-auth-user',
  sessionId?: string
): TaskScoreReport {
  if (evaluations.length === 0) {
    throw new Error('Cannot compute multi-task score with 0 evaluations.');
  }

  const sid = sessionId || evaluations[0].evidence.sessionId;
  const individualReports = evaluations.map((item) =>
    calculateCareerScore(item.evidence, item.task, item.inspectedToolIds)
  );

  const totalQuestionsAttempted = individualReports.length;
  const totalQuestionsCorrect = individualReports.filter(
    (r) => (r.questionResults?.[0]?.isCorrect ?? false)
  ).length;

  // Aggregate Marks & Score Dimensions
  const totalDurationSec = individualReports.reduce((acc, r) => acc + r.durationSec, 0);
  const avgDurationSec = Math.round(totalDurationSec / totalQuestionsAttempted);
  const totalAttempts = individualReports.reduce((acc, r) => acc + r.attempts, 0);
  const totalClicks = individualReports.reduce((acc, r) => acc + (r.clicksUsed || r.attempts), 0);
  const totalInspected = individualReports.reduce((acc, r) => acc + r.inspectedToolsCount, 0);

  const avgAccuracyScore = Math.round(
    individualReports.reduce((acc, r) => acc + r.scoreBreakdown.accuracyScore, 0) / totalQuestionsAttempted
  );
  const avgSpeedScore = Math.round(
    individualReports.reduce((acc, r) => acc + r.scoreBreakdown.speedScore, 0) / totalQuestionsAttempted
  );
  const avgAnalyticalScore = Math.round(
    individualReports.reduce((acc, r) => acc + r.scoreBreakdown.analyticalScore, 0) / totalQuestionsAttempted
  );
  const avgResilienceScore = Math.round(
    individualReports.reduce((acc, r) => acc + r.scoreBreakdown.resilienceScore, 0) / totalQuestionsAttempted
  );

  const totalMarks = Math.min(100, Math.max(0, avgAccuracyScore + avgSpeedScore + avgAnalyticalScore + avgResilienceScore));
  const percentage = totalMarks;

  // Grade determination
  let grade: ScoreBreakdown['grade'] = 'C';
  let gradeTitle = 'Foundational Vocational Explorer';

  if (totalMarks >= 95) {
    grade = 'A+';
    gradeTitle = 'Master Multi-System Specialist (Distinction)';
  } else if (totalMarks >= 85) {
    grade = 'A';
    gradeTitle = 'High-Aptitude Vocational Troubleshooter';
  } else if (totalMarks >= 75) {
    grade = 'B+';
    gradeTitle = 'Proficient Technical Practitioner';
  } else if (totalMarks >= 65) {
    grade = 'B';
    gradeTitle = 'Competent Field Trainee';
  } else {
    grade = 'C';
    gradeTitle = 'Foundational Technical Explorer';
  }

  let speedRating: ScoreBreakdown['speedRating'] = 'Extended Session';
  let speedEfficiencyIndex = 50;
  if (avgDurationSec <= 15) {
    speedRating = 'Lightning Fast';
    speedEfficiencyIndex = 98;
  } else if (avgDurationSec <= 30) {
    speedRating = 'Optimal Pace';
    speedEfficiencyIndex = 88;
  } else if (avgDurationSec <= 50) {
    speedRating = 'Methodical & Steady';
    speedEfficiencyIndex = 75;
  } else if (avgDurationSec <= 90) {
    speedRating = 'Thorough Analysis';
    speedEfficiencyIndex = 60;
  } else {
    speedRating = 'Extended Session';
    speedEfficiencyIndex = 45;
  }

  const scoreBreakdown: ScoreBreakdown = {
    accuracyScore: avgAccuracyScore,
    speedScore: avgSpeedScore,
    analyticalScore: avgAnalyticalScore,
    resilienceScore: avgResilienceScore,
    totalMarks,
    percentage,
    grade,
    gradeTitle,
    speedRating,
    speedEfficiencyIndex,
  };

  // Aggregate Skill Profile Radar
  const diagnosticReasoning = Math.round(
    individualReports.reduce((acc, r) => acc + r.skillProfile.diagnosticReasoning, 0) / totalQuestionsAttempted
  );
  const speedEfficiency = speedEfficiencyIndex;
  const safetyProtocol = Math.round(
    individualReports.reduce((acc, r) => acc + r.skillProfile.safetyProtocol, 0) / totalQuestionsAttempted
  );
  const toolLiteracy = Math.round(
    individualReports.reduce((acc, r) => acc + r.skillProfile.toolLiteracy, 0) / totalQuestionsAttempted
  );
  const problemResilience = Math.round(
    individualReports.reduce((acc, r) => acc + r.skillProfile.problemResilience, 0) / totalQuestionsAttempted
  );

  const skillProfile: SkillProfile = {
    diagnosticReasoning,
    speedEfficiency,
    safetyProtocol,
    toolLiteracy,
    problemResilience,
  };

  // Question Results Table
  const questionResults: QuestionResult[] = individualReports.map((r, index) => {
    const qRes = r.questionResults?.[0];
    return {
      taskId: r.taskId,
      taskTitle: r.taskTitle,
      questionNumber: qRes?.questionNumber || index + 1,
      attempts: r.attempts,
      clicksUsed: r.clicksUsed || r.attempts,
      isCorrect: qRes?.isCorrect ?? true,
      durationSec: r.durationSec,
      inspectedToolsCount: r.inspectedToolsCount,
      marks: r.scoreBreakdown.totalMarks,
    };
  });

  // Strengths
  const strengths: string[] = [];
  if (totalQuestionsCorrect === totalQuestionsAttempted) {
    strengths.push(`100% Problem Solving Rate: Solved all ${totalQuestionsAttempted} vocational challenges successfully.`);
  } else {
    strengths.push(`Completed ${totalQuestionsCorrect}/${totalQuestionsAttempted} challenges across the vocational battery.`);
  }
  if (avgDurationSec <= 25) {
    strengths.push(`Consistent Decision Velocity: Averaged ${avgDurationSec}s per problem resolution.`);
  }
  if (totalInspected >= 4) {
    strengths.push(`Broad Tool Literacy: Thoroughly inspected ${totalInspected} instrument technical specifications.`);
  }
  if (avgResilienceScore >= 8) {
    strengths.push('High Safety Compliance: Maintained exceptional safety discipline across multiple work environments.');
  }

  // Areas for Growth
  const areasForGrowth: string[] = [];
  if (totalQuestionsCorrect < totalQuestionsAttempted) {
    areasForGrowth.push('Review Unsolved Scenarios: Revisit tasks that exhausted click allowances to build pattern familiarity.');
  }
  if (avgDurationSec > 40) {
    areasForGrowth.push('Develop Quick-Scan Habits: Use rapid visual elimination for tools that do not match the task category.');
  }
  if (totalInspected < totalQuestionsAttempted) {
    areasForGrowth.push('Expand Tool Specification Exploration: Always review instrument ratings before testing unfamiliar circuits.');
  }

  // Recommendations
  const recommendations: string[] = [
    'Explore hands-on electrical maintenance & solar PV modules in Sambhav Experiential Labs.',
    'Practice with multi-range digital multimeters and insulated VDE toolkits.',
    'Download your Vocational Assessment Certificate and share with technical mentors.',
  ];

  // Career Matches based on Multi-Question Profile
  const careerMatches: CareerMatch[] = [
    {
      id: 'path-elec-tech',
      title: 'Electrical Maintenance & Fault Diagnostic Technician',
      matchPercentage: Math.min(99, Math.round(diagnosticReasoning * 0.45 + toolLiteracy * 0.35 + speedEfficiency * 0.2)),
      demandLevel: 'Very High',
      description: 'Performs preventative testing, fault detection, and circuit repairs in commercial buildings and residential infrastructures.',
      rationale: 'Your multi-question diagnosis consistency matches the requirements of certified vocational electricians.',
      skillsGained: ['Voltage Testing', 'Circuit Continuity', 'IS 732 Compliance', 'Fault Isolation'],
    },
    {
      id: 'path-solar-tech',
      title: 'Solar Photovoltaic (PV) & Renewable Energy Specialist',
      matchPercentage: Math.min(98, Math.round(safetyProtocol * 0.4 + diagnosticReasoning * 0.35 + toolLiteracy * 0.25)),
      demandLevel: 'High',
      description: 'Installs, measures, and maintains DC/AC solar arrays, inverter stations, and battery storage subsystems.',
      rationale: 'Strong safety protocols and wire preparation capabilities are foundational for clean energy technicians.',
      skillsGained: ['Inverter Testing', 'DC Voltage Measurement', 'Array Troubleshooting', 'Safety Protocols'],
    },
    {
      id: 'path-automation-tech',
      title: 'Industrial Automation & Control Systems Assistant',
      matchPercentage: Math.min(96, Math.round(speedEfficiency * 0.4 + toolLiteracy * 0.35 + problemResilience * 0.25)),
      demandLevel: 'Very High',
      description: 'Maintains automated manufacturing lines, sensor loops, PLC inputs/outputs, and robotic workcells.',
      rationale: 'Rapid troubleshooting and accurate instrument selection directly correlate with reducing industrial assembly downtime.',
      skillsGained: ['Sensor Calibration', 'PLC Loop Checking', 'Electrical Schematics', 'Relay Testing'],
    },
    {
      id: 'path-electronics-repair',
      title: 'Consumer Electronics & Appliance Diagnostic Specialist',
      matchPercentage: Math.min(95, Math.round(toolLiteracy * 0.4 + problemResilience * 0.35 + diagnosticReasoning * 0.25)),
      demandLevel: 'Growing',
      description: 'Diagnoses faulty motherboards, power supplies, motors, and smart home hardware devices.',
      rationale: 'Component continuity testing and precision terminal manipulation are crucial for electronics repair.',
      skillsGained: ['PCB Testing', 'Component Desoldering', 'Oscilloscope/Meter Usage', 'Power Stage Isolation'],
    },
  ];

  return {
    reportId: `REP-BATTERY-${sid.substring(sid.length - 6).toUpperCase()}`,
    sessionId: sid,
    studentId,
    taskId: 'battery-multi-tasks',
    taskTitle: `Multi-Question Vocational Assessment (${totalQuestionsAttempted} Challenges)`,
    environmentName: 'Integrated Vocational Diagnostic Suite',
    timestamp: Date.now(),
    durationSec: totalDurationSec,
    attempts: totalAttempts,
    clicksUsed: totalClicks,
    inspectedToolsCount: totalInspected,
    scoreBreakdown,
    skillProfile,
    careerMatches,
    strengths,
    areasForGrowth,
    recommendations,
    questionResults,
    totalQuestionsAttempted,
    totalQuestionsCorrect,
  };
}
