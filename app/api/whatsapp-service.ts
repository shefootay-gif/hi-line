export interface WhatsAppConfig {
  apiUrl: string;
  token: string;
  phoneNumberId: string; // for Meta API
}

const getWhatsAppConfig = (): WhatsAppConfig => {
  return {
    apiUrl: process.env.WHATSAPP_API_URL || "https://graph.facebook.com/v17.0",
    token: process.env.WHATSAPP_TOKEN || "",
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || "",
  };
};

export const sendWhatsAppMessage = async (
  toPhone: string,
  message: string
): Promise<boolean> => {
  try {
    const config = getWhatsAppConfig();
    if (!config.token || !config.phoneNumberId) {
      console.warn("WhatsApp configuration missing. Message not sent.");
      console.log(`[Mock WhatsApp to ${toPhone}]: ${message}`);
      return false; // Silently fail in dev/mock mode
    }

    // Example using Meta Cloud API
    const response = await fetch(`${config.apiUrl}/${config.phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${config.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: toPhone.replace(/\D/g, ""), // clean phone number
        type: "text",
        text: { body: message },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("WhatsApp API Error:", err);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Failed to send WhatsApp message:", error);
    return false;
  }
};
