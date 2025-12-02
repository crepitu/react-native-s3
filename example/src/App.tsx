import { useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  Button,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { S3Provider, useUploadToS3, useDownloadFromS3 } from 'react-native-s3';

// Example configuration - replace with your actual values
const s3Config = {
  bucket: 'your-s3-bucket-name',
  region: 'us-east-1',
  uploadPresignedUrlEndpoint: 'https://your-api.com/upload/presigned',
  downloadPresignedUrlEndpoint: 'https://your-api.com/download/presigned',
};

function S3Demo() {
  const [fileName, setFileName] = useState('test-file.jpg');
  const [subfolder, setSubfolder] = useState('uploads');
  const [fileUri, setFileUri] = useState('');
  const [downloadedUrl, setDownloadedUrl] = useState('');

  const {
    upload,
    uploading,
    progress: uploadProgress,
    error: uploadError,
    reset: resetUpload,
  } = useUploadToS3();

  const {
    download,
    downloading,
    error: downloadError,
    reset: resetDownload,
  } = useDownloadFromS3();

  const handleUpload = async () => {
    if (!fileUri) {
      Alert.alert('Error', 'Please provide a file URI');
      return;
    }

    resetUpload();
    try {
      const result = await upload({
        fileUri,
        fileName,
        subfolder,
        contentType: 'image/jpeg',
        onProgress: (progress) => {
          console.log(`Upload progress: ${progress.toFixed(2)}%`);
        },
      });

      if (result.success) {
        Alert.alert('Success', `File uploaded: ${result.fileName}`);
      } else {
        Alert.alert('Upload Failed', result.error || 'Unknown error');
      }
    } catch (error: any) {
      Alert.alert('Upload Error', error.message);
    }
  };

  const handleDownload = async () => {
    if (!fileName || !subfolder) {
      Alert.alert('Error', 'Please provide file name and subfolder');
      return;
    }

    resetDownload();
    try {
      const result = await download({
        fileName,
        subfolder,
        contentType: 'image/jpeg',
      });

      setDownloadedUrl(result.signedUrl);
      Alert.alert('Success', 'Presigned URL generated');
    } catch (error: any) {
      Alert.alert('Download Error', error.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>React Native S3 Upload Demo</Text>

        <Text style={styles.label}>File URI (for upload):</Text>
        <TextInput
          style={styles.input}
          value={fileUri}
          onChangeText={setFileUri}
          placeholder="file:///path/to/image.jpg"
        />

        <Text style={styles.label}>File Name:</Text>
        <TextInput
          style={styles.input}
          value={fileName}
          onChangeText={setFileName}
          placeholder="test-file.jpg"
        />

        <Text style={styles.label}>Subfolder:</Text>
        <TextInput
          style={styles.input}
          value={subfolder}
          onChangeText={setSubfolder}
          placeholder="uploads"
        />

        <View style={styles.buttonContainer}>
          <Button
            title={uploading ? 'Uploading...' : 'Upload to S3'}
            onPress={handleUpload}
            disabled={uploading}
          />
        </View>

        {uploading && (
          <Text style={styles.progress}>
            Upload Progress: {uploadProgress.toFixed(2)}%
          </Text>
        )}

        {uploadError && (
          <Text style={styles.error}>Upload Error: {uploadError}</Text>
        )}

        <View style={styles.divider} />

        <View style={styles.buttonContainer}>
          <Button
            title={downloading ? 'Getting URL...' : 'Get Download URL'}
            onPress={handleDownload}
            disabled={downloading}
          />
        </View>

        {downloadError && (
          <Text style={styles.error}>Download Error: {downloadError}</Text>
        )}

        {downloadedUrl && (
          <View style={styles.urlContainer}>
            <Text style={styles.label}>Presigned Download URL:</Text>
            <Text style={styles.url} numberOfLines={3}>
              {downloadedUrl}
            </Text>
          </View>
        )}

        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>Configuration:</Text>
          <Text style={styles.infoText}>Bucket: {s3Config.bucket}</Text>
          <Text style={styles.infoText}>Region: {s3Config.region}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

export default function App() {
  return (
    <S3Provider config={s3Config}>
      <S3Demo />
    </S3Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 5,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  buttonContainer: {
    marginTop: 20,
  },
  progress: {
    marginTop: 10,
    fontSize: 14,
    color: '#007AFF',
    textAlign: 'center',
  },
  error: {
    marginTop: 10,
    fontSize: 14,
    color: '#FF3B30',
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 30,
  },
  urlContainer: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#e8e8e8',
    borderRadius: 8,
  },
  url: {
    fontSize: 12,
    color: '#333',
    marginTop: 5,
  },
  infoContainer: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
});
