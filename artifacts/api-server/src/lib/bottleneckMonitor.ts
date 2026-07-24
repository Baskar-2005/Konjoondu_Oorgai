import nodemailer from "nodemailer";
import { ordersCol } from "./firestoreDb";

// ---------- Config (runtime-mutable) ----------

interface MonitorConfig {
  threshold: number;
  checkIntervalMs: number;
}

const config: MonitorConfig = {
  threshold: parseInt(process.env.BOTTLENECK_THRESHOLD ?? "5", 10),
  checkIntervalMs: parseInt(process.env.BOTTLENECK_CHECK_INTERVAL_MS ?? "60000", 10),
};

export function getMonitorConfig() {
  return { threshold: config.threshold, checkIntervalMs: config.checkIntervalMs };
}

export function setMonitorThreshold(n: number) {
  config.threshold = Math.max(1, n);
  console.info(`[bottleneck-monitor] Threshold updated to ${config.threshold}`);
}

// ---------- Station definitions ----------

const STATIONS = [
  { key: "packing",  label: "Packing Station",  waitingStatuses: ["confirmed", "preparing"] },
  { key: "shipping", label: "Shipping Station", waitingStatuses: ["packed", "ready_for_pickup", "picked_up"] },
  { key: "delivery", label: "Delivery Station", waitingStatuses: ["shipped", "in_transit", "out_for_delivery"] },
];

// Track which stations have already fired an alert (prevents spam)
const alertedStations = new Set<string>();

// Recent alert log (last 20, newest first)
export interface AlertEntry {
  type: "alert" | "cleared";
  station: string;
  label: string;
  count: number;
  threshold: number;
  timestamp: string;
}
const alertLog: AlertEntry[] = [];
function recordAlert(entry: AlertEntry) {
  alertLog.unshift(entry);
  if (alertLog.length > 20) alertLog.pop();
}
export function getAlertLog(): AlertEntry[] { return [...alertLog]; }

// ---------- Notification helpers ----------

async function sendTelegram(text: string): Promise<void> {
  const token  = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;
  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
    });
    const data = (await r.json()) as { ok: boolean; description?: string };
    if (!data.ok) console.warn("[bottleneck-monitor] Telegram error:", data.description);
    else console.info("[bottleneck-monitor] Telegram alert sent");
  } catch (err) {
    console.warn("[bottleneck-monitor] Telegram send failed:", err);
  }
}

async function sendEmail(subject: string, html: string): Promise<void> {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_APP_PASSWORD;
  if (!user || !pass) return;
  try {
    const transporter = nodemailer.createTransport({ service: "gmail", auth: { user, pass } });
    await transporter.sendMail({ from: `"Konjoondu Oorgai" <${user}>`, to: user, subject, html });
    console.info("[bottleneck-monitor] Email alert sent");
  } catch (err) {
    console.warn("[bottleneck-monitor] Email send failed:", err);
  }
}

function bottleneckAlertTelegram(label: string, count: number): string {
  return [
    `⚠️ <b>Bottleneck Alert — ${label}</b>`,
    ``,
    `📦 <b>${count} orders</b> are queued and waiting to be processed.`,
    `🎯 Threshold: ${config.threshold} orders`,
    `🔧 Assign more staff to the ${label}.`,
    ``,
    `<i>Konjoondu Oorgai · Station Monitor · ${new Date().toLocaleString("en-IN")}</i>`,
  ].join("\n");
}

function bottleneckAlertEmail(label: string, count: number): string {
  const ts = new Date().toLocaleString("en-IN");
  return `
<!DOCTYPE html><html><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:24px;background:#fef3c7;font-family:Poppins,Arial,sans-serif;">
  <div style="max-width:500px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:2px solid #fbbf24;box-shadow:0 8px 32px rgba(217,119,6,0.15);">
    <div style="background:linear-gradient(135deg,#d97706,#b45309);padding:24px 28px;">
      <h2 style="color:#fff;margin:0;font-size:20px;">⚠️ Bottleneck Alert</h2>
      <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:13px;">${label} · Konjoondu Oorgai</p>
    </div>
    <div style="padding:28px;">
      <p style="font-size:48px;font-weight:900;color:#d97706;margin:0;line-height:1;">${count}</p>
      <p style="font-size:13px;color:#92400e;margin:4px 0 20px;">orders queued · threshold is ${config.threshold}</p>
      <p style="font-size:15px;color:#3d2b1f;line-height:1.6;">Assign more staff to the <strong>${label}</strong> to clear the backlog before it grows further.</p>
      <div style="margin-top:24px;padding:14px 18px;background:#fef3c7;border-radius:12px;border:1px solid #fbbf24;">
        <p style="margin:0;font-size:12px;color:#92400e;">📊 Check the <strong>Station Manager Dashboard</strong> for a real-time view of all stations.</p>
      </div>
      <p style="font-size:11px;color:#9ca3af;margin-top:20px;">${ts} · Konjoondu Oorgai Station Monitor</p>
    </div>
  </div>
</body></html>`;
}

function clearedTelegram(label: string, count: number): string {
  return [
    `✅ <b>Bottleneck Cleared — ${label}</b>`,
    ``,
    `Queue is now at ${count} orders (below threshold of ${config.threshold}).`,
    ``,
    `<i>Konjoondu Oorgai · Station Monitor · ${new Date().toLocaleString("en-IN")}</i>`,
  ].join("\n");
}

// ---------- Core check ----------

async function checkBottlenecks(): Promise<void> {
  try {
    const allOrders = await ordersCol.findAll();

    for (const station of STATIONS) {
      const count = allOrders.filter((o) => station.waitingStatuses.includes(o.status)).length;
      const isOver  = count >= config.threshold;
      const wasOver = alertedStations.has(station.key);

      if (isOver && !wasOver) {
        alertedStations.add(station.key);
        const entry: AlertEntry = { type: "alert", station: station.key, label: station.label, count, threshold: config.threshold, timestamp: new Date().toISOString() };
        recordAlert(entry);
        console.warn(`[bottleneck-monitor] ALERT: ${station.label} — ${count} queued (threshold ${config.threshold})`);
        await Promise.all([
          sendTelegram(bottleneckAlertTelegram(station.label, count)),
          sendEmail(`⚠️ Bottleneck: ${station.label} — ${count} orders queued`, bottleneckAlertEmail(station.label, count)),
        ]);
      } else if (!isOver && wasOver) {
        alertedStations.delete(station.key);
        const entry: AlertEntry = { type: "cleared", station: station.key, label: station.label, count, threshold: config.threshold, timestamp: new Date().toISOString() };
        recordAlert(entry);
        console.info(`[bottleneck-monitor] CLEARED: ${station.label} — ${count} queued (threshold ${config.threshold})`);
        await sendTelegram(clearedTelegram(station.label, count));
      }
    }
  } catch (err) {
    console.error("[bottleneck-monitor] Check error:", err);
  }
}

// ---------- Lifecycle ----------

let monitorInterval: ReturnType<typeof setInterval> | null = null;

export function startBottleneckMonitor(): void {
  if (monitorInterval) return;
  console.info(`[bottleneck-monitor] Starting — threshold: ${config.threshold}, interval: ${config.checkIntervalMs / 1000}s`);
  checkBottlenecks();
  monitorInterval = setInterval(checkBottlenecks, config.checkIntervalMs);
}

export function stopBottleneckMonitor(): void {
  if (monitorInterval) {
    clearInterval(monitorInterval);
    monitorInterval = null;
    console.info("[bottleneck-monitor] Stopped");
  }
}
