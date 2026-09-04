export function groupOrderItems<T extends { orderId: number }>(items: T[]) {
  const grouped = new Map<number, T[]>();
  for (const item of items) {
    const orderItems = grouped.get(item.orderId) ?? [];
    orderItems.push(item);
    grouped.set(item.orderId, orderItems);
  }
  return grouped;
}
