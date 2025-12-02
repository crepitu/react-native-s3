import type {
  PresignedUrlResponse,
  UploadResult,
  HttpClient,
  HttpRequestConfig,
  HttpResponse,
} from '../types';

/**
 * Default HTTP client using fetch API
 */
const defaultHttpClient: HttpClient = {
  request: async <T = any>(
    config: HttpRequestConfig
  ): Promise<HttpResponse<T>> => {
    const response = await fetch(config.url, {
      method: config.method,
      headers: config.headers,
      body: config.body,
    });

    let data: any;
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const error = new Error(
        `Request failed with status ${response.status}: ${response.statusText}`
      );
      (error as any).status = response.status;
      (error as any).response = { data, status: response.status };
      throw error;
    }

    return {
      data,
      status: response.status,
      statusText: response.statusText,
    };
  },
};

/**
 * Fetch presigned URL from the backend
 */
export async function fetchPresignedUrl(
  endpoint: string,
  params: {
    bucket: string;
    region: string;
    fileName: string;
    subfolder: string;
    contentType?: string;
  },
  httpClient?: HttpClient
): Promise<PresignedUrlResponse> {
  const queryParams = new URLSearchParams({
    bucket: params.bucket,
    region: params.region,
    fileName: params.fileName,
    subfolder: params.subfolder,
    contentType: params.contentType || 'application/octet-stream',
  });

  const client = httpClient || defaultHttpClient;

  const response = await client.request<PresignedUrlResponse>({
    url: `${endpoint}?${queryParams.toString()}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return response.data;
}

/**
 * Upload file to S3 using presigned URL with fetch API
 *
 * IMPORTANT: For React Native, the fileUri should be a valid file:// URI
 * This method sends the file directly using PUT request to the presigned URL
 *
 * Note: fetch API doesn't support upload progress tracking natively.
 * If you need progress tracking, consider using XMLHttpRequest or a library like react-native-fs
 */
export async function uploadToS3(
  presignedUrl: string,
  fileUri: string,
  fileName: string,
  contentType: string = 'application/octet-stream',
  _onProgress?: (progress: number) => void,
  _httpClient?: HttpClient
): Promise<UploadResult> {
  try {
    // React Native way: Create a file object for fetch
    // React Native's fetch knows how to handle this blob-like object
    const file = {
      uri: fileUri,
      type: contentType,
      name: fileName,
    } as unknown as Blob;

    // For S3 upload, we use fetch directly as custom HTTP clients
    // may not handle React Native file blobs correctly
    // The httpClient is mainly for presigned URL fetching
    const response = await fetch(presignedUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': contentType,
      },
      body: file,
    });

    if (response.ok) {
      return {
        success: true,
        fileName,
      };
    } else {
      return {
        success: false,
        fileName,
        error: `Upload failed with status: ${response.status} ${response.statusText}`,
      };
    }
  } catch (error: any) {
    return {
      success: false,
      fileName,
      error: error.message || 'Unknown upload error',
    };
  }
}

/**
 * Normalize file path for different platforms
 */
export function normalizeFilePath(fileUri: string): string {
  // Handle empty or undefined
  if (!fileUri) {
    return '';
  }

  // For content:// URIs (Android), keep as is
  if (fileUri.startsWith('content://')) {
    return fileUri;
  }

  // For ph:// URIs (iOS Photos), keep as is
  if (fileUri.startsWith('ph://')) {
    return fileUri;
  }

  // For file:// URIs, ensure proper format
  if (fileUri.startsWith('file://')) {
    return fileUri;
  }

  // For absolute paths without scheme, add file://
  if (fileUri.startsWith('/')) {
    return `file://${fileUri}`;
  }

  return fileUri;
}

/**
 * Validate file URI format (basic validation)
 * Note: This doesn't check if file actually exists - use react-native-fs for that
 */
export function validateFileUri(fileUri: string): boolean {
  if (!fileUri || typeof fileUri !== 'string') {
    return false;
  }

  // Valid URI schemes for React Native
  const validSchemes = ['file://', 'content://', 'ph://', 'assets-library://'];

  // Check if it's a valid URI or absolute path
  return (
    validSchemes.some((scheme) => fileUri.startsWith(scheme)) ||
    fileUri.startsWith('/')
  );
}
