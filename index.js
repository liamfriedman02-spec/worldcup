// Sharker World Cup bot — Railway version (long polling, no webhook needed)
// Requires env var BOT_TOKEN (set it in Railway -> Variables)

const BOT_TOKEN = process.env.BOT_TOKEN;
const APP_URL = "https://sharker-final.netlify.app/";
const API = `8855935542:AAFsPy1VrxAj3IKBoOhezLcpHCp5b6M05dc`;

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
      "\u26BD Spain vs Argentina \u2014 the World Cup Final is tonight.\n\n" +
      "Pick your winner and back it on Sharker.\n" +
      "18+ | Please bet responsibly. Terms: sharker.com",
    reply_markup: {
      inline_keyboard: [
        [
          { text: "\uD83C\uDDE6\uD83C\uDDF7 Pick Argentina", web_app: { url: APP_URL + "?pick=argentina" } },
          { text: "\uD83C\uDDEA\uD83C\uDDF8 Pick Spain", web_app: { url: APP_URL + "?pick=spain" } },
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
