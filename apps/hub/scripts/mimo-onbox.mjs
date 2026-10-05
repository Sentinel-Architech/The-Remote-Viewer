/**
 * On-box MiMo loader. Reads a TRV-owned weight directory on this machine.
 * It does not open a socket, and it does not execute the MiMo network.
 */
import { closeSync, openSync, readFileSync, readSync, statSync } from "node:fs";
import { join } from "node:path";

const dir = process.argv[2] ?? "";
if (!dir || /^https?:/i.test(dir)) {
  process.stderr.write("MiMo-V2.6-Pro runs only from a TRV-owned copy.\n");
  process.exit(2);
}

const configPath = join(dir, "config.json");
const weightsPath = join(dir, "model.safetensors");
const configText = readFileSync(configPath, "utf8");
if (/https?:|xiaomi\.com|huggingface\.co|hf\.co/i.test(configText)) {
  process.stderr.write("Weight config names a remote host. Nothing was sent.\n");
  process.exit(2);
}

const config = JSON.parse(configText);
if (config.model !== "MiMo-V2.6-Pro" || config.owner !== "trv" || config.remote !== false) {
  process.stderr.write("Weights are not a TRV-owned MiMo-V2.6-Pro copy.\n");
  process.exit(2);
}

const size = statSync(weightsPath).size;
if (size < 1) {
  process.stderr.write("Weight file is empty.\n");
  process.exit(3);
}

const fd = openSync(weightsPath, "r");
const header = Buffer.alloc(Math.min(size, 65536));
const headerBytes = readSync(fd, header, 0, header.length, 0);
closeSync(fd);
if (headerBytes < 1) {
  process.stderr.write("Weight file could not be read.\n");
  process.exit(3);
}

process.stdout.write(
  JSON.stringify({
    status: "loaded",
    loaded: true,
    inferenceRan: false,
    bytes: size,
    headerBytes,
    model: "MiMo-V2.6-Pro",
    remote: false,
  }),
);
