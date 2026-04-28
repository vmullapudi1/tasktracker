import type { AppData, Block, Paper, Project, Todo } from './types';
import { DEFAULT_SETTINGS } from './types';
import { addDays, fmtDateKey, startOfWeek, uid } from './helpers';

export function seedData(): AppData {
  const today = new Date();
  const monday = startOfWeek(today);

  const projects: Project[] = [
    {
      id: 'p1',
      name: 'Thesis: Cortical Plasticity',
      code: 'THESIS',
      active: true,
      paletteIdx: 0,
      targetHours: 600,
      hoursLogged: 312,
      phases: [
        {
          id: uid(),
          name: 'Literature review',
          done: true,
          checkpoints: [
            { id: uid(), name: 'Identify 50 core papers', done: true },
            { id: uid(), name: 'Synthesis draft', done: true },
          ],
        },
        {
          id: uid(),
          name: 'Methodology',
          done: true,
          checkpoints: [
            { id: uid(), name: 'Pilot protocol', done: true },
            { id: uid(), name: 'IRB approval', done: true },
          ],
        },
        {
          id: uid(),
          name: 'Data collection',
          done: false,
          checkpoints: [
            { id: uid(), name: 'Cohort A complete', done: true },
            { id: uid(), name: 'Cohort B complete', done: false },
            { id: uid(), name: 'Cohort C complete', done: false },
          ],
        },
        {
          id: uid(),
          name: 'Analysis',
          done: false,
          checkpoints: [
            { id: uid(), name: 'Preprocessing pipeline', done: false },
            { id: uid(), name: 'Statistical models', done: false },
          ],
        },
        {
          id: uid(),
          name: 'Writing & defense',
          done: false,
          checkpoints: [
            { id: uid(), name: 'Chapter drafts', done: false },
            { id: uid(), name: 'Committee review', done: false },
            { id: uid(), name: 'Defense', done: false },
          ],
        },
      ],
      updates: [
        { id: uid(), date: fmtDateKey(addDays(today, -14)), text: 'Cohort A wrapped, n=24 retained.' },
        { id: uid(), date: fmtDateKey(addDays(today, -3)), text: 'Started recruiting Cohort B.' },
      ],
    },
    {
      id: 'p2',
      name: 'Side study: Attention & Sleep',
      code: 'SLEEP',
      active: true,
      paletteIdx: 1,
      targetHours: 200,
      hoursLogged: 72,
      phases: [
        {
          id: uid(),
          name: 'Proposal',
          done: true,
          checkpoints: [{ id: uid(), name: 'Hypothesis draft', done: true }],
        },
        {
          id: uid(),
          name: 'Pilot',
          done: false,
          checkpoints: [
            { id: uid(), name: 'Recruit 8 subjects', done: true },
            { id: uid(), name: 'Run pilot block', done: false },
          ],
        },
        {
          id: uid(),
          name: 'Full study',
          done: false,
          checkpoints: [
            { id: uid(), name: 'Pre-registration', done: false },
            { id: uid(), name: 'Data collection', done: false },
          ],
        },
        {
          id: uid(),
          name: 'Write-up',
          done: false,
          checkpoints: [{ id: uid(), name: 'Submit to journal', done: false }],
        },
      ],
      updates: [],
    },
    {
      id: 'p3',
      name: 'Coursework: Adv. Statistics',
      code: 'STATS',
      active: true,
      paletteIdx: 2,
      targetHours: 120,
      hoursLogged: 88,
      phases: [
        { id: uid(), name: 'Module 1', done: true, checkpoints: [{ id: uid(), name: 'Problem set', done: true }] },
        { id: uid(), name: 'Module 2', done: true, checkpoints: [{ id: uid(), name: 'Problem set', done: true }] },
        {
          id: uid(),
          name: 'Module 3',
          done: false,
          checkpoints: [
            { id: uid(), name: 'Problem set', done: false },
            { id: uid(), name: 'Midterm', done: false },
          ],
        },
        {
          id: uid(),
          name: 'Final project',
          done: false,
          checkpoints: [
            { id: uid(), name: 'Proposal', done: false },
            { id: uid(), name: 'Submission', done: false },
          ],
        },
      ],
      updates: [],
    },
    {
      id: 'p4',
      name: 'TA: Intro Neuroscience',
      code: 'TA',
      active: true,
      paletteIdx: 3,
      targetHours: 150,
      hoursLogged: 64,
      phases: [
        { id: uid(), name: 'Prep', done: true, checkpoints: [{ id: uid(), name: 'Syllabus review', done: true }] },
        {
          id: uid(),
          name: 'Mid-semester',
          done: false,
          checkpoints: [
            { id: uid(), name: 'Midterm grading', done: true },
            { id: uid(), name: 'Office hours block 1', done: false },
          ],
        },
        {
          id: uid(),
          name: 'End-semester',
          done: false,
          checkpoints: [{ id: uid(), name: 'Final grading', done: false }],
        },
      ],
      updates: [],
    },
  ];

  const blocks: Block[] = [];
  const addBlock = (dayOffset: number, startMin: number, endMin: number, title: string, projectId: string) => {
    blocks.push({
      id: uid(),
      date: fmtDateKey(addDays(monday, dayOffset)),
      start: startMin,
      end: endMin,
      title,
      projectId,
    });
  };

  addBlock(0, 9 * 60, 11 * 60 + 30, 'Cohort B recruitment calls', 'p1');
  addBlock(0, 13 * 60, 15 * 60, 'Stats lecture + notes', 'p3');
  addBlock(0, 15 * 60 + 30, 17 * 60, 'Read attention papers', 'p2');
  addBlock(1, 8 * 60, 9 * 60 + 30, 'Lab meeting', 'p1');
  addBlock(1, 10 * 60, 12 * 60 + 30, 'Pipeline scaffolding', 'p1');
  addBlock(1, 14 * 60, 16 * 60, 'TA office hours', 'p4');
  addBlock(1, 16 * 60 + 30, 18 * 60, 'Sleep pilot prep', 'p2');
  addBlock(2, 9 * 60, 12 * 60, 'Cohort B session — S07', 'p1');
  addBlock(2, 13 * 60, 14 * 60 + 30, 'Stats problem set', 'p3');
  addBlock(2, 15 * 60, 17 * 60, 'Section prep', 'p4');
  addBlock(3, 8 * 60 + 30, 10 * 60, 'Advisor 1:1', 'p1');
  addBlock(3, 10 * 60 + 30, 12 * 60 + 30, 'Methods writing', 'p1');
  addBlock(3, 14 * 60, 17 * 60, 'TA section', 'p4');
  addBlock(4, 9 * 60, 11 * 60, 'Stats: midterm review', 'p3');
  addBlock(4, 11 * 60 + 30, 13 * 60, 'Sleep study IRB amend.', 'p2');
  addBlock(4, 14 * 60, 16 * 60 + 30, 'Cohort B session — S08', 'p1');
  addBlock(5, 10 * 60, 12 * 60, 'Reading: review papers', 'p2');

  const papers: Paper[] = [
    {
      id: uid(),
      title: 'Hebbian dynamics in adult cortical reorganization',
      authors: 'Voss et al., 2024',
      venue: 'Nature Neuroscience',
      addedAt: fmtDateKey(addDays(today, -1)),
      read: true,
      summary:
        'Longitudinal two-photon imaging in adult mice across 12 weeks of forelimb retraining. Tracked spine turnover in M1 layer 2/3.',
      takeaway: 'Spine stabilization, not formation rate, predicts motor recovery — overturns the additive model.',
      projectId: 'p1',
    },
    {
      id: uid(),
      title: 'Sleep spindles gate selective attention encoding',
      authors: 'Kaur & Demir, 2025',
      venue: 'Neuron',
      addedAt: fmtDateKey(addDays(today, -3)),
      read: true,
      summary: 'Closed-loop spindle-locked auditory cueing during NREM. 38 subjects, within-subject design.',
      takeaway: 'Spindle phase, not amplitude, modulates next-day attention performance — a clean phase-coding result.',
      projectId: 'p2',
    },
    {
      id: uid(),
      title: 'Bayesian hierarchical models for small-N neuroimaging',
      authors: 'Okafor et al., 2025',
      venue: 'NeuroImage',
      addedAt: fmtDateKey(addDays(today, -5)),
      read: true,
      summary: 'Tutorial + simulation study on partial pooling for ROI-level fMRI with n<20 per group.',
      takeaway:
        'Use weakly-informative priors anchored to meta-analytic estimates; fixed-effect comparisons are systematically overconfident at small N.',
      projectId: 'p3',
    },
    {
      id: uid(),
      title: 'A unified taxonomy of executive function tasks',
      authors: 'Reyes-Ortiz, 2026',
      venue: 'Annual Review of Psychology',
      addedAt: fmtDateKey(addDays(today, -9)),
      read: false,
      summary: '',
      takeaway: '',
      projectId: 'p4',
    },
    {
      id: uid(),
      title: 'Replay sequences during quiet wakefulness',
      authors: 'Tanaka & Linville, 2025',
      venue: 'Cell',
      addedAt: fmtDateKey(addDays(today, -12)),
      read: false,
      summary: '',
      takeaway: '',
      projectId: 'p1',
    },
  ];

  const todos: Todo[] = [
    { id: uid(), title: 'Email IRB amendment for sleep study', projectId: 'p2', due: fmtDateKey(addDays(today, 1)), done: false, scheduled: false },
    { id: uid(), title: 'Run cohort B subject S09', projectId: 'p1', due: fmtDateKey(addDays(today, 2)), done: false, scheduled: false },
    { id: uid(), title: 'Grade midterm batch 2', projectId: 'p4', due: fmtDateKey(addDays(today, 3)), done: false, scheduled: false },
    { id: uid(), title: 'Stats problem set 6', projectId: 'p3', due: fmtDateKey(addDays(today, 4)), done: false, scheduled: false },
    { id: uid(), title: 'Draft methods §2.3', projectId: 'p1', due: fmtDateKey(addDays(today, 5)), done: false, scheduled: false },
    { id: uid(), title: 'Reply to Voss et al. follow-up email', projectId: 'p1', due: fmtDateKey(addDays(today, 6)), done: false, scheduled: false },
    { id: uid(), title: 'Submit conference abstract', projectId: 'p2', due: fmtDateKey(addDays(today, 10)), done: false, scheduled: false },
  ];

  return { projects, blocks, papers, todos, highlights: [], settings: { ...DEFAULT_SETTINGS } };
}
