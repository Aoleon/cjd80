import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Client } from 'minio';

describe('MinIO S3 API Integration Tests', () => {
  let client: Client;
  const testBucket = 'test-bucket-integration';
  const testFile = 'test-file.txt';
  const testContent = Buffer.from('Hello MinIO World!');

  beforeAll(async () => {
    // Initialize MinIO client
    // Use direct IP since we're testing from localhost
    // MINIO_ENDPOINT env var might be 'dev_minio' which won't resolve outside Docker network
    const endpoint = '172.18.0.14';
    const port = 9000;

    client = new Client({
      endPoint: endpoint,
      port: port,
      useSSL: false,
      accessKey: 'minioadmin',
      secretKey: 'minioadmin123',
    });

    // Create test bucket
    const exists = await client.bucketExists(testBucket);
    if (!exists) {
      await client.makeBucket(testBucket, 'us-east-1');
    }
  });

  afterAll(async () => {
    // Cleanup: delete test file and bucket
    try {
      await client.removeObject(testBucket, testFile);
    } catch (error) {
      // File might not exist
    }

    try {
      await client.removeBucket(testBucket);
    } catch (error) {
      // Bucket might not be empty
    }
  });

  it('should connect to MinIO successfully', async () => {
    const buckets = await client.listBuckets();
    expect(buckets).toBeDefined();
    expect(Array.isArray(buckets)).toBe(true);
    console.log('Connected buckets:', buckets.map(b => b.name));
  });

  it('should upload a file to MinIO', async () => {
    await client.putObject(
      testBucket,
      testFile,
      testContent,
      testContent.length,
      { 'Content-Type': 'text/plain' }
    );

    // Verify file exists
    const stat = await client.statObject(testBucket, testFile);
    expect(stat.size).toBe(testContent.length);
  });

  it('should download a file from MinIO', async () => {
    // First upload a file
    await client.putObject(
      testBucket,
      'download-test.txt',
      Buffer.from('Download test content'),
      'Download test content'.length,
      { 'Content-Type': 'text/plain' }
    );

    // Download the file
    const dataStream = await client.getObject(testBucket, 'download-test.txt');

    let downloadedContent = '';
    for await (const chunk of dataStream as any) {
      downloadedContent += chunk.toString();
    }

    expect(downloadedContent).toBe('Download test content');
  });

  it('should list objects in bucket', async () => {
    const objectsList: string[] = [];
    const stream = client.listObjects(testBucket, '', true);

    for await (const obj of stream as any) {
      objectsList.push(obj.name);
    }

    expect(objectsList.length).toBeGreaterThan(0);
    console.log('Objects in bucket:', objectsList);
  });

  it('should delete a file from MinIO', async () => {
    // Upload a file first
    const deleteTestFile = 'delete-test.txt';
    await client.putObject(
      testBucket,
      deleteTestFile,
      Buffer.from('To be deleted'),
      'To be deleted'.length
    );

    // Delete the file
    await client.removeObject(testBucket, deleteTestFile);

    // Verify file is deleted
    try {
      await client.statObject(testBucket, deleteTestFile);
      expect.fail('File should have been deleted');
    } catch (error: any) {
      expect(error.code).toBe('NotFound');
    }
  });

  it('should get presigned URL for file', async () => {
    // Upload a file first
    await client.putObject(
      testBucket,
      'presigned-test.txt',
      Buffer.from('Presigned URL test'),
      'Presigned URL test'.length
    );

    // Get presigned URL
    const url = await client.presignedGetObject(
      testBucket,
      'presigned-test.txt',
      24 * 60 * 60 // 24 hours
    );

    expect(url).toBeDefined();
    expect(typeof url).toBe('string');
    expect(url).toContain(testBucket);
    expect(url).toContain('presigned-test.txt');
    console.log('Presigned URL:', url);
  });

  it('should check bucket policy', async () => {
    try {
      const policy = await client.getBucketPolicy(testBucket);
      // Policy might not be set
      console.log('Bucket policy:', policy);
    } catch (error: any) {
      // Expected if no policy is set
      console.log('No bucket policy set');
    }
  });

  it('should verify S3 compatibility', async () => {
    // Test standard S3 operations compatibility
    const testBucketName = 's3-compat-test';

    // Create bucket
    const bucketExists = await client.bucketExists(testBucketName);

    if (!bucketExists) {
      await client.makeBucket(testBucketName, 'us-east-1');
    }

    // Put object with metadata
    const metadata = {
      'X-Amz-Meta-Testing': 'test-value'
    };

    await client.putObject(
      testBucketName,
      's3-test-object.bin',
      Buffer.from('S3 compatibility test'),
      'S3 compatibility test'.length,
      metadata
    );

    // Get object stat
    const stat = await client.statObject(testBucketName, 's3-test-object.bin');
    expect(stat).toBeDefined();
    expect(stat.etag).toBeDefined();

    console.log('S3 object metadata:', {
      size: stat.size,
      etag: stat.etag,
      lastModified: stat.lastModified
    });

    // Cleanup
    await client.removeObject(testBucketName, 's3-test-object.bin');
    await client.removeBucket(testBucketName);
  });
});
