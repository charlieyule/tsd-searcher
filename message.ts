import { SearchOptions } from "./options.ts";
import { TSD } from "./tsd.ts";

export enum Type {
  Close,
  Search,
  Status,
}

export enum Status {
  Idle,
}

export type Request =
  | CloseRequest
  | SearchRequest;

export type CloseRequest = {
  type: Type.Close;
};

export type SearchRequest = {
  type: Type.Search;
  id: number;
  seq: string;
  options?: SearchOptions;
};

export type Response =
  | SearchResponse
  | StatusResponse;

export type SearchResponse = {
  type: Type.Search;
  id: number;
  tsds: TSD[];
};

export type StatusResponse = {
  type: Type.Status;
  name: string;
  status: Status;
};

export const close: CloseRequest = { type: Type.Close };
