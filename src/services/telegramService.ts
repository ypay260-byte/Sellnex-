import { Order, RestaurantOrder, RestaurantProfile } from '../types';

export interface TelegramConfig {
  botToken: string;
  chatId: string;
  enabled: boolean;
  notifyNewOrders: boolean;
  notifySupplierOrders: boolean;
  notifyPayments: boolean;
}

const DEFAULT_BOT_TOKEN = '8221894297:AAGsXEaVM0qcPcukoOhzux3ohR_EctKqdvs';
const STORAGE_KEY = 'sellnex_telegram_config';

export const telegramService = {
  getConfig(): TelegramConfig {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return {
          botToken: DEFAULT_BOT_TOKEN,
          notifyNewOrders: true,
          notifySupplierOrders: true,
          notifyPayments: true,
          enabled: true,
          chatId: '',
          ...JSON.parse(saved),
        };
      }
    } catch {
      // fallback
    }

    return {
      botToken: DEFAULT_BOT_TOKEN,
      chatId: '',
      enabled: true,
      notifyNewOrders: true,
      notifySupplierOrders: true,
      notifyPayments: true,
    };
  },

  saveConfig(config: Partial<TelegramConfig>): TelegramConfig {
    const current = this.getConfig();
    const updated = { ...current, ...config };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save telegram config', e);
    }
    return updated;
  },

  async getBotInfo(token?: string): Promise<{ success: boolean; data?: any; error?: string }> {
    const botToken = token || this.getConfig().botToken || DEFAULT_BOT_TOKEN;
    try {
      const res = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
      const data = await res.json();
      if (data.ok) {
        return { success: true, data: data.result };
      }
      return { success: false, error: data.description || 'Bot ma\'lumotlarini olishda xatolik' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Tarmoq xatosi' };
    }
  },

  async getRecentChatUpdates(token?: string): Promise<{ success: boolean; chats: Array<{ id: string; name: string; username?: string; text?: string }>; error?: string }> {
    const botToken = token || this.getConfig().botToken || DEFAULT_BOT_TOKEN;
    try {
      const res = await fetch(`https://api.telegram.org/bot${botToken}/getUpdates?limit=10`);
      const data = await res.json();
      if (data.ok && Array.isArray(data.result)) {
        const chatsMap = new Map<string, { id: string; name: string; username?: string; text?: string }>();
        for (const update of data.result) {
          const msg = update.message || update.channel_post || update.my_chat_member;
          if (msg && msg.chat) {
            const chatId = String(msg.chat.id);
            const chatName = msg.chat.title || [msg.chat.first_name, msg.chat.last_name].filter(Boolean).join(' ') || chatId;
            chatsMap.set(chatId, {
              id: chatId,
              name: chatName,
              username: msg.chat.username,
              text: msg.text,
            });
          }
        }
        return { success: true, chats: Array.from(chatsMap.values()) };
      }
      return { success: false, chats: [], error: data.description };
    } catch (err: any) {
      return { success: false, chats: [], error: err.message };
    }
  },

  async sendMessage(
    text: string,
    targetChatId?: string,
    replyMarkup?: any,
    customToken?: string
  ): Promise<{ success: boolean; error?: string }> {
    const config = this.getConfig();
    const token = customToken || config.botToken || DEFAULT_BOT_TOKEN;
    const chatId = targetChatId || config.chatId;

    if (!chatId) {
      console.warn('Telegram Alert: Chat ID belgilanmagan. Iltimos botga /start bosing yoki Chat ID kiriting.');
      return { success: false, error: 'Chat ID belgilanmagan. Botga @Sellnex orqali /start yozing yoki Chat ID kiriting.' };
    }

    try {
      const payload: any = {
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      };

      if (replyMarkup) {
        payload.reply_markup = replyMarkup;
      }

      const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const resData = await response.json();
      if (resData.ok) {
        return { success: true };
      } else {
        return { success: false, error: resData.description || 'Xabar yuborilmadi' };
      }
    } catch (err: any) {
      console.error('Telegram sendMessage error:', err);
      return { success: false, error: err.message || 'Xabar yuborishda tarmoq xatosi' };
    }
  },

  async sendRestaurantOrderAlert(order: RestaurantOrder, restaurant: RestaurantProfile): Promise<{ success: boolean; error?: string }> {
    const chatId = restaurant.telegramChatId || this.getConfig().chatId;
    const token = restaurant.telegramBotToken || this.getConfig().botToken || DEFAULT_BOT_TOKEN;

    if (!chatId) {
      console.warn('Restoran telegram chat ID kiritilmagan');
      return { success: false, error: 'Telegram chat ID mavjud emas' };
    }

    const itemsList = order.items
      .map((item) => {
        const addonsText = item.selectedAddons && item.selectedAddons.length > 0
          ? `\n  <i>+ Qo'shimchalar: ${item.selectedAddons.map(a => `${escapeHtml(a.name)} (+${a.price.toLocaleString()} so'm)`).join(', ')}</i>`
          : '';
        return `🍔 <b>${escapeHtml(item.name)}</b> x${item.quantity} — <b>${item.totalPrice.toLocaleString()} so‘m</b>${addonsText}`;
      })
      .join('\n');

    const appOrigin = typeof window !== 'undefined' && window.location?.origin ? window.location.origin : 'https://sellnex.uz';

    const message = `🔔 <b>YANGI BUYURTMA!</b>

Buyurtma <b>№${order.orderNumber}</b>

${itemsList}

🚚 <b>Yetkazib berish:</b> ${order.deliveryFee > 0 ? `${order.deliveryFee.toLocaleString()} so‘m` : 'Bepul'}
💰 <b>Jami:</b> <b>${order.totalAmount.toLocaleString()} so‘m</b>

👤 <b>Mijoz:</b> ${escapeHtml(order.customerName)}
📞 <b>Telefon:</b> <code>${escapeHtml(order.customerPhone)}</code>
📍 <b>Manzil:</b> ${escapeHtml(order.deliveryAddress)}
${order.deliveryNotes ? `💬 <b>Izoh:</b> <i>${escapeHtml(order.deliveryNotes)}</i>\n` : ''}
🕐 <b>Vaqti:</b> ${new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}

⚡ <i>Sellnex Restaurant Mode</i>`;

    const inlineKeyboard = {
      inline_keyboard: [
        [
          {
            text: '✅ Qabul qilish',
            url: `${appOrigin}/?restaurantAction=accept&orderId=${order.id}&token=${order.orderNumber}`
          },
          {
            text: '❌ Rad etish',
            url: `${appOrigin}/?restaurantAction=reject&orderId=${order.id}&token=${order.orderNumber}`
          }
        ],
        [
          {
            text: '👁 Buyurtmani ko‘rish',
            url: `${appOrigin}/?restaurantOrder=${order.id}`
          }
        ]
      ]
    };

    return this.sendMessage(message, chatId, inlineKeyboard, token);
  },

  async sendRestaurantStatusUpdate(
    order: RestaurantOrder,
    restaurant: RestaurantProfile,
    newStatus: string
  ): Promise<{ success: boolean; error?: string }> {
    const chatId = restaurant.telegramChatId || this.getConfig().chatId;
    const token = restaurant.telegramBotToken || this.getConfig().botToken || DEFAULT_BOT_TOKEN;

    if (!chatId) return { success: false };

    const statusMap: Record<string, string> = {
      new: '🟡 Yangi buyurtma',
      preparing: '🔵 Qabul qilindi / Tayyorlanmoqda',
      delivering: '🟠 Yetkazilmoqda (Kuryer yo‘lda)',
      delivered: '🟢 Muvaffaqiyatli yetkazildi',
      cancelled: '🔴 Bekor qilindi'
    };

    const statusLabel = statusMap[newStatus] || newStatus;

    const message = `🔄 <b>BUYURTMA STATUSI YANGILANDI!</b>
━━━━━━━━━━━━━━━━━━━━
🏢 <b>Restoran:</b> ${escapeHtml(restaurant.name)}
🆔 <b>Buyurtma №:</b> <code>${order.orderNumber}</code>
📊 <b>Yangi holat:</b> <b>${statusLabel}</b>
👤 <b>Mijoz:</b> ${escapeHtml(order.customerName)} (<code>${escapeHtml(order.customerPhone)}</code>)
💰 <b>Summa:</b> <b>${order.totalAmount.toLocaleString()} so‘m</b>
🕐 <b>Vaqt:</b> ${new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}`;

    return this.sendMessage(message, chatId, undefined, token);
  },

  async sendNewOrderAlert(order: Order, storeName: string): Promise<{ success: boolean; error?: string }> {
    const config = this.getConfig();
    if (!config.enabled || !config.notifyNewOrders) return { success: false };

    const itemsList = order.items
      .map(
        (item) =>
          `• <b>${escapeHtml(item.title)}</b> (${item.quantity} dona)\n  <i>Variant: ${escapeHtml(item.variant || 'Standart')}</i>\n  Narx: <b>${item.sellingPrice.toLocaleString()} UZS</b>`
      )
      .join('\n\n');

    const address = [
      order.shippingAddress.region,
      order.shippingAddress.district,
      order.shippingAddress.streetAddress,
      order.shippingAddress.apartment ? `xonadon ${order.shippingAddress.apartment}` : '',
    ]
      .filter(Boolean)
      .join(', ');

    const message = `🛍️ <b>YANGI DROPSHIPPING BUYURTMASI!</b> 🔔
━━━━━━━━━━━━━━━━━━━━
🏢 <b>Do'kon:</b> ${escapeHtml(storeName)}
🆔 <b>Buyurtma raqami:</b> <code>${order.orderNumber}</code>
📅 <b>Vaqti:</b> ${new Date().toLocaleString('uz-UZ')}

👤 <b>Mijoz:</b> ${escapeHtml(order.customerName)}
📞 <b>Telefon:</b> <code>${escapeHtml(order.customerPhone)}</code>
📍 <b>Manzil:</b> ${escapeHtml(address)}
${order.shippingAddress.deliveryNotes ? `💬 <b>Izoh:</b> <i>${escapeHtml(order.shippingAddress.deliveryNotes)}</i>\n` : ''}
📦 <b>Mahsulotlar:</b>
${itemsList}

━━━━━━━━━━━━━━━━━━━━
💳 <b>To'lov usuli:</b> ${order.paymentMethod} (${order.paymentStatus === 'Paid' ? '✅ To\'langan' : '⏳ Kutilmoqda / COD'})
💵 <b>Jami tushum:</b> <b>${order.totalAmount.toLocaleString()} UZS</b>
📦 <b>Ta'minotchi xarajati:</b> ${order.totalSupplierCost.toLocaleString()} UZS
🚀 <b>SOF FOYDA (PROFIT):</b> <b>+${order.totalProfit.toLocaleString()} UZS</b> 💰

🚚 <b>Kuryer / Trek:</b> ${order.deliveryCourier || 'UzPost'} (<code>${order.trackingNumber || 'Tayyorlanmoqda'}</code>)
━━━━━━━━━━━━━━━━━━━━
⚡ <i>Sellnex Dropshipping Engine — Avtomatlashtirilgan xabarnoma</i>`;

    return this.sendMessage(message);
  },

  async sendSupplierDispatchedAlert(order: Order, supplierName: string): Promise<{ success: boolean; error?: string }> {
    const config = this.getConfig();
    if (!config.enabled || !config.notifySupplierOrders) return { success: false };

    const message = `📦 <b>TA'MINOTCHIGA AVTO-BUYURTMA YUBORILDI!</b> ⚡
━━━━━━━━━━━━━━━━━━━━
🆔 <b>Buyurtma:</b> <code>${order.orderNumber}</code>
🏭 <b>Ta'minotchi:</b> <b>${escapeHtml(supplierName)}</b>
📦 <b>Trek raqami:</b> <code>${order.trackingNumber || 'Avtomatik generatsiya'}</code>
💵 <b>Chiqim:</b> ${order.totalSupplierCost.toLocaleString()} UZS
👤 <b>Yetkaziladigan mijoz:</b> ${escapeHtml(order.customerName)} (${escapeHtml(order.shippingAddress.region)})

✅ Ta'minotchi omboriga buyurtma yuborildi va qadoqlashga topshirildi.`;

    return this.sendMessage(message);
  },

  async sendPaymentReceiptAlert(payment: {
    paymentNumber: string;
    userName: string;
    userEmail: string;
    userPhone: string;
    planRequested: string;
    amount: number;
    paymentMethod: string;
    notes?: string;
    screenshotUrl?: string;
  }): Promise<{ success: boolean; error?: string }> {
    const config = this.getConfig();
    if (!config.enabled || !config.notifyPayments) return { success: false };

    const message = `🔔 <b>YANGI OBUNA TOʻLOV CHEKI QABUL QILINDI!</b> 💎
━━━━━━━━━━━━━━━━━━━━
🆔 <b>Kvitansiya ID:</b> <code>${payment.paymentNumber}</code>
👤 <b>Mijoz:</b> <b>${escapeHtml(payment.userName)}</b>
📧 <b>Email:</b> <code>${escapeHtml(payment.userEmail)}</code>
📞 <b>Telefon:</b> <code>${escapeHtml(payment.userPhone || 'Mavjud emas')}</code>
💎 <b>Soʻralgan Tarif:</b> <b>${escapeHtml(payment.planRequested.toUpperCase())}</b>
💵 <b>Toʻlov Summasi:</b> <b>${payment.amount.toLocaleString()} UZS</b>
💳 <b>Toʻlov Usuli:</b> ${escapeHtml(payment.paymentMethod)}
${payment.notes ? `📝 <b>Izoh / Tranzaksiya:</b> <i>${escapeHtml(payment.notes)}</i>\n` : ''}
━━━━━━━━━━━━━━━━━━━━
⚡ <i>Admin Panel orqali tasdiqlash uchun saytga kiring:</i>
👉 <b>Login:</b> <code>+998942865021</code>
👉 <b>Parol:</b> <code>Kamoliddin1986.</code>`;

    return this.sendMessage(message);
  },

  async sendTestMessage(targetChatId?: string): Promise<{ success: boolean; error?: string }> {
    const message = `🚀 <b>SELLNEX TELEGRAM BOTI MUVAFFAQIYATLI ULINDI!</b> ⚡
━━━━━━━━━━━━━━━━━━━━
Bu sinov xabarnomasi. Endi har bir yangi buyurtma, to'lovlar (Click/Payme) va ta'minotchilarga yuborilgan buyurtmalar haqidagi xabarlar to'g'ridan-to'g'ri ushbu chatga keladi.

💰 <i>Shopify kabi har bir savdoda darhol sof foyda va xaridor telefon raqamini ko'rib borasiz!</i>`;

    return this.sendMessage(message, targetChatId);
  },
};

function escapeHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
