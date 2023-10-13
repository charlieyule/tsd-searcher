import { TextLineStream } from "std/streams/mod.ts";

// FAEntry represents an entry consists of an ID and a genome sequence in a FASTA file.
export interface FAEntry {
  id: string;
  seq: string;
}

// Read a stream of an FASTA file and generates a sequence of entries.
export async function* readFA(
  readable: ReadableStream<Uint8Array>,
): AsyncIterable<FAEntry> {
  let id: string | undefined;
  let genomes: string[] = [];
  for await (
    const line of readable.pipeThrough(new TextDecoderStream()).pipeThrough(
      new TextLineStream(),
    )
  ) {
    if (line.startsWith(">")) {
      if (id) {
        yield { id, seq: genomes.join("") };
      }
      id = line.substring(1).trim();
      genomes = [];
    } else if (line) {
      genomes.push(line);
    }
  }
  if (id && genomes.length > 0) {
    yield { id, seq: genomes.join("") };
  }
}
