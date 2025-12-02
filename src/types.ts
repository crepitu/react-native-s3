/**
 * Request configuration for custom HTTP client
 */
export interface HttpRequestConfig {
  url: string;
  method: 'GET' | 'PUT' | 'POST' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
}

/**
 * Response object from custom HTTP client
 */
export interface HttpResponse<T = any> {
  data: T;
  status: number;
  statusText?: string;
}

/**
 * Custom HTTP client interface
 * Allows users to plug in their own HTTP client (e.g., Axios instance with interceptors)
 *
 * @example
 * // Using Axios with interceptors
 * const httpClient: HttpClient = {
 *   request: async (config) => {
 *     const response = await axiosInstance({
 *       url: config.url,
 *       method: config.method,
 *       headers: config.headers,
 *       data: config.body,
 *     });
 *     return { data: response.data, status: response.status };
 *   }
 * };
 */
export interface HttpClient {
  request: <T = any>(config: HttpRequestConfig) => Promise<HttpResponse<T>>;
}

export interface S3Config {
  bucket: string;
  region: string;
  uploadPresignedUrlEndpoint: string;
  downloadPresignedUrlEndpoint: string;
  /**
   * Optional custom function to fetch presigned URL
   * Use this if you have a custom API handler (like axios wrapper)
   */
  getPresignedUrl?: (
    params: GetPresignedUrlRequestParams
  ) => Promise<PresignedUrlResponse>;
  /**
   * Optional custom HTTP client for all requests
   * Use this to plug in your own HTTP client with interceptors (e.g., Axios)
   *
   * @example
   * // Using Axios with interceptors already configured
   * httpClient: {
   *   request: async (config) => {
   *     const response = await axiosInstance({
   *       url: config.url,
   *       method: config.method,
   *       headers: config.headers,
   *       data: config.body,
   *     });
   *     return { data: response.data, status: response.status };
   *   }
   * }
   */
  httpClient?: HttpClient;
}

export interface GetPresignedUrlRequestParams {
  bucket: string;
  region: string;
  fileName: string;
  subfolder: string;
  contentType: string;
  type: 'upload' | 'download';
}

export interface GetPresignedUrlParams {
  fileName: string;
  subfolder: string;
  contentType?: string;
}

export interface PresignedUrlResponse {
  signedUrl: string;
}

export interface UploadParams {
  fileUri: string;
  fileName: string;
  subfolder: string;
  contentType?: string;
  onProgress?: (progress: number) => void;
}

export interface UploadResult {
  success: boolean;
  fileName: string;
  error?: string;
}

export interface DownloadParams {
  fileName: string;
  subfolder: string;
  contentType?: string;
}

export interface DownloadResult {
  signedUrl: string;
}
