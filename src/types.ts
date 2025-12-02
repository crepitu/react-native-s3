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
