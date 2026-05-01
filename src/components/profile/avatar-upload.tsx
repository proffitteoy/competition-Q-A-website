"use client";

import { useRef, useState } from "react";
import { Camera } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";

interface AvatarUploadProps {
  currentImage: string | null;
  name: string;
  editable?: boolean;
  onUploaded?: (url: string) => void;
}

export function AvatarUpload({
  currentImage,
  name,
  editable = false,
  onUploaded,
}: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const displayUrl = previewUrl ?? currentImage;
  const initial = name.charAt(0);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.set("file", file);

      const res = await fetch("/api/me/avatar", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "上传失败" }));
        throw new Error(err.message);
      }

      const { url } = await res.json();
      setPreviewUrl(url);
      onUploaded?.(url);
      toast.success("头像已更新");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "上传失败");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="relative inline-block">
      <div
        className={cn(
          "flex size-20 items-center justify-center overflow-hidden rounded-full",
          displayUrl
            ? "bg-slate-100"
            : "bg-gradient-to-br from-blue-100 to-indigo-200",
          editable && "cursor-pointer",
        )}
        onClick={() => editable && inputRef.current?.click()}
      >
        {displayUrl ? (
          <img
            src={displayUrl}
            alt={name}
            className="size-full object-cover"
          />
        ) : (
          <span className="text-2xl font-bold text-indigo-700">{initial}</span>
        )}
      </div>
      {editable && (
        <>
          <button
            type="button"
            className="absolute bottom-0 right-0 flex size-7 items-center justify-center rounded-full border-2 border-white bg-slate-900 text-white shadow-sm transition-colors hover:bg-slate-700"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            <Camera className="size-3.5" />
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg"
            className="hidden"
            onChange={handleFileChange}
          />
        </>
      )}
      {uploading && (
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
          <div className="size-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
        </div>
      )}
    </div>
  );
}
