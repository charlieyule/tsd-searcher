import { Options } from "./options.ts";
import { TSD } from "./tsd.ts";

export enum Type {
  Close,
  Search,
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
  options?: Options;
};

export type SearchResponse = {
  id: number;
  tsds: TSD[];
};

export const close: CloseRequest = { type: Type.Close };
