// src/app/api/chalani/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import {
  uploadFileToS3,
  deleteS3Objects,
  type StoredFile,
} from "@/lib/s3";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_SIZE = 10 * 1024 * 1024;
const MAX_FILES = 10;
const ALLOWED = new Set([
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "application/pdf",
  "application/zip",
]);

const fieldsSchema = z.object({
  chalaniNumber: z.string().min(1).max(50),
  personName: z.string().min(1).max(120),
});

export async function POST(req: Request) {
  // --- 1. Parse multipart ---
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json(
      { message: "Invalid form data." },
      { status: 400 },
    );
  }

  // --- 2. Validate text fields ---
  const parsed = fieldsSchema.safeParse({
    chalaniNumber: formData.get("chalaniNumber"),
    personName: formData.get("personName"),
  });
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Invalid fields", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  // --- 3. Validate files ---
  const files = formData
    .getAll("image")
    .filter((v): v is File => v instanceof File);

  if (files.length === 0) {
    return NextResponse.json(
      { message: "At least one file is required." },
      { status: 400 },
    );
  }
  if (files.length > MAX_FILES) {
    return NextResponse.json(
      { message: `Max ${MAX_FILES} files.` },
      { status: 400 },
    );
  }
  for (const f of files) {
    if (f.size === 0) {
      return NextResponse.json(
        { message: `"${f.name}" is empty.` },
        { status: 400 },
      );
    }
    if (f.size > MAX_SIZE) {
      return NextResponse.json(
        { message: `"${f.name}" exceeds 10MB.` },
        { status: 400 },
      );
    }
    if (f.type && !ALLOWED.has(f.type)) {
      return NextResponse.json(
        { message: `"${f.name}" has an unsupported type (${f.type}).` },
        { status: 400 },
      );
    }
  }

  // --- 4. Upload to Tigris ---
  const uploaded: StoredFile[] = [];
  try {
    for (const f of files) {
      uploaded.push(await uploadFileToS3(f));
    }
  } catch (err) {
    console.error("S3 upload failed:", err);
    await deleteS3Objects(uploaded.map((u) => u.key)).catch(() => {});
    return NextResponse.json(
      { message: "File upload failed." },
      { status: 500 },
    );
  }

  // --- 5. Persist ---
  try {
    const chalani = await prisma.chalani.create({
      data: {
        chalaniNumber: parsed.data.chalaniNumber,
        personName: parsed.data.personName,
        imageUrls: uploaded.map((u) => u.key),
      },
    });

    return NextResponse.json(
      { ...chalani, images: uploaded },
      { status: 201 },
    );
  } catch (err: unknown) {
    const code =
      typeof err === "object" && err !== null && "code" in err
        ? (err as { code: string }).code
        : undefined;

    // Roll back the S3 uploads since the row wasn't created.
    await deleteS3Objects(uploaded.map((u) => u.key)).catch(() => {});

    if (code === "P2002") {
      return NextResponse.json(
        { message: "Chalani number already exists." },
        { status: 409 },
      );
    }

    console.error("DB write failed:", err);
    return NextResponse.json(
      { message: "Failed to save chalani." },
      { status: 500 },
    );
  }
}