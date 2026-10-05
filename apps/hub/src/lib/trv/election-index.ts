/** Named election catalog text. Unverified. Not a government record. */

export const ELECTION_CATALOG_MARK =
  "Unverified blurb. Not a government record. The DECLASSIFIED wording is source text, not a verification." as const;

export const ELECTION_INDEX_POSTURE = {
  verified: false,
  governmentRecord: false,
  verifiedGovernmentText: false,
  declassifiedBadgeVerified: false,
  source: "unverified third-party text",
} as const;

export type ElectionCatalogEntry = {
  title: string;
  when: string;
  agency: string;
  blurb: string;
  label?: string;
  officialName?: string;
  href?: string;
};

export const ELECTION_CATALOG = {
  documentTitle: "U.S. ELECTIONS DECLASSIFIED INDEX",
  subtitle: "Historical & Intelligence Records Reference Guide",
  archiveScope:
    "This document catalogs major declassified intelligence files, presidential daily briefs (PDBs), CISA vulnerability disclosures, and federal counterintelligence records detailing political influence campaigns, election security, and foreign intervention threats from the Cold War to present.",
  footer: "DECLASSIFIED RECORDS ON AMERICAN ELECTIONS.",
  pageMarkers: ["PAGE 1 OF 2", "PAGE 2 OF 2"],
  entries: [
    {
      title: "Project FUBAR / Italian Election Covert Action",
      when: "1948",
      agency: "CIA",
      blurb:
        "Declassified CIA records detailing the agency's first major covert electoral intervention. Included million-dollar funding allocations to anti-communist parties, forged letters, and media propaganda to sway Italy's general election away from the PCI coalition.",
      label: "Project FUBAR / Italian election 1948",
      officialName: "NSC 1/3",
      href: "https://history.state.gov/historicaldocuments/frus1948v03/d475",
    },
    {
      title: "Project MINARET & Political Watchlists",
      when: "1967–1973",
      agency: "NSA / FBI",
      blurb:
        "Declassified operational files exposing NSA's secret intercepts of political candidates, anti-war activists, and U.S. Senators. Intercepted signals intelligence was routed to the FBI and White House to evaluate domestic political movements.",
      href: "https://www.archives.gov/files/research/jfk/releases/docid-32423575.pdf",
    },
    {
      title: "COINTELPRO Political Influence Files",
      when: "1956–1971",
      agency: "FBI",
      blurb:
        "Unsealed domestic counterintelligence records detailing FBI operations aimed at harassing, infiltrating, and disrupting legal domestic political parties, third-party movements, and presidential campaigns.",
      href: "https://vault.fbi.gov/cointel-pro",
    },
    {
      title: "Operation TRACK III (Chilean Election Intervention)",
      when: "1970",
      agency: "CIA / NSC",
      blurb:
        "Declassified NSC and CIA cables detailing covert efforts, economic pressure, and media campaigns conducted to prevent the election of Salvador Allende in Chile.",
      label: "Operation TRACK III",
      officialName: "Track Two",
      href: "https://history.state.gov/historicaldocuments/frus1969-76v21/d107",
    },
    {
      title: "2016 Intelligence Community Assessment (ICA) Annexes",
      when: "Declassified 2017/2020",
      agency: "ODNI / CIA / FBI / NSA",
      blurb:
        "Unredacted working drafts and intelligence footnotes assessing Russian state-sponsored cyber operations against the Democratic National Committee (DNC) and state election databases during the 2016 presidential campaign.",
      href: "https://www.govinfo.gov/content/pkg/GOVPUB-PREX28-PURL-gpo76345/pdf/GOVPUB-PREX28-PURL-gpo76345.pdf",
    },
    {
      title: "Operation Crossfire Hurricane Investigative Records",
      when: "Declassified 2020–2021",
      agency: "FBI / DOJ",
      blurb:
        "Declassified FISA applications, confidential human source (CHS) transcripts, and internal FBI administrative memos concerning foreign intelligence approaches made to presidential campaigns.",
      href: "https://vault.fbi.gov/crossfire-hurricane-part-01",
    },
    {
      title: "NIC Assessment on Foreign Threats to the 2020 US Elections",
      when: "Declassified 2021",
      agency: "NIC",
      blurb:
        "Declassified multi-agency report detailing covert influence operations, state-media amplification, and disinformation strategies employed by foreign adversaries (Russia, Iran, China) during the 2020 presidential cycle.",
      href: "https://archive.dni.gov/files/ODNI/documents/assessments/ICA-declass-16MAR21.pdf",
    },
    {
      title: "CISA Cyber Vulnerability Advisories & Supply Chain Reports",
      when: "2022–2024",
      agency: "CISA",
      blurb:
        "Declassified security assessments analyzing electronic voting hardware, paper-ballot audit logs, and hardware component vulnerabilities across certified voting systems.",
      href: "https://www.cisa.gov/topics/election-security",
    },
    {
      title: "Declassified PDB Excerpts on Voter Database Espionage",
      when: "2024–2026",
      agency: "ODNI",
      blurb:
        "Declassified executive intelligence summaries documenting foreign cyber-threat actor intrusions targeting state-level voter registration portals and commercial election data vendors.",
    },
  ],
  doors: ["https://www.nass.org/can-i-vote"],
} as const satisfies {
  documentTitle: string;
  subtitle: string;
  archiveScope: string;
  footer: string;
  pageMarkers: readonly string[];
  entries: readonly ElectionCatalogEntry[];
  doors: readonly string[];
};
