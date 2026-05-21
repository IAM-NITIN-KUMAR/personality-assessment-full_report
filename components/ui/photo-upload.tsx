"use client";

import { useRef, useState } from "react";
import { Camera, X, Loader2 } from "lucide-react";
import { compressToAvatar } from "@/lib/image";
import { cn } from "@/lib/utils";

interface PhotoUploadProps {
  value?: string;
  onChange: (dataUrl: string | undefined) => void;
  className?: string;
}

/**
 * Optional avatar uploader for the sign-up form. Renders as a circular
 * drop-zone; on click opens a file picker; on file pick compresses to ~256px
 * and hands the data URL up.
 */
export function PhotoUpload({ value, onChange, className }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickFile = () => inputRef.current?.click();

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const dataUrl = await compressToAvatar(file);
      onChange(dataUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't process that image.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(undefined);
  };

  return (
    <div className={cn("flex items-center gap-4", className)}>
      <button
        type="button"
        onClick={pickFile}
        disabled={busy}
        className={cn(
          "relative size-20 rounded-full overflow-hidden flex items-center justify-center transition-all shrink-0",
          "border-[1.5px] border-dashed border-line hover:border-electric/60 bg-surface-subtle",
          value && "border-solid border-line",
          busy && "opacity-60 cursor-progress",
        )}
        aria-label={value ? "Replace photo" : "Add a photo"}
      >
        {value ? (
          <>
            <img src={value} alt="Profile" className="size-full object-cover" draggable={false} />
            <span
              role="button"
              tabIndex={0}
              onClick={clear}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") clear(e as unknown as React.MouseEvent);
              }}
              className="absolute top-0 right-0 size-6 rounded-full bg-ink text-white flex items-center justify-center cursor-pointer"
              aria-label="Remove photo"
            >
              <X className="h-3 w-3" />
            </span>
          </>
        ) : busy ? (
          <Loader2 className="h-5 w-5 text-ink-300 animate-spin" />
        ) : (
          <Camera className="h-5 w-5 text-ink-300" />
        )}
      </button>

      <div className="min-w-0">
        <div className="mono-eyebrow text-ink-700 mb-1">PHOTO · OPTIONAL</div>
        <div className="text-[12px] text-ink-500 leading-relaxed max-w-[180px]">
          {value
            ? "Looks good. We'll add it to your report."
            : "Add a face to your report. Stays on this device only."}
        </div>
        {error && (
          <div className="text-[11px] text-warning mt-1">{error}</div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0])}
      />
    </div>
  );
}
