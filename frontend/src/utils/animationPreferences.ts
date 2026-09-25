export const COMMUNICATE_INTRO_ANIMATION_KEY = 'sambhav_communicate_intro_animation';
export const APP_ANIMATIONS_KEY = 'sambhav_app_animations_enabled';

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

export function isAppAnimationsEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  const stored = localStorage.getItem(APP_ANIMATIONS_KEY);
  if (stored === null) return true;
  return stored === 'true';
}

export function setAppAnimationsEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(APP_ANIMATIONS_KEY, String(enabled));
  const root = document.documentElement;
  if (enabled) {
    root.classList.remove('app-disable-animations');
  } else {
    root.classList.add('app-disable-animations');
  }
}

export function initAppAnimations(): void {
  if (typeof window === 'undefined') return;
  const enabled = isAppAnimationsEnabled();
  if (!enabled) {
    document.documentElement.classList.add('app-disable-animations');
  } else {
    document.documentElement.classList.remove('app-disable-animations');
  }
}
