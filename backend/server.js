const express = require('express');
const cors = require('cors');
const { Telegraf } = require('telegraf');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const bot = new Telegraf(process.env.BOT_TOKEN);
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;

app.use(cors({ origin: '*', methods: ['GET', 'POST', 'OPTIONS'], allowedHeaders: ['Content-Type'] }));
app.options('*', cors());
app.use(express.json());

app.post('/api/contact', async (req, res) => {
  try {
    const data = req.body;
    console.log('Received application type:', data.serviceType);

    let message = '';
    if (data.serviceType === 'full') {
      message = `
📦 ПОСТАВКА ПОД КЛЮЧ
👤 Контакт: ${data.contact.name} (${data.contact.company || 'без компании'})
📞 Телефон: ${data.contact.phone}
✉️ Email: ${data.contact.email}
🆔 Telegram: ${data.telegramUser?.username || 'нет'} (ID: ${data.telegramUser?.id || 'нет'})
📦 Товаров: ${data.products?.length || 0}
💰 Итого: ${Math.round(data.result?.totalRub || 0).toLocaleString()} ₽
📊 Себестоимость ед.: ${Math.round(data.result?.costPerItem || 0).toLocaleString()} ₽
🕐 ${new Date().toLocaleString('ru-RU')}
      `;
    } else if (data.serviceType === 'logistics') {
      const ld = data.logisticsData;
      const res = data.result;
      message = `
🚢 ТОЛЬКО ЛОГИСТИКА (FOB)
👤 Контакт: ${data.contact.name} (${data.contact.company || 'без компании'})
📞 Телефон: ${data.contact.phone}
✉️ Email: ${data.contact.email}
🆔 Telegram: ${data.telegramUser?.username || 'нет'} (ID: ${data.telegramUser?.id || 'нет'})

📦 Товар: ${ld.productName}
📏 Вес: ${ld.weightGross} кг, Контейнер: ${ld.containerType}
🚢 Порт: ${ld.portOfLoading} → ${ld.destinationCity}
💰 Стоимость товара: ${ld.invoiceAmount} ${ld.invoiceCurrency}
${ld.needCustoms ? '🛃 Таможня: да' : '🛃 Таможня: нет'}

💰 ИТОГО: ${Math.round(res.totalRub).toLocaleString()} ₽
🕐 ${new Date().toLocaleString('ru-RU')}
      `;
    }

    await bot.telegram.sendMessage(ADMIN_CHAT_ID, message);
    res.json({ success: true });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal error' });
  }
});

app.get('/health', (req, res) => res.send('OK'));

process.on('uncaughtException', (err) => console.error('Uncaught Exception:', err));
process.on('unhandledRejection', (reason) => console.error('Unhandled Rejection:', reason));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));