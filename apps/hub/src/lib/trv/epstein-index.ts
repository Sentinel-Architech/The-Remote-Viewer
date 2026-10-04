/** Titles from the public Epstein files index that was named. No document body is stored. */

export const EPSTEIN_INDEX_POSTURE = {
  thirdPartyIndex: true,
  verifiedGovernmentText: false,
  documentBodyStored: false,
} as const;

export type EpsteinIndexGroup = "DOJ data sets" | "Media" | "Dockets" | "Official doors";

export type EpsteinIndexTitle = {
  group: EpsteinIndexGroup;
  title: string;
};

export const EPSTEIN_INDEX: readonly EpsteinIndexTitle[] = [
  { group: "DOJ data sets", title: "EFTA-DS01 FBI 302s" },
  { group: "DOJ data sets", title: "EFTA-DS02 SDNY search warrants" },
  { group: "DOJ data sets", title: "EFTA-DS03 flight logs" },
  { group: "DOJ data sets", title: "EFTA-DS04 financial records" },
  { group: "DOJ data sets", title: "EFTA-DS05 email archives" },
  { group: "DOJ data sets", title: "EFTA-DS06 BOP custody records" },
  { group: "DOJ data sets", title: "EFTA-DS07 address books" },
  { group: "DOJ data sets", title: "EFTA-DS08 NPA files" },
  { group: "DOJ data sets", title: "EFTA-DS09-10 grand jury exhibits" },
  { group: "DOJ data sets", title: "EFTA-DS11-12 supplemental files" },
  { group: "Media", title: "property search photos" },
  { group: "Media", title: "video depositions and audio" },
  { group: "Dockets", title: "Giuffre v. Maxwell 1:15-cv-07433" },
  { group: "Dockets", title: "US v. Maxwell 1:20-cr-00330" },
  { group: "Dockets", title: "House Oversight production" },
  { group: "Official doors", title: "https://www.justice.gov/epstein" },
  { group: "Official doors", title: "https://oversight.house.gov" },
];
