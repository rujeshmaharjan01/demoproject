// src/components/web/forms/imageUpload.tsx
"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, File as FileIcon, X } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";

const MAX_SIZE = 10 * 1024 * 1024;
const ACCEPT = {
  "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
  "application/pdf": [".pdf"],
  "application/zip": [".zip"],
} as const;

interface StagedFile {
  id: string;
  file: File;
  objectUrl: string;
}

interface UploaderProps {
  onChange?: (files: File[]) => void;
  disabled?: boolean;
}

export function Uploader({ onChange, disabled = false }: UploaderProps) {
  const [files, setFiles] = useState<StagedFile[]>([]);

  useEffect(() => {
    onChange?.(files.map((f) => f.file));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

  const onDrop = useCallback((accepted: File[]) => {
    if (!accepted.length) return;
    const items: StagedFile[] = accepted.map((file) => ({
      id: uuidv4(),
      file,
      objectUrl: URL.createObjectURL(file),
    }));
    setFiles((prev) => [...prev, ...items]);
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const target = prev.find((f) => f.id === id);
      if (target) URL.revokeObjectURL(target.objectUrl);
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const clearAll = useCallback(() => {
    setFiles((prev) => {
      prev.forEach((f) => URL.revokeObjectURL(f.objectUrl));
      return [];
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      accept: ACCEPT,
      maxSize: MAX_SIZE,
      multiple: true,
      disabled,
      onDropRejected: (rejections) => {
        rejections.forEach((r) => {
          const reason = r.errors[0]?.code;
          if (reason === "file-too-large") {
            toast.error(`"${r.file.name}" exceeds 10MB`);
          } else if (reason === "file-invalid-type") {
            toast.error(`"${r.file.name}" has an unsupported type`);
          }
        });
      },
    });

  return (
    <div className="w-full space-y-4">
      <Card
        {...getRootProps()}
        className={cn(
          "relative flex flex-col items-center justify-center gap-3 p-10",
          "border-2 border-dashed rounded-2xl cursor-pointer",
          "transition-all duration-200 ease-in-out",
          "bg-linear-to-br from-background to-muted/30",
          "hover:border-primary/60 hover:bg-muted/50 hover:shadow-lg",
          isDragActive &&
            !isDragReject &&
            "border-primary bg-primary/5 scale-[1.02] shadow-xl",
          isDragReject && "border-destructive bg-destructive/5",
          disabled && "pointer-events-none opacity-60",
        )}
      >
        <input {...getInputProps()} />

        <div
          className={cn(
            "flex h-16 w-16 items-center justify-center rounded-full",
            "bg-primary/10 text-primary transition-transform duration-200",
            isDragActive && "scale-110",
            isDragReject && "bg-destructive/10 text-destructive",
          )}
        >
          <UploadCloud className="h-8 w-8" />
        </div>

        <div className="text-center space-y-1">
          <p className="text-base font-semibold text-foreground">
            {isDragActive
              ? isDragReject
                ? "File type not supported"
                : "Drop files here"
              : "Drag & drop files here"}
          </p>
          <p className="text-sm text-muted-foreground">
            or{" "}
            <span className="text-primary font-medium underline underline-offset-4">
              click to browse
            </span>
          </p>
          <p className="text-xs text-muted-foreground/80 pt-1">
            PNG, JPG, GIF, PDF, ZIP — up to 10MB each
          </p>
        </div>
      </Card>

      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <p className="text-sm font-medium text-foreground">
              Files ({files.length})
            </p>
            <Button
              variant="destructive"
              size="sm"
              type="button"
              onClick={clearAll}
              className="text-xs"
            >
              Clear all
            </Button>
          </div>

          <ul className="space-y-2">
            {files.map((item) => (
              <StagedRow key={item.id} item={item} onRemove={removeFile} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

interface StagedRowProps {
  item: StagedFile;
  onRemove: (id: string) => void;
}

function StagedRow({ item, onRemove }: StagedRowProps) {
  const isImage = item.file.type.startsWith("image/");
  return (
    <li
      className={cn(
        "group flex items-center gap-3 p-3 rounded-xl",
        "bg-card border border-border/60",
        "hover:border-primary/40 hover:shadow-sm transition-all duration-200",
      )}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary overflow-hidden">
        {isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.objectUrl}
            alt={item.file.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <FileIcon className="h-5 w-5" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {item.file.name}
        </p>
        <p className="text-xs text-muted-foreground">
          {(item.file.size / 1024).toFixed(1)} KB · Ready
        </p>
      </div>

      <Button
        variant="ghost"
        size="icon"
        type="button"
        onClick={() => onRemove(item.id)}
        className={cn(
          "h-7 w-7 shrink-0 rounded-full text-muted-foreground",
          "hover:text-destructive hover:bg-destructive/10",
          "opacity-0 group-hover:opacity-100 transition-opacity",
          "focus-visible:opacity-100",
        )}
        aria-label="Remove file"
      >
        <X className="h-4 w-4" />
      </Button>
    </li>
  );
}