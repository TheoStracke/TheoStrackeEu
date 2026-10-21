/** Animação direcional entre a home e os case studies (View Transitions). */
export const PAGE_TRANSITION = {
  enter: { "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" },
  exit: { "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" },
} as const;
