/**
 * Single source of truth for the Hallcraft brand, company and contact details.
 * The footer, legal pages and metadata read from here so the identity stays
 * consistent across the site.
 */
export const site = {
  name: "Hallcraft",
  domain: "hallcraft.xyz",
  url: "https://hallcraft.xyz",
  tagline: "Event space design, planned to the centimetre",
  description:
    "Hallcraft is a floor plan studio for events: draw the room, seat the guests, check the spacing and share an exact plan with the venue and the team.",
  company: "Ivents",
  companyLine: "Hallcraft is a product of Ivents.",
  email: "hello@hallcraft.xyz",
  location: "Lagos, Nigeria",
  lastUpdated: "4 November 2026",
} as const;
