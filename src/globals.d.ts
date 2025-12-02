declare const global: any;

// Declare global types for React Native environment
declare const XMLHttpRequest: any;
declare const FormData: any;
declare const Blob: any;

declare function fetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response>;

declare class URLSearchParams {
  constructor(init?: Record<string, string> | string);
  toString(): string;
}

declare class Response {
  ok: boolean;
  status: number;
  statusText: string;
  json(): Promise<any>;
  blob(): Promise<Blob>;
}

interface RequestInit {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
}

type RequestInfo = string;
