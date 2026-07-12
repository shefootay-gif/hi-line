export interface PaymobConfig {
  apiKey: string;
  integrationId: string;
  iframeId: string;
}

const getPaymobConfig = (): PaymobConfig => {
  return {
    apiKey: process.env.PAYMOB_API_KEY || "",
    integrationId: process.env.PAYMOB_INTEGRATION_ID || "",
    iframeId: process.env.PAYMOB_IFRAME_ID || "",
  };
};

export const initializePaymobPayment = async (
  amountCents: number,
  orderNumber: string,
  billingData: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    city: string;
    country: string;
    street: string;
  }
): Promise<string | null> => {
  try {
    const config = getPaymobConfig();
    if (!config.apiKey || !config.integrationId || !config.iframeId) {
      console.warn("Paymob configuration is missing. Skipping payment initialization.");
      return null;
    }

    // 1. Authentication Request
    const authResponse = await fetch("https://accept.paymob.com/api/auth/tokens", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ api_key: config.apiKey }),
    });
    const authData = (await authResponse.json()) as any;
    const token = authData.token;

    if (!token) throw new Error("Paymob auth failed");

    // 2. Order Registration Request
    const orderResponse = await fetch("https://accept.paymob.com/api/ecommerce/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        auth_token: token,
        delivery_needed: "false",
        amount_cents: amountCents.toString(),
        currency: "EGP",
        merchant_order_id: orderNumber,
      }),
    });
    const orderData = (await orderResponse.json()) as any;
    const paymobOrderId = orderData.id;

    if (!paymobOrderId) throw new Error("Paymob order registration failed");

    // 3. Payment Key Request
    const paymentKeyResponse = await fetch("https://accept.paymob.com/api/acceptance/payment_keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        auth_token: token,
        amount_cents: amountCents.toString(),
        expiration: 3600,
        order_id: paymobOrderId,
        billing_data: {
          first_name: billingData.firstName || "N/A",
          last_name: billingData.lastName || "N/A",
          email: billingData.email || "test@test.com",
          phone_number: billingData.phoneNumber || "N/A",
          apartment: "N/A",
          floor: "N/A",
          street: billingData.street || "N/A",
          building: "N/A",
          shipping_method: "N/A",
          postal_code: "N/A",
          city: billingData.city || "N/A",
          country: billingData.country || "EG",
          state: "N/A",
        },
        currency: "EGP",
        integration_id: parseInt(config.integrationId, 10),
      }),
    });
    const paymentKeyData = (await paymentKeyResponse.json()) as any;
    const paymentKey = paymentKeyData.token;

    if (!paymentKey) throw new Error("Paymob payment key request failed");

    // Return the iframe URL
    return `https://accept.paymob.com/api/acceptance/iframes/${config.iframeId}?payment_token=${paymentKey}`;
  } catch (error) {
    console.error("Paymob initialization error:", error);
    return null;
  }
};
