/** Progress for checks this install actually performs. Unmeasured work stays waiting. */

export type BuildStep = {
  id: "fit" | "weight-files" | "weight-copy" | "byte-read" | "network";
  label: string;
  state: "done" | "waiting";
  completed: number | null;
  total: number | null;
  note: string;
};

export function buildProgress(input: {
  fitChecked: boolean;
  fits: boolean | null;
  filesFound: number | null;
  filesRequired: number | null;
  headerBytes: number | null;
  fileBytes: number | null;
}): BuildStep[] {
  const fit: BuildStep = input.fitChecked
    ? {
        id: "fit",
        label: "Model fit check",
        state: "done",
        completed: 1,
        total: 1,
        note:
          input.fits === true
            ? "The fit check finished. The model was not executed."
            : "The fit check finished. The file does not fit, so it was not loaded.",
      }
    : {
        id: "fit",
        label: "Model fit check",
        state: "waiting",
        completed: null,
        total: null,
        note: "Waiting. The fit check has not run.",
      };

  const filesKnown =
    typeof input.filesFound === "number" &&
    typeof input.filesRequired === "number" &&
    input.filesRequired > 0 &&
    input.filesFound >= 0 &&
    input.filesFound <= input.filesRequired;
  const files: BuildStep = filesKnown
    ? {
        id: "weight-files",
        label: "Local weight files",
        state: "done",
        completed: input.filesFound,
        total: input.filesRequired,
        note: `${input.filesFound} of ${input.filesRequired} required weight files are on this machine. The model was not executed.`,
      }
    : {
        id: "weight-files",
        label: "Local weight files",
        state: "waiting",
        completed: null,
        total: null,
        note: "Waiting. Weight files were not measured.",
      };

  const copy: BuildStep = {
    id: "weight-copy",
    label: "Weight copy",
    state: "waiting",
    completed: null,
    total: null,
    note: "Waiting. No weight copy ran. Nothing was fetched.",
  };

  const readKnown =
    typeof input.headerBytes === "number" &&
    typeof input.fileBytes === "number" &&
    input.fileBytes > 0 &&
    input.headerBytes >= 0 &&
    input.headerBytes <= input.fileBytes;
  const read: BuildStep = readKnown
    ? {
        id: "byte-read",
        label: "Local byte read",
        state: "done",
        completed: input.headerBytes,
        total: input.fileBytes,
        note: `Read ${input.headerBytes} of ${input.fileBytes} file bytes. The network was not executed.`,
      }
    : {
        id: "byte-read",
        label: "Local byte read",
        state: "waiting",
        completed: null,
        total: null,
        note: "Waiting. No weight file was read.",
      };

  const network: BuildStep = {
    id: "network",
    label: "Model network",
    state: "waiting",
    completed: null,
    total: null,
    note: "Waiting. The model network was not executed.",
  };

  return [fit, files, copy, read, network];
}
