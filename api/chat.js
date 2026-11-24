// Vercel serverless function: the site's AI chat assistant.
// Needs the ANTHROPIC_API_KEY environment variable set in Vercel (Project > Settings > Environment Variables).
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const SYSTEM = `You are the website assistant for Everspace Exhibits LLC, a Florida owned and operated trade show booth company that designs, builds and installs booths anywhere.

What Everspace does:
- Custom booth design (3D renderings before anything is built)
- Booth fabrication
- Exhibit rentals with custom-printed graphics
- Graphics and signage (fabric and rigid prints, hanging signs)
- Installation and dismantling by a fully insured crew
- Shipping, freight and storage between shows
- Audio and video (screens, lighting, sound)
- Show paperwork, deadlines and union/venue rules
Booth sizes: 10x10 and 10x20 inline, 20x20 island, and larger fully custom booths of any size.
Contact: hello@everspaceexhibits.com, or the free quote form on this page (section "#quote").

How to answer:
- Be friendly, plain and brief: two to four short sentences unless the visitor asks for detail. No markdown headings.
- Never quote prices, discounts, lead times or availability, and never promise dates. Say a team member will confirm those in a free quote.
- Never invent clients, past projects, reviews, certifications, years in business or locations.
- If you don't know something about Everspace, say so and offer to connect them with the team.
- When the visitor seems ready, suggest the free quote form, or offer "Talk to a person" so the team can follow up.
- Only discuss Everspace and trade show topics. Politely steer anything else back.`;

const MAX_TURNS = 12;
const MAX_CHARS = 1500;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST." });
  if (!process.env.ANTHROPIC_API_KEY) return res.status(503).json({ error: "Assistant not configured." });

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  const history = Array.isArray(body.messages) ? body.messages : [];
  const messages = history
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim())
    .slice(-MAX_TURNS)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));
  while (messages.length && messages[0].role !== "user") messages.shift();
  if (!messages.length || messages[messages.length - 1].role !== "user") {
    return res.status(400).json({ error: "Send a message first." });
  }

  try {
    const response = await client.beta.messages.create({
      model: "claude-opus-5-5",
      max_tokens: 2000,
      output_config: { effort: "low" },
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: SYSTEM,
      messages,
    });
    if (response.stop_reason === "refusal") {
      return res.status(200).json({ reply: "I can't help with that one, but our team can. Tap \"Talk to a person\" or email hello@everspaceexhibits.com." });
    }
    const reply = response.content.filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();
    return res.status(200).json({ reply: reply || "Sorry, I didn't catch that. Could you rephrase?" });
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) {
      return res.status(429).json({ error: "The assistant is busy. Please try again in a moment." });
    }
    if (err instanceof Anthropic.APIError) {
      console.error("Anthropic API error", err.status, err.message);
      return res.status(502).json({ error: "The assistant is unavailable right now." });
    }
    console.error(err);
    return res.status(500).json({ error: "Something went wrong." });
  }
}
