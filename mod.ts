import { readFA } from "./file_handler.ts";
import { SearchOptions, WorkerPoolOptions } from "./options.ts";
import { TSD } from "./tsd.ts";
import { WorkerPool } from "./workerpool.ts";

export { TSD } from "./tsd.ts";
export { search } from "./search.ts";
export { WorkerPool } from "./workerpool.ts";

// Search TSDs from a readable stream of a FASTA file.
export async function* searchFA(
  readable: ReadableStream<Uint8Array>,
  workerOptions?: WorkerPoolOptions,
  searchOptions?: SearchOptions,
): AsyncIterable<{ seqId: string; tsds: TSD[] }> {
  const workerPool = new WorkerPool(undefined, workerOptions);
  const results = [];
  try {
    for await (const entry of (await readFA(readable))) {
      results.push({
        seqId: entry.id,
        tsdPromise: workerPool.search(entry.seq, searchOptions),
      });
    }
    for (const result of results) {
      yield {
        seqId: result.seqId,
        tsds: await result.tsdPromise,
      };
    }
  } finally {
    await workerPool.close();
  }
}
