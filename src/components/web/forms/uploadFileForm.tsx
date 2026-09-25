// src/components/web/forms/uploadFileForm.tsx
"use client";

import * as z from "zod";
import { useForm } from "@tanstack/react-form";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Uploader } from "./imageUpload";

const uploadSchema = z.object({
  chalaniNumber: z
    .string()
    .min(1, "Chalani number is required.")
    .max(50, "Too long."),
  personName: z
    .string()
    .min(1, "Person name is required.")
    .max(120, "Too long."),
});

export function UploadFileForm() {
  const filesRef = useRef<File[]>([]);
  // Bump to remount the Uploader and clear its internal list after success.
  const [uploaderKey, setUploaderKey] = useState(0);

  const form = useForm({
    defaultValues: { chalaniNumber: "", personName: "" },
    validators: { onSubmit: uploadSchema },
    onSubmit: async ({ value }) => {
      if (filesRef.current.length === 0) {
        toast.error("Please select at least one file.");
        return;
      }

      const fd = new FormData();
      fd.append("chalaniNumber", value.chalaniNumber);
      fd.append("personName", value.personName);
      for (const file of filesRef.current) {
        fd.append("image", file);
      }

      const res = await fetch("/api/chalani", {
        method: "POST",
        body: fd, // don't set Content-Type — browser adds the boundary
      });

      if (!res.ok) {
        const { message } = await res.json().catch(() => ({}));
        toast.error(message ?? "Failed to save chalani.");
        return;
      }

      toast.success("Saved!");
      form.reset();
      filesRef.current = [];
      setUploaderKey((k) => k + 1); // clear Uploader UI
    },
  });

  return (
    <div className="w-full min-w-125">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <FieldGroup>
          <form.Field name="chalaniNumber">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Chalani Number</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="e.g. 2081/001"
                    aria-invalid={isInvalid}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="personName">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Person Name</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Full name"
                    aria-invalid={isInvalid}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          <Uploader
            key={uploaderKey}
            onChange={(files) => {
              filesRef.current = files;
            }}
          />

          <form.Subscribe selector={(s) => [s.isSubmitting]}>
            {([isSubmitting]) => (
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Saving…" : "Save"}
              </Button>
            )}
          </form.Subscribe>
        </FieldGroup>
      </form>
    </div>
  );
}