import { createHash } from "node:crypto";
import { closeSync, openSync, readFileSync, readSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  SHIPPED_MODEL_LICENSE,
  SHIPPED_MODEL_NAME,
  SHIPPED_PARAMETER_COUNT,
  SHIPPED_WEIGHT_BYTES,
  SHIPPED_WEIGHT_SHA256,
} from "./minimind2-small";

/** The weight file that ships. A home folder or a URL is not this path. */
export const SHIPPED_WEIGHT_FILE = fileURLToPath(
  new URL("../../../weights/minimind2-small/model.safetensors", import.meta.url),
);

export type ShippedWeightMeasure = {
  model: typeof SHIPPED_MODEL_NAME;
  license: typeof SHIPPED_MODEL_LICENSE;
  filesFound: number;
  filesRequired: 1;
  fileBytes: number | null;
  headerBytes: number | null;
  parameterCount: number | null;
  sha256: string | null;
  inferenceRan: false;
  fetched: false;
  reason: string;
};

type TensorHeader = {
  dtype?: string;
  shape?: number[];
};

function parameterCount(header: Record<string, unknown>): number | null {
  let total = 0;
  for (const [name, value] of Object.entries(header)) {
    if (name === "__metadata__") continue;
    if (!value || typeof value !== "object") return null;
    const tensor = value as TensorHeader;
    if (tensor.dtype !== "F16" || !Array.isArray(tensor.shape) || tensor.shape.length === 0) return null;
    let count = 1;
    for (const dim of tensor.shape) {
      if (!Number.isInteger(dim) || dim < 1) return null;
      count *= dim;
    }
    total += count;
  }
  return total;
}

/** Read the safetensors header only. This does not execute the network. */
export function readSafetensorsHeader(file: string): {
  headerBytes: number;
  fileBytes: number;
  parameterCount: number | null;
} {
  const fileBytes = statSync(file).size;
  const fd = openSync(file, "r");
  try {
    const lenBuf = Buffer.alloc(8);
    if (readSync(fd, lenBuf, 0, 8, 0) !== 8) {
      throw new Error("The weight header length was not read.");
    }
    const headerLen = Number(lenBuf.readBigUInt64LE(0));
    if (!Number.isSafeInteger(headerLen) || headerLen < 2 || 8 + headerLen > fileBytes) {
      throw new Error("The weight header does not fit this file.");
    }
    const headerBuf = Buffer.alloc(headerLen);
    if (readSync(fd, headerBuf, 0, headerLen, 8) !== headerLen) {
      throw new Error("The weight header was short.");
    }
    const parsed: unknown = JSON.parse(headerBuf.toString("utf8"));
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("The weight header is not a tensor map.");
    }
    return {
      headerBytes: 8 + headerLen,
      fileBytes,
      parameterCount: parameterCount(parsed as Record<string, unknown>),
    };
  } finally {
    closeSync(fd);
  }
}

/**
 * Stat and header-read the shipped file. Missing or mismatched bytes stay unaccepted.
 * inferenceRan stays false: a measurement is not a run.
 */
export function measureShippedMiniMind(): ShippedWeightMeasure {
  const common = {
    model: SHIPPED_MODEL_NAME,
    license: SHIPPED_MODEL_LICENSE,
    filesRequired: 1 as const,
    inferenceRan: false as const,
    fetched: false as const,
  };
  let fileBytes = 0;
  try {
    const stat = statSync(SHIPPED_WEIGHT_FILE);
    if (!stat.isFile()) throw new Error("not a file");
    fileBytes = stat.size;
  } catch {
    return {
      ...common,
      filesFound: 0,
      fileBytes: null,
      headerBytes: null,
      parameterCount: null,
      sha256: null,
      reason: "MiniMind2-Small weights were not measured. Nothing was fetched. The model did not run.",
    };
  }
  const sha256 = createHash("sha256").update(readFileSync(SHIPPED_WEIGHT_FILE)).digest("hex");
  let headerBytes: number | null = null;
  let counted: number | null = null;
  try {
    const header = readSafetensorsHeader(SHIPPED_WEIGHT_FILE);
    headerBytes = header.headerBytes;
    counted = header.parameterCount;
  } catch {
    headerBytes = null;
    counted = null;
  }
  const accepted =
    fileBytes === SHIPPED_WEIGHT_BYTES &&
    sha256 === SHIPPED_WEIGHT_SHA256 &&
    counted === SHIPPED_PARAMETER_COUNT &&
    headerBytes != null;
  if (!accepted) {
    return {
      ...common,
      filesFound: 0,
      fileBytes,
      headerBytes,
      parameterCount: counted,
      sha256,
      reason: "The weight file on this machine does not match the shipped MiniMind2-Small file. The model did not run.",
    };
  }
  return {
    ...common,
    filesFound: 1,
    fileBytes,
    headerBytes,
    parameterCount: counted,
    sha256,
    reason: `Measured ${fileBytes} bytes of MiniMind2-Small. The header lists ${counted} parameters. The model network was not executed. A fit check is not a run.`,
  };
}
