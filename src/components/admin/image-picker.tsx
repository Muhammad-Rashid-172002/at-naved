"use client";

import { Upload } from "lucide-react";
import { useRef, useState } from "react";
import { useToast } from "@/components/providers/toast-provider";
import { FoodImage } from "@/components/ui/food-image";
import { imagePresets } from "@/config/images";
import { cn } from "@/lib/cn";
import { getRepo } from "@/lib/data";

export function ImagePicker({ value, onChange }: { value: string; onChange: (src: string) => void }) {
  const file = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const { show } = useToast();

  const upload = async (f: File) => {
    if (!f.type.startsWith("image/")) return show("Choose an image file (JPG, PNG or WebP).", "error");
    setUploading(true);
    try {
      onChange(await getRepo().uploadImage(f));
      show("Image uploaded");
    } catch (e) {
      show(e instanceof Error ? e.message : "Upload failed.", "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-2xl bg-mustard-soft ring-1 ring-line sm:w-48">
        <FoodImage src={value} alt="Selected image" sizes="200px" />
      </div>
      <div className="flex-1 space-y-3">
        <button
          type="button"
          onClick={() => file.current?.click()}
          disabled={uploading}
          className="inline-flex h-10 items-center gap-2 rounded-full border-2 border-dashed border-tamarind/30 px-4 text-sm font-bold hover:border-tamarind disabled:opacity-50"
        >
          <Upload className="h-4 w-4" /> {uploading ? "Uploading…" : "Upload photo"}
        </button>
        <input
          ref={file}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void upload(f);
            e.target.value = "";
          }}
        />
        <div>
          <p className="mb-2 text-xs font-semibold text-tamarind-muted">Or use a built-in illustration</p>
          <div className="flex flex-wrap gap-2">
            {imagePresets.map((p) => (
              <button
                key={p.src}
                type="button"
                onClick={() => onChange(p.src)}
                title={p.label}
                aria-label={`Use ${p.label} illustration`}
                className={cn("relative h-11 w-11 overflow-hidden rounded-xl ring-2", value === p.src ? "ring-tamarind" : "ring-transparent hover:ring-line")}
              >
                <FoodImage src={p.src} alt="" sizes="44px" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
