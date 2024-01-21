import { parse } from "std/flags/mod.ts";
import { SearchOptions } from "./options.ts";
import { extname } from "std/path/mod.ts";

export type Flags = {
  help: boolean;
  version: boolean;
  filepath: string;
  output: string;
  workers: number;
  workerScheduler: "rr" | "fi";
} & Required<SearchOptions>;

const flagArgs = new Set(
  [
    "-h",
    "--help",
    "-v",
    "--version",
    "-o",
    "--output",
    "-w",
    "--workers",
    "--worker-scheduler",
    "--lo",
    "--left-offset",
    "--lr",
    "--left-range",
    "--ro",
    "--right-offset",
    "--rr",
    "--right-range",
    "--r1",
    "--r1-length",
    "--r2",
    "--r2-length",
    "--r3",
    "--r3-length",
    "--spc",
    "--spc-length",
    "--mt",
    "--mmt",
  ],
);

const faFileExtensions = [
  ".fasta",
  ".fna",
  ".fa",
  ".ffn",
  ".faa",
  ".frn",
];

export const HELP = `Usage: tsd-searcher <fasta_file> [options]

Arguments:
  fasta_file    Filepath to an FASTA format file

Options:
  -h, --help
      Print help
  -o, --output
      Output file name (default: ./out.txt)
  -w, --workers
      Number of workers to search TSD concurrently (default: number of CPU cores / 2)
  --worker-scheduler
      Worker scheduler "rr" (Round-robin) or "fi" (First-idle) (default: "fi")
  --lo, --left-offset
      Offset from 5' end (default: 0)
  --lr, --left-range
      Search range after the offset from 5' end (default: 40)
  --ro, --right-offset
      Offset from 3' end (default: 0)
  --rr, --right-range
      Search range after the offset from 3' end (default: 70)
  --r1, --r1-length
      1st sub-repeat min length (default: 2)
  --r2, --r2-length
      2nd sub-repeat min length (default: 2)
  --r3, --r2-length
      3rd sub-repeat min length (default: 2)
  --spc, --spc-length
      Max length of spacers between sub-repeats (default: 2)
  --mt, --match-thr
      Min length of total match (default: 8)
  --mmt, --mismatch-thr
      Max length of total mismatch (default: 3)
`;

// Parse flag values with validation.
export function parseFlags(): Flags {
  const rawFlags = parse(Deno.args, {
    alias: {
      help: "h",
      version: "v",
      output: "o",
      workers: "w",
      "left-offset": "lo",
      "left-range": "lr",
      "right-offset": "ro",
      "right-range": "rr",
      "r1-length": "r1",
      "r2-length": "r2",
      "r3-length": "r3",
      "spc-length": "spc",
      "match-thr": "mt",
      "mismatch-thr": "mmt",
    },
    default: {
      output: "out.txt",
      workers: navigator.hardwareConcurrency / 2,
      "worker-scheduler": "fi",
      lo: 0,
      lr: 40,
      ro: 0,
      rr: 70,
      r1: 2,
      r2: 2,
      r3: 2,
      spc: 2,
      mt: 8,
      mmt: 3,
    },
    boolean: ["help", "version"],
    unknown: (arg, key) => {
      if (key && !flagArgs.has(arg)) {
        console.log("invalid options:", arg, "\n");
        console.log(HELP);
        Deno.exit(1);
      }
      return true;
    },
  });

  const flags: Flags = {
    help: rawFlags.help,
    version: rawFlags.version,
    filepath: String(rawFlags._?.[0] ?? ""),
    output: String(rawFlags.output),
    workers: Number(rawFlags.workers),
    workerScheduler: String(rawFlags["worker-scheduler"]) as "rr" | "fi",
    leftOffset: Number(rawFlags.lo),
    leftRange: Number(rawFlags.lr),
    rightOffset: Number(rawFlags.ro),
    rightRange: Number(rawFlags.rr),
    r1Len: Number(rawFlags.r1),
    r2Len: Number(rawFlags.r2),
    r3Len: Number(rawFlags.r3),
    sLen: Number(rawFlags.spc),
    matchThr: Number(rawFlags.mt),
    mismatchThr: Number(rawFlags.mmt),
  };
  validateFlags(flags);
  return flags;
}

// Validate flag values.
function validateFlags(flags: Flags) {
  if (flags.help) {
    return;
  }
  if (flags.version) {
    return;
  }
  if (!flags.filepath) {
    helpAndExit("Input FASTA file is required");
  }
  if (!faFileExtensions.includes(extname(flags.filepath))) {
    helpAndExit(
      `Input file must be of FASTA format (with extension ${faFileExtensions})`,
    );
  }
  if (!flags.output) {
    helpAndExit("Output file must be specified");
  }
  if (flags.workers <= 0 || !Number.isInteger(flags.workers)) {
    helpAndExit(`Number of workers must be positive integer`);
  }
  if (flags.workerScheduler != "rr" && flags.workerScheduler != "fi") {
    helpAndExit(`Worker scheduler must be either "rr" or "fi"`);
  }
  if (flags.leftOffset < 0 || !Number.isInteger(flags.leftOffset)) {
    helpAndExit(`Left offset must be non-negative integer`);
  }
  if (flags.leftRange <= 0 || !Number.isInteger(flags.leftRange)) {
    helpAndExit(`Left range must be positive integer`);
  }
  if (flags.rightOffset < 0 || !Number.isInteger(flags.rightOffset)) {
    helpAndExit(`Right offset must be non-negative integer`);
  }
  if (flags.rightRange <= 0 || !Number.isInteger(flags.rightRange)) {
    helpAndExit(`Right range must be positive integer`);
  }
  if (flags.r1Len <= 0 || !Number.isInteger(flags.r1Len)) {
    helpAndExit(`R1 length must be positive integer`);
  }
  if (flags.r2Len <= 0 || !Number.isInteger(flags.r2Len)) {
    helpAndExit(`R2 length must be positive integer`);
  }
  if (flags.r3Len <= 0 || !Number.isInteger(flags.r3Len)) {
    helpAndExit(`R3 length must be positive integer`);
  }
  if (flags.sLen <= 0 || !Number.isInteger(flags.sLen)) {
    helpAndExit(`Max length of spacers must be positive integer`);
  }
  if (flags.matchThr <= 0 || !Number.isInteger(flags.matchThr)) {
    helpAndExit(`Min length of total match must be positive integer`);
  }
  if (flags.matchThr <= 0 || !Number.isInteger(flags.matchThr)) {
    helpAndExit(`Max length of total mismatch must be positive integer`);
  }
}

// Print help message and exit with code 0.
//
// If an error message is input, it exits with code 1.
function helpAndExit(error?: string) {
  if (error) {
    console.error(error, "\n");
    console.log(HELP);
    Deno.exit(1);
  }
  console.log(HELP);
  Deno.exit(0);
}
