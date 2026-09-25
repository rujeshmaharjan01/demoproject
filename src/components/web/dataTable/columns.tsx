// src/components/web/dataTable/columns.tsx
"use client";

import { createColumnHelper } from "@tanstack/react-table";
import { Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import { type DataTableFeatures } from "./data-table-features";
import { ChalaniPreviewDialog } from "./chalani-preview-dialog";

export type Chalani = {
  id: string;
  chalaniNumber: string;
  personName: string;
  imageUrls: string[];
  createdAt: string;
};

const columnHelper = createColumnHelper<DataTableFeatures, Chalani>();

const PUBLIC_URL = process.env.NEXT_PUBLIC_S3_PUBLIC_URL ?? "";

export const columns = columnHelper.columns([
  columnHelper.accessor("chalaniNumber", {
    header: "Chalani No.",
    cell: (info) => <span className="font-medium">{info.getValue()}</span>,
  }),
  columnHelper.accessor("personName", {
    header: "Person",
    cell: (info) => <span className="block truncate">{info.getValue()}</span>,
  }),
  columnHelper.accessor("imageUrls", {
    header: "Files",
    cell: (info) => {
      const urls = info.getValue() ?? [];
      return (
        <span className="text-muted-foreground">
          {urls.length} file{urls.length === 1 ? "" : "s"}
        </span>
      );
    },
  }),
  columnHelper.accessor("createdAt", {
    header: "Created",
    cell: (info) => (
      <span>{new Date(info.getValue()).toLocaleString()}</span>
    ),
  }),
  columnHelper.display({
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <ChalaniPreviewDialog chalani={row.original} >
        <Button variant="ghost" size="icon" aria-label="Preview">
          <Eye className="h-4 w-4" />
        </Button>
      </ChalaniPreviewDialog>
    ),
  }),
]);