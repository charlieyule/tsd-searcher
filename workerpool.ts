import { close, Response, SearchRequest, Status, Type } from "./message.ts";
import { SearchOptions, WorkerPoolOptions } from "./options.ts";
import { TSD } from "./tsd.ts";

/**
 * Scheduler selects next worker to submit a search request.
 */
interface Scheduler {
  next(): Promise<Worker>;
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

  next(): Promise<Worker> {
    const worker = this.workers[this.i++];
    this.i %= this.workers.length;
    return new Promise((resolve) => {
      resolve(worker);
    });
  }
}

/**
 * FirstIdleScheduler selects the next idle worker.
 */
class FirstIdleScheduler implements Scheduler {
  private queue: Worker[] = [];
  private blockedPromiseResolves: ((value: Worker) => void)[] = [];

  constructor(workers: Worker[]) {
    workers.forEach((worker) => {
      this.setupListener(worker);
      this.queue.push(worker);
    });
  }

  async next(): Promise<Worker> {
    const worker = this.queue.shift();
    if (worker) {
      return worker;
    }
    return await new Promise((resolve) => {
      this.blockedPromiseResolves.push(resolve);
    });
  }

  private setupListener(worker: Worker) {
    const originListener = worker.onmessage;
    worker.onmessage = (e: MessageEvent<Response>) => {
      if (e.data.type == Type.Status && e.data.status == Status.Idle) {
        const blockedPromiseResolve = this.blockedPromiseResolves.shift();
        if (blockedPromiseResolve) {
          blockedPromiseResolve(worker);
        } else {
          this.queue.push(worker);
        }
      }
      originListener?.(e);
    };
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
    options: WorkerPoolOptions = {},
  ) {
    const {
      size = Math.ceil(navigator.hardwareConcurrency / 2),
      scheduler = "fi",
    } = options;
    this.workers = Array(size).fill(null).map(
      (_, index) => {
        const worker = new Worker(specifier, {
          name: `worker#${index + 1}`,
          type: "module",
        });
        this.setupWorkerListener(worker);
        return worker;
      },
    );
    switch (scheduler) {
      case "fi":
        this.scheduler = new FirstIdleScheduler(this.workers);
        break;
      case "rr":
        this.scheduler = new RoundRobin(this.workers);
        break;
    }
  }

  /**
   * Search TSDs from the input genome sequence.
   */
  public async search(
    seq: string,
    options?: SearchOptions,
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
    (await this.scheduler.next()).postMessage(request);
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
    worker.onmessage = (e: MessageEvent<Response>) => {
      if (e.data.type != Type.Search) {
        return;
      }
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
