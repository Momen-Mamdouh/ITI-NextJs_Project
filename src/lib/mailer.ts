import nodemailer from "nodemailer";

const transport = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM = process.env.SMTP_FROM || "ShopHub <noreply@shophub.com>";

function isMailerConfigured() {
  return Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
}

export type OrderEmailData = {
  to: string;
  orderId: string;
  status: string;
  totalAmount: number;
  items: { name: string; quantity: number; price: number }[];
  shippingAddress?: {
    fullName: string;
    city: string;
    country: string;
  };
  trackingNumber?: string;
  carrier?: string;
};

export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  if (!isMailerConfigured()) {
    console.log("[mailer] SMTP not configured – skipping order confirmation email");
    return;
  }

  const itemRows = data.items
    .map(
      (i) =>
        `<tr><td style="padding:6px 12px">${i.name}</td><td style="padding:6px 12px" align="center">${i.quantity}</td><td style="padding:6px 12px" align="right">$${(i.price * i.quantity).toFixed(2)}</td></tr>`,
    )
    .join("");

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <h2 style="color:#111">Order Confirmed!</h2>
      <p>Thank you for your order. Here are your details:</p>
      <p><strong>Order ID:</strong> ${data.orderId}</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <thead>
          <tr style="background:#f5f5f5">
            <th style="padding:8px 12px;text-align:left">Item</th>
            <th style="padding:8px 12px;text-align:center">Qty</th>
            <th style="padding:8px 12px;text-align:right">Total</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>
      <p style="font-size:18px"><strong>Total: $${data.totalAmount.toFixed(2)}</strong></p>
      ${data.shippingAddress ? `<p><strong>Shipping to:</strong> ${data.shippingAddress.fullName}, ${data.shippingAddress.city}, ${data.shippingAddress.country}</p>` : ""}
      <hr style="border:none;border-top:1px solid #eee;margin:20px 0"/>
      <p style="color:#666;font-size:12px">This is an automated email from ShopHub.</p>
    </div>
  `;

  try {
    await transport.sendMail({
      from: FROM,
      to: data.to,
      subject: `Order Confirmed – #${data.orderId.slice(-8)}`,
      html,
    });
  } catch (err) {
    console.error("[mailer] Failed to send order confirmation:", err);
  }
}

export async function sendOrderStatusEmail(data: {
  to: string;
  orderId: string;
  newStatus: string;
  trackingNumber?: string;
  carrier?: string;
}) {
  if (!isMailerConfigured()) {
    console.log("[mailer] SMTP not configured – skipping status update email");
    return;
  }

  const statusMessages: Record<string, string> = {
    processing: "Your order is being prepared and will ship soon.",
    shipped: `Your order has been shipped!${data.trackingNumber ? ` Tracking: <strong>${data.trackingNumber}</strong>${data.carrier ? ` via ${data.carrier}` : ""}` : ""}`,
    delivered: "Your order has been delivered. Enjoy your purchase!",
    cancelled: "Your order has been cancelled. If you were charged, a refund will be processed.",
    refunded: "Your order has been refunded. The amount will appear in your account shortly.",
  };

  const message = statusMessages[data.newStatus] || `Your order status has been updated to: <strong>${data.newStatus}</strong>.`;

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <h2 style="color:#111">Order Update</h2>
      <p><strong>Order:</strong> #${data.orderId.slice(-8)}</p>
      <p><strong>New Status:</strong> ${data.newStatus.charAt(0).toUpperCase() + data.newStatus.slice(1)}</p>
      <p>${message}</p>
      <hr style="border:none;border-top:1px solid #eee;margin:20px 0"/>
      <p style="color:#666;font-size:12px">This is an automated email from ShopHub.</p>
    </div>
  `;

  try {
    await transport.sendMail({
      from: FROM,
      to: data.to,
      subject: `Order #${data.orderId.slice(-8)} – ${data.newStatus.charAt(0).toUpperCase() + data.newStatus.slice(1)}`,
      html,
    });
  } catch (err) {
    console.error("[mailer] Failed to send status update email:", err);
  }
}
