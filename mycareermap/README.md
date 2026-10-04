# SAMBHAV MyCareerMap - Career Discovery & Multi-Trade Engineering Assessment

This folder contains the complete, standalone **MyCareerMap** module for SAMBHAV ISL AI.

## Overview
MyCareerMap provides an accessible, interactive visual career discovery assessment for deaf and hard-of-hearing students. It allows learners to explore career domains, test trade problem-solving aptitude across 5 engineering disciplines with randomized scenarios, receive granular score analytics, view matched jobs, and follow 3-tier LPA salary roadmaps (Entry 🌱, Proficient 🚀, Pro 👑).

### Features Included:
1. **10 Broad Career Domains**:
   - Engineering & Technology (Interactive assessment)
   - Healthcare & Medicine, Teaching & Education, Civil Services & Govt, IT & Data Science, Finance & Banking, Creative Arts & Design, Agriculture & Forestry, Legal & Judiciary, Tourism & Hospitality (with animated "Working On It" feedback screen).
2. **75-Question Assessment Bank across 5 Engineering Trades**:
   - Electrical Engineering (`electrical.png`)
   - Mechanical & Automotive (`mechnical.png`)
   - Civil & Structural (`civil.png`)
   - Computer Science & Software (`computer science.png`)
   - Metallurgical & Materials (`metullergy.png`)
3. **Assessment Engine**:
   - 25 dynamic questions sampled per session (5 random questions per trade $\times$ 5 trades).
   - 4 shuffled options per question (1 correct, 3 realistic distractors).
   - 5-click exploration budget with real-time timer HUD.
   - Dedicated single-instrument icon indicators (`CompositeAssetView.tsx`).
   - Detailed evidence recording and analytics logging.
4. **Scoring & Roadmaps**:
   - Weighted multi-trade marks calculation.
   - Career match percentage rankings.
   - 5 full educational and career roadmaps with milestones, certifications, and 3-tier salary progression.

---

## Directory Structure
```
mycareermap/
├── public/
│   └── images/
│       └── career councling/
│           ├── civil.png
│           ├── computer science.png
│           ├── electrical.png
│           ├── mechnical.png
│           └── metullergy.png
└── src/
    ├── pages/
    │   └── MyCareerMapPage.tsx
    ├── components/
    │   ├── CareerDomainSelector.tsx
    │   ├── CareerResultsView.tsx
    │   ├── CareerRoadmapView.tsx
    │   ├── CompositeAssetView.tsx
    │   ├── ElectricalWorkspace.tsx
    │   ├── EngineeringAssessmentView.tsx
    │   ├── TaskEvidencePanel.tsx
    │   ├── TaskReportModal.tsx
    │   ├── ToolInspectorModal.tsx
    │   └── WorkingOnItView.tsx
    ├── data/
    │   ├── careerAssets.ts
    │   ├── careerDomains.ts
    │   ├── electricalTaskData.ts
    │   ├── engineeringAssessmentData.ts
    │   └── engineeringJobRoadmaps.ts
    ├── types/
    │   └── careerDiscovery.ts
    ├── utils/
    │   └── careerScoring.ts
    └── tests/
        └── mycareermap.test.ts
```

---

## Frontend Integration in SAMBHAV

In the main application, all code is encapsulated in `frontend/src/mycareermap/` and exposed via:
- Route: `/mycareermap` (with aliases `/career-discovery`, `/career`, `/careers`, `/explore`)
- Sidebar Navigation: "My Career Map" in `AppLayout.tsx`
- Dashboard Feature Card: "My Career Map" in `Dashboard.tsx`
- Translations: Full English, Hindi, and Odia support in `translations.ts`
