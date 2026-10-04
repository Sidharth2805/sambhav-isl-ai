import React, { useState, useEffect, useCallback, useRef } from 'react';
import type {
  TaskDefinition,
  ToolDefinition,
  InteractionState,
  CareerEvent,
  TaskEvidence,
  WorkspaceHotspot,
  TaskScoreReport,
} from '../../types/careerDiscovery';
import { careerAssets } from '../../data/careerDiscovery/careerAssets';
import { ELECTRICAL_TASKS } from '../../data/careerDiscovery/electricalTaskData';
import { calculateCareerScore, calculateMultiTaskCareerScore, type TaskEvaluationItem } from '../../utils/careerScoring';
import { CompositeAssetView } from './CompositeAssetView';
import { ToolInspectorModal } from './ToolInspectorModal';
import { TaskEvidencePanel } from './TaskEvidencePanel';
import { TaskReportModal } from './TaskReportModal';

const MAX_CLICKS = 5;

interface ElectricalWorkspaceProps {
  task?: TaskDefinition;
  tasks?: TaskDefinition[];
  studentId?: string;
  onTaskCompleted?: (evidence: TaskEvidence, report: TaskScoreReport) => void;
}

export const ElectricalWorkspace: React.FC<ElectricalWorkspaceProps> = ({
  task,
  tasks = ELECTRICAL_TASKS,
  studentId = 'student-auth-user',
  onTaskCompleted,
}) => {
  const taskList = tasks && tasks.length > 0 ? tasks : task ? [task] : ELECTRICAL_TASKS;
  const [currentTaskIndex, setCurrentTaskIndex] = useState<number>(0);
  const activeTask = taskList[currentTaskIndex] || taskList[0];

  // Session Identification
  const [sessionId, setSessionId] = useState<string>(
    () => `session-career-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
  );

  // Interaction State Machine
  const [interactionState, setInteractionState] = useState<InteractionState>('IDLE');
  const [selectedTool, setSelectedTool] = useState<ToolDefinition | null>(null);
  const [inspectingTool, setInspectingTool] = useState<ToolDefinition | null>(null);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [hoveredHotspotId, setHoveredHotspotId] = useState<string | null>(null);
  const [focusedHotspotId, setFocusedHotspotId] = useState<string | null>(null);

  // 5 Clicks Budget Tracking
  const [clicksUsed, setClicksUsed] = useState<number>(0);
  const clicksRemaining = Math.max(0, MAX_CLICKS - clicksUsed);

  // Live Timer & Exploration Tracking
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [inspectedToolIds, setInspectedToolIds] = useState<Set<string>>(new Set());
  const [reportModalOpen, setReportModalOpen] = useState<boolean>(false);
  const [activeReport, setActiveReport] = useState<TaskScoreReport | null>(null);

  // Completed task evaluations across questions
  const [completedEvaluations, setCompletedEvaluations] = useState<TaskEvaluationItem[]>([]);

  // Feedback & Instructions
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Evidence & Event Log for Current Question
  const [events, setEvents] = useState<CareerEvent[]>([]);
  const [evidence, setEvidence] = useState<TaskEvidence>({
    studentId,
    sessionId,
    taskId: activeTask.id,
    phase: activeTask.phase,
    attempts: 0,
    clicksUsed: 0,
    maxClicksAllowed: MAX_CLICKS,
    correctActions: 0,
    incorrectActions: 0,
    hintsUsed: 0,
    guidanceCount: 0,
    errorsCorrected: 0,
    startTime: Date.now(),
    independentCompletion: true,
  });

  const hasEmittedStartRef = useRef(false);

  // Reset question state when navigating between questions
  const resetForTask = useCallback((targetIndex: number) => {
    const newTask = taskList[targetIndex];
    if (!newTask) return;
    setCurrentTaskIndex(targetIndex);
    setSelectedTool(null);
    setFeedbackMessage(null);
    setIsSuccess(false);
    setInteractionState('IDLE');
    setClicksUsed(0);
    setElapsedSeconds(0);
    setInspectedToolIds(new Set());
    setEvidence({
      studentId,
      sessionId,
      taskId: newTask.id,
      phase: newTask.phase,
      attempts: 0,
      clicksUsed: 0,
      maxClicksAllowed: MAX_CLICKS,
      correctActions: 0,
      incorrectActions: 0,
      hintsUsed: 0,
      guidanceCount: 0,
      errorsCorrected: 0,
      startTime: Date.now(),
      independentCompletion: true,
    });
    hasEmittedStartRef.current = false;
  }, [taskList, studentId, sessionId]);

  // Real-Time Live Elapsed Timer
  useEffect(() => {
    if (interactionState === 'COMPLETED' || interactionState === 'EXHAUSTED') return;

    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [interactionState]);

  // Record an authentic interaction event
  const recordEvent = useCallback(
    (eventType: CareerEvent['eventType'], objectId?: string, payload?: Record<string, unknown>) => {
      const newEvent: CareerEvent = {
        sessionId,
        taskId: activeTask.id,
        timestamp: Date.now(),
        eventType,
        objectId,
        payload,
      };
      setEvents((prev) => [...prev, newEvent]);
    },
    [sessionId, activeTask.id]
  );

  // Emit TASK_STARTED on task load
  useEffect(() => {
    if (!hasEmittedStartRef.current) {
      hasEmittedStartRef.current = true;
      recordEvent('TASK_STARTED', activeTask.id, { mission: activeTask.mission, questionNumber: currentTaskIndex + 1 });
    }
  }, [recordEvent, activeTask.id, activeTask.mission, currentTaskIndex]);

  // Handle Tool Inspection (Counts towards exploratory clicks)
  const handleInspectTool = (tool: ToolDefinition) => {
    if (interactionState === 'COMPLETED') return;

    setInspectingTool(tool);
    setInspectorOpen(true);
    setInspectedToolIds((prev) => new Set(prev).add(tool.id));
    recordEvent('OBJECT_INSPECTED', tool.id, { toolName: tool.name });
  };

  // Handle Tool Selection
  const handleSelectTool = (tool: ToolDefinition) => {
    if (interactionState === 'COMPLETED' || interactionState === 'EXHAUSTED') return;

    const nextClicks = clicksUsed + 1;
    setClicksUsed(nextClicks);

    setSelectedTool(tool);
    recordEvent('TOOL_SELECTED', tool.id, { toolName: tool.name, clickNumber: nextClicks });

    const newAttempts = evidence.attempts + 1;

    if (tool.id === activeTask.correctToolId) {
      // Correct Action Selected
      setIsSuccess(true);
      setInteractionState('CORRECT');
      setFeedbackMessage(tool.feedbackMessage || activeTask.instructionalFeedbackOnSuccess);
      recordEvent('ACTION_CORRECT', tool.id, { isCorrect: true, clicksUsed: nextClicks });

      const completionTimestamp = Date.now();
      const updatedEvidence: TaskEvidence = {
        ...evidence,
        attempts: newAttempts,
        clicksUsed: nextClicks,
        correctActions: evidence.correctActions + 1,
        errorsCorrected: evidence.incorrectActions > 0 ? evidence.errorsCorrected + 1 : 0,
        completionTime: completionTimestamp,
        inspectedToolsCount: inspectedToolIds.size,
      };

      setEvidence(updatedEvidence);
      recordEvent('TASK_COMPLETED', activeTask.id, {
        durationMs: completionTimestamp - evidence.startTime,
        attempts: newAttempts,
        clicksUsed: nextClicks,
        inspectedCount: inspectedToolIds.size,
      });

      // Save evaluation item
      const evalItem: TaskEvaluationItem = {
        evidence: updatedEvidence,
        task: activeTask,
        inspectedToolIds: new Set(inspectedToolIds),
      };

      setCompletedEvaluations((prev) => {
        const filtered = prev.filter((item) => item.task.id !== activeTask.id);
        return [...filtered, evalItem];
      });

      // Generate single task report
      const generatedReport = calculateCareerScore(updatedEvidence, activeTask, inspectedToolIds);
      setActiveReport(generatedReport);
      setInteractionState('COMPLETED');

      if (onTaskCompleted) {
        onTaskCompleted(updatedEvidence, generatedReport);
      }
    } else {
      // Incorrect Action Selected
      const newIncorrect = evidence.incorrectActions + 1;
      recordEvent('ACTION_INCORRECT', tool.id, { isCorrect: false, clicksUsed: nextClicks });

      const updatedEvidence: TaskEvidence = {
        ...evidence,
        attempts: newAttempts,
        clicksUsed: nextClicks,
        incorrectActions: newIncorrect,
      };
      setEvidence(updatedEvidence);

      if (nextClicks >= MAX_CLICKS) {
        // Clicks budget exhausted!
        setIsSuccess(false);
        setInteractionState('EXHAUSTED');
        setFeedbackMessage(
          `You have used all 5 exploratory clicks for this challenge. "${tool.name}" is not the right tool. You can proceed to the next question, request a comprehensive analysis of your results, or retry.`
        );
        recordEvent('CLICKS_EXHAUSTED', activeTask.id, { clicksUsed: nextClicks });

        // Save exhausted evaluation
        const evalItem: TaskEvaluationItem = {
          evidence: updatedEvidence,
          task: activeTask,
          inspectedToolIds: new Set(inspectedToolIds),
        };
        setCompletedEvaluations((prev) => {
          const filtered = prev.filter((item) => item.task.id !== activeTask.id);
          return [...filtered, evalItem];
        });
      } else {
        setIsSuccess(false);
        setInteractionState('INCORRECT');
        setFeedbackMessage(
          `${tool.feedbackMessage} (Clicks Remaining: ${MAX_CLICKS - nextClicks}/${MAX_CLICKS})`
        );
      }
    }
  };

  // Next Question Handler
  const handleNextQuestion = () => {
    if (currentTaskIndex < taskList.length - 1) {
      resetForTask(currentTaskIndex + 1);
    } else {
      // Last question reached -> trigger full analysis
      handleAnalyseMe();
    }
  };

  // Comprehensive "Analyse Me" Handler
  const handleAnalyseMe = () => {
    const allEvaluations = [...completedEvaluations];
    // If current task has attempts and isn't saved yet, include it
    if (evidence.attempts > 0 && !allEvaluations.some((e) => e.task.id === activeTask.id)) {
      allEvaluations.push({
        evidence,
        task: activeTask,
        inspectedToolIds: new Set(inspectedToolIds),
      });
    }

    if (allEvaluations.length > 1) {
      const cumulativeReport = calculateMultiTaskCareerScore(allEvaluations, studentId, sessionId);
      setActiveReport(cumulativeReport);
    } else if (allEvaluations.length === 1) {
      const singleReport = calculateCareerScore(
        allEvaluations[0].evidence,
        allEvaluations[0].task,
        allEvaluations[0].inspectedToolIds
      );
      setActiveReport(singleReport);
    } else {
      const fallbackReport = calculateCareerScore(evidence, activeTask, inspectedToolIds);
      setActiveReport(fallbackReport);
    }

    setReportModalOpen(true);
  };

  // Retry / Reset current question clicks
  const handleRetryCurrent = () => {
    setSelectedTool(null);
    setFeedbackMessage(null);
    setIsSuccess(false);
    setInteractionState('IDLE');
    setClicksUsed(0);
    setElapsedSeconds(0);
    setEvidence((prev) => ({
      ...prev,
      attempts: 0,
      clicksUsed: 0,
      startTime: Date.now(),
      completionTime: undefined,
    }));
    recordEvent('TASK_RETRIED', activeTask.id);
  };

  // Full Battery Retake (Resets everything)
  const handleFullRetake = () => {
    const newSessionId = `session-career-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    setSessionId(newSessionId);
    setCompletedEvaluations([]);
    resetForTask(0);
  };

  // Find Tool by Hotspot
  const getToolForHotspot = (hotspot: WorkspaceHotspot) => {
    return activeTask.availableTools.find((t) => t.id === hotspot.toolId);
  };

  const isCurrentCompleted = interactionState === 'COMPLETED';
  const isCurrentExhausted = interactionState === 'EXHAUSTED';

  return (
    <div className="w-full space-y-6">
      
      {/* 1. Question Navigation & Step Tracker Bar */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Question Navigation Tabs */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">quiz</span>
                Question {currentTaskIndex + 1} of {taskList.length}
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {completedEvaluations.length} / {taskList.length} Evaluated
              </span>
            </div>

            {/* Clickable Question Step Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {taskList.map((t, idx) => {
                const isCurrent = idx === currentTaskIndex;
                const isDone = completedEvaluations.some((e) => e.task.id === t.id && e.evidence.correctActions > 0);
                const isAttempted = completedEvaluations.some((e) => e.task.id === t.id);

                let pillStyle = 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700';
                if (isCurrent) {
                  pillStyle = 'bg-indigo-600 text-white border-indigo-700 ring-2 ring-indigo-400/40 font-black shadow-xs';
                } else if (isDone) {
                  pillStyle = 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 font-bold';
                } else if (isAttempted) {
                  pillStyle = 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800';
                }

                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => resetForTask(idx)}
                    className={`px-3 py-1 rounded-xl text-xs border transition-all cursor-pointer flex items-center gap-1.5 ${pillStyle}`}
                    title={`Question ${idx + 1}: ${t.title}`}
                  >
                    <span>Q{idx + 1}</span>
                    {isDone && <span className="material-symbols-outlined text-[13px]">check</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Action: Persistent "Analyse Me" Button */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleAnalyseMe}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-md ${
                completedEvaluations.length > 0 || evidence.attempts > 0
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 shadow-orange-500/20 animate-pulse'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">analytics</span>
              Analyse Me & View Report
            </button>
          </div>

        </div>
      </div>

      {/* 2. Task Header, Mission & Clicks HUD */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                {activeTask.mission}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {activeTask.phase}
              </span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                {activeTask.difficulty}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {activeTask.title}
            </h2>
          </div>

          {/* Real-Time Stopwatch, Clicks Meter & Pace Indicator */}
          <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto bg-slate-50 dark:bg-slate-800/80 p-2 sm:p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700/80">
            
            {/* 5 Clicks Budget HUD */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xs">
              <span className="material-symbols-outlined text-[15px] text-indigo-500">touch_app</span>
              <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                Clicks: <span className={clicksUsed >= 4 ? 'text-rose-500' : 'text-indigo-600 dark:text-indigo-400'}>{clicksUsed}</span>/5
              </span>
              {/* 5 Visual Energy Pips */}
              <div className="flex items-center gap-0.5 ml-1">
                {Array.from({ length: MAX_CLICKS }).map((_, i) => (
                  <span
                    key={i}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i < clicksUsed
                        ? 'bg-rose-500 scale-90'
                        : 'bg-emerald-500 scale-100 shadow-xs shadow-emerald-500/30'
                    }`}
                    title={i < clicksUsed ? 'Used Click' : 'Available Click'}
                  />
                ))}
              </div>
            </div>

            {/* Stopwatch HUD */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 shadow-2xs">
              <span className={`material-symbols-outlined text-[16px] ${isCurrentCompleted ? 'text-emerald-500' : 'text-amber-500 animate-spin'}`}>
                {isCurrentCompleted ? 'check_circle' : 'timelapse'}
              </span>
              <span>{elapsedSeconds}s</span>
            </div>

            {/* Dynamic Pace Indicator */}
            {elapsedSeconds <= 20 ? (
              <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-400/15 text-amber-700 dark:text-amber-300 border border-amber-400/30 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">bolt</span>
                Fast Pace (&lt;20s)
              </span>
            ) : elapsedSeconds <= 45 ? (
              <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-sky-400/15 text-sky-700 dark:text-sky-300 border border-sky-400/30 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">schedule</span>
                Standard Pace
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-indigo-400/15 text-indigo-700 dark:text-indigo-300 border border-indigo-400/30 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">search</span>
                Deep Analysis
              </span>
            )}

            {activeReport && (
              <button
                type="button"
                onClick={() => setReportModalOpen(true)}
                className="px-3 py-1 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 text-xs font-black transition shadow-xs flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">assessment</span>
                View Report
              </button>
            )}
          </div>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
          {activeTask.description}
        </p>
      </div>

      {/* 3. Main Interactive Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Interactive Visual Workbench */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          <div className="relative w-full rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-800 bg-slate-950 shadow-md">
            
            {/* Visual Environment Canvas */}
            <div className="relative w-full aspect-[16/9] overflow-hidden select-none">
              <img
                src={careerAssets.environment.electricalWorkspace}
                alt="Electrical Workbench with diagnostic and hand tools"
                className="w-full h-full object-cover"
                loading="eager"
              />

              {/* Interactive Hotspots Layer */}
              {activeTask.workspaceHotspots.map((hotspot) => {
                const tool = getToolForHotspot(hotspot);
                if (!tool) return null;

                const isSelected = selectedTool?.id === tool.id;
                const isHovered = hoveredHotspotId === hotspot.id;
                const isFocused = focusedHotspotId === hotspot.id;

                let borderStyle = 'border-transparent';
                let bgStyle = 'bg-indigo-500/0 hover:bg-indigo-500/20';

                if (isSelected) {
                  if (interactionState === 'CORRECT' || interactionState === 'COMPLETED') {
                    borderStyle = 'border-emerald-500 ring-4 ring-emerald-400/50 bg-emerald-500/20';
                  } else if (interactionState === 'INCORRECT' || interactionState === 'EXHAUSTED') {
                    borderStyle = 'border-rose-500 ring-4 ring-rose-400/50 bg-rose-500/20';
                  } else {
                    borderStyle = 'border-indigo-500 ring-4 ring-indigo-400/50 bg-indigo-500/25';
                  }
                } else if (isHovered || isFocused) {
                  borderStyle = 'border-amber-400 ring-2 ring-amber-300/60 bg-amber-400/20';
                }

                return (
                  <button
                    key={hotspot.id}
                    type="button"
                    disabled={isCurrentCompleted || (isCurrentExhausted && !isSuccess)}
                    style={{
                      position: 'absolute',
                      top: `${hotspot.topPercent}%`,
                      left: `${hotspot.leftPercent}%`,
                      width: `${hotspot.widthPercent}%`,
                      height: `${hotspot.heightPercent}%`,
                    }}
                    className={`rounded-xl border-2 transition-all duration-150 cursor-pointer focus:outline-none ${borderStyle} ${bgStyle} ${
                      isCurrentCompleted || isCurrentExhausted ? 'cursor-default' : ''
                    }`}
                    aria-label={`${hotspot.ariaLabel} - ${tool.name}`}
                    title={`${tool.name}: Click to inspect or select (${clicksRemaining} clicks left)`}
                    onClick={() => handleInspectTool(tool)}
                    onMouseEnter={() => setHoveredHotspotId(hotspot.id)}
                    onMouseLeave={() => setHoveredHotspotId(null)}
                    onFocus={() => setFocusedHotspotId(hotspot.id)}
                    onBlur={() => setFocusedHotspotId(null)}
                  >
                    {(isHovered || isFocused || isSelected) && (
                      <span className="absolute -top-7 left-1/2 transform -translate-x-1/2 px-2 py-0.5 rounded-md text-[11px] font-bold text-white bg-slate-900/90 border border-slate-700 shadow-md whitespace-nowrap pointer-events-none z-10 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">
                          {isSelected && isSuccess ? 'check_circle' : 'search'}
                        </span>
                        {tool.name}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Workbench Footer Guidance */}
            <div className="px-4 py-2.5 bg-slate-900 text-slate-300 text-xs flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-amber-400">ads_click</span>
                <span>You have <strong>5 total clicks</strong> per challenge to inspect or select instruments.</span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                Clicks Remaining: {clicksRemaining}/5
              </span>
            </div>
          </div>

          {/* Feedback & Result Card */}
          {feedbackMessage && (
            <div
              className={`p-5 rounded-2xl border transition-all animate-fadeIn ${
                isSuccess
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                  : isCurrentExhausted
                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                  : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
              }`}
              role="alert"
              aria-live="polite"
            >
              <div className="flex items-start gap-3.5">
                <span className={`material-symbols-outlined text-2xl mt-0.5 ${
                  isSuccess ? 'text-emerald-600 dark:text-emerald-400' : isCurrentExhausted ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'
                }`}>
                  {isSuccess ? 'verified' : isCurrentExhausted ? 'warning' : 'error'}
                </span>
                <div className="flex-1">
                  <h4 className="text-base font-bold mb-1">
                    {isSuccess
                      ? 'Correct Tool Selected!'
                      : isCurrentExhausted
                      ? '5 Clicks Limit Reached for This Question'
                      : 'Incorrect Instrument Selection'}
                  </h4>
                  <p className="text-sm leading-relaxed">
                    {feedbackMessage}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    
                    {/* If correct: Show Next Question button */}
                    {isSuccess && (
                      <>
                        <button
                          type="button"
                          onClick={handleNextQuestion}
                          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black transition-all shadow-md shadow-emerald-600/20 cursor-pointer flex items-center gap-1.5"
                        >
                          <span>{currentTaskIndex < taskList.length - 1 ? 'Next Question →' : 'Analyse Me & View Final Report'}</span>
                          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setReportModalOpen(true)}
                          className="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-950 text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
                        >
                          <span className="material-symbols-outlined text-[16px]">workspace_premium</span>
                          View Report Card ({activeReport?.scoreBreakdown.totalMarks || 0} pts)
                        </button>
                      </>
                    )}

                    {/* If clicks exhausted (5 clicks): Show Next Question, Analyse Me, or Retry options */}
                    {isCurrentExhausted && !isSuccess && (
                      <>
                        <button
                          type="button"
                          onClick={handleNextQuestion}
                          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                        >
                          <span>Next Question</span>
                          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleAnalyseMe}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 text-xs font-black transition shadow-sm cursor-pointer flex items-center gap-1.5"
                        >
                          <span className="material-symbols-outlined text-[16px]">analytics</span>
                          Analyse Me & Generate Report
                        </button>

                        <button
                          type="button"
                          onClick={handleRetryCurrent}
                          className="px-3.5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                        >
                          <span className="material-symbols-outlined text-[16px]">refresh</span>
                          Retry This Question
                        </button>
                      </>
                    )}

                    {/* If incorrect and still have clicks remaining */}
                    {!isSuccess && !isCurrentExhausted && (
                      <span className="text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[15px]">info</span>
                        Choose another tool from the bench or list below ({clicksRemaining} clicks remaining).
                      </span>
                    )}

                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Available Tools Palette & Controls */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-indigo-600 dark:text-indigo-400">
                  handyman
                </span>
                Available Tools
              </h3>
              <span className="text-xs font-semibold text-slate-400">
                {activeTask.availableTools.length} options
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
              Select an instrument directly or click Inspect to view technical roles and safety standards.
            </p>

            <div className="space-y-3" role="radiogroup" aria-label="Available Diagnostic Tools">
              {activeTask.availableTools.map((tool) => {
                const isSelected = selectedTool?.id === tool.id;

                let cardStateBorder = 'border-slate-200 dark:border-slate-700/80 hover:border-indigo-300 dark:hover:border-indigo-600';
                let cardBg = 'bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/80';

                if (isSelected) {
                  if (interactionState === 'CORRECT' || interactionState === 'COMPLETED') {
                    cardStateBorder = 'border-emerald-500 ring-2 ring-emerald-400/50';
                    cardBg = 'bg-emerald-50/60 dark:bg-emerald-950/40';
                  } else if (interactionState === 'INCORRECT' || interactionState === 'EXHAUSTED') {
                    cardStateBorder = 'border-rose-500 ring-2 ring-rose-400/50';
                    cardBg = 'bg-rose-50/60 dark:bg-rose-950/40';
                  } else {
                    cardStateBorder = 'border-indigo-500 ring-2 ring-indigo-400/50';
                    cardBg = 'bg-indigo-50/60 dark:bg-indigo-950/40';
                  }
                }

                return (
                  <div
                    key={tool.id}
                    className={`rounded-xl border p-3 transition-all duration-150 ${cardStateBorder} ${cardBg}`}
                  >
                    <div className="flex items-center gap-3">
                      <CompositeAssetView tool={tool} size="sm" alt={tool.name} />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                            {tool.name}
                          </h4>
                          <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 shrink-0">
                            {tool.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                          {tool.technicalRole}
                        </p>
                      </div>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleInspectTool(tool)}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700 transition-colors cursor-pointer flex items-center gap-1"
                        aria-label={`Inspect ${tool.name}`}
                      >
                        <span className="material-symbols-outlined text-[15px]">info</span>
                        Inspect
                      </button>

                      <button
                        type="button"
                        disabled={isCurrentCompleted || isCurrentExhausted}
                        onClick={() => handleSelectTool(tool)}
                        className={`px-3.5 py-1 rounded-lg text-xs font-bold text-white transition-all cursor-pointer flex items-center gap-1 shadow-xs ${
                          isSelected
                            ? isSuccess
                              ? 'bg-emerald-600'
                              : 'bg-rose-600'
                            : 'bg-indigo-600 hover:bg-indigo-700'
                        } ${isCurrentCompleted || isCurrentExhausted ? 'opacity-60 cursor-not-allowed' : ''}`}
                        aria-label={`Select ${tool.name} for task`}
                      >
                        <span className="material-symbols-outlined text-[15px]">
                          {isSelected ? (isSuccess ? 'check' : 'close') : 'touch_app'}
                        </span>
                        {isSelected ? 'Selected' : 'Select'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Real-Time Evidence Matrix Card */}
          <TaskEvidencePanel
            evidence={evidence}
            events={events}
            isCompleted={isCurrentCompleted}
          />
        </div>
      </div>

      {/* Tool Inspection Modal */}
      <ToolInspectorModal
        tool={inspectingTool}
        isOpen={inspectorOpen}
        onClose={() => setInspectorOpen(false)}
        onSelectTool={handleSelectTool}
        isSelected={selectedTool?.id === inspectingTool?.id}
        disabled={isCurrentCompleted || isCurrentExhausted}
      />

      {/* Comprehensive Vocational Evaluation Report Modal */}
      <TaskReportModal
        isOpen={reportModalOpen}
        report={activeReport}
        onClose={() => setReportModalOpen(false)}
        onRetake={handleFullRetake}
      />
    </div>
  );
};
