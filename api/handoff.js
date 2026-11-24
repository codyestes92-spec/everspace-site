// Vercel serverless function: hand a chat over to a real person.
// Set HANDOFF_WEBHOOK_URL in Vercel to any webhook that accepts JSON
// (a Slack incoming webhook, Zapier, Make, or an email service). Until it's set,
// the chat window falls back to showing the email address and quote form.
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST." });
  const url = process.env.HANDOFF_WEBHOOK_URL;
  if (!url) return res.status(501).json({ error: "Hand-off not configured." });

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  const clean = (v, n) => (typeof v === "string" ? v.trim().slice(0, n) : "");
  const name = clean(body.name, 120), email = clean(body.email, 200), phone = clean(body.phone, 40);
  if (!name || !/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: "Name and a valid email are required." });
  const transcript = (Array.isArray(body.messages) ? body.messages : [])
    .slice(-20)
    .map((m) => `${m.role === "user" ? "Visitor" : "Assistant"}: ${clean(m.content, 1500)}`)
    .join("\n");

  const text = `New chat hand-off from the website\nName: ${name}\nEmail: ${email}${phone ? `\nPhone: ${phone}` : ""}\n\n${transcript}`;
  try {
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, name, email, phone, transcript }),
    });
    if (!r.ok) throw new Error(`Webhook returned ${r.status}`);
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(502).json({ error: "Couldn't reach the team." });
  }
}
