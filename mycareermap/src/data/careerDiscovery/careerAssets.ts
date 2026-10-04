/**
 * Centralized Career Discovery visual asset catalog.
 * Source directory: frontend/public/images/career councling/
 * Verified files: civil.png, computer science.png, electrical.png, mechnical.png, metullergy.png
 */

const BASE_CAREER_DIR = '/images/career councling';

export const careerAssets = {
  // Primary 5 Engineering Trade Images
  trades: {
    electrical: `${BASE_CAREER_DIR}/electrical.png`,
    mechanical: `${BASE_CAREER_DIR}/mechnical.png`,
    civil: `${BASE_CAREER_DIR}/civil.png`,
    computerScience: `${BASE_CAREER_DIR}/computer science.png`,
    metallurgy: `${BASE_CAREER_DIR}/metullergy.png`,
  },

  // Primary Interactive Workspace Environments
  environment: {
    electricalWorkspace: `${BASE_CAREER_DIR}/electrical.png`,
    mechanicalWorkspace: `${BASE_CAREER_DIR}/mechnical.png`,
    civilWorkspace: `${BASE_CAREER_DIR}/civil.png`,
    softwareWorkspace: `${BASE_CAREER_DIR}/computer science.png`,
    metallurgyWorkspace: `${BASE_CAREER_DIR}/metullergy.png`,
  },

  // Student & Spotlight Images
  student: {
    measuring: `${BASE_CAREER_DIR}/electrical.png`,
    successPortrait: `${BASE_CAREER_DIR}/mechnical.png`,
  },

  // Interactive Tools & Safety
  tools: {
    multimeter: `${BASE_CAREER_DIR}/electrical.png`,
    probesPair: `${BASE_CAREER_DIR}/electrical.png`,
    handSet: `${BASE_CAREER_DIR}/electrical.png`,
  },
  safety: {
    gearSet: `${BASE_CAREER_DIR}/electrical.png`,
  },

  // Career Pathways
  pathways: {
    electricalMaintenance: `${BASE_CAREER_DIR}/electrical.png`,
    solarPV: `${BASE_CAREER_DIR}/electrical.png`,
    mechanical: `${BASE_CAREER_DIR}/mechnical.png`,
    civil: `${BASE_CAREER_DIR}/civil.png`,
    software: `${BASE_CAREER_DIR}/computer science.png`,
    metallurgy: `${BASE_CAREER_DIR}/metullergy.png`,
  },
} as const;
