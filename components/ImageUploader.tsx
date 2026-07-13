"use client";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useUploadThing } from "@/lib/uploadthing";
import { X, ImagePlus, Loader2, GripVertical } from "lucide-react";
import Image from "next/image";

// Install react-dropzone
// npm install react-dropzone

export default function ImageUploader({
  value,
  onChange,
}: {
  value: string[];
  onChange: (urls: string[]) => void;
}) {
  const [uploading, setUploading] = useState(false);

  const { startUpload } = useUploadThing("productImages", {
    onClientUploadComplete: (res) => {
      const newUrls = res.map((r) => r.ufsUrl);
      onChange([...value, ...newUrls]);
      setUploading(false);
    },
    onUploadError: (error) => {
      console.error(error);
      setUploading(false);
    },
  });

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setUploading(true);
      await startUpload(acceptedFiles);
    },
    [startUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 6 - value.length,
    disabled: uploading || value.length >= 6,
  });

  function removeImage(url: string) {
    onChange(value.filter((u) => u !== url));
  }

  function moveImage(from: number, to: number) {
    const next = [...value];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  }

  return (
    <div className="space-y-3">
      {/* Dropzone */}
      {value.length < 6 && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? "border-ember bg-ember/5"
              : uploading
              ? "border-border bg-gray-50 cursor-not-allowed"
              : "border-border hover:border-ember/50 hover:bg-steam/30"
          }`}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 size={24} className="text-ember animate-spin" />
              <p className="text-sm text-ash">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <ImagePlus size={24} className="text-ash" />
              <p className="text-sm text-char font-medium">
                {isDragActive ? "Drop images here" : "Drag & drop images here"}
              </p>
              <p className="text-xs text-ash">
                or click to browse · max 4MB each · up to {6 - value.length}{" "}
                more
              </p>
            </div>
          )}
        </div>
      )}

      {/* Preview grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {value.map((url, i) => (
            <div key={url} className="relative group aspect-square">
              <Image
                src={url}
                alt={`Product image ${i + 1}`}
                fill
                className="object-cover rounded-lg border border-border"
              />
              {/* Order badge */}
              {i === 0 && (
                <span className="absolute top-1 left-1 bg-ember text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                  Main
                </span>
              )}
              {/* Controls */}
              <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {i > 0 && (
                  <button
                    type="button"
                    onClick={() => moveImage(i, i - 1)}
                    className="bg-white text-char rounded p-1 text-xs hover:bg-steam"
                    title="Move left"
                  >
                    ←
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(url)}
                  className="bg-white text-red-500 rounded p-1 hover:bg-red-50"
                  title="Remove"
                >
                  <X size={14} />
                </button>
                {i < value.length - 1 && (
                  <button
                    type="button"
                    onClick={() => moveImage(i, i + 1)}
                    className="bg-white text-char rounded p-1 text-xs hover:bg-steam"
                    title="Move right"
                  >
                    →
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      <p className="text-xs text-ash">
        First image is used as the main product photo. Drag to reorder.
      </p>
    </div>
  );
}