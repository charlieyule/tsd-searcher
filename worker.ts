import { Request, SearchResponse, Type } from "./message.ts";
import { search } from "./search.ts";

function start() {
  console.log(`[${self.name}]: worker started`);

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
        const response: SearchResponse = { id, tsds };
        self.postMessage(response);
        break;
      }
    }
  };
}

if (import.meta.main) {
  start();
}
