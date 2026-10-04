import React, { useState, useEffect, useCallback, useRef } from 'react';
import type {
  ToolDefinition,
  InteractionState,
  CareerEvent,
  TaskEvidence,
  TaskScoreReport,
  EngineeringTopicScore,
  TaskDefinition,
} from '../types/careerDiscovery';
import {
  ENGINEERING_TOPICS,
  generateRandomizedEngineeringAssessment,
} from '../data/engineeringAssessmentData';
import { calculateCareerScore, calculateMultiTaskCareerScore, type TaskEvaluationItem } from '../utils/careerScoring';
import { CompositeAssetView } from './CompositeAssetView';
import { ToolInspectorModal } from './ToolInspectorModal';
import { TaskEvidencePanel } from './TaskEvidencePanel';

const MAX_CLICKS = 5;
const OPTION_LETTERS = ['A', 'B', 'C', 'D'] as const;

interface EngineeringAssessmentViewProps {
  studentId?: string;
  onBackToDomains: () => void;
  onCompleteAssessment: (report: TaskScoreReport, topicScores: EngineeringTopicScore[]) => void;
}

export const EngineeringAssessmentView: React.FC<EngineeringAssessmentViewProps> = ({
  studentId = 'student-auth-user',
  onBackToDomains,
  onCompleteAssessment,
}) => {
  // Generate a fresh randomized 25-question assessment (5 random questions per trade, 4 shuffled options each)
  const [questions] = useState<TaskDefinition[]>(() => generateRandomizedEngineeringAssessment());
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);

  const activeTask = questions[currentQuestionIndex] || questions[0];
  const activeTopic = ENGINEERING_TOPICS.find((t) => t.id === activeTask.topicId) || ENGINEERING_TOPICS[0];

  // Session ID
  const [sessionId] = useState<string>(
    () => `session-eng-25-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
  );

  // Interaction State Machine
  const [interactionState, setInteractionState] = useState<InteractionState>('IDLE');
  const [selectedTool, setSelectedTool] = useState<ToolDefinition | null>(null);
  const [inspectingTool, setInspectingTool] = useState<ToolDefinition | null>(null);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [evidencePanelOpen, setEvidencePanelOpen] = useState(false);

  // 5 Clicks Budget Tracking
  const [clicksUsed, setClicksUsed] = useState<number>(0);
  const clicksRemaining = Math.max(0, MAX_CLICKS - clicksUsed);

  // Live Stopwatch
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [inspectedToolIds, setInspectedToolIds] = useState<Set<string>>(new Set());

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

  // Reset state when navigating questions
  const loadQuestion = useCallback((targetIndex: number) => {
    const newTask = questions[targetIndex];
    if (!newTask) return;
    setCurrentQuestionIndex(targetIndex);
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
  }, [questions, studentId, sessionId]);

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

  // Emit TASK_STARTED on load
  useEffect(() => {
    if (!hasEmittedStartRef.current) {
      hasEmittedStartRef.current = true;
      recordEvent('TASK_STARTED', activeTask.id, {
        topic: activeTask.topicId,
        questionNumber: currentQuestionIndex + 1,
      });
    }
  }, [recordEvent, activeTask.id, activeTask.topicId, currentQuestionIndex]);

  // Handle Tool Inspection
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
      // Correct Tool Selected
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

      const evalItem: TaskEvaluationItem = {
        evidence: updatedEvidence,
        task: activeTask,
        inspectedToolIds: new Set(inspectedToolIds),
      };

      setCompletedEvaluations((prev) => {
        const filtered = prev.filter((item) => item.task.id !== activeTask.id);
        return [...filtered, evalItem];
      });

      setInteractionState('COMPLETED');
    } else {
      // Incorrect Tool Selected
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
        setIsSuccess(false);
        setInteractionState('EXHAUSTED');
        setFeedbackMessage(
          `You have used all 5 exploratory clicks for this question. "${tool.name}" is not the right tool. You can proceed to the next challenge, generate your analysis, or retry.`
        );
        recordEvent('CLICKS_EXHAUSTED', activeTask.id, { clicksUsed: nextClicks });

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

  // Compile Topic Scores & Finalize
  const compileFinalReportAndFinish = () => {
    const allEvaluations = [...completedEvaluations];
    if (evidence.attempts > 0 && !allEvaluations.some((e) => e.task.id === activeTask.id)) {
      allEvaluations.push({
        evidence,
        task: activeTask,
        inspectedToolIds: new Set(inspectedToolIds),
      });
    }

    // Compute Topic-by-Topic Marks Breakdown for all 5 trades
    const topicScores: EngineeringTopicScore[] = ENGINEERING_TOPICS.map((topic) => {
      const topicEvals = allEvaluations.filter((e) => e.task.topicId === topic.id);
      const questionsSolved = topicEvals.filter((e) => e.evidence.correctActions > 0).length;

      let topicMarks = 50; // default baseline
      if (topicEvals.length > 0) {
        const topicReports = topicEvals.map((e) => calculateCareerScore(e.evidence, e.task, e.inspectedToolIds));
        const avgMarks = Math.round(
          topicReports.reduce((acc, r) => acc + r.scoreBreakdown.totalMarks, 0) / topicEvals.length
        );
        topicMarks = avgMarks;
      }

      return {
        topicId: topic.id,
        topicName: topic.name,
        marksObtained: topicMarks,
        questionsAttempted: topicEvals.length,
        questionsSolved,
        avgDurationSec: topicEvals.length > 0
          ? Math.round(
              topicEvals.reduce(
                (acc, e) =>
                  acc +
                  (e.evidence.completionTime
                    ? (e.evidence.completionTime - e.evidence.startTime) / 1000
                    : 30),
                0
              ) / topicEvals.length
            )
          : 0,
      };
    });

    let cumulativeReport: TaskScoreReport;
    if (allEvaluations.length > 1) {
      cumulativeReport = calculateMultiTaskCareerScore(allEvaluations, studentId, sessionId);
    } else if (allEvaluations.length === 1) {
      cumulativeReport = calculateCareerScore(
        allEvaluations[0].evidence,
        allEvaluations[0].task,
        allEvaluations[0].inspectedToolIds
      );
    } else {
      cumulativeReport = calculateCareerScore(evidence, activeTask, inspectedToolIds);
    }

    cumulativeReport.topicScores = topicScores;
    onCompleteAssessment(cumulativeReport, topicScores);
  };

  // Next Question Handler
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      loadQuestion(currentQuestionIndex + 1);
    } else {
      compileFinalReportAndFinish();
    }
  };

  // Retry question
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

  const isCurrentCompleted = interactionState === 'COMPLETED';
  const isCurrentExhausted = interactionState === 'EXHAUSTED';

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-6 animate-fadeIn">
      {/* 1. Top Navigation & Trade Progression Header */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Back & Topic Identity */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToDomains}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Back to Career Domains"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold text-white bg-gradient-to-r ${activeTopic.accentColor}`}
                >
                  <span className="material-symbols-outlined text-[14px]">{activeTopic.icon}</span>
                  {activeTopic.name}
                </span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Trade {activeTopic.tradeNumber} of 5
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                Question {currentQuestionIndex + 1} of {questions.length}: {activeTask.mission}
              </h2>
            </div>
          </div>

          {/* Persistent Action: "Analyse Me / View Results" */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setEvidencePanelOpen((prev) => !prev)}
              className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px]">troubleshoot</span>
              Evidence Log
            </button>

            <button
              type="button"
              onClick={compileFinalReportAndFinish}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs transition shadow-md shadow-orange-500/20 flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">insights</span>
              Analyse Me ({completedEvaluations.length}/{questions.length} Solved)
            </button>
          </div>
        </div>

        {/* 25 Question Progress Tabs grouped by Topic */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto pb-1">
          {questions.map((q, idx) => {
            const isCurrent = idx === currentQuestionIndex;
            const isDone = completedEvaluations.some(
              (e) => e.task.id === q.id && e.evidence.correctActions > 0
            );
            const isAttempted = completedEvaluations.some((e) => e.task.id === q.id);

            let pillStyle =
              'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700';
            if (isCurrent) {
              pillStyle =
                'bg-indigo-600 text-white border-indigo-700 font-bold ring-2 ring-indigo-400/40 shadow-xs';
            } else if (isDone) {
              pillStyle =
                'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 font-bold';
            } else if (isAttempted) {
              pillStyle =
                'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800';
            }

            return (
              <button
                key={q.id}
                type="button"
                onClick={() => loadQuestion(idx)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border transition-all cursor-pointer shrink-0 flex items-center gap-1 ${pillStyle}`}
                title={`Q${idx + 1}: ${q.title}`}
              >
                <span>Q{idx + 1}</span>
                {isDone && <span className="material-symbols-outlined text-[12px]">check</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Active Question Mission & Clicks HUD */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                {activeTask.mission}
              </span>
              <span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                {activeTask.difficulty}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              {activeTask.title}
            </h3>
          </div>

          {/* Real-time HUD: Clicks & Timer */}
          <div className="flex items-center gap-2.5 self-start sm:self-auto bg-slate-50 dark:bg-slate-800/80 p-2 rounded-2xl border border-slate-200 dark:border-slate-700/80">
            {/* 5 Clicks Meter */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xs">
              <span className="material-symbols-outlined text-[15px] text-indigo-500">touch_app</span>
              <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                Clicks:{' '}
                <span
                  className={
                    clicksUsed >= 4
                      ? 'text-rose-500'
                      : 'text-indigo-600 dark:text-indigo-400'
                  }
                >
                  {clicksUsed}
                </span>
                /5
              </span>
              <div className="flex items-center gap-0.5 ml-1">
                {Array.from({ length: MAX_CLICKS }).map((_, i) => (
                  <span
                    key={i}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i < clicksUsed
                        ? 'bg-rose-500 scale-90'
                        : 'bg-emerald-500 scale-100 shadow-xs shadow-emerald-500/30'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Timer */}
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 shadow-2xs">
              <span
                className={`material-symbols-outlined text-[15px] ${
                  isCurrentCompleted ? 'text-emerald-500' : 'text-amber-500 animate-spin'
                }`}
              >
                {isCurrentCompleted ? 'check_circle' : 'timelapse'}
              </span>
              <span>{elapsedSeconds}s</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-300 mt-2.5 leading-relaxed">
          {activeTask.description}
        </p>
      </div>

      {/* 3. High-Visibility Image Workspace & Compact Options Layout */}
      <div className="w-full flex flex-col space-y-3">
        <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-700/80 bg-slate-950 shadow-xl">
          {/* Main Visual Trade Image - Ample height, clear view without dark washout */}
          <div className="relative w-full h-[320px] sm:h-[420px] md:h-[480px] lg:h-[520px] bg-slate-950 flex items-center justify-center overflow-hidden select-none">
            <img
              src={activeTask.environmentImage || activeTopic.environmentImage}
              alt={activeTask.environmentName}
              className="w-full h-full object-contain sm:object-cover object-center"
              loading="eager"
            />
            {/* Subtle soft gradient only at the very edges for text contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40 pointer-events-none" />

            {/* Top Left: Trade Watermark Badge */}
            <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex items-center gap-2 pointer-events-none">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-slate-900/90 text-white border border-slate-700 backdrop-blur-md flex items-center gap-1.5 shadow-md">
                <span className="material-symbols-outlined text-[15px] text-amber-400">
                  {activeTopic.icon}
                </span>
                <span>{activeTopic.name}</span>
                <span className="text-slate-400">•</span>
                <span className="text-amber-300 font-mono">Q{activeTask.topicQuestionIndex}/5</span>
              </span>
            </div>

            {/* Top Right: Clicks Badge */}
            <div className="absolute top-3 right-3 sm:top-4 sm:right-4 pointer-events-none">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-900/90 text-slate-200 border border-slate-700 backdrop-blur-md shadow-md flex items-center gap-1.5 font-mono">
                <span className="material-symbols-outlined text-[15px] text-emerald-400">touch_app</span>
                <span>{clicksRemaining} Clicks Left</span>
              </span>
            </div>
          </div>

          {/* Compact 4-Option Grid (Reduced space, high ergonomics) */}
          <div className="p-3 sm:p-4 bg-slate-900/95 border-t border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-300 mb-2.5 px-0.5">
              <span className="font-bold flex items-center gap-1.5 text-amber-300 text-xs sm:text-sm">
                <span className="material-symbols-outlined text-[16px]">touch_app</span>
                Choose the correct instrument:
              </span>
              <span className="font-mono text-[11px] text-slate-400">
                1 Correct • 4 Options
              </span>
            </div>

            {/* Compact 4-Column Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {activeTask.availableTools.map((tool, optIdx) => {
                const isSelected = selectedTool?.id === tool.id;
                const letter = OPTION_LETTERS[optIdx] || `${optIdx + 1}`;

                let boxStyle =
                  'border-slate-700/80 hover:border-indigo-400/80 bg-slate-800/80 hover:bg-slate-800/95 text-slate-200';
                if (isSelected) {
                  if (interactionState === 'CORRECT' || interactionState === 'COMPLETED') {
                    boxStyle = 'border-emerald-500 ring-2 ring-emerald-400/60 bg-emerald-950/70 text-emerald-100';
                  } else if (interactionState === 'INCORRECT' || interactionState === 'EXHAUSTED') {
                    boxStyle = 'border-rose-500 ring-2 ring-rose-400/60 bg-rose-950/70 text-rose-100';
                  } else {
                    boxStyle = 'border-indigo-500 ring-2 ring-indigo-400/60 bg-indigo-950/70 text-indigo-100';
                  }
                }

                return (
                  <button
                    key={tool.id}
                    type="button"
                    disabled={isCurrentCompleted || isCurrentExhausted}
                    onClick={() => handleSelectTool(tool)}
                    className={`group rounded-xl border p-2.5 sm:p-3 transition-all duration-150 flex flex-col justify-between text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 ${boxStyle} ${
                      isCurrentCompleted || (isCurrentExhausted && !isSuccess) ? 'opacity-85' : ''
                    }`}
                  >
                    {/* Compact Header: Letter + Icon + Info + Category */}
                    <div className="flex items-center justify-between gap-1.5 w-full mb-1.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className={`w-6 h-6 rounded-md font-black font-mono text-[11px] flex items-center justify-center shrink-0 shadow-xs transition-colors ${
                            isSelected
                              ? isSuccess
                                ? 'bg-emerald-500 text-slate-950'
                                : 'bg-rose-500 text-white'
                              : 'bg-slate-700 group-hover:bg-indigo-600 text-white'
                          }`}
                        >
                          {letter}
                        </span>
                        <CompositeAssetView tool={tool} size="sm" alt={tool.name} />
                        <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-700/80 text-slate-300 shrink-0">
                          {tool.category}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleInspectTool(tool);
                        }}
                        className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-700/70 transition cursor-pointer"
                        title="Inspect Instrument Specifications"
                        aria-label={`Inspect ${tool.name}`}
                      >
                        <span className="material-symbols-outlined text-[16px]">info</span>
                      </button>
                    </div>

                    {/* Compact Title & Description */}
                    <div className="space-y-1 my-0.5 flex-1">
                      <h4
                        className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors leading-snug line-clamp-1"
                        title={tool.name}
                      >
                        {tool.name}
                      </h4>
                      <p
                        className="text-[11px] text-slate-300 leading-snug line-clamp-2"
                        title={tool.technicalRole}
                      >
                        {tool.technicalRole}
                      </p>
                    </div>

                    {/* Action / Feedback Status Pill */}
                    <div className="mt-2 pt-1.5 border-t border-slate-700/50 flex items-center justify-between text-[11px]">
                      <span className="font-semibold flex items-center gap-1 text-slate-300 group-hover:text-white">
                        <span className="material-symbols-outlined text-[14px]">
                          {isSelected ? (isSuccess ? 'check_circle' : 'cancel') : 'touch_app'}
                        </span>
                        <span>{isSelected ? (isSuccess ? 'Correct' : 'Incorrect') : `Select Option ${letter}`}</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {isSelected && isSuccess ? '100% Match' : ''}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Feedback & Progression Card */}
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
          >
            <div className="flex items-start gap-3.5">
              <span
                className={`material-symbols-outlined text-2xl mt-0.5 ${
                  isSuccess
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : isCurrentExhausted
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {isSuccess ? 'verified' : isCurrentExhausted ? 'warning' : 'error'}
              </span>
              <div className="flex-1">
                <h4 className="text-base font-bold mb-1">
                  {isSuccess
                    ? 'Correct Instrument Selected!'
                    : isCurrentExhausted
                    ? '5 Clicks Limit Reached for this Scenario'
                    : 'Incorrect Instrument'}
                </h4>
                <p className="text-sm leading-relaxed">{feedbackMessage}</p>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  {isSuccess && (
                    <button
                      type="button"
                      onClick={handleNextQuestion}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs sm:text-sm font-black transition shadow-md flex items-center gap-2 cursor-pointer"
                    >
                      <span>
                        {currentQuestionIndex < questions.length - 1
                          ? activeTask.topicQuestionIndex === 5
                            ? `Completed Trade ${activeTopic.tradeNumber}! Next Trade →`
                            : 'Next Challenge →'
                          : 'Complete Assessment & View Matched Jobs →'}
                      </span>
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </button>
                  )}

                  {isCurrentExhausted && !isSuccess && (
                    <>
                      <button
                        type="button"
                        onClick={handleNextQuestion}
                        className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>Next Question</span>
                        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                      </button>

                      <button
                        type="button"
                        onClick={compileFinalReportAndFinish}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 text-xs font-black transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">analytics</span>
                        Analyse Me Now
                      </button>

                      <button
                        type="button"
                        onClick={handleRetryCurrent}
                        className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">refresh</span>
                        Retry
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Optional Collapsible Evidence Panel */}
        {evidencePanelOpen && (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900 shadow-sm">
            <TaskEvidencePanel
              evidence={evidence}
              events={events}
              isCompleted={isCurrentCompleted}
            />
          </div>
        )}
      </div>

      {/* Tool Inspector Modal */}
      <ToolInspectorModal
        tool={inspectingTool}
        isOpen={inspectorOpen}
        onClose={() => setInspectorOpen(false)}
        onSelectTool={handleSelectTool}
        isSelected={selectedTool?.id === inspectingTool?.id}
        disabled={isCurrentCompleted || isCurrentExhausted}
      />
    </div>
  );
};
