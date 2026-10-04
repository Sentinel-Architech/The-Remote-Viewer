import { spawnSync } from "node:child_process";
import { existsSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { assertMimoLocal, UI_MODEL_NAME, XIAOMI_PAID } from "./ui-experts";

const LOADER = fileURLToPath(new URL("../../../scripts/mimo-onbox.mjs", import.meta.url));
/** Weights count only inside this repo directory. A home folder or a URL does not. */
export const MIMO_REPO_DIR = fileURLToPath(new URL("../../../mimo/MiMo-V2.6-Pro", import.meta.url));
const WEIGHT_FILES = ["config.json", "model.safetensors"] as const;

export type MimoOnBoxStatus = "missing-weights" | "loaded" | "refused";

export type MimoOnBoxResult = {
  model: typeof UI_MODEL_NAME;
  xiaomiPaid: false;
  sendsViewerData: false;
  remote: false;
  fetched: false;
  loaded: boolean;
  processRan: boolean;
  inferenceRan: false;
  status: MimoOnBoxStatus;
  bytes: number;
  headerBytes: number | null;
  filesFound: number;
  filesRequired: number;
  weightsDir: string;
  reason: string;
};

function base(weightsDir: string): Omit<MimoOnBoxResult, "loaded" | "processRan" | "status" | "bytes" | "reason"> {
  if (XIAOMI_PAID) {
    throw new Error("Xiaomi is not paid.");
  }
  return {
    model: UI_MODEL_NAME,
    xiaomiPaid: false,
    sendsViewerData: false,
    remote: false,
    fetched: false,
    inferenceRan: false,
    weightsDir,
  };
}

export function weightsDirInRepo(dir: string): boolean {
  const root = resolve(MIMO_REPO_DIR);
  const target = resolve(dir);
  const fromRoot = relative(root, target);
  return fromRoot === "" || (!fromRoot.startsWith("..") && !fromRoot.startsWith("/"));
}

/** Unset uses the repo directory. Any other path must still be inside that directory. */
export function resolveMimoWeightsDir(env: NodeJS.ProcessEnv = process.env): string {
  const raw = (env.TRV_MIMO_WEIGHTS ?? "").trim();
  if (!raw) return MIMO_REPO_DIR;
  assertMimoLocal(raw);
  if (!weightsDirInRepo(raw)) {
    throw new Error("MiMo-V2.6-Pro runs only from the weights directory in this repo. The model did not run.");
  }
  return resolve(raw);
}

export function countWeightFiles(dir: string): { found: number; required: number } {
  let found = 0;
  for (const name of WEIGHT_FILES) {
    try {
      const file = join(dir, name);
      if (existsSync(file) && statSync(file).isFile() && statSync(file).size > 0) found += 1;
    } catch {
      /* This file was not measured as present. */
    }
  }
  return { found, required: WEIGHT_FILES.length };
}

export function mimoWeightsPresent(dir: string): boolean {
  if (!dir) return false;
  assertMimoLocal(dir);
  const counted = countWeightFiles(dir);
  return counted.required > 0 && counted.found === counted.required;
}

/**
 * Look on this box. Missing files stay missing: nothing is downloaded.
 * When the files are present, a local process reads them. That process does not run the MiMo network.
 */
export function runMimoOnBox(env: NodeJS.ProcessEnv = process.env): MimoOnBoxResult {
  const weightsDir = resolveMimoWeightsDir(env);
  const common = base(weightsDir);
  const files = countWeightFiles(weightsDir);
  if (!mimoWeightsPresent(weightsDir)) {
    return {
      ...common,
      loaded: false,
      processRan: false,
      status: "missing-weights",
      bytes: 0,
      headerBytes: null,
      filesFound: files.found,
      filesRequired: files.required,
      reason: "MiMo-V2.6-Pro weights are not in this repo. Nothing was fetched. The model did not load and did not run.",
    };
  }

  const child = spawnSync(process.execPath, [LOADER, weightsDir], {
    encoding: "utf8",
    timeout: 15_000,
    env: { ...env, TRV_MIMO_WEIGHTS: weightsDir },
    stdio: ["ignore", "pipe", "pipe"],
  });

  if (child.status !== 0) {
    const detail = (child.stderr || child.stdout || "The local loader refused the directory.").trim();
    return {
      ...common,
      loaded: false,
      processRan: false,
      status: "refused",
      bytes: 0,
      headerBytes: null,
      filesFound: files.found,
      filesRequired: files.required,
      reason: detail,
    };
  }

  let bytes = 0;
  let headerBytes: number | null = null;
  try {
    const parsed = JSON.parse(child.stdout) as { bytes?: number; headerBytes?: number; inferenceRan?: boolean; loaded?: boolean };
    if (parsed.inferenceRan === true || parsed.loaded !== true) {
      return {
        ...common,
        loaded: false,
        processRan: false,
        status: "refused",
        bytes: 0,
        headerBytes: null,
        filesFound: files.found,
        filesRequired: files.required,
        reason: "The local loader reported a result this hub will not accept.",
      };
    }
    bytes = Number(parsed.bytes) || 0;
    const read = Number(parsed.headerBytes);
    headerBytes = Number.isFinite(read) && read >= 0 ? read : null;
  } catch {
    return {
      ...common,
      loaded: false,
      processRan: false,
      status: "refused",
      bytes: 0,
      headerBytes: null,
      filesFound: files.found,
      filesRequired: files.required,
      reason: "The local loader did not return a weight read.",
    };
  }

  return {
    ...common,
    loaded: true,
    processRan: true,
    status: "loaded",
    bytes,
    headerBytes,
    filesFound: files.found,
    filesRequired: files.required,
    reason: `Read ${bytes} weight bytes from this box. The MiMo network was not executed. Nothing was sent to Xiaomi.`,
  };
}
