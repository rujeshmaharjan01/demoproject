// src/lib/s3.ts
import "server-only";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { PutObjectCommand, DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { S3 } from "./S3Client";

const BUCKET = process.env.S3_BUCKET_NAME!;
const PUBLIC_URL = process.env.NEXT_PUBLIC_S3_PUBLIC_URL ?? "";

export type StoredFile = {
  key: string;
  url: string;
  name: string;
  size: number;
  type: string;
};

function safeExt(filename: string) {
  const ext = path.extname(filename).toLowerCase();
  return /^\.[a-z0-9]{1,8}$/.test(ext) ? ext : "";
}

export async function uploadFileToS3(
  file: File,
  prefix = "uploads",
): Promise<StoredFile> {
  const ext = safeExt(file.name);
  const key = `${prefix}/${randomUUID()}${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  await S3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: file.type || "application/octet-stream",
      ContentLength: buffer.byteLength,
    }),
  );

  return {
    key,
    url: PUBLIC_URL ? `${PUBLIC_URL}/${key}` : key,
    name: file.name,
    size: file.size,
    type: file.type,
  };
}

export async function deleteS3Objects(keys: string[]): Promise<void> {
  if (!keys.length) return;
  await S3.send(
    new DeleteObjectsCommand({
      Bucket: BUCKET,
      Delete: { Objects: keys.map((Key) => ({ Key })) },
    }),
  );
}
