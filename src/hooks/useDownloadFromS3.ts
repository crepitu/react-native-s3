import { useState, useCallback } from 'react';
import { useS3Config } from '../context/S3Context';
import { fetchPresignedUrl } from '../utils/s3Utils';
import type { DownloadParams, DownloadResult } from '../types';

interface UseDownloadFromS3Result {
  download: (params: DownloadParams) => Promise<DownloadResult>;
  downloading: boolean;
  error: string | null;
  reset: () => void;
}

export const useDownloadFromS3 = (): UseDownloadFromS3Result => {
  const config = useS3Config();
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const download = useCallback(
    async ({
      fileName,
      subfolder,
      contentType = 'application/octet-stream',
    }: DownloadParams): Promise<DownloadResult> => {
      if (!config.isConfigured) {
        const errorMsg =
          'S3 is not configured. Please provide valid configuration.';
        setError(errorMsg);
        throw new Error(errorMsg);
      }

      setDownloading(true);
      setError(null);

      try {
        // Fetch presigned URL - use custom function if provided
        let signedUrl: string;
        if (config.getPresignedUrl) {
          const response = await config.getPresignedUrl({
            bucket: config.bucket,
            region: config.region,
            fileName,
            subfolder,
            contentType,
            type: 'download',
          });
          signedUrl = response.signedUrl;
        } else {
          const response = await fetchPresignedUrl(
            config.downloadPresignedUrlEndpoint,
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

        return { signedUrl };
      } catch (err: any) {
        const errorMsg = err.message || 'Unknown download error';
        setError(errorMsg);
        throw new Error(errorMsg);
      } finally {
        setDownloading(false);
      }
    },
    [config]
  );

  const reset = useCallback(() => {
    setDownloading(false);
    setError(null);
  }, []);

  return {
    download,
    downloading,
    error,
    reset,
  };
};
