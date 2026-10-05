/** Titles the Architect named. No document body is stored. */

export type DeclassifiedAgency = "CIA" | "NSA" | "FBI" | "NRO" | "DIA and DOD";

export type DeclassifiedTitle = {
  agency: DeclassifiedAgency;
  title: string;
  years: string;
};

export const DECLASSIFIED_TITLES: readonly DeclassifiedTitle[] = [
  { agency: "CIA", title: "MKUltra (MKDELTA, MKNAOMI, CHATTER, BLUEBIRD, ARTICHOKE)", years: "1953–1973" },
  { agency: "CIA", title: "CORONA (Keyhole KH-1–4, Discoverer)", years: "1958–1972" },
  { agency: "CIA", title: "ARGON (KH-5)", years: "1961–1962" },
  { agency: "CIA", title: "LANYARD (KH-6)", years: "1963" },
  { agency: "CIA", title: "OXCART (A-12, Cygnus, Archangel)", years: "1957–1968" },
  { agency: "CIA", title: "Azorian (Jennifer, Hughes Glomar Explorer)", years: "1968–1974" },
  { agency: "CIA", title: "Mockingbird (OSP)", years: "c.1950–1976" },
  { agency: "CIA", title: "Paperclip (Overcast)", years: "1945–1959" },
  { agency: "CIA", title: "Stargate (GONDOLA WISH, GRILL FLAME, CENTER LANE, SUN STREAK, SCANATE, Project CF)", years: "1978–1995" },
  { agency: "CIA", title: "Rainbow/Gusto (AQUATONE, U-2, RCS)", years: "1957–1959" },
  { agency: "NSA", title: "Venona (BRIDE, DRUG, LACE)", years: "1943–1980" },
  { agency: "NSA", title: "MINARET", years: "1967–1973" },
  { agency: "NSA", title: "SHAMROCK", years: "1945–1975" },
  { agency: "NSA", title: "Trailblazer", years: "2000–2006" },
  { agency: "NSA", title: "ThinThread (P-238)", years: "1998–2001" },
  { agency: "NSA", title: "XKeyscore", years: "2008–2013" },
  { agency: "FBI", title: "COINTELPRO (Hoodwink)", years: "1956–1971" },
  { agency: "FBI", title: "Solo (NY 694-S)", years: "1952–1980" },
  { agency: "FBI", title: "Ghost Stories", years: "2000–2010" },
  { agency: "NRO", title: "GAMBIT (KH-7, KH-8)", years: "1963–1984" },
  { agency: "NRO", title: "HEXAGON (KH-9, Big Bird)", years: "1971–1986" },
  { agency: "NRO", title: "MOL (DORIAN, KH-10)", years: "1963–1969" },
  { agency: "NRO", title: "POPPY (GRAB)", years: "1962–1977" },
  { agency: "NRO", title: "PARCAE (White Cloud, NOSS)", years: "1976–1987" },
  { agency: "NRO", title: "FARRAH/JUMPSEAT (AFP-711, Chalet, Vortex)", years: "1971–1983" },
  { agency: "DIA and DOD", title: "Sun Streak/Grill Flame (DETACHMENT 45)", years: "1977–1995" },
  { agency: "DIA and DOD", title: "AATIP (AAWSAP)", years: "2007–2012" },
  { agency: "DIA and DOD", title: "Sunshine", years: "1953–1959" },
  { agency: "DIA and DOD", title: "Iceworm (Camp Century)", years: "1959–1966" },
  { agency: "DIA and DOD", title: "Horizon", years: "1959" },
];
