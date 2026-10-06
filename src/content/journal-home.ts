export const journalHome = {
  heroTitle: 'Follow your curiosity.\nChoose with care.',
  heroDescription:
    'Practical guides and considered reviews for your home, hobbies, pets, wellbeing, and creative life. Start a project, learn a skill, or take a closer look before you buy.',
  metaTitle: 'Practical guides, reviews & everyday ideas',
  metaDescription:
    'Explore researched reviews and practical guides for cooking, home and garden, DIY, hobbies, pets, digital tools, wellness, and personal growth.',
}

export function isStarterHomeTitle(title: string) {
  return [
    'Learn Affiliate Marketing. Build Your Freedom.',
    'Good finds.\nBetter everyday living.',
  ].includes(title)
}

// Retire the old template artwork while preserving editors' custom uploads.
export function isStarterHomeImage(filename?: string | null) {
  return /^(?:matsato[-_]|kitchen-editorial\.|affiliate-hero\.)/.test(filename || '')
}
