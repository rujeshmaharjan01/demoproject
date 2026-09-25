"use client";

import * as React from "react";
import { FileText, ExternalLink } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import type { Chalani } from "./types";

const PUBLIC_URL = process.env.NEXT_PUBLIC_S3_PUBLIC_URL ?? "";

interface ChalaniPreviewDialogProps {
  chalani: Chalani;
  children: React.ReactNode;
}

function isImage(key: string) {
  return /\.(png|jpe?g|gif|webp)$/i.test(key);
}

function fileName(key: string) {
  return key.split("/").pop() ?? key;
}

// Stable across server + client — same locale, same timezone.
function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    timeZone: "UTC",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function FileTile({
  fileKey,
  href,
}: {
  fileKey: string;
  href: string;
}) {
  const image = isImage(fileKey);
  const [failed, setFailed] = React.useState(false);
  const showImage = image && !failed;

  return (
    <li className="bg-card flex items-center gap-3 rounded-lg border p-3">
      <div className="bg-muted flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md">
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={href}
            alt={fileName(fileKey)}
            className="h-full w-full object-cover"
            onError={() => setFailed(true)}
          />
        ) : (
          <FileText className="text-muted-foreground h-6 w-6" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{fileName(fileKey)}</p>
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="text-primary inline-flex items-center gap-1 text-xs underline-offset-4 hover:underline"
        >
          Open
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </li>
  );
}

export function ChalaniPreviewDialog({
  chalani,
  children,
}: ChalaniPreviewDialogProps) {
  const files = chalani.imageUrls ?? [];

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {chalani.chalaniNumber}
            <Badge variant="secondary">Chalani</Badge>
          </DialogTitle>
          <DialogDescription>
            Uploaded on {formatDate(chalani.createdAt)}
          </DialogDescription>
        </DialogHeader>

        <Separator />

        <dl className="grid grid-cols-3 gap-4 text-sm">
          <div className="col-span-1">
            <dt className="text-muted-foreground">Chalani No.</dt>
            <dd className="font-medium">{chalani.chalaniNumber}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-muted-foreground">Person Name</dt>
            <dd className="font-medium">{chalani.personName}</dd>
          </div>
          <div className="col-span-3">
            <dt className="text-muted-foreground">Created</dt>
            <dd className="font-medium">{formatDate(chalani.createdAt)}</dd>
          </div>
        </dl>

        <Separator />

        <div className="space-y-3">
          <h3 className="text-sm font-medium">Files ({files.length})</h3>

          {files.length === 0 ? (
            <p className="text-muted-foreground text-sm">No files attached.</p>
          ) : (
            <ul className="grid grid-cols-2 gap-3">
              {files.map((key) => (
                <FileTile
                  key={key}
                  fileKey={key}
                  href={`${PUBLIC_URL}/${key}`}
                />
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}