/**
 * Sellnex Official Telegram Bot Engine (@Sellnex_bot)
 * Handles /start welcome interface, WebApp launch, persistent keyboard,
 * order notifications, and seller automation.
 */

export const TELEGRAM_BOT_TOKEN =
  process.env.TELEGRAM_BOT_TOKEN || '8885318556:AAGv6wzA-fv0xU19tDaSnutc8OZLXrwZ4YM';

export const TELEGRAM_BOT_USERNAME = 'Sellnex_bot';

// Public HTTPS URL for Telegram WebApp
export const APP_WEBAPP_URL =
  process.env.PUBLIC_APP_URL ||
  process.env.APP_URL ||
  'https://ais-pre-dlxz227b6eawujdxjpehjo-199879217551.asia-east1.run.app';

/**
 * Build the start welcome message HTML and keyboards
 */
export function getStartInterface(firstName = 'hurmatli sotuvchi') {
  const safeName = firstName ? escapeHtml(firstName) : 'hurmatli sotuvchi';

  const message = `<b>Assalomu alaykum, ${safeName}! 👋</b>

🛍️ <b>Savdoni boshlash uchun quyidagi tugmani bosing!</b>

━━━━━━━━━━━━━━━━━━━━
🚀 <b>Sellnex bilan nimalarga ega bo‘lasiz?</b>

✨ <b>1 daqiqada onlayn do‘kon</b> — dasturlashsiz, tayyor professional dizayn va shaxsiy katalog.
📦 <b>10 000+ tayyor mahsulotlar</b> — omborsiz va boshlang‘ich sarmoyasiz dropshipping savdosi.
💳 <b>Milliy to‘lovlar</b> — Click, Payme va Uzum Bank orqali to‘g‘ridan-to‘g‘ri hisobingizga tushum.
🚚 <b>O‘zbekiston bo‘ylab yetkazib berish</b> — buyurtmalarni avtomatlashtirilgan kuryerlik tizimi.
📊 <b>Qulay boshqaruv paneli</b> — har bir buyurtma, daromad va statistika yagona markazda.
━━━━━━━━━━━━━━━━━━━━

👇 <i>Pastdagi katta <b>🟢 «Savdoni boshlash»</b> tugmasini bosing va o‘z onlayn biznesingizni yo‘lga qo‘ying!</i>`;

  // Inline keyboard attached directly to the message
  const inlineKeyboard = {
    inline_keyboard: [
      [
        {
          text: '🟢 Savdoni boshlash',
          web_app: { url: APP_WEBAPP_URL },
        },
      ],
      [
        {
          text: '🌐 Brauzerda ochish (sellnex.uz)',
          url: APP_WEBAPP_URL,
        },
      ],
      [
        {
          text: '📦 Mahsulotlar katalogi',
          web_app: { url: `${APP_WEBAPP_URL}/#dropshipping` },
        },
        {
          text: '💎 Tariflar & Obuna',
          web_app: { url: `${APP_WEBAPP_URL}/#pricing` },
        },
      ],
    ],
  };

  // Large, persistent bottom keyboard
  const replyKeyboard = {
    keyboard: [
      [
        {
          text: '🟢 Savdoni boshlash',
          web_app: { url: APP_WEBAPP_URL },
        },
      ],
      [
        {
          text: '📦 Dropshipping katalog',
          web_app: { url: `${APP_WEBAPP_URL}/#dropshipping` },
        },
        {
          text: '💎 Tariflar & Obuna',
          web_app: { url: `${APP_WEBAPP_URL}/#pricing` },
        },
      ],
      [
        { text: 'ℹ️ Sellnex haqida' },
        { text: '📞 Bog‘lanish va Yordam' },
      ],
    ],
    resize_keyboard: true,
    is_persistent: true,
  };

  return { message, inlineKeyboard, replyKeyboard };
}

/**
 * Send start welcome interface to a Telegram chat
 */
export async function sendWelcomeStartInterface(
  chatId: string | number,
  firstName?: string,
  token = TELEGRAM_BOT_TOKEN
): Promise<{ success: boolean; result?: any; error?: string }> {
  const { message, inlineKeyboard, replyKeyboard } = getStartInterface(firstName);

  try {
    // 1. Send the main welcome message with Inline Buttons
    const res1 = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
        disable_web_page_preview: false,
        reply_markup: inlineKeyboard,
      }),
    });
    const data1 = await res1.json();

    // 2. Set the large, persistent bottom reply keyboard
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: '👇 Quyidagi menyu orqali do‘koningizni tezkor boshqarishingiz mumkin:',
        parse_mode: 'HTML',
        reply_markup: replyKeyboard,
      }),
    }).catch(() => {});

    if (data1.ok) {
      return { success: true, result: data1.result };
    }
    return { success: false, error: data1.description || 'Xabar yuborilmadi' };
  } catch (err: any) {
    console.error('[TelegramBot] sendWelcomeStartInterface error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Handle about message
 */
export async function sendAboutInterface(chatId: string | number, token = TELEGRAM_BOT_TOKEN) {
  const text = `🏢 <b>Sellnex — E-commerce & Dropshipping Ekotizimi</b>

Sellnex O‘zbekiston bozoridagi har bir tadbirkor, sotuvchi va yangi boshlovchilarga 1 daqiqada zamonaviy onlayn do‘kon ochish hamda dropshipping orqali mahsulot sotish imkonini beradi.

✅ <b>Asosiy xususiyatlar:</b>
• <b>Noldan sarmoyasiz:</b> Mahsulotlarni omborga sotib olmaysiz — mijoz buyurtma beradi, ta'minotchi yetkazadi, siz sof foydani olasiz.
• <b>To‘lovlar integratsiyasi:</b> Click, Payme, Uzum Bank va P2P kartalar.
• <b>Bot xabarnomalari:</b> Har bir yangi buyurtma va to‘lov cheki darhol Telegramingizga keladi.

🔗 <b>Saytga kirish:</b> <a href="${APP_WEBAPP_URL}">sellnex.uz</a>`;

  return fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🟢 Savdoni boshlash', web_app: { url: APP_WEBAPP_URL } }],
        ],
      },
    }),
  });
}

/**
 * Handle support message
 */
export async function sendSupportInterface(chatId: string | number, token = TELEGRAM_BOT_TOKEN) {
  const text = `📞 <b>Sellnex Qo‘llab-quvvatlash Markazi</b>

Savollaringiz yoki takliflaringiz bo‘lsa, biz bilan bog‘laning:

👨‍💻 <b>Admin / Qo‘llab-quvvatlash:</b> @kamoliddin_admin
📧 <b>Email:</b> ypay260@gmail.com
📱 <b>Aloqa telefoni:</b> +998 (94) 286-50-21
🌐 <b>Rasmiy platforma:</b> <a href="${APP_WEBAPP_URL}">sellnex.uz</a>

Savdoni boshlash uchun quyidagi tugmani bosing!`;

  return fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🟢 Savdoni boshlash', web_app: { url: APP_WEBAPP_URL } }],
        ],
      },
    }),
  });
}

/**
 * Configure Telegram Bot Metadata (Menu button, commands, descriptions)
 */
export async function configureBotMetadata(token = TELEGRAM_BOT_TOKEN) {
  try {
    // 1. Set Chat Menu Button to WebApp "🟢 Savdoni boshlash"
    await fetch(`https://api.telegram.org/bot${token}/setChatMenuButton`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        menu_button: {
          type: 'web_app',
          text: '🟢 Savdoni boshlash',
          web_app: { url: APP_WEBAPP_URL },
        },
      }),
    });

    // 2. Set Bot Commands
    await fetch(`https://api.telegram.org/bot${token}/setMyCommands`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        commands: [
          { command: 'start', description: '🟢 Savdoni boshlash va do‘kon ochish' },
          { command: 'catalog', description: '📦 Dropshipping katalogi' },
          { command: 'pricing', description: '💎 Tariflar va obunalar' },
          { command: 'help', description: 'ℹ️ Qo‘llanma va yordam' },
        ],
      }),
    });

    // 3. Set Description
    await fetch(`https://api.telegram.org/bot${token}/setMyDescription`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description:
          'Assalomu alaykum, hurmatli sotuvchi! 👋\n\n' +
          'Sellnex — bu O‘zbekistondagi zamonaviy e-commerce va dropshipping platformasi.\n\n' +
          '🛍️ Savdoni boshlash uchun «Boshlash» tugmasini bosing!',
        language_code: 'uz',
      }),
    });

    console.log('[TelegramBot] Bot metadata, menu button, and commands successfully configured.');
  } catch (err) {
    console.warn('[TelegramBot] Could not configure bot metadata:', err);
  }
}

/**
 * Process a single Telegram Update (from webhook or long-polling)
 */
export async function processTelegramUpdate(update: any, token = TELEGRAM_BOT_TOKEN) {
  try {
    const msg = update.message || update.edited_message;
    if (!msg || !msg.chat) return;

    const chatId = msg.chat.id;
    const text = (msg.text || '').trim();
    const firstName = msg.from?.first_name || msg.chat.first_name || 'hurmatli sotuvchi';

    if (text.startsWith('/start') || text === '🟢 Savdoni boshlash' || text === 'Savdoni boshlash') {
      await sendWelcomeStartInterface(chatId, firstName, token);
    } else if (text.startsWith('/catalog') || text.includes('katalog') || text.includes('Katalog')) {
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: `📦 <b>Sellnex Dropshipping Katalogi</b>\n\n10 000+ dan ortiq talabgir mahsulotlar ulgurji narxda mavjud. Bir klikda do‘koningizga import qiling va savdoni boshlang!\n\n👇 Katalogga o‘tish uchun tugmani bosing:`,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [{ text: '📦 Katalogni ochish', web_app: { url: `${APP_WEBAPP_URL}/#dropshipping` } }],
            ],
          },
        }),
      });
    } else if (text.startsWith('/pricing') || text.includes('Tariflar') || text.includes('tarif')) {
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: `💎 <b>Sellnex Obuna Tariflari</b>\n\nStarter ($1 / 3 oy), Pro ($5 / oy), Business ($10 / oy) va Premium tariflarida sotuvchilarga keng imkoniyatlar yaratilgan.\n\n👇 Tariflarni ko‘rish va faollashtirish:`,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [{ text: '💎 Tariflarni ko‘rish', web_app: { url: `${APP_WEBAPP_URL}/#pricing` } }],
            ],
          },
        }),
      });
    } else if (text.startsWith('/help') || text.includes('haqida') || text.includes('Haqida')) {
      await sendAboutInterface(chatId, token);
    } else if (text.includes('Bog‘lanish') || text.includes('Yordam') || text.includes('yordam')) {
      await sendSupportInterface(chatId, token);
    } else {
      // Default friendly response pointing to the main button
      const { inlineKeyboard, replyKeyboard } = getStartInterface(firstName);
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: `Assalomu alaykum! 👋\n\n🛍️ <b>Savdoni boshlash uchun quyidagi tugmani bosing:</b>`,
          parse_mode: 'HTML',
          reply_markup: inlineKeyboard,
        }),
      });
    }
  } catch (err) {
    console.error('[TelegramBot] Error processing update:', err);
  }
}

/**
 * Start long-polling listener in background (Node.js runtime)
 */
export function startTelegramBotPolling(token = TELEGRAM_BOT_TOKEN) {
  let isRunning = true;
  let offset = 0;

  console.log(`[TelegramBot] Starting background long-polling for @${TELEGRAM_BOT_USERNAME}...`);

  // Initial metadata setup
  configureBotMetadata(token);

  const poll = async () => {
    while (isRunning) {
      try {
        const url = `https://api.telegram.org/bot${token}/getUpdates?offset=${offset}&timeout=20`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.ok && Array.isArray(data.result)) {
          for (const update of data.result) {
            offset = update.update_id + 1;
            // Process update asynchronously without blocking loop
            processTelegramUpdate(update, token).catch((e) =>
              console.error('[TelegramBot] Update handling error:', e)
            );
          }
        } else if (data.error_code === 409) {
          // Webhook conflict: wait 10 seconds before retrying
          console.warn('[TelegramBot] 409 Conflict: webhook active or other instance polling. Retrying in 10s...');
          await new Promise((r) => setTimeout(r, 10000));
        } else {
          await new Promise((r) => setTimeout(r, 3000));
        }
      } catch (err: any) {
        // Network fluctuation guard
        await new Promise((r) => setTimeout(r, 4000));
      }
    }
  };

  poll().catch((e) => console.error('[TelegramBot] Polling loop fatal error:', e));

  return () => {
    isRunning = false;
  };
}

function escapeHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
