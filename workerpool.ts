import { close, SearchRequest, SearchResponse, Type } from "./message.ts";
import { Options } from "./options.ts";
import { TSD } from "./tsd.ts";

/**
 * Scheduler selects next worker to submit a search request.
 */
interface Scheduler {
  next(): Worker;
}

/**
 * IDGenerator generates IDs for search requests.
 */
interface IDGenerator {
  generate(): number;
}

/**
 * RoundRobin selects next worker with Round-robin.
 */
class RoundRobin implements Scheduler {
  private i = 0;
  constructor(private workers: Worker[]) {
  }

  next(): Worker {
    const worker = this.workers[this.i++];
    this.i %= this.workers.length;
    return worker;
  }
}

/**
 * Serial generates serial sequence of IDs.
 */
class Serial implements IDGenerator {
  private i = 1;
  generate(): number {
    return this.i++;
  }
}

/**
 * WorkerPool manages a group of workers that searches TSDs on requests.
 */
export class WorkerPool {
  private workers: Worker[];
  private scheduler: Scheduler;
  private idGenerator: IDGenerator = new Serial();
  private promiseResolves: Map<number, (tsd: TSD[]) => void> = new Map();

  constructor(
    specifier: string | URL = new URL("./worker.ts", import.meta.url).href,
    options: {
      size?: number;
      workerOptions?: WorkerOptions;
    } = {},
  ) {
    const {
      size = Math.ceil(navigator.hardwareConcurrency / 2),
      workerOptions = {},
    } = options;
    const { name = "worker", type = "module" } = workerOptions;
    this.workers = Array(size).fill(null).map(
      (_, index) => {
        const worker = new Worker(specifier, {
          name: `${name}#${index + 1}`,
          type,
        });
        this.setupWorkerListener(worker);
        return worker;
      },
    );
    this.scheduler = new RoundRobin(this.workers);
  }

  /**
   * Search TSDs from the input genome sequence.
   */
  public search(
    seq: string,
    options?: Options,
  ): Promise<TSD[]> {
    const id = this.idGenerator.generate();
    const request: SearchRequest = {
      type: Type.Search,
      id,
      seq,
      options,
    };
    const promise = new Promise<TSD[]>((resolve) => {
      this.promiseResolves.set(id, resolve);
    });
    this.scheduler.next().postMessage(request);
    return promise;
  }

  /**
   * Close the worker pool.
   */
  public close(): Promise<void> {
    this.workers.forEach((worker) => worker.postMessage(close));
    // sleep for a short while to let workers exit properly
    return new Promise((resolve) => setTimeout(() => resolve(undefined), 100));
  }

  /**
   * Setup listener on the input worker to handle the the result.
   */
  private setupWorkerListener(worker: Worker) {
    worker.onmessage = (e: MessageEvent<SearchResponse>) => {
      const { id, tsds } = e.data;
      this.promiseResolves.get(id)?.(tsds.map((tsd) =>
        // re-construct TSD objects as the received from workers lose the prototypes.
        new TSD(
          tsd.leftSeq,
          tsd.leftStart,
          tsd.leftEnd,
          tsd.rightSeq,
          tsd.rightStart,
          tsd.rightEnd,
          tsd.score,
        )
      ));
      this.promiseResolves.delete(id);
    };
  }
}
