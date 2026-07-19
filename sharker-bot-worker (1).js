// Telegram bot webhook — replies to /start with a Play Now button
// Paste this into a Cloudflare Worker, replace BOT_TOKEN, deploy.

const BOT_TOKEN = "8855935542:AAFsPy1VrxAj3IKBoOhezLcpHCp5b6M05dc";
const APP_URL = "https://sharker-final.netlify.app/";

export default {
  async fetch(request) {
    if (request.method !== "POST") return new Response("ok");

    let update;
    try { update = await request.json(); } catch { return new Response("ok"); }

    const msg = update.message;
    if (msg && msg.text && msg.text.startsWith("/start")) {
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: msg.chat.id,
          text: "\u26BD Spain vs Argentina \u2014 the World Cup Final is tonight.\n\nPick your winner and back it on Sharker. 18+ | Please bet responsibly. Terms: sharker.com",
          reply_markup: {
            inline_keyboard: [[
              { text: "\u26BD Play Now", web_app: { url: APP_URL } }
            ]]
          }
        })
      });
    }
    return new Response("ok");
  }
};
