import { Router, type IRouter } from "express";
import nodemailer from "nodemailer";

const router: IRouter = Router();

function getTransporter() {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) return null;
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });
}

// POST /api/email/order-confirmation
router.post("/email/order-confirmation", async (req, res) => {
  const transporter = getTransporter();
  if (!transporter) {
    res.status(503).json({ success: false, message: "Email service not configured." });
    return;
  }

  const { orderId, customerName, customerEmail, items, totalAmount, shippingAddress } = req.body as {
    orderId: string;
    customerName: string;
    customerEmail: string;
    items: Array<{ productName: string; size: string; price: number; quantity: number }>;
    totalAmount: number;
    shippingAddress: string;
  };

  if (!customerEmail || !orderId) {
    res.status(400).json({ success: false, message: "customerEmail and orderId are required." });
    return;
  }

  const itemRows = items
    .map(
      (i) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #f0e8df;">${i.productName} (${i.size})</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f0e8df;text-align:center;">${i.quantity}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f0e8df;text-align:right;">₹${(i.price * i.quantity).toLocaleString("en-IN")}</td>
      </tr>`
    )
    .join("");

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"/></head>
    <body style="margin:0;padding:0;background:#fdf8f3;font-family:Poppins,Arial,sans-serif;">
      <div style="max-width:600px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(139,94,60,0.1);">
        <div style="background:linear-gradient(135deg,#b53a2e,#8b2a20);padding:32px 36px;text-align:center;">
          <h1 style="color:#fff9f0;margin:0;font-size:26px;font-weight:800;letter-spacing:-0.5px;">Konjoondu Oorgai</h1>
          <p style="color:rgba(255,249,240,0.75);margin:6px 0 0;font-size:14px;">Order Confirmation</p>
        </div>
        <div style="padding:32px 36px;">
          <p style="color:#3d2b1f;font-size:16px;margin-top:0;">Dear <strong>${customerName}</strong>,</p>
          <p style="color:#6b4c38;font-size:14px;line-height:1.6;">
            Thank you for your order! We've received your order and will contact you within 24 hours to arrange delivery.
          </p>
          <div style="background:#fdf8f3;border-radius:12px;padding:16px 20px;margin:20px 0;border:1px solid #f0e8df;">
            <p style="margin:0;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#8b5e3c;">Order ID</p>
            <p style="margin:6px 0 0;font-size:20px;font-weight:800;color:#b53a2e;">${orderId}</p>
          </div>
          <table style="width:100%;border-collapse:collapse;margin:20px 0;">
            <thead>
              <tr style="background:#fdf8f3;">
                <th style="padding:10px 12px;text-align:left;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#8b5e3c;">Item</th>
                <th style="padding:10px 12px;text-align:center;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#8b5e3c;">Qty</th>
                <th style="padding:10px 12px;text-align:right;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#8b5e3c;">Price</th>
              </tr>
            </thead>
            <tbody>${itemRows}</tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding:12px;font-weight:800;font-size:15px;color:#3d2b1f;">Total</td>
                <td style="padding:12px;font-weight:800;font-size:18px;color:#b53a2e;text-align:right;">₹${totalAmount.toLocaleString("en-IN")}</td>
              </tr>
            </tfoot>
          </table>
          <div style="background:#fdf8f3;border-radius:12px;padding:16px 20px;margin:20px 0;border:1px solid #f0e8df;">
            <p style="margin:0;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#8b5e3c;">Delivery Address</p>
            <p style="margin:6px 0 0;font-size:14px;color:#3d2b1f;line-height:1.5;">${shippingAddress}</p>
          </div>
          <p style="color:#6b4c38;font-size:13px;line-height:1.6;">
            We'll send you an update once your order is shipped. If you have any questions, just reply to this email.
          </p>
        </div>
        <div style="background:#fdf8f3;padding:20px 36px;text-align:center;border-top:1px solid #f0e8df;">
          <p style="margin:0;font-size:12px;color:#8b5e3c;">© ${new Date().getFullYear()} Konjoondu Oorgai · Handcrafted Pickles</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"Konjoondu Oorgai" <${process.env.EMAIL_USER}>`,
      to: customerEmail,
      subject: `Order Confirmed — ${orderId} | Konjoondu Oorgai`,
      html,
    });
    res.json({ success: true, message: "Confirmation email sent." });
  } catch (err) {
    console.error("[email] Failed to send:", err);
    res.status(500).json({ success: false, message: "Failed to send email." });
  }
});

export default router;
