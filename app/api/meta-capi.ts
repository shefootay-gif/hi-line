export const sendMetaCAPIEvent = async (eventName: string, eventData: any, userData: any) => {
  const PIXEL_ID = process.env.META_PIXEL_ID;
  const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;

  if (!PIXEL_ID || !ACCESS_TOKEN) {
    console.warn("Meta CAPI credentials missing, skipping tracking");
    return;
  }

  const payload = {
    data: [
      {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        action_source: "website",
        user_data: {
          ph: userData.phone ? [await hashData(userData.phone)] : [],
          em: userData.email ? [await hashData(userData.email)] : [],
          fn: userData.firstName ? [await hashData(userData.firstName)] : [],
          ln: userData.lastName ? [await hashData(userData.lastName)] : [],
          client_ip_address: userData.clientIp || "0.0.0.0",
          client_user_agent: userData.userAgent || "",
        },
        custom_data: eventData,
      },
    ],
  };

  try {
    const res = await fetch(`https://graph.facebook.com/v19.0/${PIXEL_ID}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, access_token: ACCESS_TOKEN }),
    });
    
    if (!res.ok) {
      console.error("Meta CAPI error:", await res.text());
    }
  } catch (err) {
    console.error("Meta CAPI failed:", err);
  }
};

const hashData = async (data: string) => {
  if (!data) return "";
  const crypto = await import("crypto");
  return crypto.createHash("sha256").update(data.trim().toLowerCase()).digest("hex");
};
