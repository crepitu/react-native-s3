import { useState, useCallback } from 'react';
import { useS3Config } from '../context/S3Context';
import {
  fetchPresignedUrl,
  uploadToS3,
  normalizeFilePath,
} from '../utils/s3Utils';
import type { UploadParams, UploadResult } from '../types';

interface UseUploadToS3Result {
  upload: (params: UploadParams) => Promise<UploadResult>;
  uploading: boolean;
  progress: number;
  error: string | null;
  reset: () => void;
}

export const useUploadToS3 = (): UseUploadToS3Result => {
  const config = useS3Config();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(
    async ({
      fileUri,
      fileName,
      subfolder,
      contentType = 'application/octet-stream',
      onProgress,
    }: UploadParams): Promise<UploadResult> => {
      if (!config.isConfigured) {
        const errorMsg =
          'S3 is not configured. Please provide valid configuration.';
        setError(errorMsg);
        return {
          success: false,
          fileName,
          error: errorMsg,
        };
      }

      setUploading(true);
      setProgress(0);
      setError(null);

      try {
        // Normalize file path
        const normalizedPath = normalizeFilePath(fileUri);

        // Fetch presigned URL - use custom function if provided
        let signedUrl: string;
        if (config.getPresignedUrl) {
          const response = await config.getPresignedUrl({
            bucket: config.bucket,
            region: config.region,
            fileName,
            subfolder,
            contentType,
            type: 'upload',
          });
          signedUrl = response.signedUrl;
        } else {
          const response = await fetchPresignedUrl(
            config.uploadPresignedUrlEndpoint,
            {
              bucket: config.bucket,
              region: config.region,
              fileName,
              subfolder,
              contentType,
            }
          );
          signedUrl = response.signedUrl;
        }

        // Upload file to S3
        const result = await uploadToS3(
          signedUrl,
          normalizedPath,
          fileName,
          contentType,
          (uploadProgress) => {
            setProgress(uploadProgress);
            onProgress?.(uploadProgress);
          }
        );

        if (!result.success) {
          setError(result.error || 'Upload failed');
        }

        return result;
      } catch (err: any) {
        const errorMsg = err.message || 'Unknown upload error';
        setError(errorMsg);
        return {
          success: false,
          fileName,
          error: errorMsg,
        };
      } finally {
        setUploading(false);
      }
    },
    [config]
  );

  const reset = useCallback(() => {
    setUploading(false);
    setProgress(0);
    setError(null);
  }, []);

  return {
    upload,
    uploading,
    progress,
    error,
    reset,
  };
};
