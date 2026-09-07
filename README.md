# Hot Topic Emo Bot — Deploy Guide

Everything here is designed to take under an hour to get live, at close to zero cost for portfolio-scale traffic.

## What's in this folder
- `public/index.html` — the whole chat widget (HTML/CSS/JS, no build step)
- `api/chat.js` — a serverless function that calls the Claude API
- `api/system-prompt.js` — the persona instructions (edit this anytime to tweak the voice)
- `package.json` — the one dependency (Anthropic's SDK)

## Step 1: Get an Anthropic API key
1. Go to https://console.anthropic.com and sign up / log in.
2. Go to **Settings → API Keys** and create a key. Copy it somewhere safe.
3. **Set a spend cap immediately**: go to **Settings → Limits** (or **Plans & Billing**, the exact label has moved around) and set a monthly spend limit — even $5 is plenty of headroom for a portfolio demo. This is your real safety net, more reliable than anything in the code.

## Step 2: Deploy to Vercel (free tier)
1. Go to https://vercel.com and sign up (GitHub login is easiest).
2. Push this folder to a new GitHub repo (or use Vercel's CLI / drag-and-drop import — either works).
3. In Vercel, **Add New Project**, import that repo.
4. Vercel will auto-detect it as a serverless project. Before deploying, add an environment variable:
   - Name: `ANTHROPIC_API_KEY`
   - Value: the key you copied in Step 1
5. Click **Deploy**. In under a minute you'll get a live URL like `https://hot-topic-emo-bot.vercel.app`.

That URL is your **shareable link** — anyone can open it and start chatting, no embedding required.

## Step 3 (optional): Embed on your portfolio site
Since the whole widget lives at one URL, embedding is a single line — no rebuilding, no CORS setup:

```html
<iframe
  src="https://hot-topic-emo-bot.vercel.app"
  width="420"
  height="640"
  style="border: none; border-radius: 8px;">
</iframe>
```

Drop that wherever you want the widget to appear on your site.

## Cost expectations
With `max_tokens: 150` per reply and short conversation history, each exchange costs a small fraction of a cent. Even a few hundred messages from curious classmates should land well under a dollar. The daily server-side counter in `chat.js` (300 requests/day) is a soft extra guard, but the **spend cap in Step 1 is what actually protects you** if traffic spikes unexpectedly — serverless functions restart often enough that the in-code counter alone isn't fully reliable.

## Editing the personality
Everything about the bot's voice lives in `api/system-prompt.js`. Change the text, redeploy (Vercel auto-redeploys on every git push), done.
