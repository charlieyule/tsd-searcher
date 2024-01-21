import { exists } from "std/fs/mod.ts";
import { dirname } from "std/path/mod.ts";
import { searchFA } from "./mod.ts";
import { HELP, parseFlags } from "./flags.ts";

if (import.meta.main) {
  const flags = parseFlags();
  if (flags.help) {
    console.log(HELP);
    Deno.exit(0);
  }

  console.log(
    `Start searching TSD with options ${JSON.stringify(flags, null, 2)}`,
  );

  if (!flags.filepath) {
    console.log("FASTA file is required\n");
    console.log(HELP);
    Deno.exit(0);
  }

  let input: Deno.FsFile;
  try {
    input = await Deno.open(flags.filepath, { read: true });
  } catch (error) {
    console.error("Failed to read input FASTA file", error);
    Deno.exit(1);
  }

  try {
    await Deno.mkdir(dirname(flags.output), { recursive: true });
  } catch (error) {
    console.error("Failed to make directory", error);
    Deno.exit(1);
  }

  if (await exists(flags.output)) {
    console.error(
      `${flags.output} already exists, please use other filename or remove the existing one`,
    );
    Deno.exit(1);
  }

  let output: Deno.FsFile;
  try {
    output = await Deno.open(flags.output, {
      write: true,
      create: true,
    });
  } catch (error) {
    console.error("Failed to create output file", error);
    Deno.exit(1);
  }

  const encoder = new TextEncoder();
  try {
    output.write(
      encoder.encode(
        "> left_sequence left_start left_end right_sequence right_start right_end\n",
      ),
    );
    for await (
      const { seqId, tsds } of await searchFA(
        input.readable,
        {
          size: flags.workers,
          scheduler: flags.workerScheduler,
        },
        flags,
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
