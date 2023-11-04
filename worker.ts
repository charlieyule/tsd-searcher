import {
  Request,
  SearchResponse,
  Status,
  StatusResponse,
  Type,
} from "./message.ts";
import { search } from "./search.ts";

function start() {
  console.log(`[${self.name}]: worker started`);
  const idleResponse: StatusResponse = {
    type: Type.Status,
    name: self.name,
    status: Status.Idle,
  };

  self.onmessage = (message: MessageEvent<Request>) => {
    const request = message.data;
    switch (request.type) {
      case Type.Close: {
        console.log(`[${self.name}]: received "close" request, worker closed`);
        self.close();
        break;
      }
      case Type.Search: {
        const { id, seq, options } = request;
        console.log(
          `[${self.name}]: received "search" request, searching TSD for sequence ${id}`,
        );
        const tsds = search(seq, options);
        const searchResponse: SearchResponse = { id, tsds, type: Type.Search };
        self.postMessage(searchResponse);
        self.postMessage(idleResponse);
        break;
      }
    }
  };
}

if (import.meta.main) {
  start();
}
