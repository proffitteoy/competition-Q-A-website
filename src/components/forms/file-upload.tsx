"use client";

import { useMemo, useState } from "react";
import { FileUp, ImageUp } from "lucide-react";

import { cn } from "@/lib/utils";

interface FileUploadProps {
  label: string;
  hint: string;
  accept?: string;
  multiple?: boolean;
  className?: string;
}

export function FileUpload({
  label,
  hint,
  accept,
  multiple = false,
  className,
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);

  const names = useMemo(() => files.map((file) => file.name), [files]);

  return (
    <label
      className={cn(
        "block rounded-3xl border border-dashed border-border/80 bg-card/70 p-5 transition-colors hover:border-primary/50",
        className,
      )}
    >
      <div className="flex items-start gap-4">
        <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          {accept?.includes("image") ? (
            <ImageUp className="size-5" />
          ) : (
            <FileUp className="size-5" />
          )}
        </div>
        <div className="flex-1 space-y-2">
          <div>
            <p className="font-medium">{label}</p>
            <p className="text-sm leading-6 text-muted-foreground">{hint}</p>
          </div>
          <input
            type="file"
            accept={accept}
            multiple={multiple}
            className="block w-full text-sm text-muted-foreground file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground"
            onChange={(event) => {
              const nextFiles = Array.from(event.target.files ?? []);
              setFiles(nextFiles);
            }}
          />
          {names.length ? (
            <ul className="space-y-1 text-sm text-muted-foreground">
              {names.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </label>
  );
}
