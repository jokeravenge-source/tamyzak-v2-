import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ImageOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getChatPhotoUrls } from "@/lib/communityChat";
import { cn } from "@/lib/utils";

export function ChatPhotoPreview({ file, removeLabel, disabled, onRemove }: {
  file: File; removeLabel: string; disabled: boolean; onRemove: () => void;
}) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    if (typeof URL.createObjectURL !== "function") return;
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);
  return (
    <div className="relative aspect-square overflow-hidden rounded-xl border border-border bg-muted">
      {url && <img src={url} alt="" className="size-full object-cover" />}
      <Button size="icon" type="button" disabled={disabled} aria-label={removeLabel} onClick={onRemove}
        className="absolute end-0 top-0 size-8 rounded-bl-xl rounded-tr-xl bg-black/75 text-white hover:bg-black">
        <X aria-hidden="true" />
      </Button>
    </div>
  );
}

export default function CommunityPostPhotos({ paths, userId, label, unavailable }: {
  paths: string[]; userId: string; label: (position: number) => string; unavailable: string;
}) {
  const photos = useQuery({
    queryKey: ["community-chat-photos", userId, paths],
    queryFn: () => getChatPhotoUrls(paths),
    staleTime: 45 * 60_000,
    refetchInterval: 55 * 60_000,
    retry: false,
  });
  const single = paths.length === 1;
  return (
    <div className={cn("mt-3 grid gap-2", !single && "grid-cols-2")}>
      {paths.map((path, index) => {
        const url = photos.data?.[path];
        const tile = cn("grid place-items-center overflow-hidden rounded-xl border border-border bg-muted/60", single ? "min-h-28" : "aspect-square");
        return url ? (
          <a key={path} href={url} target="_blank" rel="noopener noreferrer" className={tile}>
            <img src={url} alt={label(index + 1)} loading="lazy" decoding="async"
              className={cn("w-full object-contain", single ? "max-h-[32rem]" : "h-full")} />
          </a>
        ) : (
          <div key={path} className={tile} aria-busy={photos.isPending}>
            {!photos.isPending && <span className="flex items-center gap-2 p-3 text-sm text-muted-foreground">
              <ImageOff className="size-4 shrink-0" aria-hidden="true" />{unavailable}
            </span>}
          </div>
        );
      })}
    </div>
  );
}
