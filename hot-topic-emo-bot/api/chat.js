const Anthropic = require('@anthropic-ai/sdk');
const systemPrompt = require('./system-prompt');

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// --- Soft cost guardrails ---
// Vercel's free-tier functions are stateless between cold starts, so this
// counter is a best-effort deterrent, not a hard limit. The REAL safety net
// is the monthly spend cap you set in the Anthropic console (see README).
let requestsToday = 0;
let dayStamp = new Date().toDateString();
const MAX_REQUESTS_PER_DAY = 300; // ~pennies to a few dollars at these token limits

module.exports = async (req, res) => {
  // Only allow POST
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Reset the daily counter if the day has rolled over
  const today = new Date().toDateString();
  if (today !== dayStamp) {
    dayStamp = today;
    requestsToday = 0;
  }

  if (requestsToday >= MAX_REQUESTS_PER_DAY) {
    res.status(429).json({
      reply: "The store's closed for the day. Come back tomorrow, I guess, if you still care that much."
    });
    return;
  }

  const { message, history } = req.body || {};

  if (!message || typeof message !== 'string' || message.length > 500) {
    res.status(400).json({ error: 'Invalid message' });
    return;
  }

  // history = short array of {role: 'user'|'assistant', content: string}
  // sent by the client so the bot has conversational context. Capped below
  // to keep token usage (and cost) predictable.
  const safeHistory = Array.isArray(history) ? history.slice(-10) : [];

  try {
    requestsToday += 1;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 150, // keeps replies short and keeps cost predictable
      system: systemPrompt,
      messages: [...safeHistory, { role: 'user', content: message }]
    });

    const reply = response.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('\n');

    res.status(200).json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      reply: "Something's broken, kind of like everything else today. Try again in a sec."
    });
  }
};
