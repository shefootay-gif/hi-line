export type ProductSort = "oldest" | "newest" | "price-asc" | "price-desc";

type SortableProduct = {
  id: number;
  price: string;
  salePrice?: string | null;
  createdAt?: Date | string;
};

export function sortProducts<T extends SortableProduct>(products: readonly T[], sort: ProductSort): T[] {
  return [...products].sort((a, b) => {
    const chronological = a.createdAt && b.createdAt
      ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      : 0;
    const oldestFirst = chronological || a.id - b.id;
    if (sort === "oldest") return oldestFirst;
    if (sort === "newest") return -oldestFirst;
    const priceDifference = Number(a.salePrice ?? a.price) - Number(b.salePrice ?? b.price);
    return (sort === "price-asc" ? priceDifference : -priceDifference) || oldestFirst;
  });
}
