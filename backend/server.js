const express = require('express');
const cors = require('cors');
const { Telegraf } = require('telegraf');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const bot = new Telegraf(process.env.BOT_TOKEN);
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;

// Разрешаем CORS для всех источников (включая localhost и Vercel)
app.use(cors({
  origin: '*', // для теста можно так, позже сузишь до конкретного домена
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));
app.options('*', cors()); // обработка preflight запросов

app.use(express.json());

app.post('/api/contact', async (req, res) => {
  try {
    const data = req.body;
    console.log('Received application from:', data.telegramUser?.username);

    const message = `
📬 Новая заявка!
👤 Пользователь: ${data.telegramUser?.username || 'неизвестен'} (ID: ${data.telegramUser?.id || 'нет'})
📦 Товаров: ${data.products?.length || 0}
💰 Итого: ${Math.round(data.result?.totalRub || 0).toLocaleString()} ₽
📊 Себестоимость ед.: ${Math.round(data.result?.costPerItem || 0).toLocaleString()} ₽
🕐 ${new Date().toLocaleString('ru-RU')}
    `;

    await bot.telegram.sendMessage(ADMIN_CHAT_ID, message);
    res.json({ success: true });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal error' });
  }
});

// Health check
app.get('/health', (req, res) => res.send('OK'));

// Глобальные обработчики ошибок
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));