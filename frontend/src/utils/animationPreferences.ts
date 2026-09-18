export const COMMUNICATE_INTRO_ANIMATION_KEY = 'sambhav_communicate_intro_animation';

export function isCommunicateIntroAnimationEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  const stored = localStorage.getItem(COMMUNICATE_INTRO_ANIMATION_KEY);
  if (stored === null) return true;
  return stored === 'true';
}

export function setCommunicateIntroAnimationEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(COMMUNICATE_INTRO_ANIMATION_KEY, String(enabled));
}
