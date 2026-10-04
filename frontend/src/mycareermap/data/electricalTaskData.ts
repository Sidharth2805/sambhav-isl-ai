import type { TaskDefinition, ToolDefinition, WorkspaceHotspot } from '../types/careerDiscovery';
import { careerAssets } from './careerAssets';

// Shared Tool Definitions for Electrical Workbench
const SHARED_MULTIMETER: ToolDefinition = {
  id: 'tool-multimeter',
  name: 'Digital Multimeter',
  category: 'diagnostic',
  technicalRole: 'Measures AC/DC voltage, electrical resistance (Ohms), continuity, and DC current across electrical circuits.',
  educationalDescription: 'Digital Multimeters combine multiple measurement meters into one portable unit. Technicians use the continuity and voltage settings to test whether power reaches the switch and lamp socket without guessing.',
  safetyNotes: 'Always verify meter probe insulation and select the proper range before touching energized terminals.',
  isCorrect: false,
  feedbackMessage: 'The digital multimeter is used for measuring voltage, current, and resistance.',
  standaloneAssetKey: careerAssets.tools.multimeter,
};

const SHARED_SCREWDRIVER: ToolDefinition = {
  id: 'tool-screwdriver',
  name: 'Insulated Screwdriver (1000V VDE)',
  category: 'mechanical',
  technicalRole: 'Fastens, loosens, and tightens slotted and Phillips terminal screws and fixture mountings.',
  educationalDescription: 'An insulated screwdriver is an essential assembly tool for securing wires inside terminal blocks, switch plates, and fixture housings.',
  safetyNotes: 'Use VDE/1000V rated insulated handles when working near electrical components.',
  isCorrect: false,
  feedbackMessage: 'A screwdriver is used for mechanical fastening and tightening screw terminal connections.',
  spriteRegion: {
    x: 66, // right 1/3 of tools_hand_set
    y: 0,
    width: 34,
    height: 100,
  },
};

const SHARED_PLIERS: ToolDefinition = {
  id: 'tool-pliers',
  name: 'Combination Lineman Pliers',
  category: 'mechanical',
  technicalRole: 'Grips, bends, twists, and cuts solid and stranded copper conductors.',
  educationalDescription: 'Lineman pliers provide heavy gripping leverage and side-cutting jaws for manipulating heavy gauge cables during wiring installations.',
  safetyNotes: 'Never use pliers as a testing tool or attempt to cut live energized conductors.',
  isCorrect: false,
  feedbackMessage: 'Pliers are designed to grip, twist, and cut conductors with mechanical leverage.',
  spriteRegion: {
    x: 0, // left 1/3 of tools_hand_set
    y: 0,
    width: 33,
    height: 100,
  },
};

const SHARED_WIRE_STRIPPER: ToolDefinition = {
  id: 'tool-wire-stripper',
  name: 'Precision Wire Stripper',
  category: 'wirework',
  technicalRole: 'Strips polymeric insulation from electrical wires at calibrated AWG/mm² gauges without nicking the copper core.',
  educationalDescription: 'Wire strippers feature precision-ground sizing holes that cleanly cut through rubber/PVC outer insulation so conductors can be inserted into terminal blocks.',
  safetyNotes: 'Match wire diameter to the correct numbered gauge slot to avoid weakening the conductor.',
  isCorrect: false,
  feedbackMessage: 'Wire strippers remove outer insulation without damaging inner conductor strands.',
  spriteRegion: {
    x: 33, // middle 1/3 of tools_hand_set
    y: 0,
    width: 34,
    height: 100,
  },
};

const SHARED_PROBES: ToolDefinition = {
  id: 'tool-probes',
  name: 'CAT III/IV Insulated Test Leads',
  category: 'diagnostic',
  technicalRole: 'Precision test probes that connect to multimeters for low-impedance voltage and continuity touch measurements.',
  educationalDescription: 'Safety-shrouded test probes allow technicians to make positive contact with miniature terminal pins and fuse caps without risking accidental cross-shorting.',
  safetyNotes: 'Ensure finger guard barriers are in place and probe tips are free of oxidation.',
  isCorrect: false,
  feedbackMessage: 'Test probes connect the multimeter to the circuit test points to measure continuity and potential difference.',
  standaloneAssetKey: careerAssets.tools.probesPair,
};

const SHARED_SAFETY_GEAR: ToolDefinition = {
  id: 'tool-safety-gear',
  name: 'VDE Insulated Safety Gloves & Eye Protection',
  category: 'safety',
  technicalRole: 'Protects the technician against high-voltage electrical shocks, arc flashes, and flying particulate debris.',
  educationalDescription: 'Dielectric rubber insulating gloves and impact-rated goggles are mandatory personal protective equipment (PPE) before opening live distribution enclosures.',
  safetyNotes: 'Always perform an air inflation test on gloves prior to every shift to verify dielectric integrity.',
  isCorrect: false,
  feedbackMessage: 'Safety PPE provides the crucial dielectric barrier protecting against shock and arc flash injuries.',
  standaloneAssetKey: careerAssets.safety.gearSet,
};

// Common Hotspots on Workbench
const COMMON_HOTSPOTS: WorkspaceHotspot[] = [
  {
    id: 'hotspot-multimeter',
    toolId: 'tool-multimeter',
    label: 'Digital Multimeter',
    ariaLabel: 'Digital Multimeter on workbench',
    topPercent: 50,
    leftPercent: 21,
    widthPercent: 12,
    heightPercent: 30,
    description: 'Yellow digital multimeter with selector dial and test ports.',
  },
  {
    id: 'hotspot-probes',
    toolId: 'tool-probes',
    label: 'Test Probes',
    ariaLabel: 'Multimeter test probe leads on workbench',
    topPercent: 53,
    leftPercent: 34,
    widthPercent: 7,
    heightPercent: 26,
    description: 'Red positive and black negative insulated test leads.',
  },
  {
    id: 'hotspot-screwdriver',
    toolId: 'tool-screwdriver',
    label: 'Insulated Screwdriver',
    ariaLabel: 'Insulated screwdriver on workbench',
    topPercent: 54,
    leftPercent: 40,
    widthPercent: 4,
    heightPercent: 23,
    description: 'Insulated handle screwdriver for terminal adjustments.',
  },
  {
    id: 'hotspot-pliers',
    toolId: 'tool-pliers',
    label: 'Combination Pliers',
    ariaLabel: 'Combination pliers on workbench',
    topPercent: 55,
    leftPercent: 44,
    widthPercent: 6,
    heightPercent: 25,
    description: 'Orange insulated grip combination lineman pliers.',
  },
  {
    id: 'hotspot-wire-stripper',
    toolId: 'tool-wire-stripper',
    label: 'Wire Stripper',
    ariaLabel: 'Wire stripper on workbench',
    topPercent: 52,
    leftPercent: 52,
    widthPercent: 7,
    heightPercent: 28,
    description: 'Multi-gauge wire stripping and crimping tool.',
  },
  {
    id: 'hotspot-safety-gear',
    toolId: 'tool-safety-gear',
    label: 'Insulated Safety Gear',
    ariaLabel: 'Insulated dielectric gloves and safety goggles on workbench',
    topPercent: 48,
    leftPercent: 63,
    widthPercent: 15,
    heightPercent: 28,
    description: 'VDE dielectric insulated gloves and safety glasses.',
  },
];

const COMMON_PATHWAYS = [
  {
    id: 'pathway-electrical-maintenance',
    title: 'Electrical Systems Maintenance',
    description: 'Diagnose industrial power panels, motor control centers, and commercial facility circuits using professional test instruments.',
    imageAssetKey: careerAssets.pathways.electricalMaintenance,
  },
  {
    id: 'pathway-solar-pv',
    title: 'Solar PV & Clean Energy Systems',
    description: 'Install, commission, and test solar array combiner boxes, inverters, and grid-tied renewable power installations.',
    imageAssetKey: careerAssets.pathways.solarPV,
  },
];

// 1. Task 1: Multimeter Diagnosis
export const ELECTRICAL_TASK_1: TaskDefinition = {
  id: 'task-elec-01-lamp-diag',
  questionNumber: 1,
  title: 'The room lamp is not working. Find the correct tool to investigate the problem.',
  environmentName: 'Basic Electrical Troubleshooting Workspace',
  mission: 'RESTORE POWER TO A ROOM',
  description: 'An indoor lamp circuit has lost power. Before making any repairs or opening enclosed terminals, you must select the appropriate instrument to safely test the circuit voltage and continuity.',
  difficulty: 'Beginner',
  phase: 'Phase 1: Initial Fault Diagnosis',
  correctToolId: 'tool-multimeter',
  instructionalFeedbackOnSuccess: 'Correct! A Digital Multimeter is the fundamental diagnostic instrument used by electrical technicians to measure voltage, test conductor continuity, and verify resistance before taking any corrective actions.',
  availableTools: [
    {
      ...SHARED_MULTIMETER,
      isCorrect: true,
      feedbackMessage: 'Excellent choice! The digital multimeter allows non-destructive diagnosis of power supply, switch operation, and lamp socket integrity.',
    },
    {
      ...SHARED_SCREWDRIVER,
      isCorrect: false,
      feedbackMessage: 'A screwdriver is used for mechanical fastening and tightening connections, but it cannot measure electrical voltage or test for circuit faults.',
    },
    {
      ...SHARED_PLIERS,
      isCorrect: false,
      feedbackMessage: 'Pliers are designed to grip, twist, and cut conductors, not to measure electrical quantities or diagnose electrical faults.',
    },
    {
      ...SHARED_WIRE_STRIPPER,
      isCorrect: false,
      feedbackMessage: 'Wire strippers are used during wiring preparation to remove insulation, not for electrical measurement or troubleshooting.',
    },
    {
      ...SHARED_PROBES,
      isCorrect: false,
      feedbackMessage: 'Test leads are essential accessories, but you must select the primary multimeter unit to conduct the comprehensive voltage measurement.',
    },
    {
      ...SHARED_SAFETY_GEAR,
      isCorrect: false,
      feedbackMessage: 'Safety gear protects the operator, but you also need the active diagnostic instrument to test circuit voltage.',
    },
  ],
  workspaceHotspots: COMMON_HOTSPOTS,
  relatedPathways: COMMON_PATHWAYS,
};

// 2. Task 2: Insulated Screwdriver Terminal Tightening
export const ELECTRICAL_TASK_2: TaskDefinition = {
  id: 'task-elec-02-terminal-tighten',
  questionNumber: 2,
  title: 'Securing a loose switch terminal connection.',
  environmentName: 'Switchbox Assembly & Terminal Enclosure',
  mission: 'SECURE LOOSE TERMINAL CONTACTS',
  description: 'A wall switch connection has become loose, causing intermittent light flickering. After confirming the main circuit breaker is OFF, which insulated tool should you select to firmly tighten the loose conductor screw clamp?',
  difficulty: 'Beginner',
  phase: 'Phase 2: Mechanical Connection Integrity',
  correctToolId: 'tool-screwdriver',
  instructionalFeedbackOnSuccess: 'Correct! An Insulated Screwdriver (1000V VDE) allows you to apply precise rotational torque to tighten terminal screw clamps securely without damaging the conductor or stripping the screw head.',
  availableTools: [
    {
      ...SHARED_SCREWDRIVER,
      isCorrect: true,
      feedbackMessage: 'Spot on! The insulated screwdriver provides proper torque to secure screw clamp terminals tightly, preventing arc hazards and intermittent contact.',
    },
    {
      ...SHARED_PLIERS,
      isCorrect: false,
      feedbackMessage: 'Lineman pliers can damage slotted screw heads and do not provide the axial alignment needed for terminal screws.',
    },
    {
      ...SHARED_WIRE_STRIPPER,
      isCorrect: false,
      feedbackMessage: 'Wire strippers cannot tighten threaded terminal screws.',
    },
    {
      ...SHARED_MULTIMETER,
      isCorrect: false,
      feedbackMessage: 'The multimeter is a measurement instrument; it cannot mechanically turn or tighten terminal screws.',
    },
    {
      ...SHARED_PROBES,
      isCorrect: false,
      feedbackMessage: 'Test probes are fragile measurement tips and must never be used to turn mechanical screws.',
    },
    {
      ...SHARED_SAFETY_GEAR,
      isCorrect: false,
      feedbackMessage: 'Safety gear is essential attire, but you need the mechanical fastening hand tool to tighten the terminal.',
    },
  ],
  workspaceHotspots: COMMON_HOTSPOTS,
  relatedPathways: COMMON_PATHWAYS,
};

// 3. Task 3: Precision Wire Stripper
export const ELECTRICAL_TASK_3: TaskDefinition = {
  id: 'task-elec-03-wire-strip',
  questionNumber: 3,
  title: 'Stripping outer wire insulation without nicking conductor core.',
  environmentName: 'Junction Box Cable Splicing & Preparation',
  mission: 'PREPARE NEW COPPER CONDUCTOR LEAD',
  description: 'You need to splice a new 2.5mm² branch line into a junction box. Which precision tool should you use to strip away the outer PVC insulation cleanly to the exact gauge without scoring, nicking, or weakening the inner copper core?',
  difficulty: 'Intermediate',
  phase: 'Phase 3: Wire Preparation & Splicing',
  correctToolId: 'tool-wire-stripper',
  instructionalFeedbackOnSuccess: 'Correct! A Precision Wire Stripper features laser-calibrated gauge apertures that slice cleanly through insulation while leaving the underlying copper strand intact and mechanically robust.',
  availableTools: [
    {
      ...SHARED_WIRE_STRIPPER,
      isCorrect: true,
      feedbackMessage: 'Perfect! The calibrated sizing holes cut cleanly through insulation without nicking the copper core, avoiding high-resistance hot spots.',
    },
    {
      ...SHARED_PLIERS,
      isCorrect: false,
      feedbackMessage: 'Cutting pliers crush and nick copper conductors when stripping insulation, which can cause the wire to snap under vibration.',
    },
    {
      ...SHARED_SCREWDRIVER,
      isCorrect: false,
      feedbackMessage: 'A screwdriver cannot strip or cut cable insulation.',
    },
    {
      ...SHARED_MULTIMETER,
      isCorrect: false,
      feedbackMessage: 'A multimeter measures electrical values and cannot physically strip insulation.',
    },
    {
      ...SHARED_PROBES,
      isCorrect: false,
      feedbackMessage: 'Test probes cannot strip wires.',
    },
    {
      ...SHARED_SAFETY_GEAR,
      isCorrect: false,
      feedbackMessage: 'Safety gear protects your hands, but you need the wire stripper tool to prepare the conductor.',
    },
  ],
  workspaceHotspots: COMMON_HOTSPOTS,
  relatedPathways: COMMON_PATHWAYS,
};

// 4. Task 4: Combination Lineman Pliers
export const ELECTRICAL_TASK_4: TaskDefinition = {
  id: 'task-elec-04-conductors-cut-twist',
  questionNumber: 4,
  title: 'Cutting and twisting heavy conductor pairs.',
  environmentName: 'Conduit Pull & Conductor Jointing Bench',
  mission: 'JOIN AND TERMINATE SOLID CABLES',
  description: 'During a conduit rough-in, you have pulled stiff copper cables and need to trim excess length and tightly twist the paired neutral lines together before attaching a twist-on wire connector. Which tool delivers the cutting power and gripping leverage needed?',
  difficulty: 'Intermediate',
  phase: 'Phase 4: Heavy Jointing & Conductor Routing',
  correctToolId: 'tool-pliers',
  instructionalFeedbackOnSuccess: 'Correct! Combination Lineman Pliers feature high-leverage knurled jaws and hardened side cutters specifically engineered to cleanly sever solid copper wires and twist conductors into tight, low-resistance splices.',
  availableTools: [
    {
      ...SHARED_PLIERS,
      isCorrect: true,
      feedbackMessage: 'Accurate! Lineman pliers provide the gripping surface and torque needed to bind solid copper wires uniformly before capping.',
    },
    {
      ...SHARED_SCREWDRIVER,
      isCorrect: false,
      feedbackMessage: 'A screwdriver has no jaws or cutting blades to grip or trim multiple solid cables.',
    },
    {
      ...SHARED_WIRE_STRIPPER,
      isCorrect: false,
      feedbackMessage: 'Wire strippers are made for stripping and light gauge trimming, not for heavy twisting of solid multi-conductor bundles.',
    },
    {
      ...SHARED_MULTIMETER,
      isCorrect: false,
      feedbackMessage: 'A multimeter is an electronic diagnostic device, not a mechanical cutting tool.',
    },
    {
      ...SHARED_PROBES,
      isCorrect: false,
      feedbackMessage: 'Probes are electronic measurement tips.',
    },
    {
      ...SHARED_SAFETY_GEAR,
      isCorrect: false,
      feedbackMessage: 'Safety gear does not perform cutting or wire twisting.',
    },
  ],
  workspaceHotspots: COMMON_HOTSPOTS,
  relatedPathways: COMMON_PATHWAYS,
};

// 5. Task 5: Multimeter Test Probes for Continuity
export const ELECTRICAL_TASK_5: TaskDefinition = {
  id: 'task-elec-05-continuity-leads',
  questionNumber: 5,
  title: 'Verifying continuity across an enclosed cartridge fuse.',
  environmentName: 'Safety Disconnect & Component Quality Testing',
  mission: 'TEST CARTRIDGE FUSE INTEGRITY',
  description: 'A safety disconnect switch has cut power to an appliance. To verify whether the internal cartridge fuse has blown without dismantling the assembly, what specialized multimeter accessories must you touch across the metal end caps?',
  difficulty: 'Intermediate',
  phase: 'Phase 5: Component-Level Continuity Verification',
  correctToolId: 'tool-probes',
  instructionalFeedbackOnSuccess: 'Correct! Insulated Test Probes (red positive and black negative) allow precise point contact across the fuse terminal ferrules to register continuity (0 Ohms) or an open circuit (OL / blown fuse).',
  availableTools: [
    {
      ...SHARED_PROBES,
      isCorrect: true,
      feedbackMessage: 'Excellent precision! The insulated test leads allow narrow contact points across the fuse ferrules to test for 0-Ohm continuity.',
    },
    {
      ...SHARED_SCREWDRIVER,
      isCorrect: false,
      feedbackMessage: 'Touching a metal screwdriver across a fuse does not measure electrical continuity.',
    },
    {
      ...SHARED_PLIERS,
      isCorrect: false,
      feedbackMessage: 'Pliers cannot read or indicate electrical continuity.',
    },
    {
      ...SHARED_WIRE_STRIPPER,
      isCorrect: false,
      feedbackMessage: 'Wire strippers cannot test fuse continuity.',
    },
    {
      ...SHARED_SAFETY_GEAR,
      isCorrect: false,
      feedbackMessage: 'Safety gear is necessary protective wear, but probe leads are required to connect the meter to the component.',
    },
    {
      ...SHARED_MULTIMETER,
      isCorrect: false,
      feedbackMessage: 'The multimeter unit requires its paired test probes to be physically touched across the component test points.',
    },
  ],
  workspaceHotspots: COMMON_HOTSPOTS,
  relatedPathways: COMMON_PATHWAYS,
};

// 6. Task 6: VDE Safety Gloves & PPE
export const ELECTRICAL_TASK_6: TaskDefinition = {
  id: 'task-elec-06-ppe-safety',
  questionNumber: 6,
  title: 'Personal Protective Equipment before high-voltage panel inspection.',
  environmentName: 'Main Industrial Power Distribution Center (415V 3-Phase)',
  mission: 'ENSURE ARC FLASH & SHOCK SAFETY PROTOCOL',
  description: 'Before opening the protective deadfront cover of a 415V commercial power distribution panel to perform live voltage verification, what essential personal protective equipment must you don to protect yourself against accidental shock and arc flash?',
  difficulty: 'Advanced',
  phase: 'Phase 6: High-Voltage Safety Protocol & PPE Verification',
  correctToolId: 'tool-safety-gear',
  instructionalFeedbackOnSuccess: 'Correct! VDE Dielectric Insulated Safety Gloves and protective eye gear are life-saving PPE required by Indian Standards (IS 13774) and OSHA standards before touching or inspecting live distribution gear.',
  availableTools: [
    {
      ...SHARED_SAFETY_GEAR,
      isCorrect: true,
      feedbackMessage: 'Outstanding safety discipline! Dielectric insulated gloves and safety goggles create an impenetrable barrier against shock hazards and arc flashes.',
    },
    {
      ...SHARED_MULTIMETER,
      isCorrect: false,
      feedbackMessage: 'Never open a high-energy panel without putting on your certified PPE first.',
    },
    {
      ...SHARED_SCREWDRIVER,
      isCorrect: false,
      feedbackMessage: 'Opening or loosening panels without wearing PPE violates core industrial safety protocols.',
    },
    {
      ...SHARED_PLIERS,
      isCorrect: false,
      feedbackMessage: 'PPE must be put on before handling any tools near high-capacity electrical panels.',
    },
    {
      ...SHARED_WIRE_STRIPPER,
      isCorrect: false,
      feedbackMessage: 'Safety equipment takes precedence before conducting any mechanical or wire work.',
    },
    {
      ...SHARED_PROBES,
      isCorrect: false,
      feedbackMessage: 'You must don insulating gloves and eye protection before applying test probes to live 415V phase busbars.',
    },
  ],
  workspaceHotspots: COMMON_HOTSPOTS,
  relatedPathways: COMMON_PATHWAYS,
};

// Comprehensive Question Bank (6 Questions)
export const ELECTRICAL_TASKS: TaskDefinition[] = [
  ELECTRICAL_TASK_1,
  ELECTRICAL_TASK_2,
  ELECTRICAL_TASK_3,
  ELECTRICAL_TASK_4,
  ELECTRICAL_TASK_5,
  ELECTRICAL_TASK_6,
];
