/** Domínio canônico (persona.md §1) — usado em metadata, sitemap e OG. */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://theostracke.work";

export const CONTACT = {
  email: "theostracke11@gmail.com",
  linkedin: "https://linkedin.com/in/theostracke",
  github: "https://github.com/theostracke",
} as const;

/** Briefing de criação de site (Google Forms) — abre em nova aba. */
export const BRIEFING_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSdzhXvXm6fQSCDqqKcARkbjAuMkrD7cMFNwCNUtMaP1-2mhtQ/viewform";
