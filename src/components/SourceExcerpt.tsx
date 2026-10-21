export type SourceRegion = { page: number; box: readonly number[]; src: string; width: number; height: number };
export type SourceCardMedia = { question: readonly SourceRegion[]; answer: readonly SourceRegion[] };
/** Display source coordinates without rewriting formulas or truncating answers. */
export function SourceExcerpt({ regions, label, enlarged = false }: { regions: readonly SourceRegion[]; label: string; enlarged?: boolean }) {
  return <div className={`w-full space-y-3 ${enlarged ? "min-w-[650px]" : ""}`}>
    {regions.map((r, i) => <figure key={`${r.page}-${i}`} className="m-0 overflow-hidden rounded-lg border border-border bg-white">
      <svg role="img" aria-label={`${label} · source page ${r.page} · part ${i + 1}`} viewBox={`${r.box[0]} ${r.box[1]} ${r.box[2] - r.box[0]} ${r.box[3] - r.box[1]}`} className="block h-auto w-full" xmlns="http://www.w3.org/2000/svg">
        <image href={r.src} x="0" y="0" width={r.width} height={r.height} />
      </svg>
      <figcaption className="border-t border-border bg-card px-2 py-1 text-start text-[11px] font-normal text-muted-foreground">Source page {r.page}</figcaption>
    </figure>)}
  </div>;
}
