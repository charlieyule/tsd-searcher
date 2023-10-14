import { parse } from "std/flags/mod.ts";
import { exists } from "std/fs/mod.ts";
import { dirname } from "std/path/mod.ts";
import { Options } from "./options.ts";
import { searchFA } from "./mod.ts";

const flagArgs = new Set(
  [
    "-h",
    "--help",
    "-o",
    "--output",
    "-w",
    "--workers",
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

const HELP = `Usage: tsd-searcher <fasta_file> [options]

Arguments:
  fasta_file    Filepath to an FASTA format file

Options:
  -h, --help
      Print help
  -o, --output
      Output file name (default: ./output.txt)
  -w, --workers
      Number of workers to search TSD concurrently (default: number of CPU cores / 2)
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
      Max total mismatch length (default: 3)
`;

function parseFlags() {
  const flags = parse(Deno.args, {
    alias: {
      help: "h",
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
      output: "output.txt",
      workers: navigator.hardwareConcurrency / 2,
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
    boolean: ["help"],
    unknown: (arg, key) => {
      if (key && !flagArgs.has(arg)) {
        console.log("invalid options:", arg, "\n");
        console.log(HELP);
        Deno.exit(1);
      }
      return true;
    },
  });
  console.log(
    `Start searching TSDs with options: ${JSON.stringify(flags, null, 2)}`,
  );
  return flags;
}

if (import.meta.main) {
  const flags = parseFlags();
  if (flags.help) {
    console.log(HELP);
    Deno.exit(0);
  }

  const filepath = String(flags._?.[0] ?? "");
  if (!filepath) {
    console.log("FASTA file is required\n");
    console.log(HELP);
    Deno.exit(0);
  }
  const outPath = String(flags.output);

  const options: Options = {
    leftOffset: Number(flags.lo),
    leftRange: Number(flags.lr),
    rightOffset: Number(flags.ro),
    rightRange: Number(flags.rr),
    r1Len: Number(flags.r1),
    r2Len: Number(flags.r2),
    r3Len: Number(flags.r3),
    sLen: Number(flags.spc),
    matchThr: Number(flags.mt),
    mismatchThr: Number(flags.mmt),
  };

  let file: Deno.FsFile;

  try {
    file = await Deno.open(filepath, { read: true });
  } catch (error) {
    console.error("Failed to read input FASTA file", error);
    Deno.exit(1);
  }

  try {
    await Deno.mkdir(dirname(outPath), { recursive: true });
  } catch (error) {
    console.error("Failed to make directory", error);
    Deno.exit(1);
  }

  if (await exists(outPath)) {
    console.error(
      `${outPath} already exists, please use other filename or remove the existing one`,
    );
    Deno.exit(1);
  }

  let output: Deno.FsFile;
  try {
    output = await Deno.open(outPath, {
      write: true,
      create: true,
    });
  } catch (error) {
    console.error("Failed to create output file", error);
    Deno.exit(1);
  }

  const encoder = new TextEncoder();
  try {
    for await (
      const { seqId, tsds } of await searchFA(
        file.readable,
        Number(flags.workers),
        options,
      )
    ) {
      output.write(encoder.encode(`>${seqId}\n`));
      output.write(
        encoder.encode(`${tsds.map((tsd) => tsd.toString()).join(" ")}\n`),
      );
    }
  } finally {
    output.close();
  }
}
