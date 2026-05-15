export const SCAN_COUNT_KEY = "cross_promo_scan_count";
export const COUNTER_KEY = "cross_promo_alt_counter";
export const SCANS_BETWEEN_PROMOS = 3;

export const PEPTIDE_PROMO = {
  appName: "Peptide Hub",
  tagline: "Your complete guide to peptides, dosing & protocols.",
  features: [
    "Science-backed peptide database",
    "Dosing calculators & protocols",
    "Track your peptide cycles",
  ],
  iconUrl:
    "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/b4/2c/63/b42c63f3-5b8d-b794-f7b2-62d0560bc4c8/AppIcon-0-0-1x_U007ephone-0-1-85-220.png/512x512bb.jpg",
  iconGradient: ["#8B5CF6", "#7C3AED"] as [string, string],
  appStoreId: "6759482842",
  promoKey: "promo_peptide",
};

export const REGROW_PROMO = {
  appName: "Snap It: Regrow",
  tagline: "Worried about more than food? Track your hair health.",
  features: [
    "AI scalp analysis",
    "Norwood stage tracking",
    "Personalized action plans",
  ],
  iconUrl:
    "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/4e/83/d8/4e83d812-da39-69f7-8cb5-209af9e8f204/AppIcon-0-0-1x_U007epad-0-1-85-220.png/512x512bb.jpg",
  iconGradient: ["#10b981", "#059669"] as [string, string],
  appStoreId: "6758930237",
  promoKey: "promo_regrow",
};
