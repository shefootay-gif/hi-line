import { packshotBounds } from "@/lib/product-presentation";

export function ProductPackshot({ src, alt, loading = "lazy" }: { src: string; alt: string; loading?: "lazy" | "eager" }) {
  const bounds = packshotBounds[src];
  if (!bounds) return <div className="relative aspect-square w-full p-5"><img src={src} alt={alt} loading={loading} className="absolute inset-[14%] h-[72%] w-[72%] object-contain" /></div>;
  const [width, height, x, y, cropWidth, cropHeight] = bounds;
  return <div className="relative aspect-square w-full" data-packshot="normalized">
    <div className="absolute left-1/2 top-[14%] h-[72%] -translate-x-1/2 overflow-hidden" style={{ width: `${72 * cropWidth / cropHeight}%` }}>
      <img src={src} alt={alt} loading={loading} width={width} height={height} className="absolute max-w-none" style={{ width: `${width / cropWidth * 100}%`, height: `${height / cropHeight * 100}%`, left: `${-x / cropWidth * 100}%`, top: `${-y / cropHeight * 100}%` }} />
    </div>
  </div>;
}
