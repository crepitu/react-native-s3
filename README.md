# react-native-s3

A lightweight React Native library for handling S3 file uploads and downloads using presigned URLs. This library provides a simple Context API-based configuration system and React hooks for easy integration.

## Features

- ✅ **Zero native dependencies** - Uses standard React Native APIs
- 🚀 **Simple Context API** configuration
- 📤 **Upload files** to S3 with progress tracking
- 📥 **Download files** from S3 using presigned URLs
- 🎯 **TypeScript** support with full type definitions
- 🪝 **React Hooks** for easy integration
- 🔄 **Progress tracking** for uploads
- ⚠️ **Error handling** built-in

## Installation

```sh
npm install react-native-s3
```

or

```sh
yarn add react-native-s3
```

## Usage

### 1. Wrap your app with S3Provider

First, configure the S3Provider with your bucket information and API endpoints:

```tsx
import React from 'react';
import { S3Provider } from 'react-native-s3';

const s3Config = {
  bucket: 'your-s3-bucket-name',
  region: 'us-east-1',
  uploadPresignedUrlEndpoint: 'https://your-api.com/upload/presigned',
  downloadPresignedUrlEndpoint: 'https://your-api.com/download/presigned',
};

export default function App() {
  return (
    <S3Provider config={s3Config}>
      {/* Your app components */}
    </S3Provider>
  );
}
```

### 2. Upload files using useUploadToS3

```tsx
import React, { useState } from 'react';
import { Button, Text, View } from 'react-native';
import { useUploadToS3 } from 'react-native-s3';

function UploadComponent() {
  const { upload, uploading, progress, error } = useUploadToS3();

  const handleUpload = async () => {
    const result = await upload({
      fileUri: 'file:///path/to/image.jpg',
      fileName: 'my-photo.jpg',
      subfolder: 'uploads/photos',
      contentType: 'image/jpeg',
      onProgress: (progress) => {
        console.log(`Upload progress: ${progress}%`);
      },
    });

    if (result.success) {
      console.log('Upload successful:', result.fileName);
    } else {
      console.error('Upload failed:', result.error);
    }
  };

  return (
    <View>
      <Button
        title={uploading ? 'Uploading...' : 'Upload File'}
        onPress={handleUpload}
        disabled={uploading}
      />
      {uploading && <Text>Progress: {progress.toFixed(2)}%</Text>}
      {error && <Text>Error: {error}</Text>}
    </View>
  );
}
```

### 3. Download files using useDownloadFromS3

```tsx
import React from 'react';
import { Button, Text, View } from 'react-native';
import { useDownloadFromS3 } from 'react-native-s3';

function DownloadComponent() {
  const { download, downloading, error } = useDownloadFromS3();

  const handleDownload = async () => {
    try {
      const result = await download({
        fileName: 'my-photo.jpg',
        subfolder: 'uploads/photos',
        contentType: 'image/jpeg',
      });

      console.log('Download URL:', result.signedUrl);
      // Use the signedUrl to download or display the file
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  return (
    <View>
      <Button
        title={downloading ? 'Getting URL...' : 'Get Download URL'}
        onPress={handleDownload}
        disabled={downloading}
      />
      {error && <Text>Error: {error}</Text>}
    </View>
  );
}
```

## API Reference

### S3Provider

Context provider that configures S3 settings for the entire app.

**Props:**

```typescript
interface S3Config {
  bucket: string; // S3 bucket name
  region: string; // AWS region
  uploadPresignedUrlEndpoint: string; // API endpoint for upload presigned URLs
  downloadPresignedUrlEndpoint: string; // API endpoint for download presigned URLs
}
```

### useUploadToS3

Hook for uploading files to S3.

**Returns:**

```typescript
{
  upload: (params: UploadParams) => Promise<UploadResult>;
  uploading: boolean;
  progress: number; // 0-100
  error: string | null;
  reset: () => void;
}
```

**UploadParams:**

```typescript
interface UploadParams {
  fileUri: string; // Local file URI
  fileName: string; // Destination file name
  subfolder: string; // S3 subfolder path
  contentType?: string; // MIME type (default: 'application/octet-stream')
  onProgress?: (progress: number) => void; // Progress callback
}
```

### useDownloadFromS3

Hook for getting presigned download URLs from S3.

**Returns:**

```typescript
{
  download: (params: DownloadParams) => Promise<DownloadResult>;
  downloading: boolean;
  error: string | null;
  reset: () => void;
}
```

**DownloadParams:**

```typescript
interface DownloadParams {
  fileName: string; // File name in S3
  subfolder: string; // S3 subfolder path
  contentType?: string; // MIME type (default: 'application/octet-stream')
}
```

### useS3Config

Hook to access the current S3 configuration.

```typescript
const config = useS3Config();
console.log(config.bucket, config.region, config.isConfigured);
```

## Backend Requirements

Your backend API should provide two endpoints that return presigned URLs:

### Upload Presigned URL Endpoint

**GET** `/upload/presigned`

**Query Parameters:**
- `bucket`: S3 bucket name
- `region`: AWS region
- `fileName`: Destination file name
- `subfolder`: S3 subfolder path
- `contentType`: MIME type

**Response:**
```json
{
  "signedUrl": "https://your-bucket.s3.amazonaws.com/..."
}
```

### Download Presigned URL Endpoint

**GET** `/download/presigned`

**Query Parameters:**
- `bucket`: S3 bucket name
- `region`: AWS region
- `fileName`: File name in S3
- `subfolder`: S3 subfolder path
- `contentType`: MIME type

**Response:**
```json
{
  "signedUrl": "https://your-bucket.s3.amazonaws.com/..."
}
```

## Error Handling

All hooks provide error states and throw errors that can be caught:

```tsx
const { upload, error } = useUploadToS3();

try {
  const result = await upload(params);
  if (!result.success) {
    console.error('Upload failed:', result.error);
  }
} catch (err) {
  console.error('Exception during upload:', err);
}

// Or use the error state
if (error) {
  console.error('Upload error:', error);
}
```

## TypeScript

This library is written in TypeScript and includes full type definitions. Import types as needed:

```typescript
import type {
  S3Config,
  UploadParams,
  UploadResult,
  DownloadParams,
  DownloadResult,
} from 'react-native-s3';
```

## Advanced Usage

### Using Utility Functions Directly

For advanced use cases, you can import and use the utility functions directly:

```typescript
import {
  fetchPresignedUrl,
  uploadToS3,
  normalizeFilePath,
} from 'react-native-s3';
```

## Contributing

- [Development workflow](CONTRIBUTING.md#development-workflow)
- [Sending a pull request](CONTRIBUTING.md#sending-a-pull-request)
- [Code of conduct](CODE_OF_CONDUCT.md)

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)

