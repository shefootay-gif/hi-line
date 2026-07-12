# Backend API Requirements
The backend provides APIs for the Hi Line Pro Care store.

## Features
1. Store API
- Fetch products `/api/trpc/store.getProducts`
- Place orders `/api/trpc/store.placeOrder`
- Track orders `/api/trpc/store.getOrderByNumber`

2. Admin API
- Login `/api/trpc/auth.login`
- List orders `/api/trpc/admin.listOrders`
- Update order status `/api/trpc/admin.updateOrderStatus`

## Edge Cases to Test
- Missing payload
- Invalid data types
- SQL Injection attempts
- Invalid slugs
- Unauthenticated access to admin endpoints
- Out of stock scenarios
- Large payloads
- Duplicate requests
- Negative quantities
- Rate limiting behaviors
