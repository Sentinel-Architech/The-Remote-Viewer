/** Election-index titles that were named. Not verified government text. No document body is stored. */

export const ELECTION_INDEX_POSTURE = {
  verified: false,
  verifiedGovernmentText: false,
  documentBodyStored: false,
} as const;

export type ElectionIndexGroup = "Election index" | "Door";

export type ElectionIndexTitle = {
  group: ElectionIndexGroup;
  title: string;
};

export const ELECTION_INDEX: readonly ElectionIndexTitle[] = [
  { group: "Election index", title: "Project FUBAR / Italian election 1948 CIA" },
  { group: "Election index", title: "MINARET watchlists 1967-1973 NSA/FBI" },
  { group: "Election index", title: "COINTELPRO 1956-1971 FBI" },
  { group: "Election index", title: "Operation TRACK III Chile 1970 CIA/NSC" },
  { group: "Election index", title: "2016 ICA annexes ODNI/CIA/FBI/NSA" },
  { group: "Election index", title: "Crossfire Hurricane records FBI/DOJ" },
  { group: "Election index", title: "NIC 2020 election threats" },
  { group: "Election index", title: "CISA election advisories" },
  { group: "Election index", title: "PDB excerpts on voter database espionage ODNI" },
  { group: "Door", title: "cisa.gov/topics/election-security" },
  { group: "Door", title: "nass.org/can-i-vote" },
];
