import type { JobPathwayDetailed } from '../../types/careerDiscovery';
import { careerAssets } from './careerAssets';

export const DETAILED_ENGINEERING_JOB_ROADMAPS: JobPathwayDetailed[] = [
  // 1. Electrical Engineering (Image: electrical.png)
  {
    id: 'job-power-grid-engineer',
    title: 'Electrical Power Systems & Smart Grid Engineer',
    topicId: 'electrical',
    topicName: 'Electrical Engineering',
    category: 'Heavy Power, Grid & Renewable Utilities',
    matchPercentage: 98,
    demandLevel: 'Very High',
    overview: 'Designs, commissions, and protects high-voltage electrical substations, industrial power distribution switchgear, and smart grid automation architectures.',
    rationale: 'Your exceptional scores in electrical fault isolation, insulation diagnostics, and circuit safety standards directly align with heavy electrical transmission and distribution engineering.',
    imageAssetKey: careerAssets.trades.electrical,
    recommendedMajors: [
      'B.Tech / B.E. in Electrical & Electronics Engineering (EEE)',
      'Diploma in Electrical Engineering & Power Systems',
      'M.Tech in Power Electronics, Drives & Smart Grids',
    ],
    coreSubjectsToMaster: [
      'Power System Analysis & High Voltage Engineering (IS 732 / IEC 61850)',
      'Electrical Machines, Induction Motors & Transformers',
      'Switchgear Protection, Relay Coordination & Circuit Breakers',
      'Control Systems & SCADA Industrial Telemetry',
      'Renewable Energy Integration & Battery Energy Storage Systems (BESS)',
    ],
    salaryTiers: [
      {
        level: 'Entry / Average',
        rangeLPA: '4.5 – 7.5 LPA',
        experienceYears: '0 – 2 Years',
        typicalJobRole: 'Junior Electrical Engineer / Substation Field Trainee',
        keyCompetenciesExpected: [
          'Single-line diagram (SLD) schematic reading',
          'Switchgear cable termination & insulation resistance testing (Megger)',
          'Basic relay tripping tests and load calculation compliance',
        ],
      },
      {
        level: 'Proficient / Experienced',
        rangeLPA: '9.0 – 18.0 LPA',
        experienceYears: '3 – 6 Years',
        typicalJobRole: 'Senior Electrical Project Engineer / Commissioning Lead',
        keyCompetenciesExpected: [
          'ETAP / PSCAD power system fault flow simulations',
          'Substation automation and SCADA/RTU integration',
          'Transformer oil dissolved gas analysis (DGA) diagnostics',
        ],
      },
      {
        level: 'Pro / Senior Specialist',
        rangeLPA: '22.0 – 42.0+ LPA',
        experienceYears: '7+ Years',
        typicalJobRole: 'Principal Power Grid Architect / Chief Electrical Consultant',
        keyCompetenciesExpected: [
          'High-Voltage Direct Current (HVDC) transmission design',
          'National smart grid stability and microgrid islanding architecture',
          'Regulatory compliance (CERC / IEEE standards) leadership',
        ],
      },
    ],
    roadmapPhases: [
      {
        phaseNumber: 1,
        phaseName: 'Foundation & Core Theory (Years 1–2)',
        timeline: 'Semesters 1 to 4',
        recommendedMajorsAndSubjects: ['Circuit Theory', 'Electromagnetic Fields', 'Analog & Digital Electronics', 'Engineering Mathematics'],
        coreMilestones: [
          'Master Kirchhoff’s laws, AC phasor algebra, and balanced 3-phase systems',
          'Build strong proficiency in multimeters, oscilloscopes, and safety PPE',
        ],
        certificationsAndProjects: ['AutoCAD Electrical CAD Certification', 'Lab bench DC power supply and inverter circuit project'],
      },
      {
        phaseNumber: 2,
        phaseName: 'Specialized Systems & Industrial Labs (Years 3–4)',
        timeline: 'Semesters 5 to 8',
        recommendedMajorsAndSubjects: ['Power Systems Protection', 'Power Electronics', 'Electric Drives', 'Microcontrollers & PLCs'],
        coreMilestones: [
          'Perform short-circuit fault calculations and protective relay curves',
          'Complete 6-month industrial internship at power utility or manufacturing plant',
        ],
        certificationsAndProjects: ['ETAP Power System Analysis Certified Specialist', 'Solar PV Grid-Tied Inverter Capstone Project'],
      },
      {
        phaseNumber: 3,
        phaseName: 'Professional Practice & Advanced Architecture (Industry)',
        timeline: 'Post-Graduation Career',
        recommendedMajorsAndSubjects: ['SCADA/EMS Systems', 'High Voltage Engineering', 'Energy Audit Management'],
        coreMilestones: [
          'Lead greenfield 33kV/11kV substation commissioning project',
          'Publish technical case studies on power factor optimization',
        ],
        certificationsAndProjects: ['Certified Energy Auditor (BEE India)', 'Chartered Engineer (IEI) Professional License'],
      },
    ],
    deafAccessibilityAdvantages: [
      'Visual SCADA mimic displays and automated digital telemetry alarms eliminate reliance on audio indicators.',
      'Schematic-driven CAD design and computerized load simulation workflows are 100% visual and text-based.',
      'High-contrast digital multimeter displays, color-coded safety lockout tags (LOTO), and visual strobe indicators.',
    ],
  },

  // 2. Mechanical Engineering (Image: mechnical.png)
  {
    id: 'job-mechanical-cad-engineer',
    title: 'Mechanical Design & Precision Automotive Engineer',
    topicId: 'mechanical',
    topicName: 'Mechanical Engineering',
    category: 'CAD, Robotics & Automotive Powertrain',
    matchPercentage: 95,
    demandLevel: 'High',
    overview: 'Develops precision 3D CAD mechanical assemblies, simulates structural stress using Finite Element Analysis (FEA), and designs electric vehicle (EV) powertrain mechanisms.',
    rationale: 'Your high marks in vernier caliper precision, torque wrench calibration, bearing extraction, and runout metrology match mechanical engineering excellence.',
    imageAssetKey: careerAssets.trades.mechanical,
    recommendedMajors: [
      'B.Tech / B.E. in Mechanical Engineering',
      'B.Tech in Automobile / Mechatronics Engineering',
      'M.Tech in Computer-Aided Design & Manufacturing (CAD/CAM)',
    ],
    coreSubjectsToMaster: [
      'Solid Mechanics & Strength of Materials (GD&T / ASME Y14.5)',
      'Thermodynamics, Fluid Dynamics & Heat Transfer',
      'Kinematics & Dynamics of Machines',
      'Finite Element Analysis (FEA / ANSYS) & Computational Fluid Dynamics (CFD)',
      'Manufacturing Processes, CNC Machining & 3D Additive Printing',
    ],
    salaryTiers: [
      {
        level: 'Entry / Average',
        rangeLPA: '4.5 – 7.0 LPA',
        experienceYears: '0 – 2 Years',
        typicalJobRole: 'Junior Mechanical CAD Drafter / CAE Trainee',
        keyCompetenciesExpected: [
          '3D parametric part modeling in SolidWorks / CATIA / Fusion 360',
          'Geometric Dimensioning & Tolerancing (GD&T) drawing production',
          'Basic static structural stress analysis in ANSYS',
        ],
      },
      {
        level: 'Proficient / Experienced',
        rangeLPA: '8.5 – 17.5 LPA',
        experienceYears: '3 – 6 Years',
        typicalJobRole: 'Senior Mechanical Product Design Engineer',
        keyCompetenciesExpected: [
          'Non-linear dynamic crash simulation and fatigue life calculation',
          'Design for Manufacturability & Assembly (DFMA) plastic/die-cast tooling',
          'EV battery pack thermal management cooling jacket design',
        ],
      },
      {
        level: 'Pro / Senior Specialist',
        rangeLPA: '20.0 – 40.0+ LPA',
        experienceYears: '7+ Years',
        typicalJobRole: 'Chief Mechanical Systems Architect / Lead Vehicle Dynamics Engineer',
        keyCompetenciesExpected: [
          'Complete vehicle chassis structural optimization and lightweighting',
          'High-speed rotating turbomachinery aerodynamic optimization',
          'Autonomous multi-axis robotics kinematics and actuator control',
        ],
      },
    ],
    roadmapPhases: [
      {
        phaseNumber: 1,
        phaseName: 'Core Mechanics & CAD Modeling (Years 1–2)',
        timeline: 'Semesters 1 to 4',
        recommendedMajorsAndSubjects: ['Engineering Mechanics', 'Material Science', 'Fluid Mechanics', 'Machine Drawing'],
        coreMilestones: [
          'Master parametric 3D CAD modeling, assembly constraints, and GD&T drawings',
          'Fabricate machined lathe and milling components in mechanical workshop',
        ],
        certificationsAndProjects: ['Certified SolidWorks Associate (CSWA)', 'High-efficiency 3-speed planetary gearbox assembly'],
      },
      {
        phaseNumber: 2,
        phaseName: 'FEA Simulation & Mechatronics (Years 3–4)',
        timeline: 'Semesters 5 to 8',
        recommendedMajorsAndSubjects: ['Design of Machine Elements', 'Automobile Engineering', 'Robotics', 'Refrigeration & AC'],
        coreMilestones: [
          'Perform modal and thermal stress simulations using ANSYS Workbench',
          'Design Formula Student EV racecar suspension and chassis',
        ],
        certificationsAndProjects: ['ANSYS Certified Simulation Professional', 'EV Battery Thermal Management Enclosure Capstone'],
      },
      {
        phaseNumber: 3,
        phaseName: 'Advanced Product Engineering & DFM (Industry)',
        timeline: 'Post-Graduation Career',
        recommendedMajorsAndSubjects: ['Non-linear Finite Element Analysis', 'Additive Manufacturing', 'Robotic Automation'],
        coreMilestones: [
          'Lead full mechanical product design from concept through injection molding tooling',
          'Secure patent on lightweight high-torque robotic harmonic drive',
        ],
        certificationsAndProjects: ['Certified SolidWorks Professional (CSWP)', 'DFSS (Design for Six Sigma) Green Belt'],
      },
    ],
    deafAccessibilityAdvantages: [
      'Visual 3D CAD models, finite element stress color contour maps, and kinematics motion simulations are entirely visual.',
      'Digital vernier calipers, micrometers, and CMM inspection machines provide large digital readouts.',
      'Engineering blueprints and revision tracking happen through text and PLM software (Teamcenter/Windchill).',
    ],
  },

  // 3. Civil & Structural Engineering (Image: civil.png)
  {
    id: 'job-structural-civil-engineer',
    title: 'Civil Infrastructure & Structural Design Engineer',
    topicId: 'civil',
    topicName: 'Civil & Structural Engineering',
    category: 'BIM, Smart Cities & Infrastructure',
    matchPercentage: 92,
    demandLevel: 'Very High',
    overview: 'Analyzes high-rise structural stability, designs earthquake-resistant RCC/steel bridges, and models 3D Building Information Modeling (BIM) architectures.',
    rationale: 'Your high score in optical auto-leveling, concrete slump testing, rebar scanning, and plumb bob verticality aligns with certified structural engineering.',
    imageAssetKey: careerAssets.trades.civil,
    recommendedMajors: [
      'B.Tech / B.E. in Civil Engineering',
      'B.Tech in Construction Management & Smart Infrastructure',
      'M.Tech in Structural Engineering / Geotechnical Engineering',
    ],
    coreSubjectsToMaster: [
      'Structural Analysis & Design of Concrete Structures (IS 456 / IS 1893 Earthquake)',
      'Design of Steel Structures (IS 800) & Pre-stressed Concrete',
      'Geotechnical Engineering, Soil Mechanics & Deep Foundation Piling',
      'Building Information Modeling (Revit BIM / Tekla Structures / STAAD.Pro)',
      'Surveying, GIS Mapping & Project Scheduling (Primavera / MS Project)',
    ],
    salaryTiers: [
      {
        level: 'Entry / Average',
        rangeLPA: '4.2 – 7.0 LPA',
        experienceYears: '0 – 2 Years',
        typicalJobRole: 'Junior Site Engineer / Structural Modeling Trainee',
        keyCompetenciesExpected: [
          'Bar bending schedule (BBS) calculation and concrete mix quality checks',
          'STAAD.Pro / ETABS 3D structural frame modeling',
          'Total Station surveying and elevation benchmark setting',
        ],
      },
      {
        level: 'Proficient / Experienced',
        rangeLPA: '8.5 – 18.0 LPA',
        experienceYears: '3 – 6 Years',
        typicalJobRole: 'Senior Structural Design Engineer / BIM Manager',
        keyCompetenciesExpected: [
          'High-rise seismic response spectrum analysis and wind tunnel simulation',
          'Pre-stressed concrete girder bridge design and post-tensioning inspection',
          'Revit BIM 4D construction sequencing and clash detection',
        ],
      },
      {
        level: 'Pro / Senior Specialist',
        rangeLPA: '22.0 – 45.0+ LPA',
        experienceYears: '7+ Years',
        typicalJobRole: 'Chief Structural Consultant / Metro Rail Project Director',
        keyCompetenciesExpected: [
          'Mega-infrastructure suspension bridge and underground tunnel engineering',
          'Carbon-neutral smart green building certification (IGBC / LEED Platinum)',
          'Government statutory structural safety audit certification',
        ],
      },
    ],
    roadmapPhases: [
      {
        phaseNumber: 1,
        phaseName: 'Mechanics & Surveying Foundations (Years 1–2)',
        timeline: 'Semesters 1 to 4',
        recommendedMajorsAndSubjects: ['Strength of Materials', 'Fluid Mechanics', 'Surveying & Geomatics', 'Building Materials'],
        coreMilestones: [
          'Master Total Station electronic surveying, leveling, and contour mapping',
          'Calculate shear force, bending moments, and deflection for beam frames',
        ],
        certificationsAndProjects: ['AutoCAD Civil Certification', 'Campus Topographical Contour Survey & Soil Bearing Test'],
      },
      {
        phaseNumber: 2,
        phaseName: 'Structural Design & BIM Specialization (Years 3–4)',
        timeline: 'Semesters 5 to 8',
        recommendedMajorsAndSubjects: ['Design of RCC & Steel', 'Soil Mechanics', 'Transportation Engineering', 'Environmental Engineering'],
        coreMilestones: [
          'Model G+15 high-rise RCC building in ETABS with seismic zone V loading',
          'Draft structural rebar detailing sheets compliant with IS 13920 ductile standards',
        ],
        certificationsAndProjects: ['Autodesk Revit BIM Professional', 'Seismic-Resistant Hospital Building Capstone Project'],
      },
      {
        phaseNumber: 3,
        phaseName: 'Mega-Infrastructure & Project Leadership (Industry)',
        timeline: 'Post-Graduation Career',
        recommendedMajorsAndSubjects: ['Bridge Engineering', 'Advanced Foundation Dynamics', 'Construction Law & Contracts'],
        coreMilestones: [
          'Sign off on certified structural stability audits for commercial developments',
          'Direct multi-crore infrastructure metro viaduct construction',
        ],
        certificationsAndProjects: ['Chartered Structural Engineer License', 'PMP (Project Management Professional) Certification'],
      },
    ],
    deafAccessibilityAdvantages: [
      'Visual architectural plans, 3D BIM models, and structural color stress diagrams provide 100% visual clarity.',
      'Site laser measuring instruments, total stations, and rebar scanners feature bright digital displays.',
      'Construction progress and site quality logs are managed digitally via iPad/tablet inspection software (PlanRadar/Procore).',
    ],
  },

  // 4. Computer Science & Software Engineering (Image: computer science.png)
  {
    id: 'job-cloud-software-architect',
    title: 'Cloud Systems Architect & Full-Stack Platform Engineer',
    topicId: 'software',
    topicName: 'Computer Science & Software',
    category: 'Cloud, Distributed Systems & AI',
    matchPercentage: 96,
    demandLevel: 'Very High',
    overview: 'Architects scalable cloud microservices, designs resilient distributed database backends, optimizes API latency, and implements automated CI/CD DevOps infrastructure.',
    rationale: 'Your high score in network packet analysis, Git version control recovery, SQL query indexing, and container orchestration matches elite software engineering.',
    imageAssetKey: careerAssets.trades.computerScience,
    recommendedMajors: [
      'B.Tech / B.E. in Computer Science & Engineering (CSE)',
      'B.Tech in Artificial Intelligence & Data Science (AI & DS)',
      'M.Tech / M.S. in Distributed Systems & Cloud Computing',
    ],
    coreSubjectsToMaster: [
      'Data Structures, Graph Algorithms & Time Complexity Analysis (Big-O)',
      'Distributed Systems, Microservices & Database Indexing (PostgreSQL / Redis)',
      'Operating Systems, Linux Kernel Internals & TCP/IP Computer Networks',
      'Cloud Architecture (AWS / GCP / Kubernetes / Terraform Infrastructure as Code)',
      'System Design, Load Balancing, Caching & Event-Driven Message Queues (Kafka)',
    ],
    salaryTiers: [
      {
        level: 'Entry / Average',
        rangeLPA: '6.0 – 12.0 LPA',
        experienceYears: '0 – 2 Years',
        typicalJobRole: 'Software Development Engineer I (SDE 1) / Full-Stack Trainee',
        keyCompetenciesExpected: [
          'Clean backend API development (Node.js/TypeScript, Python, Java/Go)',
          'Relational database schema modeling, SQL query writes, and unit testing',
          'Git version control branching, PR code reviews, and containerization',
        ],
      },
      {
        level: 'Proficient / Experienced',
        rangeLPA: '15.0 – 32.0 LPA',
        experienceYears: '3 – 6 Years',
        typicalJobRole: 'Senior Software Engineer / DevOps Platform Lead',
        keyCompetenciesExpected: [
          'High-throughput microservices handling 10,000+ requests/sec with low latency',
          'Kubernetes cluster deployment, CI/CD pipelines, and zero-downtime updates',
          'Distributed caching (Redis), asynchronous task queues, and DB sharding',
        ],
      },
      {
        level: 'Pro / Senior Specialist',
        rangeLPA: '35.0 – 75.0+ LPA',
        experienceYears: '7+ Years',
        typicalJobRole: 'Principal Cloud Architect / VP of Engineering',
        keyCompetenciesExpected: [
          'Multi-region active-active distributed cloud architectures (99.999% SLA)',
          'Enterprise security governance, SOC 2 compliance, and zero-trust mesh',
          'Large-scale AI model serving infrastructure with GPU cluster auto-scaling',
        ],
      },
    ],
    roadmapPhases: [
      {
        phaseNumber: 1,
        phaseName: 'Algorithms, Data Structures & Core CS (Years 1–2)',
        timeline: 'Semesters 1 to 4',
        recommendedMajorsAndSubjects: ['Data Structures & Algorithms', 'Discrete Mathematics', 'Database Management Systems', 'OOP in Java/C++'],
        coreMilestones: [
          'Solve 300+ LeetCode problems covering Trees, Graphs, Dynamic Programming',
          'Build and deploy a full-stack web application with authentication and SQL backend',
        ],
        certificationsAndProjects: ['AWS Certified Cloud Practitioner', 'Real-Time Collaborative Code Editor with WebSockets'],
      },
      {
        phaseNumber: 2,
        phaseName: 'Distributed Systems, Cloud & Microservices (Years 3–4)',
        timeline: 'Semesters 5 to 8',
        recommendedMajorsAndSubjects: ['Computer Networks', 'Operating Systems', 'Cloud Computing', 'Compiler Design'],
        coreMilestones: [
          'Architect containerized microservices orchestrated on Kubernetes',
          'Implement distributed caching and message broker pipelines in high-load projects',
        ],
        certificationsAndProjects: ['Certified Kubernetes Administrator (CKA)', 'Distributed Event-Driven E-Commerce Engine Capstone'],
      },
      {
        phaseNumber: 3,
        phaseName: 'System Architecture, Scalability & Engineering Leadership (Industry)',
        timeline: 'Post-Graduation Career',
        recommendedMajorsAndSubjects: ['System Design Architecture', 'Site Reliability Engineering (SRE)', 'Machine Learning Engineering'],
        coreMilestones: [
          'Scale distributed system to millions of daily active users with sub-50ms latency',
          'Lead technical design reviews (RFCs) across cross-functional engineering pods',
        ],
        certificationsAndProjects: ['AWS Certified Solutions Architect – Professional', 'Google Cloud Certified Professional Cloud Architect'],
      },
    ],
    deafAccessibilityAdvantages: [
      'Entirely digital, asynchronous workflow utilizing Git pull requests, GitHub/GitLab code reviews, and visual dashboards.',
      'IDE syntax highlighting, linter alerts, and unit test suites provide 100% visual feedback.',
      'Standard tech industry communication operates via Slack, Discord, Jira tickets, and async documentation (Notion/Confluence).',
    ],
  },

  // 5. Metallurgical & Materials Engineering (Image: metullergy.png)
  {
    id: 'job-metallurgical-materials-engineer',
    title: 'Metallurgical & Advanced Materials Process Engineer',
    topicId: 'metallurgy',
    topicName: 'Metallurgical & Materials Engineering',
    category: 'Aerospace Alloys, Pyrometallurgy & NDT Inspection',
    matchPercentage: 94,
    demandLevel: 'High',
    overview: 'Directs primary metal smelting, optimizes steel heat treatment processes (austenitizing, quenching, tempering), and conducts non-destructive testing (NDT) on aerospace alloys.',
    rationale: 'Your high score in optical metallography, Rockwell hardness analysis, ultrasonic flaw inspection, and furnace pyrometry directly matches metallurgical process engineering.',
    imageAssetKey: careerAssets.trades.metallurgy,
    recommendedMajors: [
      'B.Tech / B.E. in Metallurgical & Materials Engineering',
      'B.Tech in Materials Science & Nanotechnology',
      'M.Tech in Process Metallurgy, Welding & Corrosion Science',
    ],
    coreSubjectsToMaster: [
      'Physical Metallurgy, Phase Diagrams (Fe-C) & Heat Treatment',
      'Extractive Metallurgy, Blast Furnace Ironmaking & Steelmaking',
      'Mechanical Behavior of Materials, Fracture & Fatigue (ASTM E8/E23)',
      'Non-Destructive Testing (ASNT NDT Level II in UT, MPI, DPT, RT)',
      'Corrosion Science, Electrochemistry & Protective Surface Coatings',
    ],
    salaryTiers: [
      {
        level: 'Entry / Average',
        rangeLPA: '4.8 – 7.8 LPA',
        experienceYears: '0 – 2 Years',
        typicalJobRole: 'Junior Metallurgist / QA Inspection Metallographer',
        keyCompetenciesExpected: [
          'Sample polishing, chemical etching, and optical grain size analysis (ASTM E112)',
          'Rockwell / Brinell hardness testing and tensile coupon prep',
          'Liquid dye penetrant (DPT) and magnetic particle testing (MPI)',
        ],
      },
      {
        level: 'Proficient / Experienced',
        rangeLPA: '9.5 – 19.0 LPA',
        experienceYears: '3 – 6 Years',
        typicalJobRole: 'Senior Heat Treatment Metallurgist / NDT Quality Lead',
        keyCompetenciesExpected: [
          'Continuous casting thermal profile optimization and vacuum degassing (VD/VOD)',
          'Ultrasonic A-scan / Phased Array ultrasonic testing (PAUT) flaw evaluation',
          'Spark-OES and X-ray fluorescence (XRF) alloy grade certification',
        ],
      },
      {
        level: 'Pro / Senior Specialist',
        rangeLPA: '22.0 – 48.0+ LPA',
        experienceYears: '7+ Years',
        typicalJobRole: 'Chief Materials Scientist / Steel Meltshop Technical Director',
        keyCompetenciesExpected: [
          'High-temperature nickel superalloy vacuum induction melting (VIM) for aerospace',
          'Forensic failure root-cause analysis (FE-SEM / fractography / XRD)',
          'Carbon-neutral Direct Reduced Iron (DRI) hydrogen metallurgy transitions',
        ],
      },
    ],
    roadmapPhases: [
      {
        phaseNumber: 1,
        phaseName: 'Crystallography & Thermodynamics Foundations (Years 1–2)',
        timeline: 'Semesters 1 to 4',
        recommendedMajorsAndSubjects: ['Materials Science', 'Metallurgical Thermodynamics', 'Crystallography & X-ray Diffraction', 'Phase Transformations'],
        coreMilestones: [
          'Master iron-carbon equilibrium phase diagrams, TTT curves, and CCT diagrams',
          'Polish and etch steel specimens to photograph pearlite and martensite phases under microscope',
        ],
        certificationsAndProjects: ['ASNT NDT Level I Certification (PT & MT)', 'Cold-rolled dual-phase steel microstructure capstone'],
      },
      {
        phaseNumber: 2,
        phaseName: 'Extractive Metallurgy & Mechanical Testing (Years 3–4)',
        timeline: 'Semesters 5 to 8',
        recommendedMajorsAndSubjects: ['Iron & Steelmaking', 'Mechanical Metallurgy', 'Corrosion Engineering', 'Welding Metallurgy'],
        coreMilestones: [
          'Perform Charpy impact transition tests and Universal Testing Machine stress-strain curves',
          'Complete industrial internship at integrated steel plant blast furnace / melt shop',
        ],
        certificationsAndProjects: ['ASNT NDT Level II Ultrasonic Testing (UT)', 'Induction furnace melting and casting of high-entropy alloys'],
      },
      {
        phaseNumber: 3,
        phaseName: 'Failure Analysis & Plant Technical Leadership (Industry)',
        timeline: 'Post-Graduation Career',
        recommendedMajorsAndSubjects: ['Scanning Electron Microscopy (SEM)', 'High Temperature Materials', 'Powder Metallurgy'],
        coreMilestones: [
          'Lead failure investigation on catastrophic gas pipeline fracture using fractography',
          'Commission automated continuous heat-treatment quench line with zero decarburization',
        ],
        certificationsAndProjects: ['NACE Certified Corrosion Specialist', 'Chartered Metallurgical Engineer (IIM)'],
      },
    ],
    deafAccessibilityAdvantages: [
      'Microstructural grain photographs, SEM fractography images, and XRD diffraction peaks are 100% visual datasets.',
      'Fluorescent dye penetrant and magnetic particle inspections glow brightly under UV light for high-contrast visual detection.',
      'Digital ultrasonic flaw detectors and hardness testers display large digital waveforms (A-scans) and numerical readouts.',
    ],
  },
];
