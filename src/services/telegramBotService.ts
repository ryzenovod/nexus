import { WishlistItem, UtilityBill, TaskCategory, Assignee, RoomArea, BracketColor } from '../types/nexus';

export interface TelegramSendMessageResponse {
  ok: boolean;
  result?: any;
  description?: string;
}

export interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: {
      id: number;
      is_bot: boolean;
      first_name: string;
      username?: string;
    };
    chat: {
      id: number;
      title?: string;
      type: string;
    };
    date: number;
    text?: string;
  };
}

class TelegramBotService {
  private baseUrl = 'https://api.telegram.org/bot';

  // Send message via direct client fetch to Telegram Bot API
  public async sendMessage(
    botToken: string,
    chatId: string,
    text: string,
    parseMode: 'Markdown' | 'HTML' = 'Markdown'
  ): Promise<{ success: boolean; error?: string }> {
    if (!botToken || !chatId) {
      return { success: false, error: 'Токен бота или Chat ID не заполнены' };
    }

    const cleanToken = botToken.trim();
    const cleanChatId = chatId.trim();
    const url = `${this.baseUrl}${cleanToken}/sendMessage`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: cleanChatId,
          text,
          parse_mode: parseMode,
          disable_web_page_preview: true,
        }),
      });

      const data: TelegramSendMessageResponse = await response.json();

      if (!response.ok || !data.ok) {
        return {
          success: false,
          error: data.description || `HTTP ${response.status}`,
        };
      }

      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Ошибка сетевого запроса к Telegram API',
      };
    }
  }

  // Fetch new messages from Telegram chat using getUpdates
  public async getUpdates(
    botToken: string,
    offset: number = 0
  ): Promise<{ success: boolean; updates: TelegramUpdate[]; error?: string }> {
    if (!botToken) {
      return { success: false, updates: [], error: 'Токен бота не указан' };
    }

    const cleanToken = botToken.trim();
    const url = `${this.baseUrl}${cleanToken}/getUpdates?offset=${offset}&timeout=2`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok || !data.ok) {
        return {
          success: false,
          updates: [],
          error: data.description || `HTTP ${response.status}`,
        };
      }

      return {
        success: true,
        updates: data.result || [],
      };
    } catch (err: any) {
      return {
        success: false,
        updates: [],
        error: err.message || 'Не удалось связаться с Telegram',
      };
    }
  }

  // Beautiful message formatter for Wishlist Shopping List
  public formatShoppingListMessage(items: WishlistItem[]): string {
    const approved = items.filter((i) => i.status === 'approved' || (i.egorVote === 'yes' && i.anyaVote === 'yes'));
    const pending = items.filter((i) => i.status === 'pending');

    const totalBudget = approved.reduce((acc, curr) => acc + curr.estimatedPrice, 0);

    let text = `🛒 *NEXUS • Список покупок для дома*\n`;
    text += `_Синхронизировано из Couple OS_\n\n`;

    if (approved.length > 0) {
      text += `✅ *Одобрено обоими (${approved.length}):*\n`;
      approved.forEach((item, idx) => {
        text += `${idx + 1}. *${item.title}* — ${item.estimatedPrice.toLocaleString('ru-RU')} ₽\n`;
        if (item.category) text += `   📂 Категория: \`${item.category}\`\n`;
        if (item.link) text += `   🔗 [Ссылка на товар](${item.link})\n`;
      });
      text += `\n💰 *Итого к покупке:* ~*${totalBudget.toLocaleString('ru-RU')} ₽*\n`;
      text += `💡 *Рекомендация по оплате:* Т-Банк (6% категория Дом/Ремонт) или WB Банк (-7%)\n\n`;
    }

    if (pending.length > 0) {
      text += `⏳ *На голосовании (${pending.length}):*\n`;
      pending.forEach((item, idx) => {
        const egorIcon = item.egorVote === 'yes' ? '💙' : item.egorVote === 'no' ? '❌' : '⏳';
        const anyaIcon = item.anyaVote === 'yes' ? '💖' : item.anyaVote === 'no' ? '❌' : '⏳';
        text += `• ${item.title} (${item.estimatedPrice} ₽) [Егор ${egorIcon} | Аня ${anyaIcon}]\n`;
      });
    }

    return text;
  }

  // Beautiful message formatter for Moscow Utilities reminder
  public formatUtilityReminderMessage(bills: UtilityBill[]): string {
    let text = `⚡️ *NEXUS • Напоминание по ЖКХ Москвы*\n\n`;

    const dueOrOverdue = bills.filter((b) => b.status !== 'paid');
    const totalDue = dueOrOverdue.reduce((acc, b) => acc + b.amount + b.commission, 0);

    if (dueOrOverdue.length === 0) {
      text += `🎉 *Все коммунальные платежи оплачены! Чистый дзен.*\n`;
    } else {
      text += `🚨 *К оплате (${dueOrOverdue.length} счета на ${totalDue.toLocaleString('ru-RU')} ₽):*\n\n`;

      dueOrOverdue.forEach((b) => {
        const isOverdue = b.status === 'overdue';
        const icon = isOverdue ? '🔴' : '🟡';
        text += `${icon} *${b.serviceName}* (${b.provider})\n`;
        text += `   Сумма: *${b.amount.toLocaleString('ru-RU')} ₽* (комиссия: ${b.commission} ₽)\n`;
        text += `   Срок: до ${b.dueDate}\n`;
        if (b.readingsRequired && b.readingsWindow) {
          text += `   💧 *Передача счетчиков:* окно с 15 по 26 число!\n`;
        }
        text += `   🔗 [Оплатить онлайн](${b.linkUrl})\n\n`;
      });
    }

    text += `_Отправлено из NEXUS Couple OS (Егор & Аня)_`;
    return text;
  }

  // Push message when a task is completed
  public formatTaskCompletedMessage(taskTitle: string, assignee: string, xpGained: number): string {
    const who = assignee === 'egor' ? 'Егор 💙' : assignee === 'anya' ? 'Аня 💖' : 'Дримтим 🌟';
    return (
      `✨ *NEXUS • Дело сделано!*\n\n` +
      `👤 ${who} выполнил(а) задачу:\n` +
      `📌 *«${taskTitle}»*\n\n` +
      `🐾 Котик Нексус мурчит от удовольствия! +${xpGained} XP в общую копилку пары! 🎉`
    );
  }

  // Push message on mutual wishlist like
  public formatWishlistMatchMessage(itemTitle: string, price: number): string {
    return (
      `🎉 *NEXUS • Взаимный лайк в вишлисте!* 💜\n\n` +
      `И Егор, и Аня проголосовали ЗА:\n` +
      `🛍 *«${itemTitle}»*\n` +
      `💵 Оценка бюджета: *${price.toLocaleString('ru-RU')} ₽*\n\n` +
      `Товар автоматически перемещен в список одобренных покупок для дома!`
    );
  }

  // NLP parser for incoming Telegram messages
  public parseTelegramMessageToTask(text: string): {
    title: string;
    category: TaskCategory;
    date: string;
    assignee: Assignee;
    room: RoomArea;
    bracketColor: BracketColor;
    price?: number;
  } {
    const raw = text.trim();
    let lower = raw.toLowerCase();

    // 1. Assignee detection
    let assignee: Assignee = 'together';
    if (lower.includes('@егор') || lower.includes('@egor') || lower.includes('для егора')) {
      assignee = 'egor';
    } else if (lower.includes('@аня') || lower.includes('@anya') || lower.includes('для ани')) {
      assignee = 'anya';
    }

    // 2. Room detection
    let room: RoomArea = 'Комната';
    if (lower.includes('ванн') || lower.includes('душ') || lower.includes('туалет')) {
      room = 'Ванная';
    } else if (lower.includes('балкон') || lower.includes('лоджи')) {
      room = 'Балкон';
    } else if (lower.includes('кухн') || lower.includes('раковин') || lower.includes('фильтр')) {
      room = 'Кухня';
    } else if (lower.includes('коридор') || lower.includes('прихож')) {
      room = 'Коридор';
    }

    // 3. Category detection
    let category: TaskCategory = '📋 Общее';
    let bracketColor: BracketColor = 'active';

    if (lower.includes('вшэ') || lower.includes('hse') || lower.includes('магистр') || lower.includes('консенсус')) {
      category = '🎓 ВШЭ (Егор)';
      assignee = 'egor';
      bracketColor = 'cyber';
    } else if (lower.includes('рудн') || lower.includes('психолог') || lower.includes('брс')) {
      category = '🎓 РУДН (Аня)';
      assignee = 'anya';
      bracketColor = 'cyber';
    } else if (lower.includes('япрофи') || lower.includes('дфо') || lower.includes('цфо') || lower.includes('вебинар')) {
      category = '🏆 Я-Профессионал';
      assignee = 'anya';
      bracketColor = 'cyber';
    } else if (lower.includes('купить') || lower.includes('покупк') || lower.includes('заказать')) {
      category = '🛒 Покупки';
      bracketColor = 'neutral';
    } else if (lower.includes('жкх') || lower.includes('счетчик') || lower.includes('оплат') || lower.includes('деньги')) {
      category = '💰 Финансы';
      bracketColor = 'finance';
    } else if (lower.includes('ремонт') || lower.includes('дом') || lower.includes('затирк') || lower.includes('люстр')) {
      category = '📦 Для дома!';
      bracketColor = 'active';
    }

    if (lower.includes('срочно') || lower.includes('важно') || lower.includes('!')) {
      bracketColor = 'critical';
    }

    // 4. Date detection
    const today = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

    let date = 'inbox';
    if (lower.includes('сегодня')) {
      date = todayStr;
    } else if (lower.includes('завтра')) {
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      date = `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}`;
    }

    // 5. Price extraction if any (e.g. "1200 руб" or "1200р" or "1200 ₽")
    const priceMatch = raw.match(/(\d+)\s*(?:₽|руб|р\b)/i);
    const price = priceMatch ? parseInt(priceMatch[1], 10) : undefined;

    // Clean title from command tags
    let cleanTitle = raw
      .replace(/@\w+/g, '')
      .replace(/#\w+/g, '')
      .replace(/!(?:срочно|важно)/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanTitle) cleanTitle = raw;

    return {
      title: cleanTitle,
      category,
      date,
      assignee,
      room,
      bracketColor,
      price,
    };
  }
}

export const telegramBotService = new TelegramBotService();
