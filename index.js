// Sharker World Cup bot — Railway version (long polling, no webhook needed)
// Requires env var BOT_TOKEN (set it in Railway -> Variables)

// The token comes from Railway -> Variables (name: BOT_TOKEN).
// DO NOT paste the token anywhere in this file.
const BOT_TOKEN = (process.env.BOT_TOKEN || "").trim();
const APP_URL = "https://sharker-final.netlify.app/";
const API = `https://api.telegram.org/bot${BOT_TOKEN}`;

if (!BOT_TOKEN) {
  console.error("Missing BOT_TOKEN env var. Add it in Railway -> Variables.");
  process.exit(1);
}

async function tg(method, payload) {
  const res = await fetch(`${API}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload || {}),
  });
  return res.json();
}

async function handleUpdate(update) {
  const msg = update.message;
  if (!msg || !msg.text || !msg.text.startsWith("/start")) return;

  await tg("sendMessage", {
    chat_id: msg.chat.id,
    text:
      "\u26BD España vs Argentina \u2014 la Final de la Copa del Mundo es esta noche.\n\n" +
      "Elige a tu ganador y apuéstalo en Sharker.\n" +
      "18+ | Juega con responsabilidad. Términos: sharker.com",
    reply_markup: {
      inline_keyboard: [
        [
          { text: "\uD83C\uDDE6\uD83C\uDDF7 Elige a Argentina", web_app: { url: APP_URL + "?pick=argentina" } },
          { text: "\uD83C\uDDEA\uD83C\uDDF8 Elige a España", web_app: { url: APP_URL + "?pick=spain" } },
        ],
      ],
    },
  });
}

async function main() {
  // Polling and webhooks conflict — remove any webhook left from earlier attempts
  await tg("deleteWebhook");
  console.log("Bot started, polling for updates...");

  let offset = 0;
  while (true) {
    try {
      const data = await tg("getUpdates", { offset, timeout: 30 });
      if (data.ok && Array.isArray(data.result)) {
        for (const update of data.result) {
          offset = update.update_id + 1;
          handleUpdate(update).catch((e) => console.error("update error:", e));
        }
      } else if (!data.ok) {
        console.error("getUpdates error:", data.description);
        await new Promise((r) => setTimeout(r, 5000));
      }
    } catch (e) {
      console.error("poll error:", e.message);
      await new Promise((r) => setTimeout(r, 5000));
    }
  }
}

main();
