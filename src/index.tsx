// Export context provider and hook
export { S3Provider, useS3Config } from './context/S3Context';

// Export hooks
export { useUploadToS3 } from './hooks/useUploadToS3';
export { useDownloadFromS3 } from './hooks/useDownloadFromS3';

// Export types
export type {
  S3Config,
  HttpClient,
  HttpRequestConfig,
  HttpResponse,
  GetPresignedUrlParams,
  GetPresignedUrlRequestParams,
  PresignedUrlResponse,
  UploadParams,
  UploadResult,
  DownloadParams,
  DownloadResult,
} from './types';

// Export utility functions (optional, for advanced usage)
export {
  fetchPresignedUrl,
  uploadToS3,
  normalizeFilePath,
  validateFileUri,
} from './utils/s3Utils';
